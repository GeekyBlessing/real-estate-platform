import uuid
from datetime import datetime, timedelta, timezone

from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import get_settings
from app.modules.auth.models import RefreshToken

settings = get_settings()


async def create_refresh_token(db: AsyncSession, *, user_id: uuid.UUID, family_id: uuid.UUID, token_hash: str) -> RefreshToken:
    token = RefreshToken(
        user_id=user_id,
        family_id=family_id,
        token_hash=token_hash,
        expires_at=datetime.now(timezone.utc) + timedelta(days=settings.refresh_token_days),
    )
    db.add(token)
    await db.flush()
    return token


async def get_valid_by_hash(db: AsyncSession, token_hash: str) -> RefreshToken | None:
    """Only a token that has not been revoked and has not expired counts as valid. A rotated-away token still exists, just as revoked."""
    stmt = select(RefreshToken).where(
        RefreshToken.token_hash == token_hash,
        RefreshToken.revoked_at.is_(None),
        RefreshToken.expires_at > datetime.now(timezone.utc),
    )
    return await db.scalar(stmt)


async def get_by_hash_any_state(db: AsyncSession, token_hash: str) -> RefreshToken | None:
    """Looks a token up regardless of revoked/expired state, needed to detect reuse of an already-rotated token."""
    return await db.scalar(select(RefreshToken).where(RefreshToken.token_hash == token_hash))


async def get_by_id(db: AsyncSession, token_id: uuid.UUID) -> RefreshToken | None:
    """Follows a rotation chain via replaced_by_id, used by the grace-period check in service.refresh()."""
    return await db.scalar(select(RefreshToken).where(RefreshToken.id == token_id))


async def revoke_token(db: AsyncSession, token: RefreshToken, *, replaced_by_id: uuid.UUID | None = None) -> None:
    token.revoked_at = datetime.now(timezone.utc)
    token.replaced_by_id = replaced_by_id
    await db.flush()


async def revoke_family(db: AsyncSession, family_id: uuid.UUID) -> None:
    """
    Revokes every token in a family at once: the response to reuse
    detection (section 8, "the whole family revoked") and to logout.
    """
    await db.execute(
        update(RefreshToken)
        .where(RefreshToken.family_id == family_id, RefreshToken.revoked_at.is_(None))
        .values(revoked_at=datetime.now(timezone.utc))
    )
    await db.flush()
