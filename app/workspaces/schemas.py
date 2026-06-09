"""
Pydantic v2 schemas for the workspaces module.

Slug validation enforces URL-safe lowercase kebab-case strings
(e.g. 'my-workspace'). Lowercasing happens before pattern validation.
"""

import re
import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator

from app.shared.enums import WorkspaceRole

_SLUG_PATTERN = re.compile(r"^[a-z0-9]+(?:-[a-z0-9]+)*$")


# ---------------------------------------------------------------------------
# Input schemas
# ---------------------------------------------------------------------------

class WorkspaceCreate(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    slug: str = Field(min_length=1, max_length=100)
    description: str | None = None

    @field_validator("slug")
    @classmethod
    def validate_slug(cls, v: str) -> str:
        v = v.lower()
        if not _SLUG_PATTERN.match(v):
            msg = "Slug must be lowercase alphanumeric with hyphens (e.g. 'my-workspace')."
            raise ValueError(msg)
        return v


class WorkspaceUpdate(BaseModel):
    """All fields optional — only provided fields are updated."""

    name: str | None = Field(default=None, min_length=1, max_length=100)
    slug: str | None = Field(default=None, min_length=1, max_length=100)
    description: str | None = None

    @field_validator("slug")
    @classmethod
    def validate_slug(cls, v: str | None) -> str | None:
        if v is None:
            return v
        v = v.lower()
        if not _SLUG_PATTERN.match(v):
            msg = "Slug must be lowercase alphanumeric with hyphens (e.g. 'my-workspace')."
            raise ValueError(msg)
        return v


class InviteMemberRequest(BaseModel):
    email: EmailStr
    role: WorkspaceRole = WorkspaceRole.MEMBER


# ---------------------------------------------------------------------------
# Output schemas
# ---------------------------------------------------------------------------

class WorkspaceResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    name: str
    slug: str
    description: str | None = None
    owner_id: uuid.UUID
    created_at: datetime
    updated_at: datetime


class WorkspaceMemberResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    workspace_id: uuid.UUID
    user_id: uuid.UUID
    role: WorkspaceRole
    created_at: datetime
