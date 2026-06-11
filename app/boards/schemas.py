import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


# ---------------------------------------------------------------------------
# Input schemas
# ---------------------------------------------------------------------------


class BoardCreate(BaseModel):
    project_id: uuid.UUID
    name: str = Field(min_length=1, max_length=100)
    description: str | None = None


class BoardUpdate(BaseModel):
    """All fields optional — only provided fields are updated."""

    name: str | None = Field(default=None, min_length=1, max_length=100)
    description: str | None = None


# ---------------------------------------------------------------------------
# Output schemas
# ---------------------------------------------------------------------------


class BoardResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    project_id: uuid.UUID
    name: str
    description: str | None = None
    created_by: uuid.UUID
    created_at: datetime
    updated_at: datetime


class UserBoardPreferenceResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    user_id: uuid.UUID
    board_id: uuid.UUID
    view_type: str
    created_at: datetime
    updated_at: datetime


class UserBoardPreferenceUpdate(BaseModel):
    view_type: str = Field(min_length=1, max_length=20, pattern="^(board|list)$")

