import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.modules.verification.models import VerificationDocument, VerificationHistory, VerificationRequest

SUBJECT_TYPE_USER = "user"
REQUESTED_LEVEL_IDENTITY = "identity_verified"
"""
Every onboarding role that needs verification (landlord, agent, car
dealer, private seller) is verifying the same thing at this stage:
that the person is who they say they are. subject_type stays "user"
and subject_id the user's own id for all of them, rather than
inventing a per-role requested_level; a listing- or agency-specific
review level can be layered on later without touching this shape.
"""


async def get_active_request(db: AsyncSession, user_id: uuid.UUID) -> VerificationRequest | None:
    """The one non-final verification request for this user, if any: at most one is ever open at a time."""
    stmt = (
        select(VerificationRequest)
        .where(
            VerificationRequest.subject_type == SUBJECT_TYPE_USER,
            VerificationRequest.subject_id == user_id,
            VerificationRequest.requested_level == REQUESTED_LEVEL_IDENTITY,
        )
        .options(selectinload(VerificationRequest.documents))
        .order_by(VerificationRequest.created_at.desc())
        .limit(1)
    )
    return await db.scalar(stmt)


async def get_by_id(db: AsyncSession, request_id: uuid.UUID) -> VerificationRequest | None:
    stmt = (
        select(VerificationRequest)
        .where(VerificationRequest.id == request_id)
        .options(selectinload(VerificationRequest.documents))
    )
    return await db.scalar(stmt)


async def create_request(db: AsyncSession, *, user_id: uuid.UUID) -> VerificationRequest:
    request = VerificationRequest(
        subject_type=SUBJECT_TYPE_USER,
        subject_id=user_id,
        requested_level=REQUESTED_LEVEL_IDENTITY,
        status="in_progress",
    )
    db.add(request)
    await db.flush()
    return request


async def add_document(
    db: AsyncSession, *, verification_request_id: uuid.UUID, document_type: str, storage_reference: str
) -> VerificationDocument:
    document = VerificationDocument(
        verification_request_id=verification_request_id,
        document_type=document_type,
        private_bucket_reference=storage_reference,
    )
    db.add(document)
    await db.flush()
    return document


async def get_document(db: AsyncSession, document_id: uuid.UUID) -> VerificationDocument | None:
    return await db.get(VerificationDocument, document_id)


async def delete_document(db: AsyncSession, document: VerificationDocument) -> None:
    await db.delete(document)


async def record_transition(
    db: AsyncSession,
    *,
    request: VerificationRequest,
    to_status: str,
    changed_by_admin_id: uuid.UUID | None = None,
    reason: str = "",
) -> None:
    db.add(
        VerificationHistory(
            verification_request_id=request.id,
            from_status=request.status,
            to_status=to_status,
            changed_by_admin_id=changed_by_admin_id,
            reason=reason,
        )
    )
    request.status = to_status


async def list_queue(db: AsyncSession, *, statuses: tuple[str, ...]) -> list[VerificationRequest]:
    """Admin review queue: every open request in one of the given statuses, oldest first so nothing waits forever unseen."""
    stmt = (
        select(VerificationRequest)
        .where(VerificationRequest.status.in_(statuses))
        .options(selectinload(VerificationRequest.documents))
        .order_by(VerificationRequest.created_at.asc())
    )
    result = await db.execute(stmt)
    return list(result.scalars().all())
