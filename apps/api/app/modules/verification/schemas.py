import uuid
from datetime import datetime

from pydantic import BaseModel

from app.modules.verification.models import VerificationDocument, VerificationRequest

VERIFICATION_STATES = ("not_started", "in_progress", "submitted", "under_review", "verified", "needs_attention")
"""
The six states the product spec requires, exactly. not_started means
no VerificationRequest row exists yet for this user; every other state
is that row's own status column (see models.py), so there is only ever
one place a status can drift from this list: the values this module
itself writes.
"""

STATE_EXPLANATIONS: dict[str, str] = {
    "not_started": "Verification has not started yet.",
    "in_progress": "You have started verification but have not submitted it for review.",
    "submitted": "Your information has been submitted and is waiting to be reviewed.",
    "under_review": "An administrator is currently reviewing your information.",
    "verified": "Your identity has been verified.",
    "needs_attention": "Something needs to be corrected before verification can continue.",
}
"""Shown directly in the UI next to the status: the spec requires every state to have a clear explanation, not just a label."""


class VerificationDocumentOut(BaseModel):
    id: uuid.UUID
    document_type: str
    file_name: str
    uploaded_at: datetime


def document_to_out(document: VerificationDocument, *, file_name: str) -> VerificationDocumentOut:
    return VerificationDocumentOut(
        id=document.id,
        document_type=document.document_type,
        file_name=file_name,
        uploaded_at=document.created_at,
    )


class VerificationStatusOut(BaseModel):
    id: uuid.UUID | None
    """
    The underlying VerificationRequest's id, null only for the
    not_started state where no row exists yet. Required for an admin
    to act on a specific request from the queue (POST
    /verification/admin/{request_id}/review or .../decision); also
    returned to the request's own owner, where it is not sensitive on
    its own.
    """
    subject_id: uuid.UUID | None
    """The user this request belongs to. Always the caller's own id when read from GET /verification/status; meaningful for telling requests apart in the admin queue."""
    state: str
    explanation: str
    decision_reason: str | None
    documents: list[VerificationDocumentOut]
    submitted_at: datetime | None
    updated_at: datetime | None


class SubmitDecisionRequest(BaseModel):
    decision: str
    """verified | needs_attention."""
    reason: str = ""
