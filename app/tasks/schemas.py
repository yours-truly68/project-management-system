import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field

from app.shared.enums import Priority


# ---------------------------------------------------------------------------
# Input schemas
# ---------------------------------------------------------------------------

class TaskCreate(BaseModel):
    column_id: uuid.UUID
    title: str = Field(min_length=1, max_length=100)
    description: str | None = None
    priority: Priority = Priority.MEDIUM
    assignee_id: uuid.UUID | None = None
    reporter_id: uuid.UUID | None = None
    due_date: datetime | None = None
    position: int = Field(ge=0)


class TaskUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=1, max_length=100)
    description: str | None = None
    priority: Priority | None = None
    assignee_id: uuid.UUID | None = None
    reporter_id: uuid.UUID | None = None
    due_date: datetime | None = None


class TaskMove(BaseModel):
    """Schema to move a task within its column or to a different column."""

    column_id: uuid.UUID
    position: int = Field(ge=0)


class TaskReorder(BaseModel):
    """Schema to reorder a collection of tasks within a specific column."""

    column_id: uuid.UUID
    ordered_ids: list[uuid.UUID] = Field(min_length=1)


class TaskAssign(BaseModel):
    """Schema to change task assignment."""

    assignee_id: uuid.UUID | None = None


# ---------------------------------------------------------------------------
# Output schemas
# ---------------------------------------------------------------------------

class TaskResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    column_id: uuid.UUID
    title: str
    description: str | None = None
    priority: Priority
    assignee_id: uuid.UUID | None = None
    reporter_id: uuid.UUID | None = None
    due_date: datetime | None = None
    position: int
    created_at: datetime
    updated_at: datetime
