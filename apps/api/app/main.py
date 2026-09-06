import structlog
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app import models_registry  # noqa: F401  (registers every module's tables; see that file's docstring)
from app.common.exceptions import AppError
from app.core.config import get_settings

logger = structlog.get_logger()
from app.modules.auth.router import router as auth_router
from app.modules.users.router import router as users_router

settings = get_settings()

app = FastAPI(title="Ile API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(AppError)
async def app_error_handler(request: Request, exc: AppError) -> JSONResponse:
    """
    Every service-layer error (app/common/exceptions.py) lands here
    instead of every router needing its own try/except boilerplate.
    Routers that need a different status per error (auth's flows,
    where a 409 and a 401 both need to surface distinctly) still
    catch AppError explicitly; this handler is the fallback for
    modules that don't.
    """
    return JSONResponse(status_code=exc.status_code, content={"detail": exc.message})


@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    """
    Without this, an unexpected error (a bug, a constraint the service
    layer didn't anticipate) propagates past CORSMiddleware entirely
    and Starlette's default error handling sends a bare response that
    was never routed back through the CORS layer, so the browser
    reports a misleading "blocked by CORS policy" instead of the real
    500. This one bit us during this pass's own testing: registering
    two accounts with the same phone number hit a database
    UniqueViolation that nothing caught, and the browser's console
    showed a CORS error with no hint that a duplicate phone was the
    actual cause (see app/modules/auth/service.py's get_by_phone check,
    added once this surfaced). Logged with structlog rather than left
    to print to stderr, so a real deployment's log aggregation
    actually captures what happened.
    """
    logger.error("unhandled_exception", path=request.url.path, error=str(exc), exc_info=exc)
    return JSONResponse(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, content={"detail": "Something went wrong."})


@app.get("/health", tags=["health"])
async def health() -> dict[str, str]:
    return {"status": "ok"}


app.include_router(auth_router)
app.include_router(users_router)

# properties, media, search, verification, messaging, inspections,
# reports, payments, notifications, and admin all have real ORM models
# (see app/models_registry.py) but no router yet: per
# roadmap-reconciliation.md, Stage 7 is real accounts and a backend,
# Stage 8 is listing creation, dashboards, messaging, and inspections
# built on top of it. Mounting empty or fake routers for those now
# would be the same "looks like progress, isn't" problem the frontend
# audits warned against, just moved to the backend.
