import uuid
from datetime import datetime

from pydantic import BaseModel, field_validator

INSPECTION_MODES = {"in person", "video"}


class RequestInspectionRequest(BaseModel):
    preferred_at: datetime
    mode: str = "in person"
    notes: str = ""

    @field_validator("mode")
    @classmethod
    def valid_mode(cls, value: str) -> str:
        if value.lower() not in INSPECTION_MODES:
            raise ValueError("Choose in person or video.")
        return value.lower()

    @field_validator("notes")
    @classmethod
    def trimmed_notes(cls, value: str) -> str:
        return value.strip()[:1000]


class InspectionDecisionRequest(BaseModel):
    action: str
    """confirm | reject | propose."""
    proposed_at: datetime | None = None

    @field_validator("action")
    @classmethod
    def valid_action(cls, value: str) -> str:
        if value not in {"confirm", "reject", "propose"}:
            raise ValueError("Unknown decision.")
        return value


class InspectionListingSummaryOut(BaseModel):
    slug: str
    title: str
    category: str


class InspectionOut(BaseModel):
    id: uuid.UUID
    listing: InspectionListingSummaryOut
    requested_by_user_id: uuid.UUID
    requested_by_name: str
    status: str
    mode: str
    notes: str
    proposed_at: datetime | None
    proposed_by_user_id: uuid.UUID | None
    created_at: datetime
