import uuid

from fastapi import APIRouter, Depends, UploadFile
from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.common.exceptions import ForbiddenError, NotFoundError
from app.core.db import get_db
from app.modules.auth.dependencies import get_current_user
from app.modules.media.models import ListingMedia
from app.modules.media.processing import process_upload
from app.modules.media.schemas import AttachRequest, MediaOut, ReorderRequest, SetPrimaryRequest, to_out
from app.modules.media.storage import get_storage
from app.modules.properties.models import Listing
from app.modules.users.models import User

router = APIRouter(tags=["media"])


async def _load_owned_media(db: AsyncSession, media_id: uuid.UUID, user: User) -> ListingMedia:
    """
    The one ownership check every mutating route below needs: a photo
    still awaiting a listing is owned directly (owner_user_id), a
    photo already attached is owned through its listing, per
    get_current_user's own docstring on why this is re-derived from
    the database on every request rather than trusted from the
    frontend hiding a button.
    """
    media = await db.get(ListingMedia, media_id, options=[])
    if media is None:
        raise NotFoundError("Photo not found.")
    if media.listing_id is None:
        if media.owner_user_id != user.id:
            raise ForbiddenError("You don't have access to this photo.")
        return media
    listing = await db.get(Listing, media.listing_id)
    if listing is None or listing.owner_user_id != user.id:
        raise ForbiddenError("You don't have access to this photo.")
    return media


@router.post("/media/uploads", response_model=list[MediaOut])
async def upload_media(
    files: list[UploadFile],
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
) -> list[MediaOut]:
    """
    Real photos, uploaded by the person listing a property or vehicle,
    before that listing necessarily exists yet (see ListingMedia's
    docstring): this is the "photos" step of PropertyListingFlow /
    SellACarFlow calling something real instead of collecting a bare
    filename. Each file is independently validated and re-encoded
    (see processing.py) before anything is written to disk or the
    database, so one bad file in a batch fails on its own rather than
    silently corrupting the others.
    """
    storage = get_storage()

    existing_count = (
        await db.execute(
            select(ListingMedia).where(ListingMedia.owner_user_id == user.id, ListingMedia.listing_id.is_(None))
        )
    ).scalars().all()
    next_sort_order = len(existing_count)
    has_primary_already = any(item.is_primary for item in existing_count)

    created: list[ListingMedia] = []
    for index, file in enumerate(files):
        processed = await process_upload(file)
        extension = "jpg"  # Every image is re-encoded to JPEG in processing.py regardless of the source format.
        full_url = storage.save(processed.full_bytes, extension)
        thumbnail_url = storage.save(processed.thumbnail_bytes, extension)

        media = ListingMedia(
            listing_id=None,
            owner_user_id=user.id,
            media_type="image",
            url=full_url,
            thumbnail_url=thumbnail_url,
            content_type="image/jpeg",
            width=processed.width,
            height=processed.height,
            byte_size=processed.byte_size,
            sort_order=next_sort_order + index,
            is_primary=(not has_primary_already and index == 0),
            processing_status="optimized",
        )
        db.add(media)
        created.append(media)

    await db.commit()
    for media in created:
        await db.refresh(media)
    return [to_out(media) for media in created]


@router.get("/media/uploads", response_model=list[MediaOut])
async def list_my_unattached_media(
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
) -> list[MediaOut]:
    """Resuming a listing draft: the photos this user has uploaded that aren't attached to a listing yet."""
    result = await db.execute(
        select(ListingMedia)
        .where(ListingMedia.owner_user_id == user.id, ListingMedia.listing_id.is_(None))
        .order_by(ListingMedia.sort_order)
    )
    return [to_out(media) for media in result.scalars().all()]


@router.patch("/media/{media_id}", response_model=MediaOut)
async def set_primary(
    media_id: uuid.UUID,
    body: SetPrimaryRequest,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
) -> MediaOut:
    media = await _load_owned_media(db, media_id, user)
    if body.is_primary:
        # Exactly one primary per scope (unattached-by-user, or attached-by-listing): clear any other first.
        scope_filter = (
            (ListingMedia.owner_user_id == user.id, ListingMedia.listing_id.is_(None))
            if media.listing_id is None
            else (ListingMedia.listing_id == media.listing_id,)
        )
        await db.execute(update(ListingMedia).where(*scope_filter).values(is_primary=False))
    media.is_primary = body.is_primary
    await db.commit()
    await db.refresh(media)
    return to_out(media)


@router.post("/media/reorder", response_model=list[MediaOut])
async def reorder_media(
    body: ReorderRequest,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
) -> list[MediaOut]:
    """
    Every id in the request is individually ownership-checked (not
    just "trust the list the client sent"), then reassigned sort_order
    0..n-1 in the order given, in one transaction so a gallery is never
    read back mid-reorder.
    """
    items = [await _load_owned_media(db, media_id, user) for media_id in body.media_ids]
    for index, media in enumerate(items):
        media.sort_order = index
    await db.commit()
    for media in items:
        await db.refresh(media)
    return [to_out(media) for media in items]


@router.delete("/media/{media_id}", status_code=204)
async def delete_media(
    media_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
) -> None:
    media = await _load_owned_media(db, media_id, user)
    was_primary = media.is_primary
    scope_filter = (
        (ListingMedia.owner_user_id == user.id, ListingMedia.listing_id.is_(None))
        if media.listing_id is None
        else (ListingMedia.listing_id == media.listing_id,)
    )

    storage = get_storage()
    if media.url:
        storage.delete(media.url)
    if media.thumbnail_url:
        storage.delete(media.thumbnail_url)
    await db.delete(media)
    await db.flush()

    if was_primary:
        # A gallery that still has photos should never end up with none of
        # them marked as the cover: promote whichever remaining photo now
        # sorts first, the same rule upload_media uses for a scope's very
        # first photo.
        next_media = (
            await db.execute(select(ListingMedia).where(*scope_filter).order_by(ListingMedia.sort_order).limit(1))
        ).scalar_one_or_none()
        if next_media is not None:
            next_media.is_primary = True

    await db.commit()


@router.post("/media/{media_id}/attach", response_model=MediaOut)
async def attach_media(
    media_id: uuid.UUID,
    body: AttachRequest,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
) -> MediaOut:
    """
    The other half of the real flow: once a listing has actually been
    created, its previously-uploaded draft photos move from
    "owned by this user" to "belongs to this listing" here. Requires
    owning both the photo (as an unattached upload) and the listing.
    """
    media = await db.get(ListingMedia, media_id)
    if media is None or media.listing_id is not None or media.owner_user_id != user.id:
        raise NotFoundError("Photo not found or already attached.")
    listing = await db.get(Listing, body.listing_id)
    if listing is None or listing.owner_user_id != user.id:
        raise ForbiddenError("You don't have access to this listing.")
    media.listing_id = body.listing_id
    media.owner_user_id = None
    await db.commit()
    await db.refresh(media)
    return to_out(media)


@router.get("/listings/{listing_id}/media", response_model=list[MediaOut])
async def list_listing_media(listing_id: uuid.UUID, db: AsyncSession = Depends(get_db)) -> list[MediaOut]:
    """Public: a listing's gallery, in order, for the detail page and cards."""
    result = await db.execute(
        select(ListingMedia).where(ListingMedia.listing_id == listing_id).order_by(ListingMedia.sort_order)
    )
    return [to_out(media) for media in result.scalars().all()]
