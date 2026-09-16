import uuid
from datetime import datetime

from pydantic import BaseModel, field_validator


class SendMessageRequest(BaseModel):
    """Shared by both POST /listings/{id}/messages (starts or continues a thread about that listing) and POST /conversations/{id}/messages (a reply)."""

    body: str
    body: str

    @field_validator("body")
    @classmethod
    def non_blank_body(cls, value: str) -> str:
        if not value.strip():
            raise ValueError("Write a message before sending.")
        if len(value.strip()) > 4000:
            raise ValueError("Message is too long.")
        return value.strip()


class ConversationListingSummaryOut(BaseModel):
    slug: str
    title: str
    category: str


class MessageOut(BaseModel):
    id: uuid.UUID
    conversation_id: uuid.UUID
    sender_user_id: uuid.UUID
    body: str
    created_at: datetime


class ConversationParticipantOut(BaseModel):
    user_id: uuid.UUID
    name: str


class ConversationSummaryOut(BaseModel):
    id: uuid.UUID
    listing: ConversationListingSummaryOut | None
    other_participant: ConversationParticipantOut | None
    last_message: str | None
    last_message_at: datetime | None
    unread_count: int


class ConversationThreadOut(BaseModel):
    id: uuid.UUID
    listing: ConversationListingSummaryOut | None
    participants: list[ConversationParticipantOut]
    messages: list[MessageOut]
