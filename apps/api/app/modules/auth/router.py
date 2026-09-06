from fastapi import APIRouter, Cookie, Depends, HTTPException, Request, Response, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.common.exceptions import AppError
from app.core.config import get_settings
from app.core.db import get_db
from app.modules.auth import service
from app.modules.auth.dependencies import require_same_origin_header
from app.modules.auth.schemas import LoginRequest, RegisterRequest, TokenResponse
from app.modules.auth.service import TokenPair
from app.modules.users.schemas import to_public

router = APIRouter(prefix="/auth", tags=["auth"])
settings = get_settings()


def _set_refresh_cookie(response: Response, plaintext: str) -> None:
    response.set_cookie(
        key=settings.refresh_cookie_name,
        value=plaintext,
        httponly=True,
        secure=settings.is_production,
        # Local development is plain HTTP; Secure cookies require HTTPS, so
        # this only turns on outside development. Every real deployment
        # must run behind TLS, at which point is_production flips this on.
        samesite="strict",
        max_age=settings.refresh_token_days * 24 * 60 * 60,
        path="/auth",
    )


def _clear_refresh_cookie(response: Response) -> None:
    response.delete_cookie(key=settings.refresh_cookie_name, path="/auth")


def _token_response(tokens: TokenPair) -> TokenResponse:
    return TokenResponse(
        access_token=tokens.access_token,
        expires_in_seconds=settings.jwt_access_token_minutes * 60,
        user=to_public(tokens.user),
    )


@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
async def register(payload: RegisterRequest, response: Response, db: AsyncSession = Depends(get_db)):
    try:
        user = await service.register(
            db,
            full_name=payload.full_name,
            email=payload.email,
            phone=payload.phone,
            role=payload.role,
            password=payload.password,
        )
    except AppError as exc:
        raise HTTPException(status_code=exc.status_code, detail=exc.message)

    # Email verification gating "full standing" (section 8) is not
    # enforced yet, so a new account can sign in immediately: issuing
    # a session right away rather than making them log in separately.
    tokens = await service.issue_session(db, user)
    _set_refresh_cookie(response, tokens.refresh_token_plaintext)
    return _token_response(tokens)


@router.post("/login", response_model=TokenResponse)
async def login(payload: LoginRequest, request: Request, response: Response, db: AsyncSession = Depends(get_db)):
    # request.client is None only in contexts FastAPI's own test client can
    # produce; a real deployment behind a proxy needs this to read a
    # trusted X-Forwarded-For instead, which is a deployment-time concern
    # (the proxy config), not something this scaffold can decide.
    client_ip = request.client.host if request.client else "unknown"
    try:
        tokens = await service.login(db, email=payload.email, password=payload.password, ip_address=client_ip)
    except AppError as exc:
        raise HTTPException(status_code=exc.status_code, detail=exc.message)
    _set_refresh_cookie(response, tokens.refresh_token_plaintext)
    return _token_response(tokens)


@router.post("/refresh", response_model=TokenResponse, dependencies=[Depends(require_same_origin_header)])
async def refresh(
    response: Response,
    db: AsyncSession = Depends(get_db),
    refresh_cookie: str | None = Cookie(default=None, alias=settings.refresh_cookie_name),
):
    if not refresh_cookie:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="No session to refresh.")
    try:
        tokens = await service.refresh(db, refresh_token_plaintext=refresh_cookie)
    except AppError as exc:
        _clear_refresh_cookie(response)
        raise HTTPException(status_code=exc.status_code, detail=exc.message)
    _set_refresh_cookie(response, tokens.refresh_token_plaintext)
    return _token_response(tokens)


@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT, dependencies=[Depends(require_same_origin_header)])
async def logout(
    response: Response,
    db: AsyncSession = Depends(get_db),
    refresh_cookie: str | None = Cookie(default=None, alias=settings.refresh_cookie_name),
):
    if refresh_cookie:
        await service.logout(db, refresh_token_plaintext=refresh_cookie)
    _clear_refresh_cookie(response)
    return None
