"""
Pydantic v2 schemas for the users module.

Separation of concerns:
- UserCreate: registration input (email/password flow only).
- UserLogin: login credentials.
- UserResponse: public-facing output — never exposes hashed_password.
- UserUpdate: partial updates by the authenticated user.
"""

import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict, EmailStr, Field

from app.shared.enums import AuthProvider


# ---------------------------------------------------------------------------
# Input schemas
# ---------------------------------------------------------------------------


class UserCreate(BaseModel):
    email: EmailStr
    username: str = Field(min_length=3, max_length=50, pattern=r"^[a-zA-Z0-9_-]+$")
    full_name: str = Field(min_length=1, max_length=100)
    password: str = Field(min_length=8, max_length=128)


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserUpdate(BaseModel):
    """All fields optional — only provided fields are updated."""

    full_name: str | None = Field(default=None, min_length=1, max_length=100)
    username: str | None = Field(
        default=None, min_length=3, max_length=50, pattern=r"^[a-zA-Z0-9_-]+$"
    )
    avatar_url: str | None = None


# ---------------------------------------------------------------------------
# Output schemas
# ---------------------------------------------------------------------------


class UserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    email: EmailStr
    username: str
    full_name: str
    auth_provider: AuthProvider
    avatar_url: str | None = None
    is_active: bool
    is_verified: bool
    created_at: datetime
    updated_at: datetime
