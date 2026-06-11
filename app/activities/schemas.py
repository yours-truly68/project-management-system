import uuid
from datetime import datetime
from typing import Any

from pydantic import BaseModel, ConfigDict, Field
from app.users.schemas import UserResponse


class ActivityResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True, populate_by_name=True)

    id: uuid.UUID
    workspace_id: uuid.UUID
    project_id: uuid.UUID | None = None
    board_id: uuid.UUID | None = None
    task_id: uuid.UUID | None = None
    actor_id: uuid.UUID
    action: str
    metadata: dict[str, Any] | None = Field(None, validation_alias="activity_metadata")
    created_at: datetime

    actor: UserResponse | None = None
