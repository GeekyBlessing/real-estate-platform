import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.common.exceptions import AppError
from app.core.db import get_db
from app.modules.auth.dependencies import get_current_user, get_current_user_optional, require_roles
from app.modules.properties import service
from app.modules.properties.schemas import (
    AdminListingQueueItemOut,
    CreatePropertyListingRequest,
    CreateVehicleListingRequest,
    ListingDecisionRequest,
    ListingDetailOut,
    UpdatePropertyListingRequest,
    UpdateVehicleListingRequest,
)
from app.modules.users.models import User

router = APIRouter(tags=["listings"])


@router.post("/listings/property", response_model=ListingDetailOut)
async def create_property_listing(
    payload: CreatePropertyListingRequest,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
) -> ListingDetailOut:
    try:
        return await service.create_property_listing(db, user, payload)
    except AppError as exc:
        raise HTTPException(status_code=exc.status_code, detail=exc.message)


@router.post("/listings/vehicle", response_model=ListingDetailOut)
async def create_vehicle_listing(
    payload: CreateVehicleListingRequest,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
) -> ListingDetailOut:
    try:
        return await service.create_vehicle_listing(db, user, payload)
    except AppError as exc:
        raise HTTPException(status_code=exc.status_code, detail=exc.message)


@router.patch("/listings/{listing_id}/property", response_model=ListingDetailOut)
async def update_property_listing(
    listing_id: uuid.UUID,
    payload: UpdatePropertyListingRequest,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
) -> ListingDetailOut:
    try:
        return await service.update_property_listing(db, user, listing_id, payload)
    except AppError as exc:
        raise HTTPException(status_code=exc.status_code, detail=exc.message)


@router.patch("/listings/{listing_id}/vehicle", response_model=ListingDetailOut)
async def update_vehicle_listing(
    listing_id: uuid.UUID,
    payload: UpdateVehicleListingRequest,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
) -> ListingDetailOut:
    try:
        return await service.update_vehicle_listing(db, user, listing_id, payload)
    except AppError as exc:
        raise HTTPException(status_code=exc.status_code, detail=exc.message)


@router.delete("/listings/{listing_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_draft_listing(
    listing_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
) -> None:
    try:
        await service.delete_draft(db, user, listing_id)
    except AppError as exc:
        raise HTTPException(status_code=exc.status_code, detail=exc.message)


@router.post("/listings/{listing_id}/submit", response_model=ListingDetailOut)
async def submit_listing(
    listing_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
) -> ListingDetailOut:
    try:
        return await service.submit_for_review(db, user, listing_id)
    except AppError as exc:
        raise HTTPException(status_code=exc.status_code, detail=exc.message)


@router.get("/listings/mine", response_model=list[ListingDetailOut])
async def my_listings(db: AsyncSession = Depends(get_db), user: User = Depends(get_current_user)) -> list[ListingDetailOut]:
    return await service.my_listings(db, user)


@router.get("/listings", response_model=list[ListingDetailOut])
async def list_listings(
    category: str,
    city: str | None = None,
    transaction_type: str | None = None,
    property_type: str | None = None,
    db: AsyncSession = Depends(get_db),
) -> list[ListingDetailOut]:
    return await service.list_public(db, category=category, city_slug=city, transaction_type=transaction_type, property_type=property_type)


@router.get("/listings/{slug}", response_model=ListingDetailOut)
async def get_listing(
    slug: str,
    db: AsyncSession = Depends(get_db),
    viewer: User | None = Depends(get_current_user_optional),
) -> ListingDetailOut:
    try:
        return await service.get_listing(db, slug, viewer)
    except AppError as exc:
        raise HTTPException(status_code=exc.status_code, detail=exc.message)


@router.get("/admin/listings/queue", response_model=list[AdminListingQueueItemOut])
async def admin_listing_queue(
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_roles("admin")),
) -> list[AdminListingQueueItemOut]:
    return await service.admin_queue(db)


@router.post("/admin/listings/{listing_id}/decision", response_model=ListingDetailOut)
async def admin_decide_listing(
    listing_id: uuid.UUID,
    decision: ListingDecisionRequest,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(require_roles("admin")),
) -> ListingDetailOut:
    try:
        return await service.admin_decide(db, admin, listing_id, decision)
    except AppError as exc:
        raise HTTPException(status_code=exc.status_code, detail=exc.message)
