import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


# ---------------------------------------------------------------------------
# Input schemas
# ---------------------------------------------------------------------------


class ColumnCreate(BaseModel):
    board_id: uuid.UUID
    name: str = Field(min_length=1, max_length=50)
    position: int = Field(ge=0)
    color: str | None = Field(default=None, pattern=r"^#[0-9a-fA-F]{6}$")


class ColumnUpdate(BaseModel):
    """All fields optional — only provided fields are updated."""

    name: str | None = Field(default=None, min_length=1, max_length=50)
    position: int | None = Field(default=None, ge=0)
    color: str | None = Field(default=None, pattern=r"^#[0-9a-fA-F]{6}$")


class ColumnReorder(BaseModel):
    """List of column IDs in their new sequential order."""

    ordered_ids: list[uuid.UUID] = Field(min_length=1)


# ---------------------------------------------------------------------------
# Output schemas
# ---------------------------------------------------------------------------


class ColumnResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    board_id: uuid.UUID
    name: str
    position: int
    color: str | None = None
    created_at: datetime
    updated_at: datetime
