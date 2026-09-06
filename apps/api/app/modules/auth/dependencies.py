import uuid

import jwt
from fastapi import Depends, Header, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.db import get_db
from app.core.security import decode_access_token
from app.modules.users.models import User
from app.modules.users.repository import get_by_id


async def get_current_user(
    authorization: str | None = Header(default=None),
    db: AsyncSession = Depends(get_db),
) -> User:
    """
    The coarse RBAC gate the architecture doc describes (section 8):
    "must be logged in" / "must hold this role" is checked here, as a
    dependency, on every route that needs it. Fine-grained ownership
    checks ("must own this specific listing") do not exist yet since
    no mutating listing endpoints exist yet either; when they do, that
    check belongs in each module's service layer, re-deriving
    permission from the database on every request, per that same
    section: the frontend hiding a button is UX, never authorization.
    """
    credentials_error = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Not authenticated.",
        headers={"WWW-Authenticate": "Bearer"},
    )
    if not authorization or not authorization.lower().startswith("bearer "):
        raise credentials_error

    token = authorization.split(" ", 1)[1]
    try:
        payload = decode_access_token(token)
    except jwt.PyJWTError:
        raise credentials_error

    try:
        user_id = uuid.UUID(payload["sub"])
    except (KeyError, ValueError):
        raise credentials_error

    user = await get_by_id(db, user_id)
    if not user or user.status != "active":
        raise credentials_error

    # Re-derived from the database on every request, not trusted from
    # the token alone: if a password change or admin suspension bumped
    # token_version since this token was issued, it stops working
    # immediately rather than waiting out its 15 minute expiry.
    if payload.get("tv") != user.token_version:
        raise credentials_error

    return user


async def require_same_origin_header(x_ile_client: str | None = Header(default=None)) -> None:
    """
    The pragmatic CSRF defense section 8 describes: because the
    refresh token lives in an httpOnly cookie, a state-changing
    request needs something a cross-site form or script can't
    attach. A custom header does that, since simple cross-site
    requests (a plain form submission, an <img> tag) cannot set
    arbitrary headers, only fetch() from a page that shares CORS
    access can, and CORS is locked to this app's own origin (see
    core/config.py's cors_allowed_origins). SameSite=Strict on the
    cookie itself (see the router's cookie flags) is the other half of
    this defense, not a replacement for it.
    """
    if x_ile_client != "web":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Missing or invalid client header.")


def require_roles(*allowed_roles: str):
    """FastAPI dependency factory: require_roles("admin") gates a route to admins, for instance."""

    async def dependency(user: User = Depends(get_current_user)) -> User:
        if not set(user.role_names) & set(allowed_roles):
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="You don't have access to this.")
        return user

    return dependency
