import uuid

from sqlalchemy import ForeignKey, Integer, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.core.db import Base, TimestampMixin, UUIDPrimaryKeyMixin


class Report(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "reports"

    reporter_user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    subject_type: Mapped[str] = mapped_column(String(16), nullable=False)
    """listing | user."""
    subject_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), nullable=False, index=True)
    reason_category: Mapped[str] = mapped_column(String(32), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False, default="")
    status: Mapped[str] = mapped_column(String(16), nullable=False, default="open")
    """open | reviewing | resolved | dismissed."""
    handled_by_admin_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)


class Review(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    """
    Present but feature-flagged off in Phase 1 UI, per the architecture
    doc's section 5: "structured so ratings, response rate, and
    confirmed-transaction signals can be computed later without new
    tables." This bare version predates the fuller Resident Experience
    and Property Reputation system specified afterward (Tenancy,
    ResidentExperienceReview, IssueReport, ResidentLifecycleEvent,
    PropertyReputationSummary, described in
    marketplace-expansion-audit-and-plan.md section 10 and stubbed as
    types in apps/web/lib/asset-types.ts). That richer schema is a
    deliberately separate, later addition (Stage 10 in
    roadmap-reconciliation.md), not built here: building it before
    real tenancies exist to back it would be exactly the kind of
    premature schema the audit warns against. This table stays the
    original, minimal placeholder until that stage starts.
    """

    __tablename__ = "reviews"

    listing_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("listings.id", ondelete="CASCADE"), nullable=False)
    reviewer_user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    rating: Mapped[int] = mapped_column(Integer, nullable=False)
    body: Mapped[str] = mapped_column(Text, nullable=False, default="")
