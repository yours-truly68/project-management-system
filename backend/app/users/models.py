"""
User ORM model.

Includes auth_provider and provider_id from DATABASE_SCHEMA_V1.md
to support Email + Google + GitHub OAuth flows defined in AI_CONTEXT.md.
hashed_password is nullable because OAuth users don't set a password.
"""

from sqlalchemy import String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.database.base import Base
from app.database.mixins import TimestampMixin, UUIDMixin
from app.shared.enums import AuthProvider


class User(UUIDMixin, TimestampMixin, Base):
    __tablename__ = "users"

    email: Mapped[str] = mapped_column(
        String(255),
        unique=True,
        index=True,
        nullable=False,
    )
    username: Mapped[str] = mapped_column(
        String(50),
        unique=True,
        index=True,
        nullable=False,
    )
    full_name: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
    )
    hashed_password: Mapped[str | None] = mapped_column(
        String(255),
        nullable=True,
    )
    auth_provider: Mapped[AuthProvider] = mapped_column(
        nullable=False,
        server_default=AuthProvider.EMAIL.value,
    )
    provider_id: Mapped[str | None] = mapped_column(
        String(255),
        nullable=True,
    )
    avatar_url: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )
    is_active: Mapped[bool] = mapped_column(
        default=True,
        server_default="true",
    )
    is_verified: Mapped[bool] = mapped_column(
        default=False,
        server_default="false",
    )
