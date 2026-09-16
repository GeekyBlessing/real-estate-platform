import re
from datetime import date, datetime, timezone

from sqlalchemy.ext.asyncio import AsyncSession

from app.common.exceptions import ConflictError
from app.modules.onboarding import repository
from app.modules.onboarding.schemas import ONBOARDING_ROLES, ROLES_REQUIRING_VERIFICATION, OnboardingProgressOut, OnboardingResultOut
from app.modules.users.models import User
from app.modules.users.repository import add_role_to_user

NIN_PATTERN = re.compile(r"^\d{11}$")


def _require(condition: bool, message: str) -> None:
    if not condition:
        raise ConflictError(message)


def _parse_date(value) -> date | None:
    if not value:
        return None
    if isinstance(value, date):
        return value
    try:
        return date.fromisoformat(str(value))
    except ValueError:
        raise ConflictError("Enter a valid date of birth.")


async def get_progress(db: AsyncSession, user: User) -> OnboardingProgressOut:
    progress = await repository.get_progress(db, user.id)
    if progress is None:
        # role_links is always eager loaded alongside the user (see
        # users/repository.py's get_by_id), primary_role is not, so this
        # reads role_names rather than touching user.primary_role and
        # risking a lazy load outside of an active session context.
        default_role = user.role_names[0] if user.role_names else "buyer"
        return OnboardingProgressOut(role=default_role, status="not_started", current_step=None, draft_data={}, updated_at=None)
    return OnboardingProgressOut(
        role=progress.role, status=progress.status, current_step=progress.current_step, draft_data=progress.draft_data or {}, updated_at=progress.updated_at
    )


async def save_progress(db: AsyncSession, user: User, *, role: str, current_step: str | None, draft_data: dict) -> OnboardingProgressOut:
    _require(role in ONBOARDING_ROLES, "Unrecognized role.")
    progress = await repository.upsert_progress(db, user_id=user.id, role=role, current_step=current_step, draft_data=draft_data)
    await db.commit()
    return OnboardingProgressOut(
        role=progress.role, status=progress.status, current_step=progress.current_step, draft_data=progress.draft_data or {}, updated_at=progress.updated_at
    )


def _validate_and_extract(role: str, draft: dict) -> dict:
    """Role specific required-field checks, and the subset of draft_data that actually maps onto that role's profile columns."""
    if role in ("buyer", "tenant"):
        skipped = bool(draft.get("preferences_skipped"))
        return {
            "intent": draft.get("intent"),
            "preferred_location_slugs": draft.get("preferred_location_slugs") or None,
            "preferred_property_types": draft.get("preferred_property_types") or None,
            "budget_min": draft.get("budget_min"),
            "budget_max": draft.get("budget_max"),
            "bedrooms": draft.get("bedrooms"),
            "interested_in_cars": bool(draft.get("interested_in_cars", False)),
            "car_preferences": draft.get("car_preferences") or None,
            "preferences_skipped": skipped,
        }

    if role == "landlord":
        _require(bool(draft.get("date_of_birth")), "Enter your date of birth.")
        _require(bool((draft.get("residential_address") or "").strip()), "Enter your residential address.")
        _require(bool(draft.get("state_of_residence_slug")), "Select your state of residence.")
        _require(bool(NIN_PATTERN.match(str(draft.get("nin") or ""))), "Enter a valid 11 digit National Identification Number.")
        return {
            "date_of_birth": _parse_date(draft.get("date_of_birth")),
            "residential_address": draft.get("residential_address", "").strip(),
            "state_of_residence_slug": draft.get("state_of_residence_slug"),
            "nin": draft.get("nin"),
            "business_name": (draft.get("business_name") or "").strip() or None,
            "ownership_notes": (draft.get("ownership_notes") or "").strip() or None,
            "property_count_estimate": draft.get("property_count_estimate"),
            "operating_location_slugs": draft.get("operating_location_slugs") or None,
            "bio": (draft.get("bio") or "").strip() or None,
        }

    if role == "agent":
        _require(bool(draft.get("date_of_birth")), "Enter your date of birth.")
        _require(bool((draft.get("residential_address") or "").strip()), "Enter your residential address.")
        _require(bool(draft.get("state_of_residence_slug")), "Select your state of residence.")
        _require(bool(NIN_PATTERN.match(str(draft.get("nin") or ""))), "Enter a valid 11 digit National Identification Number.")
        _require(bool(draft.get("years_experience")), "Select your years of experience.")
        _require(bool(draft.get("specializations")), "Select at least one specialization.")
        operates_as = draft.get("operates_as")
        _require(operates_as in ("independent", "agency"), "Tell us whether you work independently or with an agency.")
        if operates_as == "agency":
            _require(bool((draft.get("agency_name") or "").strip()), "Enter your agency name.")
        _require(bool(draft.get("operating_location_slugs")), "Select at least one operating location.")
        return {
            "date_of_birth": _parse_date(draft.get("date_of_birth")),
            "residential_address": draft.get("residential_address", "").strip(),
            "state_of_residence_slug": draft.get("state_of_residence_slug"),
            "nin": draft.get("nin"),
            "years_experience": draft.get("years_experience"),
            "specializations": draft.get("specializations"),
            "license_number": (draft.get("license_number") or "").strip() or None,
            "operates_as": operates_as,
            "agency_name": (draft.get("agency_name") or "").strip() or None,
            "agency_registration_number": (draft.get("agency_registration_number") or "").strip() or None,
            "operating_location_slugs": draft.get("operating_location_slugs"),
            "bio": (draft.get("bio") or "").strip() or None,
        }

    if role == "car_dealer":
        _require(bool(draft.get("date_of_birth")), "Enter your date of birth.")
        _require(bool(NIN_PATTERN.match(str(draft.get("nin") or ""))), "Enter a valid 11 digit National Identification Number.")
        _require(bool((draft.get("dealership_name") or "").strip()), "Enter your dealership name.")
        _require(bool((draft.get("dealership_address") or "").strip()), "Enter your dealership address.")
        _require(bool(draft.get("operating_location_slugs")), "Select at least one operating location.")
        return {
            "date_of_birth": _parse_date(draft.get("date_of_birth")),
            "nin": draft.get("nin"),
            "dealership_name": draft.get("dealership_name", "").strip(),
            "business_registration_number": (draft.get("business_registration_number") or "").strip() or None,
            "dealership_address": draft.get("dealership_address", "").strip(),
            "years_in_business": draft.get("years_in_business"),
            "specialties": draft.get("specialties") or None,
            "operating_location_slugs": draft.get("operating_location_slugs"),
            "bio": (draft.get("bio") or "").strip() or None,
        }

    if role == "private_seller":
        _require(bool(draft.get("date_of_birth")), "Enter your date of birth.")
        _require(bool(NIN_PATTERN.match(str(draft.get("nin") or ""))), "Enter a valid 11 digit National Identification Number.")
        _require(bool(draft.get("location_slug")), "Select your location.")
        return {
            "date_of_birth": _parse_date(draft.get("date_of_birth")),
            "nin": draft.get("nin"),
            "location_slug": draft.get("location_slug"),
            "bio": (draft.get("bio") or "").strip() or None,
        }

    raise ConflictError("Unrecognized role.")


async def submit(db: AsyncSession, user: User, *, role: str, draft_data: dict) -> OnboardingResultOut:
    _require(role in ONBOARDING_ROLES, "Unrecognized role.")
    fields = _validate_and_extract(role, draft_data)

    await add_role_to_user(db, user=user, role_name=role)
    profile = await repository.create_profile_if_missing(db, role=role, user_id=user.id)
    for key, value in fields.items():
        setattr(profile, key, value)
    profile.onboarding_completed_at = datetime.now(timezone.utc)

    await repository.mark_completed(db, user_id=user.id, role=role)

    await db.commit()

    requires_verification = role in ROLES_REQUIRING_VERIFICATION
    return OnboardingResultOut(
        role=role,
        requires_verification=requires_verification,
        next_action="verify_identity" if requires_verification else "browse",
    )
