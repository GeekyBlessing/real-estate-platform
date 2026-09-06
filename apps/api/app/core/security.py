import hashlib
import secrets
import uuid
from datetime import datetime, timedelta, timezone
from typing import Any

import jwt
from argon2 import PasswordHasher
from argon2.exceptions import VerifyMismatchError

from app.core.config import get_settings

settings = get_settings()

# argon2id (the PasswordHasher default), the current OWASP-recommended
# choice over bcrypt, per the architecture doc's section 2. Parameters
# are argon2-cffi's defaults for this pass; the doc flags tuning these
# to the actual deployment's compute budget as a task for real
# infrastructure, not local development.
_password_hasher = PasswordHasher()


def hash_password(plain_password: str) -> str:
    return _password_hasher.hash(plain_password)


def verify_password(plain_password: str, password_hash: str) -> bool:
    try:
        return _password_hasher.verify(password_hash, plain_password)
    except VerifyMismatchError:
        return False


def create_access_token(*, user_id: uuid.UUID, roles: list[str], token_version: int) -> str:
    """
    Short-lived JWT carrying user id, role set, and a token version
    claim, per section 8 of the architecture doc. token_version lets
    every access token for a user be invalidated at once (a password
    change or an admin suspension) without a token blocklist: bump the
    user's token_version and every previously issued access token
    fails the version check below on its next use.
    """
    now = datetime.now(timezone.utc)
    payload: dict[str, Any] = {
        "sub": str(user_id),
        "roles": roles,
        "tv": token_version,
        "iat": now,
        "exp": now + timedelta(minutes=settings.jwt_access_token_minutes),
        "type": "access",
    }
    return jwt.encode(payload, settings.jwt_secret_key, algorithm=settings.jwt_algorithm)


def decode_access_token(token: str) -> dict[str, Any]:
    """Raises jwt.PyJWTError on an invalid or expired token; callers turn that into a 401."""
    payload = jwt.decode(token, settings.jwt_secret_key, algorithms=[settings.jwt_algorithm])
    if payload.get("type") != "access":
        raise jwt.InvalidTokenError("not an access token")
    return payload


def generate_refresh_token() -> tuple[str, str]:
    """
    Refresh tokens are opaque (not JWTs), per section 8, so nothing
    about their contents needs decoding, only their hash needs to
    match what is stored. Returns (plaintext, sha256_hash): the
    plaintext is set as the httpOnly cookie value and never stored;
    the hash is what actually lives in the refresh_tokens table, so a
    database read alone can never produce a usable session, the same
    principle as storing a password hash instead of the password.
    """
    plaintext = secrets.token_urlsafe(48)
    token_hash = hashlib.sha256(plaintext.encode("utf-8")).hexdigest()
    return plaintext, token_hash


def hash_refresh_token(plaintext: str) -> str:
    return hashlib.sha256(plaintext.encode("utf-8")).hexdigest()
