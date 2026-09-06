import uuid
from datetime import datetime

from sqlalchemy import Boolean, DateTime, ForeignKey, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.core.db import Base, TimestampMixin, UUIDPrimaryKeyMixin


class Inspection(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    """
    The real entity behind what the inspection request modal on a
    property or vehicle detail page currently simulates and discards
    (see asset-platform-implementation-audit.md section 3). Matches
    the Inspection shape already sketched, type-only, in
    apps/web/lib/asset-types.ts, so that file's shape and this table
    should be kept in sync if either changes.
    """

    __tablename__ = "inspections"

    listing_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("listings.id", ondelete="CASCADE"), nullable=False)
    requested_by_user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    status: Mapped[str] = mapped_column(String(16), nullable=False, default="requested")
    """requested | proposed | confirmed | rejected | completed | cancelled, per section 5."""
    mode: Mapped[str] = mapped_column(String(16), nullable=False, default="in person")
    """in person | video."""
    notes: Mapped[str] = mapped_column(Text, nullable=False, default="")


class InspectionProposal(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    """The back-and-forth over proposed times, per section 5, kept separate from Inspection's own status field."""

    __tablename__ = "inspection_proposals"

    inspection_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("inspections.id", ondelete="CASCADE"), nullable=False
    )
    proposed_by_user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    proposed_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    accepted: Mapped[bool | None] = mapped_column(Boolean, nullable=True)
