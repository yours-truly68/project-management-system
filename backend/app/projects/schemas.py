"""
Pydantic v2 schemas for the projects module.

Key validation enforces short uppercase alphanumeric codes (used in task keys like 'PROJ-42').
"""

import re
import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field, field_validator

_KEY_PATTERN = re.compile(r"^[A-Z0-9]+$")


# ---------------------------------------------------------------------------
# Input schemas
# ---------------------------------------------------------------------------


class ProjectCreate(BaseModel):
    workspace_id: uuid.UUID
    name: str = Field(min_length=1, max_length=150)
    key: str = Field(min_length=2, max_length=10)
    description: str | None = None

    @field_validator("key")
    @classmethod
    def validate_key(cls, v: str) -> str:
        v = v.upper().strip()
        if not _KEY_PATTERN.match(v):
            raise ValueError("Project key must contain only alphanumeric characters.")
        return v


class ProjectUpdate(BaseModel):
    """All fields optional — only provided fields are updated."""

    name: str | None = Field(default=None, min_length=1, max_length=150)
    key: str | None = Field(default=None, min_length=2, max_length=10)
    description: str | None = None
    is_archived: bool | None = None

    @field_validator("key")
    @classmethod
    def validate_key(cls, v: str | None) -> str | None:
        if v is None:
            return v
        v = v.upper().strip()
        if not _KEY_PATTERN.match(v):
            raise ValueError("Project key must contain only alphanumeric characters.")
        return v


# ---------------------------------------------------------------------------
# Output schemas
# ---------------------------------------------------------------------------


class ProjectResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    workspace_id: uuid.UUID
    name: str
    key: str
    description: str | None = None
    created_by: uuid.UUID
    is_archived: bool
    created_at: datetime
    updated_at: datetime
