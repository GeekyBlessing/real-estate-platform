import uuid

from sqlalchemy import Boolean, ForeignKey, Integer, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.core.db import Base, TimestampMixin, UUIDPrimaryKeyMixin


class ListingMedia(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    """
    Real, uploaded images for a listing (see app/modules/media/router.py
    for the actual upload/reorder/attach/delete pipeline this table now
    backs). listing_id is nullable to support the real flow a seller
    goes through: photos are uploaded and previewable before the
    listing itself exists yet (see PropertyListingFlow/SellACarFlow's
    "photos" step on the frontend), owned by owner_user_id until
    /media/{id}/attach assigns them to a real listing_id, at which
    point owner_user_id is cleared since ownership is then implied by
    the listing itself. video is modeled in media_type for forward
    compatibility but the upload endpoint only accepts images today.
    """

    __tablename__ = "listing_media"

    listing_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("listings.id", ondelete="CASCADE"), nullable=True, index=True
    )
    owner_user_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=True, index=True
    )
    """Set only while listing_id is still null: whoever uploaded this photo before it was attached to a listing."""
    media_type: Mapped[str] = mapped_column(String(8), nullable=False, default="image")
    """image | video."""
    url: Mapped[str | None] = mapped_column(String(1024), nullable=True)
    thumbnail_url: Mapped[str | None] = mapped_column(String(1024), nullable=True)
    content_type: Mapped[str | None] = mapped_column(String(32), nullable=True)
    width: Mapped[int | None] = mapped_column(Integer, nullable=True)
    height: Mapped[int | None] = mapped_column(Integer, nullable=True)
    byte_size: Mapped[int | None] = mapped_column(Integer, nullable=True)
    sort_order: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    is_primary: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    processing_status: Mapped[str] = mapped_column(String(16), nullable=False, default="pending")
    """pending | optimized | failed."""
