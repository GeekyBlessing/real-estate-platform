import uuid

from pydantic import BaseModel

from app.modules.media.models import ListingMedia


class MediaOut(BaseModel):
    id: uuid.UUID
    listing_id: uuid.UUID | None
    url: str
    thumbnail_url: str
    content_type: str | None
    width: int | None
    height: int | None
    byte_size: int | None
    sort_order: int
    is_primary: bool
    processing_status: str


def to_out(media: ListingMedia) -> MediaOut:
    return MediaOut(
        id=media.id,
        listing_id=media.listing_id,
        url=media.url or "",
        thumbnail_url=media.thumbnail_url or media.url or "",
        content_type=media.content_type,
        width=media.width,
        height=media.height,
        byte_size=media.byte_size,
        sort_order=media.sort_order,
        is_primary=media.is_primary,
        processing_status=media.processing_status,
    )


class ReorderRequest(BaseModel):
    media_ids: list[uuid.UUID]


class SetPrimaryRequest(BaseModel):
    is_primary: bool = True


class AttachRequest(BaseModel):
    listing_id: uuid.UUID
