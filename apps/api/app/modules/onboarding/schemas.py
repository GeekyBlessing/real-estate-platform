from datetime import datetime

from pydantic import BaseModel

ONBOARDING_ROLES = ("buyer", "tenant", "landlord", "agent", "car_dealer", "private_seller")
"""Every role that has an onboarding flow. admin is never included: nobody self-onboards into it."""

ROLES_REQUIRING_VERIFICATION = {"landlord", "agent", "car_dealer", "private_seller"}
"""
Matches the product principle from the brief: a buyer or renter can
browse immediately with no verification step at all. Everyone else
holds a role that lets them list something or represent a business, so
they go through identity verification (app/modules/verification)
before that becomes possible, but not before they can create an
account.
"""


class OnboardingProgressOut(BaseModel):
    role: str
    status: str
    current_step: str | None
    draft_data: dict
    updated_at: datetime | None


class SaveProgressRequest(BaseModel):
    role: str
    current_step: str | None = None
    draft_data: dict = {}


class SubmitOnboardingRequest(BaseModel):
    role: str
    draft_data: dict = {}
    """The final, complete set of answers. Sent alongside a submit rather than assumed from the last autosave, so a submit is never silently based on a stale save."""


class OnboardingResultOut(BaseModel):
    role: str
    requires_verification: bool
    next_action: str
    """browse | verify_identity. What the frontend should route to immediately after this submit."""
