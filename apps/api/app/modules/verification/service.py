import uuid

from fastapi import UploadFile
from sqlalchemy.ext.asyncio import AsyncSession

from app.common.exceptions import ConflictError, ForbiddenError, NotFoundError
from app.modules.users.models import User
from app.modules.verification import repository
from app.modules.verification.models import VerificationRequest
from app.modules.verification.schemas import STATE_EXPLANATIONS, VerificationStatusOut, document_to_out
from app.modules.verification.storage import get_document_storage
from app.modules.verification.validation import validate_document_upload

ALLOWED_DOCUMENT_TYPES = {
    "government_id",
    "proof_of_address",
    "proof_of_ownership",
    "business_registration",
    "professional_certification",
}

FINAL_STATES = {"verified"}
"""Once verified, a request is done: a role does not need to re-verify identity for every subsequent action."""


def _state_for(request: VerificationRequest | None) -> str:
    if request is None:
        return "not_started"
    return request.status


def _file_name_for(document) -> str:
    reference = document.private_bucket_reference or ""
    extension = reference.rsplit(".", 1)[-1] if "." in reference else "file"
    label = document.document_type.replace("_", " ")
    return f"{label}.{extension}"


def _to_status_out(request: VerificationRequest | None) -> VerificationStatusOut:
    state = _state_for(request)
    return VerificationStatusOut(
        id=request.id if request else None,
        subject_id=request.subject_id if request else None,
        state=state,
        explanation=STATE_EXPLANATIONS[state],
        decision_reason=request.decision_reason if request and request.status == "needs_attention" else None,
        documents=[document_to_out(doc, file_name=_file_name_for(doc)) for doc in (request.documents if request else [])],
        submitted_at=request.created_at if request else None,
        updated_at=request.updated_at if request else None,
    )


async def get_status(db: AsyncSession, user: User) -> VerificationStatusOut:
    request = await repository.get_active_request(db, user.id)
    return _to_status_out(request)


async def _get_or_create_editable_request(db: AsyncSession, user: User) -> VerificationRequest:
    """
    An "editable" request is one still being assembled: either none
    exists yet (start one) or the most recent one is in_progress or
    needs_attention (a correction, per the six state model, reopens
    editing rather than forcing an entirely new request and losing the
    review history attached to the old one).
    """
    request = await repository.get_active_request(db, user.id)
    if request is None:
        return await repository.create_request(db, user_id=user.id)
    if request.status in ("in_progress", "needs_attention"):
        if request.status == "needs_attention":
            await repository.record_transition(db, request=request, to_status="in_progress")
        return request
    raise ConflictError("Verification has already been submitted and cannot be edited right now.")


async def upload_document(db: AsyncSession, user: User, file: UploadFile, document_type: str) -> VerificationStatusOut:
    if document_type not in ALLOWED_DOCUMENT_TYPES:
        raise ConflictError("Unrecognized document type.")

    request = await _get_or_create_editable_request(db, user)
    raw, extension = await validate_document_upload(file)
    storage_reference = get_document_storage().save(raw, extension)
    await repository.add_document(db, verification_request_id=request.id, document_type=document_type, storage_reference=storage_reference)
    await db.commit()
    refreshed = await repository.get_by_id(db, request.id)
    return _to_status_out(refreshed)


async def delete_document(db: AsyncSession, user: User, document_id: uuid.UUID) -> VerificationStatusOut:
    document = await repository.get_document(db, document_id)
    request = await repository.get_active_request(db, user.id)
    if document is None or request is None or document.verification_request_id != request.id:
        raise NotFoundError("Document not found.")
    if request.status not in ("in_progress", "needs_attention"):
        raise ConflictError("This document can no longer be removed.")

    get_document_storage().delete(document.private_bucket_reference or "")
    await repository.delete_document(db, document)
    await db.commit()
    refreshed = await repository.get_by_id(db, request.id)
    return _to_status_out(refreshed)


async def submit(db: AsyncSession, user: User) -> VerificationStatusOut:
    request = await repository.get_active_request(db, user.id)
    if request is None or request.status not in ("in_progress", "needs_attention"):
        raise ConflictError("Start verification before submitting it.")
    if not request.documents:
        raise ConflictError("Add at least one document before submitting.")

    await repository.record_transition(db, request=request, to_status="submitted")
    await db.commit()
    refreshed = await repository.get_by_id(db, request.id)
    return _to_status_out(refreshed)


async def get_document_file(db: AsyncSession, user: User, document_id: uuid.UUID) -> tuple[bytes, str]:
    """Returns (bytes, content_type). Only the document's own owner or an admin may read it, re-derived from the database on every call, never trusted from the frontend."""
    document = await repository.get_document(db, document_id)
    if document is None:
        raise NotFoundError("Document not found.")
    request = await repository.get_by_id(db, document.verification_request_id)
    if request is None:
        raise NotFoundError("Document not found.")

    is_owner = request.subject_type == "user" and request.subject_id == user.id
    is_admin = "admin" in user.role_names
    if not is_owner and not is_admin:
        raise ForbiddenError("You don't have access to this document.")

    raw = get_document_storage().read(document.private_bucket_reference or "")
    if raw is None:
        raise NotFoundError("Document not found.")

    extension = (document.private_bucket_reference or "").rsplit(".", 1)[-1] if "." in (document.private_bucket_reference or "") else ""
    content_type = {
        "jpg": "image/jpeg",
        "png": "image/png",
        "webp": "image/webp",
        "pdf": "application/pdf",
    }.get(extension, "application/octet-stream")
    return raw, content_type


# --- Admin review ---------------------------------------------------------


async def admin_queue(db: AsyncSession) -> list[VerificationStatusOut]:
    requests = await repository.list_queue(db, statuses=("submitted", "under_review"))
    return [_to_status_out(request) for request in requests]


async def admin_start_review(db: AsyncSession, admin: User, request_id: uuid.UUID) -> VerificationStatusOut:
    request = await repository.get_by_id(db, request_id)
    if request is None:
        raise NotFoundError("Verification request not found.")
    if request.status != "submitted":
        raise ConflictError("Only a submitted request can move to under review.")
    await repository.record_transition(db, request=request, to_status="under_review", changed_by_admin_id=admin.id)
    request.reviewed_by_admin_id = admin.id
    await db.commit()
    refreshed = await repository.get_by_id(db, request.id)
    return _to_status_out(refreshed)


async def admin_decide(db: AsyncSession, admin: User, request_id: uuid.UUID, decision: str, reason: str) -> VerificationStatusOut:
    if decision not in ("verified", "needs_attention"):
        raise ConflictError("Decision must be 'verified' or 'needs_attention'.")
    if decision == "needs_attention" and not reason.strip():
        raise ConflictError("Explain what needs to change before sending this back.")

    request = await repository.get_by_id(db, request_id)
    if request is None:
        raise NotFoundError("Verification request not found.")
    if request.status not in ("submitted", "under_review"):
        raise ConflictError("This request has already been decided.")

    request.decision_reason = reason
    request.reviewed_by_admin_id = admin.id
    await repository.record_transition(db, request=request, to_status=decision, changed_by_admin_id=admin.id, reason=reason)
    await db.commit()
    refreshed = await repository.get_by_id(db, request.id)
    return _to_status_out(refreshed)
