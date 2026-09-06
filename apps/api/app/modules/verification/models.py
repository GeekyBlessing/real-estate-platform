import uuid
from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, String, Text, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.core.db import Base, TimestampMixin, UUIDPrimaryKeyMixin


class VerificationRequest(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    """
    subject_type/subject_id rather than a foreign key per subject
    type, per section 5, since a verification request can point at a
    user, an agent profile, or a listing (property or vehicle) with
    one shared workflow rather than three parallel tables. The
    disclosure panel in components/ui/Badge.tsx reads verification
    state off Listing directly for display; this table is the
    workflow and history behind how that state got set.
    """

    __tablename__ = "verification_requests"

    subject_type: Mapped[str] = mapped_column(String(16), nullable=False)
    """user | agent | listing."""
    subject_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), nullable=False, index=True)
    requested_level: Mapped[str] = mapped_column(String(32), nullable=False)
    """identity_verified | ownership_reviewed | listing_checked | vehicle_reviewed, per marketplace-expansion-audit-and-plan.md section 8."""
    status: Mapped[str] = mapped_column(String(16), nullable=False, default="pending")
    provider_used: Mapped[str | None] = mapped_column(String(32), nullable=True)
    """Nullable: Phase 1's fallback is manual admin review, per the architecture doc's section 9, not every request has an automated provider."""
    reviewed_by_admin_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    decision_reason: Mapped[str] = mapped_column(Text, nullable=False, default="")


class VerificationDocument(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "verification_documents"

    verification_request_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("verification_requests.id", ondelete="CASCADE"), nullable=False
    )
    document_type: Mapped[str] = mapped_column(String(64), nullable=False)
    private_bucket_reference: Mapped[str | None] = mapped_column(String(1024), nullable=True)
    """No real S3 private bucket wired up yet, same gap as ListingMedia.url. See that model's docstring."""


class VerificationHistory(Base, UUIDPrimaryKeyMixin):
    """Append-only log of every state transition, per section 5. No updated_at: a history row is never edited, only inserted."""

    __tablename__ = "verification_history"

    verification_request_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("verification_requests.id", ondelete="CASCADE"), nullable=False
    )
    from_status: Mapped[str] = mapped_column(String(16), nullable=False)
    to_status: Mapped[str] = mapped_column(String(16), nullable=False)
    changed_by_admin_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    reason: Mapped[str] = mapped_column(Text, nullable=False, default="")
    changed_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, server_default=func.now())
