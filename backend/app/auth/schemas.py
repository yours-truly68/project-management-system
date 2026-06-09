"""
Pydantic v2 schemas for the auth module.

Boundary:
- auth/schemas owns registration, login, and token contracts.
- UserResponse is reused from users/schemas for the authenticated
  user payload — no duplication of field definitions.
"""

from pydantic import BaseModel, EmailStr, Field


# ---------------------------------------------------------------------------
# Request schemas
# ---------------------------------------------------------------------------


class RegisterRequest(BaseModel):
    email: EmailStr
    username: str = Field(min_length=3, max_length=50, pattern=r"^[a-zA-Z0-9_-]+$")
    full_name: str = Field(min_length=1, max_length=100)
    password: str = Field(min_length=8, max_length=128)


class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=1)


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class AuthenticatedUserResponse(BaseModel):
    """Wraps token pair + user profile in a single response."""

    tokens: TokenResponse
    user: "UserResponse"


# Deferred import to avoid circular dependency at class-definition time.
# Pydantic v2 resolves forward refs automatically via model_rebuild().
from app.users.schemas import UserResponse  # noqa: E402

AuthenticatedUserResponse.model_rebuild()
