import uuid
from datetime import datetime

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.inspections.models import Inspection, InspectionProposal


async def create_inspection(
    db: AsyncSession, *, listing_id: uuid.UUID, requested_by_user_id: uuid.UUID, mode: str, notes: str, preferred_at: datetime
) -> Inspection:
    inspection = Inspection(listing_id=listing_id, requested_by_user_id=requested_by_user_id, mode=mode, notes=notes, status="requested")
    db.add(inspection)
    await db.flush()
    db.add(InspectionProposal(inspection_id=inspection.id, proposed_by_user_id=requested_by_user_id, proposed_at=preferred_at, accepted=None))
    await db.flush()
    return inspection


async def get_inspection(db: AsyncSession, inspection_id: uuid.UUID) -> Inspection | None:
    return await db.get(Inspection, inspection_id)


async def list_for_requester(db: AsyncSession, user_id: uuid.UUID) -> list[Inspection]:
    result = await db.execute(
        select(Inspection).where(Inspection.requested_by_user_id == user_id).order_by(Inspection.created_at.desc())
    )
    return list(result.scalars().all())


async def list_for_listing(db: AsyncSession, listing_id: uuid.UUID) -> list[Inspection]:
    result = await db.execute(
        select(Inspection).where(Inspection.listing_id == listing_id).order_by(Inspection.created_at.desc())
    )
    return list(result.scalars().all())


async def latest_proposal(db: AsyncSession, inspection_id: uuid.UUID) -> InspectionProposal | None:
    return await db.scalar(
        select(InspectionProposal)
        .where(InspectionProposal.inspection_id == inspection_id)
        .order_by(InspectionProposal.created_at.desc())
        .limit(1)
    )


async def add_proposal(
    db: AsyncSession, *, inspection_id: uuid.UUID, proposed_by_user_id: uuid.UUID, proposed_at: datetime
) -> InspectionProposal:
    proposal = InspectionProposal(inspection_id=inspection_id, proposed_by_user_id=proposed_by_user_id, proposed_at=proposed_at, accepted=None)
    db.add(proposal)
    await db.flush()
    return proposal
