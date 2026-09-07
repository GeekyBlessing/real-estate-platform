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
