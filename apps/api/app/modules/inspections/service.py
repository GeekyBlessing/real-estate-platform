import uuid
from datetime import datetime

from sqlalchemy.ext.asyncio import AsyncSession

from app.common.exceptions import ConflictError, ForbiddenError, NotFoundError
from app.modules.inspections import repository
from app.modules.inspections.schemas import InspectionDecisionRequest, InspectionListingSummaryOut, InspectionOut
from app.modules.properties import repository as listings_repository
from app.modules.users.models import User
from app.modules.users.repository import get_by_id as get_user_by_id


async def _to_out(db: AsyncSession, inspection) -> InspectionOut:
    listing = await listings_repository.get_listing_by_id(db, inspection.listing_id)
    requester = await get_user_by_id(db, inspection.requested_by_user_id)
    proposal = await repository.latest_proposal(db, inspection.id)
    return InspectionOut(
        id=inspection.id,
        listing=InspectionListingSummaryOut(
            slug=listing.slug if listing else "", title=listing.title if listing else "", category=listing.category if listing else ""
        ),
        requested_by_user_id=inspection.requested_by_user_id,
        requested_by_name=requester.full_name if requester else "",
        status=inspection.status,
        mode=inspection.mode,
        notes=inspection.notes,
        proposed_at=proposal.proposed_at if proposal else None,
        proposed_by_user_id=proposal.proposed_by_user_id if proposal else None,
        created_at=inspection.created_at,
    )


async def request_inspection(
    db: AsyncSession, requester: User, listing_id: uuid.UUID, *, preferred_at: datetime, mode: str, notes: str
) -> InspectionOut:
    """
    Mirrors messaging.service.send_listing_message's same rule: a
    listing must be real and published, per section 14, "Do not allow
    inspection requests against unpublished or invalid listings",
    before a stranger can request to see it in person.
    """
    listing = await listings_repository.get_listing_by_id(db, listing_id)
    if listing is None or listing.availability_status != "published":
        raise NotFoundError("Listing not found.")
    if listing.owner_user_id == requester.id:
        raise ForbiddenError("You cannot request an inspection of your own listing.")

    inspection = await repository.create_inspection(
        db, listing_id=listing.id, requested_by_user_id=requester.id, mode=mode, notes=notes, preferred_at=preferred_at
    )
    await db.commit()
    inspection = await repository.get_inspection(db, inspection.id)
    return await _to_out(db, inspection)


async def my_requests(db: AsyncSession, user: User) -> list[InspectionOut]:
    inspections = await repository.list_for_requester(db, user.id)
    return [await _to_out(db, item) for item in inspections]


async def requests_for_listing(db: AsyncSession, owner: User, listing_id: uuid.UUID) -> list[InspectionOut]:
    listing = await listings_repository.get_listing_by_id(db, listing_id)
    if listing is None:
        raise NotFoundError("Listing not found.")
    is_admin = "admin" in owner.role_names
    if listing.owner_user_id != owner.id and not is_admin:
        raise NotFoundError("Listing not found.")
    inspections = await repository.list_for_listing(db, listing_id)
    return [await _to_out(db, item) for item in inspections]


async def decide(db: AsyncSession, actor: User, inspection_id: uuid.UUID, decision: InspectionDecisionRequest) -> InspectionOut:
    """
    Only the listing's owner (or an admin) can confirm, reject, or
    counter-propose a time: the seller side of the flow that
    apps/web/components/property/InspectionRequestModal.tsx's real
    version now surfaces on /my-listings. Server side, not trusting
    whichever user the frontend happens to be signed in as, exactly
    like every other decision endpoint in this backend.
    """
    inspection = await repository.get_inspection(db, inspection_id)
    if inspection is None:
        raise NotFoundError("Inspection request not found.")
    listing = await listings_repository.get_listing_by_id(db, inspection.listing_id)
    is_admin = "admin" in actor.role_names
    if listing is None or (listing.owner_user_id != actor.id and not is_admin):
        raise NotFoundError("Inspection request not found.")
    if inspection.status in ("confirmed", "rejected", "completed", "cancelled"):
        raise ConflictError("This inspection request has already been decided.")

    if decision.action == "confirm":
        inspection.status = "confirmed"
        proposal = await repository.latest_proposal(db, inspection.id)
        if proposal is not None:
            proposal.accepted = True
    elif decision.action == "reject":
        inspection.status = "rejected"
        proposal = await repository.latest_proposal(db, inspection.id)
        if proposal is not None:
            proposal.accepted = False
    else:  # propose
        if decision.proposed_at is None:
            raise ConflictError("Propose a specific date and time.")
        previous = await repository.latest_proposal(db, inspection.id)
        if previous is not None:
            previous.accepted = False
        await repository.add_proposal(db, inspection_id=inspection.id, proposed_by_user_id=actor.id, proposed_at=decision.proposed_at)
        inspection.status = "proposed"

    await db.commit()
    inspection = await repository.get_inspection(db, inspection_id)
    return await _to_out(db, inspection)
