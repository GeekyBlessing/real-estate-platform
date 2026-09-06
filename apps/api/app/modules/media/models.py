import uuid

from sqlalchemy import ForeignKey, Integer, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.core.db import Base, TimestampMixin, UUIDPrimaryKeyMixin


class ListingMedia(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    """
    Images and videos for a listing, ordered, per section 5's
    property_media (renamed listing_media here since it now serves
    both properties and vehicles, see app/modules/properties/models.py's
    module docstring). No actual upload pipeline is wired up in this
    pass, no S3 bucket, no presigned URLs: this table exists so the
    schema is ready, url is nullable, and processing_status defaults
    to "pending" until that module does real work.
    """

    __tablename__ = "listing_media"

    listing_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("listings.id", ondelete="CASCADE"), nullable=False, index=True)
    media_type: Mapped[str] = mapped_column(String(8), nullable=False, default="image")
    """image | video."""
    url: Mapped[str | None] = mapped_column(String(1024), nullable=True)
    sort_order: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    processing_status: Mapped[str] = mapped_column(String(16), nullable=False, default="pending")
    """pending | optimized | failed."""
