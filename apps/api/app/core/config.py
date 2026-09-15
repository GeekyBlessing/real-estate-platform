import os
from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """
    One settings object, read once, per the architecture doc's
    core/ module (section 6): "config, security primitives, db
    session, logging, settings per environment." Nothing reads
    os.environ directly outside this file.
    """

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    environment: str = "development"

    database_url: str

    jwt_secret_key: str
    jwt_access_token_minutes: int = 15
    jwt_algorithm: str = "HS256"

    cors_allowed_origins: str = "http://localhost:3000"

    refresh_cookie_name: str = "ile_refresh_token"
    refresh_token_days: int = 30

    # Local-disk media storage (see app/modules/media/storage.py's docstring
    # for why this, not S3, is what's actually wired up in this pass, and
    # what changes the day a real bucket exists).
    media_root: str = "./media_storage"
    media_base_url: str = "/media/files"

    # Verification documents (ID, proof of address, business registration,
    # and similar) are deliberately never mounted as static files the way
    # media_root is above: a listing photo is meant to be public, an ID
    # document never is. verification_documents_root is only ever read
    # through the authenticated, ownership-checked endpoint in
    # app/modules/verification/router.py.
    verification_documents_root: str = "./verification_storage"

    # Cloudflare R2 (S3-compatible object storage), added to fix a real
    # production bug: Render's free tier gives this service no persistent
    # disk, so everything LocalDiskStorage and LocalDiskDocumentStorage wrote
    # to media_root / verification_documents_root was silently gone the next
    # time the instance restarted, which happens roughly every fifteen
    # minutes of no traffic on the free plan. See app/modules/media/storage.py
    # and app/modules/verification/storage.py: both switch to their
    # S3-backed implementation automatically the moment r2_account_id is set,
    # and fall back to local disk when it is not, so local development with
    # no R2 credentials configured keeps working exactly as before. Two
    # buckets, not one: r2_media_bucket is public (listing photos are meant
    # to be seen by anyone), r2_documents_bucket is never made public
    # (verification documents are private and only ever served back through
    # the authenticated endpoint that already exists for this).
    r2_account_id: str = ""
    r2_access_key_id: str = ""
    r2_secret_access_key: str = ""
    r2_media_bucket: str = ""
    r2_media_public_url: str = ""
    r2_documents_bucket: str = ""

    @property
    def r2_configured(self) -> bool:
        return bool(self.r2_account_id and self.r2_access_key_id and self.r2_secret_access_key)

    @property
    def r2_endpoint_url(self) -> str:
        return f"https://{self.r2_account_id}.r2.cloudflarestorage.com"

    # The origin this API is actually reachable at from a browser. A
    # locally-stored file only ever gets a path relative to this same
    # FastAPI process, so that path has to be turned into an absolute URL
    # here before it's handed to the frontend: the web app calls this API
    # from a different origin (NEXT_PUBLIC_API_URL), so a bare
    # "/media/files/x.jpg" would resolve against the frontend's own origin
    # instead of this one and 404 there. Falls back to Render's own
    # RENDER_EXTERNAL_URL, which Render sets automatically for every web
    # service, so production needs no extra configuration for this.
    api_public_url: str = "http://localhost:8000"

    @property
    def cors_origins_list(self) -> list[str]:
        return [origin.strip() for origin in self.cors_allowed_origins.split(",") if origin.strip()]

    @property
    def media_public_base_url(self) -> str:
        origin = os.environ.get("RENDER_EXTERNAL_URL", self.api_public_url).rstrip("/")
        return f"{origin}{self.media_base_url}"

    @property
    def is_production(self) -> bool:
        return self.environment == "production"


@lru_cache
def get_settings() -> Settings:
    return Settings()
