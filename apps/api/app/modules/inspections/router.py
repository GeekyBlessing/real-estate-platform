import uuid

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.common.exceptions import AppError
from app.core.db import get_db
from app.modules.auth.dependencies import get_current_user
from app.modules.inspections import service
from app.modules.inspections.schemas import InspectionDecisionRequest, InspectionOut, RequestInspectionRequest
from app.modules.users.models import User

router = APIRouter(tags=["inspections"])


@router.post("/listings/{listing_id}/inspections", response_model=InspectionOut)
async def request_inspection(
    listing_id: uuid.UUID,
    payload: RequestInspectionRequest,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
) -> InspectionOut:
    try:
        return await service.request_inspection(
            db, user, listing_id, preferred_at=payload.preferred_at, mode=payload.mode, notes=payload.notes
        )
    except AppError as exc:
        raise HTTPException(status_code=exc.status_code, detail=exc.message)


@router.get("/inspections/mine", response_model=list[InspectionOut])
async def my_inspections(db: AsyncSession = Depends(get_db), user: User = Depends(get_current_user)) -> list[InspectionOut]:
    return await service.my_requests(db, user)


@router.get("/listings/{listing_id}/inspections", response_model=list[InspectionOut])
async def listing_inspections(
    listing_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
) -> list[InspectionOut]:
    try:
        return await service.requests_for_listing(db, user, listing_id)
    except AppError as exc:
        raise HTTPException(status_code=exc.status_code, detail=exc.message)


@router.post("/inspections/{inspection_id}/decision", response_model=InspectionOut)
async def decide_inspection(
    inspection_id: uuid.UUID,
    payload: InspectionDecisionRequest,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
) -> InspectionOut:
    try:
        return await service.decide(db, user, inspection_id, payload)
    except AppError as exc:
        raise HTTPException(status_code=exc.status_code, detail=exc.message)
