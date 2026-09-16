import re

from pydantic import BaseModel, EmailStr, Field, field_validator

from app.modules.users.schemas import UserPublic

VALID_REGISTRATION_ROLES = {"tenant", "buyer", "landlord", "agent", "car_dealer", "private_seller"}
"""Not admin: nobody self-registers into the admin role. Matches apps/web/app/(auth)/register/page.tsx's ROLE_OPTIONS. "tenant" is the renter role's slug (see seed.py)."""

PHONE_PATTERN = re.compile(r"^0\d{10}$")
"""An 11 digit Nigerian mobile number starting with 0, the same pattern the register page validates client side. Server side validation cannot be skipped just because the client already checked."""


class RegisterRequest(BaseModel):
    full_name: str = Field(min_length=1, max_length=255)
    email: EmailStr
    phone: str = Field(min_length=8, max_length=32)
    role: str
    password: str = Field(min_length=8, max_length=255)

    @field_validator("full_name")
    @classmethod
    def full_name_not_blank(cls, value: str) -> str:
        stripped = value.strip()
        if not stripped:
            raise ValueError("Enter your full name.")
        return stripped

    @field_validator("phone")
    @classmethod
    def phone_is_valid_nigerian_number(cls, value: str) -> str:
        if not PHONE_PATTERN.match(value):
            raise ValueError("Enter a valid 11 digit Nigerian phone number.")
        return value

    @field_validator("password")
    @classmethod
    def password_is_strong_enough(cls, value: str) -> str:
        if not re.search(r"[A-Za-z]", value) or not re.search(r"\d", value):
            raise ValueError("Password must include at least one letter and one number.")
        return value

    @field_validator("role")
    @classmethod
    def role_is_registrable(cls, value: str) -> str:
        if value not in VALID_REGISTRATION_ROLES:
            raise ValueError("Choose how you plan to use OWNIT.")
        return value


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in_seconds: int
    user: UserPublic
