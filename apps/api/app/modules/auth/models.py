import uuid

from sqlalchemy import DateTime, ForeignKey, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.core.db import Base, TimestampMixin, UUIDPrimaryKeyMixin


class RefreshToken(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    """
    Tracks refresh token families for rotation and reuse detection,
    per section 8: "rotated on every use, tracked server-side as a
    token family so a stolen refresh token can be detected and the
    whole family revoked." The architecture doc specifies Redis for
    this; this scaffold uses Postgres instead since this pass has no
    Redis running (see common/rate_limit.py for the same tradeoff on
    login rate limiting). Functionally equivalent, just slower to
    expire naturally, which is why revoked_at and expires_at are both
    checked rather than relying on a TTL to remove rows.

    token_hash, never the plaintext token, is what's stored, matching
    the note in core/security.py: a database read alone should never
    produce a usable session.
    """

    __tablename__ = "refresh_tokens"

    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    family_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), nullable=False, index=True)
    """Shared by every token descended from one login, so revoking a family revokes the whole chain."""
    token_hash: Mapped[str] = mapped_column(String(64), unique=True, nullable=False)
    expires_at: Mapped[DateTime] = mapped_column(DateTime(timezone=True), nullable=False)
    revoked_at: Mapped[DateTime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    replaced_by_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), nullable=True)
    """Points at the token that replaced this one on rotation, forming the family's chain for audit purposes."""
