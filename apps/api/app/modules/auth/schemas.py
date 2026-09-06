from pydantic import BaseModel, EmailStr, Field

from app.modules.users.schemas import UserPublic

VALID_REGISTRATION_ROLES = {"tenant", "buyer", "landlord", "agent"}
"""Not admin: nobody self-registers into the admin role. Matches apps/web/app/(auth)/register/page.tsx's ROLE_OPTIONS."""


class RegisterRequest(BaseModel):
    full_name: str = Field(min_length=1, max_length=255)
    email: EmailStr
    phone: str = Field(min_length=8, max_length=32)
    role: str
    password: str = Field(min_length=8, max_length=255)


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in_seconds: int
    user: UserPublic
