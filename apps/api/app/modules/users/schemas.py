import uuid
from typing import TYPE_CHECKING

from pydantic import BaseModel, ConfigDict

if TYPE_CHECKING:
    from app.modules.users.models import User


class UserPublic(BaseModel):
    """
    What a client is allowed to see about a user. password_hash and
    token_version never appear here, on purpose: this schema is the
    boundary between the ORM model (models.py) and anything an HTTP
    response returns, the same separation the architecture doc's
    section 6 describes for every module (router / schemas / service
    / repository / models).
    """

    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    email: str
    phone: str | None
    full_name: str
    status: str
    roles: list[str]


def to_public(user: "User") -> UserPublic:
    """
    The one place a User ORM instance turns into the shape a response
    is allowed to return. Built field by field rather than through
    model_validate(..., from_attributes=True): role_names is a Python
    property computed from the loaded role_links relationship, not a
    plain column, and from_attributes validation requires every
    declared field to already be a gettable attribute named exactly
    "roles" on the source object, which User does not have.
    """
    return UserPublic(
        id=user.id,
        email=user.email,
        phone=user.phone,
        full_name=user.full_name,
        status=user.status,
        roles=user.role_names,
    )
