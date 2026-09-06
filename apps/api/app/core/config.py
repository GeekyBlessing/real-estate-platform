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

    @property
    def cors_origins_list(self) -> list[str]:
        return [origin.strip() for origin in self.cors_allowed_origins.split(",") if origin.strip()]

    @property
    def is_production(self) -> bool:
        return self.environment == "production"


@lru_cache
def get_settings() -> Settings:
    return Settings()
