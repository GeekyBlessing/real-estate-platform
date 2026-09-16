import re
import uuid

from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.modules.locations.models import Area, City, StateRegion
from app.modules.media.models import ListingMedia
from app.modules.properties.models import Amenity, Listing, ListingAmenity, Property, PropertyType, Vehicle
from app.modules.users.models import User


def slugify(value: str) -> str:
    slug = re.sub(r"[^a-z0-9]+", "-", value.lower()).strip("-")
    return slug or "listing"


async def unique_slug(db: AsyncSession, base: str) -> str:
    """base-<6 hex chars>, regenerated on the rare collision rather than trusting a single attempt."""
    for _ in range(5):
        candidate = f"{slugify(base)}-{uuid.uuid4().hex[:6]}"
        existing = await db.scalar(select(Listing.id).where(Listing.slug == candidate))
        if existing is None:
            return candidate
    raise RuntimeError("Could not generate a unique listing slug.")


async def get_city_by_slug(db: AsyncSession, city_slug: str) -> City | None:
    return await db.scalar(select(City).where(City.slug == city_slug).options(selectinload(City.state)))


async def get_area(db: AsyncSession, city_id: uuid.UUID, area_slug: str) -> Area | None:
    return await db.scalar(select(Area).where(Area.city_id == city_id, Area.slug == area_slug))


async def get_or_create_property_type(db: AsyncSession, name: str) -> PropertyType:
    existing = await db.scalar(select(PropertyType).where(PropertyType.name == name))
    if existing:
        return existing
    created = PropertyType(name=name)
    db.add(created)
    await db.flush()
    return created


async def get_or_create_amenities(db: AsyncSession, names: list[str]) -> list[Amenity]:
    out: list[Amenity] = []
    for name in names:
        clean = name.strip()
        if not clean:
            continue
        existing = await db.scalar(select(Amenity).where(Amenity.name == clean))
        if existing:
            out.append(existing)
            continue
        created = Amenity(name=clean)
        db.add(created)
        await db.flush()
        out.append(created)
    return out


async def get_listing_by_id(db: AsyncSession, listing_id: uuid.UUID) -> Listing | None:
    return await db.scalar(
        select(Listing)
        .where(Listing.id == listing_id)
        .options(selectinload(Listing.property), selectinload(Listing.vehicle))
    )


async def get_listing_by_slug(db: AsyncSession, slug: str) -> Listing | None:
    return await db.scalar(
        select(Listing)
        .where(Listing.slug == slug)
        .options(selectinload(Listing.property), selectinload(Listing.vehicle))
    )


async def get_listing_amenity_names(db: AsyncSession, listing_id: uuid.UUID) -> list[str]:
    result = await db.execute(
        select(Amenity.name).join(ListingAmenity, ListingAmenity.amenity_id == Amenity.id).where(ListingAmenity.listing_id == listing_id)
    )
    return [row[0] for row in result.all()]


async def get_listing_media(db: AsyncSession, listing_id: uuid.UUID) -> list[ListingMedia]:
    result = await db.execute(select(ListingMedia).where(ListingMedia.listing_id == listing_id).order_by(ListingMedia.sort_order))
    return list(result.scalars().all())


async def attach_uploaded_media(db: AsyncSession, *, media_ids: list[uuid.UUID], owner_user_id: uuid.UUID, listing_id: uuid.UUID) -> int:
    """Moves this owner's still-unattached uploads onto the new listing. Ids that are not this user's own unattached uploads are silently skipped, never trusted as-is."""
    if not media_ids:
        return 0
    result = await db.execute(
        update(ListingMedia)
        .where(ListingMedia.id.in_(media_ids), ListingMedia.owner_user_id == owner_user_id, ListingMedia.listing_id.is_(None))
        .values(listing_id=listing_id, owner_user_id=None)
    )
    return result.rowcount or 0


async def clear_listing_amenities(db: AsyncSession, listing_id: uuid.UUID) -> None:
    await db.execute(ListingAmenity.__table__.delete().where(ListingAmenity.listing_id == listing_id))


async def delete_listing(db: AsyncSession, listing: Listing) -> None:
    await db.delete(listing)


async def list_published(
    db: AsyncSession,
    *,
    category: str,
    city_slug: str | None = None,
    transaction_type: str | None = None,
    property_type: str | None = None,
    limit: int = 60,
) -> list[Listing]:
    query = (
        select(Listing)
        .join(City, Listing.city_id == City.id)
        .where(Listing.category == category, Listing.availability_status == "published")
        .options(selectinload(Listing.property), selectinload(Listing.vehicle))
        .order_by(Listing.created_at.desc())
        .limit(limit)
    )
    if city_slug:
        query = query.where(City.slug == city_slug)
    if transaction_type and category == "property":
        query = query.where(Listing.listing_type == transaction_type)
    result = await db.execute(query)
    listings = list(result.scalars().all())
    if property_type and category == "property":
        listings = [item for item in listings if item.property and item.property.property_type_id]
    return listings


async def admin_queue(db: AsyncSession) -> list[tuple[Listing, User]]:
    """
    A listing awaiting review has verification_state "pending" (set by
    submit_for_review) and is still unpublished (availability_status
    stays "draft" until an admin approves it, see service.py's
    admin_decide). Reusing verification_state as the review state
    machine, rather than inventing a second one on availability_status,
    keeps exactly one place that says whether a listing has been
    checked.
    """
    result = await db.execute(
        select(Listing, User)
        .join(User, User.id == Listing.owner_user_id)
        .where(Listing.verification_state == "pending")
        .order_by(Listing.updated_at.asc())
    )
    return [(row[0], row[1]) for row in result.all()]
