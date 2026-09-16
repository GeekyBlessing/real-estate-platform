import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.common.exceptions import ConflictError, NotFoundError
from app.modules.admin.models import AuditLog
from app.modules.locations.models import Area, City
from app.modules.properties import repository
from app.modules.properties.models import Listing, ListingAmenity, Property, PropertyType, Vehicle
from app.modules.properties.schemas import (
    LAUNCH_CITY_SLUGS,
    ROLES_ALLOWED_TO_LIST_PROPERTY,
    ROLES_ALLOWED_TO_LIST_VEHICLE,
    AdminListingQueueItemOut,
    CreatePropertyListingRequest,
    CreateVehicleListingRequest,
    ImageOut,
    ListingDecisionRequest,
    ListingDetailOut,
    LocationOut,
    SellerOut,
    UpdatePropertyListingRequest,
    UpdateVehicleListingRequest,
)
from app.modules.users.models import User
from app.modules.users.repository import get_by_id as get_user_by_id

SELLER_ROLE_LABEL: dict[str, str] = {
    "landlord": "landlord",
    "agent": "agent",
    "car_dealer": "dealer",
    "private_seller": "private seller",
}
"""Maps a User's role slug to ListingBase["listedBy"]["role"] in lib/listings.ts, the vocabulary the frontend cards already speak."""

def _require(condition: bool, message: str) -> None:
    if not condition:
        raise ConflictError(message)


def _location_label(state_name: str, include_state: bool, city_name: str, area_name: str | None) -> str:
    parts = [part for part in [area_name, city_name, f"{state_name} State" if include_state else None] if part]
    return ", ".join(parts)


def _seller_role_for(user: User, category: str) -> str:
    """
    A user can hold more than one role (see users/repository.py's
    add_role_to_user); which one describes them on THIS listing
    depends on the listing's own category, not just "whichever role
    they hold", so a landlord who is also onboarded as a car dealer is
    still shown as "landlord" on a property listing.
    """
    roles = set(user.role_names)
    candidates = ("landlord", "agent") if category == "property" else ("car_dealer", "private_seller")
    for role in candidates:
        if role in roles:
            return SELLER_ROLE_LABEL[role]
    return "landlord"


async def _build_location(db: AsyncSession, listing: Listing) -> LocationOut:
    city = await db.scalar(select(City).where(City.id == listing.city_id).options(selectinload(City.state)))
    area = await db.scalar(select(Area).where(Area.id == listing.area_id)) if listing.area_id else None
    if city is None:
        return LocationOut(state="", state_slug="", city="", city_slug="", label="")
    return LocationOut(
        state=city.state.name,
        state_slug=city.state.slug,
        city=city.name,
        city_slug=city.slug,
        area=area.name if area else None,
        area_slug=area.slug if area else None,
        label=_location_label(city.state.name, city.state.include_state_in_label, city.name, area.name if area else None),
    )


async def _to_detail(db: AsyncSession, listing: Listing) -> ListingDetailOut:
    # get_by_id (not a plain db.get) eager loads role_links: the owner
    # here is often a different user than whoever is making this
    # request (an anonymous visitor, an admin reviewing someone else's
    # listing), so unlike the request's own user object it is not
    # already sitting in the session's identity map with roles loaded,
    # and _seller_role_for's plain user.role_names access cannot lazy
    # load across an await boundary.
    seller = await get_user_by_id(db, listing.owner_user_id)
    media = await repository.get_listing_media(db, listing.id)
    images = [ImageOut(url=item.url or "", thumbnail_url=item.thumbnail_url, alt=listing.title) for item in media]
    amenity_names = await repository.get_listing_amenity_names(db, listing.id)
    location = await _build_location(db, listing)

    property_type_label = None
    if listing.property is not None:
        property_type = await db.get(PropertyType, listing.property.property_type_id)
        property_type_label = property_type.name if property_type else None

    return ListingDetailOut(
        id=listing.id,
        slug=listing.slug,
        title=listing.title,
        category=listing.category,
        location=location,
        price_in_kobo=listing.price_in_minor_units,
        images=images,
        verification_state=listing.verification_state,
        verification_detail=listing.verification_detail,
        listed_by=SellerOut(slug=str(seller.id), name=seller.full_name, role=_seller_role_for(seller, listing.category)),
        property_type=property_type_label,
        listing_type=listing.listing_type,
        rent_period=listing.rent_period,
        bedrooms=listing.property.bedrooms if listing.property else None,
        bathrooms=listing.property.bathrooms if listing.property else None,
        size_sqm=listing.property.size_sqm if listing.property else None,
        make=listing.vehicle.make if listing.vehicle else None,
        model=listing.vehicle.model if listing.vehicle else None,
        year=listing.vehicle.year if listing.vehicle else None,
        mileage_km=listing.vehicle.mileage_km if listing.vehicle else None,
        transmission=listing.vehicle.transmission if listing.vehicle else None,
        fuel_type=listing.vehicle.fuel_type if listing.vehicle else None,
        condition=listing.vehicle.condition if listing.vehicle else None,
        body_type=listing.vehicle.body_type if listing.vehicle else None,
        description=listing.description,
        amenities=amenity_names,
        furnishing_status=listing.property.furnishing_status if listing.property else None,
        availability="Available now" if listing.availability_status == "published" else None,
        features=amenity_names if listing.category == "vehicle" else [],
        availability_status=listing.availability_status,
        owner_user_id=listing.owner_user_id,
    )


async def create_property_listing(db: AsyncSession, user: User, payload: CreatePropertyListingRequest) -> ListingDetailOut:
    _require(bool(set(user.role_names) & ROLES_ALLOWED_TO_LIST_PROPERTY), "Only a landlord or agent account can list a property.")
    _require(payload.city_slug in LAUNCH_CITY_SLUGS, "OWNIT only lists properties in Lagos and Abeokuta right now.")
    if payload.transaction_type == "rent":
        _require(bool(payload.rent_period), "Choose a rent period.")

    city = await repository.get_city_by_slug(db, payload.city_slug)
    _require(city is not None, "Unknown city.")
    area = await repository.get_area(db, city.id, payload.area_slug) if payload.area_slug else None

    property_type = await repository.get_or_create_property_type(db, payload.property_type)
    amenities = await repository.get_or_create_amenities(db, payload.amenities)

    slug = await repository.unique_slug(db, f"{payload.property_type}-{city.slug}")
    title = f"{payload.bedrooms} Bedroom {payload.property_type.title()}" if payload.bedrooms else payload.property_type.title()
    listing = Listing(
        slug=slug,
        category="property",
        title=title,
        description=payload.description,
        listing_type=payload.transaction_type,
        rent_period=payload.rent_period if payload.transaction_type == "rent" else None,
        price_in_minor_units=payload.price_naira * 100,
        currency="NGN",
        city_id=city.id,
        area_id=area.id if area else None,
        owner_user_id=user.id,
        availability_status="draft",
        verification_state="unverified",
        verification_detail="",
    )
    db.add(listing)
    await db.flush()

    db.add(
        Property(
            listing_id=listing.id,
            property_type_id=property_type.id,
            bedrooms=payload.bedrooms,
            bathrooms=payload.bathrooms,
            size_sqm=payload.size_sqm,
            furnishing_status=payload.furnishing_status,
        )
    )
    for amenity in amenities:
        db.add(ListingAmenity(listing_id=listing.id, amenity_id=amenity.id))

    await repository.attach_uploaded_media(db, media_ids=payload.media_ids, owner_user_id=user.id, listing_id=listing.id)
    await db.commit()

    listing = await repository.get_listing_by_id(db, listing.id)
    return await _to_detail(db, listing)


async def create_vehicle_listing(db: AsyncSession, user: User, payload: CreateVehicleListingRequest) -> ListingDetailOut:
    _require(bool(set(user.role_names) & ROLES_ALLOWED_TO_LIST_VEHICLE), "Only a car dealer or private seller account can list a vehicle.")
    _require(payload.city_slug in LAUNCH_CITY_SLUGS, "OWNIT only lists vehicles in Lagos and Abeokuta right now.")

    city = await repository.get_city_by_slug(db, payload.city_slug)
    _require(city is not None, "Unknown city.")

    features = await repository.get_or_create_amenities(db, payload.features)

    slug = await repository.unique_slug(db, f"{payload.year}-{payload.make}-{payload.model}")
    listing = Listing(
        slug=slug,
        category="vehicle",
        title=f"{payload.year} {payload.make} {payload.model}",
        description=payload.description,
        listing_type=None,
        rent_period=None,
        price_in_minor_units=payload.price_naira * 100,
        currency="NGN",
        city_id=city.id,
        area_id=None,
        owner_user_id=user.id,
        availability_status="draft",
        verification_state="unverified",
        verification_detail="",
    )
    db.add(listing)
    await db.flush()

    db.add(
        Vehicle(
            listing_id=listing.id,
            make=payload.make,
            model=payload.model,
            year=payload.year,
            mileage_km=payload.mileage_km,
            transmission=payload.transmission,
            fuel_type=payload.fuel_type,
            condition=payload.condition,
            body_type=payload.body_type,
        )
    )
    for feature in features:
        db.add(ListingAmenity(listing_id=listing.id, amenity_id=feature.id))

    await repository.attach_uploaded_media(db, media_ids=payload.media_ids, owner_user_id=user.id, listing_id=listing.id)
    await db.commit()

    listing = await repository.get_listing_by_id(db, listing.id)
    return await _to_detail(db, listing)


def _require_editable(listing: Listing, user: User) -> None:
    """
    Shared by update and delete: a seller can only change their own
    listing, and only while nothing but them has acted on it yet.
    "unverified" covers a draft never submitted; "rejected" covers one
    an admin sent back with a reason, which is exactly when a seller
    needs to fix and resubmit it. A listing an admin is actively
    reviewing ("pending") or has already published cannot be edited or
    deleted out from under that review or that public listing.
    """
    if listing.owner_user_id != user.id:
        raise NotFoundError("Listing not found.")
    _require(listing.verification_state in ("unverified", "rejected"), "This listing can no longer be edited.")


async def update_property_listing(
    db: AsyncSession, user: User, listing_id: uuid.UUID, payload: UpdatePropertyListingRequest
) -> ListingDetailOut:
    listing = await repository.get_listing_by_id(db, listing_id)
    if listing is None or listing.category != "property":
        raise NotFoundError("Listing not found.")
    _require_editable(listing, user)
    _require(payload.city_slug in LAUNCH_CITY_SLUGS, "OWNIT only lists properties in Lagos and Abeokuta right now.")
    if payload.transaction_type == "rent":
        _require(bool(payload.rent_period), "Choose a rent period.")

    city = await repository.get_city_by_slug(db, payload.city_slug)
    _require(city is not None, "Unknown city.")
    area = await repository.get_area(db, city.id, payload.area_slug) if payload.area_slug else None
    property_type = await repository.get_or_create_property_type(db, payload.property_type)
    amenities = await repository.get_or_create_amenities(db, payload.amenities)

    listing.title = f"{payload.bedrooms} Bedroom {payload.property_type.title()}" if payload.bedrooms else payload.property_type.title()
    listing.description = payload.description
    listing.listing_type = payload.transaction_type
    listing.rent_period = payload.rent_period if payload.transaction_type == "rent" else None
    listing.price_in_minor_units = payload.price_naira * 100
    listing.city_id = city.id
    listing.area_id = area.id if area else None
    # A previously rejected listing being fixed and resubmitted starts
    # review from a clean slate, not with the old rejection reason
    # still attached once the seller has acted on it.
    if listing.verification_state == "rejected":
        listing.verification_state = "unverified"
        listing.verification_detail = ""

    if listing.property is not None:
        listing.property.property_type_id = property_type.id
        listing.property.bedrooms = payload.bedrooms
        listing.property.bathrooms = payload.bathrooms
        listing.property.size_sqm = payload.size_sqm
        listing.property.furnishing_status = payload.furnishing_status

    await repository.clear_listing_amenities(db, listing.id)
    for amenity in amenities:
        db.add(ListingAmenity(listing_id=listing.id, amenity_id=amenity.id))
    await repository.attach_uploaded_media(db, media_ids=payload.media_ids, owner_user_id=user.id, listing_id=listing.id)
    await db.commit()

    listing = await repository.get_listing_by_id(db, listing_id)
    return await _to_detail(db, listing)


async def update_vehicle_listing(
    db: AsyncSession, user: User, listing_id: uuid.UUID, payload: UpdateVehicleListingRequest
) -> ListingDetailOut:
    listing = await repository.get_listing_by_id(db, listing_id)
    if listing is None or listing.category != "vehicle":
        raise NotFoundError("Listing not found.")
    _require_editable(listing, user)
    _require(payload.city_slug in LAUNCH_CITY_SLUGS, "OWNIT only lists vehicles in Lagos and Abeokuta right now.")

    city = await repository.get_city_by_slug(db, payload.city_slug)
    _require(city is not None, "Unknown city.")
    features = await repository.get_or_create_amenities(db, payload.features)

    listing.title = f"{payload.year} {payload.make} {payload.model}"
    listing.description = payload.description
    listing.price_in_minor_units = payload.price_naira * 100
    listing.city_id = city.id
    if listing.verification_state == "rejected":
        listing.verification_state = "unverified"
        listing.verification_detail = ""

    if listing.vehicle is not None:
        listing.vehicle.make = payload.make
        listing.vehicle.model = payload.model
        listing.vehicle.year = payload.year
        listing.vehicle.mileage_km = payload.mileage_km
        listing.vehicle.transmission = payload.transmission
        listing.vehicle.fuel_type = payload.fuel_type
        listing.vehicle.condition = payload.condition
        listing.vehicle.body_type = payload.body_type

    await repository.clear_listing_amenities(db, listing.id)
    for feature in features:
        db.add(ListingAmenity(listing_id=listing.id, amenity_id=feature.id))
    await repository.attach_uploaded_media(db, media_ids=payload.media_ids, owner_user_id=user.id, listing_id=listing.id)
    await db.commit()

    listing = await repository.get_listing_by_id(db, listing_id)
    return await _to_detail(db, listing)


async def delete_draft(db: AsyncSession, user: User, listing_id: uuid.UUID) -> None:
    listing = await repository.get_listing_by_id(db, listing_id)
    if listing is None:
        raise NotFoundError("Listing not found.")
    _require_editable(listing, user)
    await repository.delete_listing(db, listing)
    await db.commit()


async def submit_for_review(db: AsyncSession, user: User, listing_id: uuid.UUID) -> ListingDetailOut:
    listing = await repository.get_listing_by_id(db, listing_id)
    if listing is None or listing.owner_user_id != user.id:
        raise NotFoundError("Listing not found.")
    _require(listing.verification_state in ("unverified", "rejected"), "This listing has already been submitted.")
    media = await repository.get_listing_media(db, listing.id)
    _require(len(media) >= 1, "Add at least one photo before submitting.")

    listing.verification_state = "pending"
    listing.verification_detail = "Submitted for review. An administrator checks new listings before they go live."
    await db.commit()

    listing = await repository.get_listing_by_id(db, listing_id)
    return await _to_detail(db, listing)


async def get_listing(db: AsyncSession, slug: str, viewer: User | None) -> ListingDetailOut:
    listing = await repository.get_listing_by_slug(db, slug)
    if listing is None:
        raise NotFoundError("Listing not found.")
    is_owner = viewer is not None and listing.owner_user_id == viewer.id
    is_admin = viewer is not None and "admin" in viewer.role_names
    if listing.availability_status != "published" and not (is_owner or is_admin):
        raise NotFoundError("Listing not found.")
    return await _to_detail(db, listing)


async def list_public(
    db: AsyncSession,
    *,
    category: str,
    city_slug: str | None,
    transaction_type: str | None,
    property_type: str | None,
) -> list[ListingDetailOut]:
    """
    Returns full detail objects, not the trimmed ListingCardOut _to_card
    produces: the search and cars grids (apps/web/app/(marketplace)/search,
    .../cars) filter client side on furnishing_status and amenities,
    fields only ListingDetailOut carries, the same way they used to
    filter over lib/mock-data.ts's PropertyDetail records rather than
    plain cards. _to_detail is already computed per listing regardless,
    so returning it directly is not extra work, just not throwing away
    fields a real screen needs.
    """
    listings = await repository.list_published(
        db, category=category, city_slug=city_slug, transaction_type=transaction_type, property_type=property_type
    )
    return [await _to_detail(db, listing) for listing in listings]


async def my_listings(db: AsyncSession, user: User) -> list[ListingDetailOut]:
    result = await db.execute(
        select(Listing)
        .where(Listing.owner_user_id == user.id)
        .options(selectinload(Listing.property), selectinload(Listing.vehicle))
        .order_by(Listing.updated_at.desc())
    )
    listings = list(result.scalars().all())
    return [await _to_detail(db, listing) for listing in listings]


async def admin_queue(db: AsyncSession) -> list[AdminListingQueueItemOut]:
    rows = await repository.admin_queue(db)
    return [
        AdminListingQueueItemOut(
            id=listing.id,
            slug=listing.slug,
            title=listing.title,
            category=listing.category,
            submitted_at=listing.updated_at,
            owner_name=owner.full_name,
            owner_email=owner.email,
        )
        for listing, owner in rows
    ]


async def admin_decide(db: AsyncSession, admin: User, listing_id: uuid.UUID, decision: ListingDecisionRequest) -> ListingDetailOut:
    listing = await repository.get_listing_by_id(db, listing_id)
    if listing is None:
        raise NotFoundError("Listing not found.")
    # A user can hold both a seller role and "admin" at once (roles are
    # additive, see users/repository.py's add_role_to_user); nothing
    # about require_roles("admin") on its own stops that person from
    # reviewing their own submission, so it has to be checked here,
    # against the listing's real owner_user_id, not a role name.
    _require(listing.owner_user_id != admin.id, "You cannot review your own listing.")
    _require(listing.verification_state == "pending", "This listing is not awaiting review.")

    if decision.approve:
        listing.verification_state = "verified"
        listing.verification_detail = "Reviewed and verified by an administrator."
        listing.availability_status = "published"
    else:
        _require(bool(decision.reason), "Explain what needs to change before rejecting a listing.")
        listing.verification_state = "rejected"
        listing.verification_detail = decision.reason or ""

    db.add(
        AuditLog(
            actor_user_id=admin.id,
            action="listing_approved" if decision.approve else "listing_rejected",
            subject_type="listing",
            subject_id=listing.id,
            before_snapshot={"verification_state": "pending"},
            after_snapshot={"verification_state": listing.verification_state, "reason": decision.reason},
        )
    )
    await db.commit()

    listing = await repository.get_listing_by_id(db, listing_id)
    return await _to_detail(db, listing)
