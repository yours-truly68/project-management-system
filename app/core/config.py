from enum import Enum
from functools import lru_cache

from pydantic import SecretStr
from pydantic_settings import BaseSettings, SettingsConfigDict


class Environment(str, Enum):
    development = "development"
    testing = "testing"
    staging = "staging"
    production = "production"


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        frozen=True,
    )

    # --- App ---
    APP_NAME: str = "Project Management System"
    ENVIRONMENT: Environment = Environment.development
    DEBUG: bool = False

    # --- Server ---
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    ALLOWED_ORIGINS: list[str] = ["http://localhost:3000"]

    # --- Database ---
    DATABASE_URL: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/pms_db"

    # --- Auth / JWT ---
    SECRET_KEY: SecretStr
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 15
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # --- Google OAuth (optional) ---
    GOOGLE_CLIENT_ID: str = ""
    GOOGLE_CLIENT_SECRET: SecretStr = SecretStr("")
    GOOGLE_REDIRECT_URI: str = "http://localhost:8000/api/auth/google/callback"

    @property
    def is_production(self) -> bool:
        return self.ENVIRONMENT == Environment.production

    @property
    def is_testing(self) -> bool:
        return self.ENVIRONMENT == Environment.testing


@lru_cache
def get_settings() -> Settings:
    return Settings()  # type: ignore[call-arg]


# Module-level convenience export
settings = get_settings()
