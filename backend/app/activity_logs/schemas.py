import uuid
from datetime import datetime
from typing import Any

from pydantic import BaseModel, ConfigDict, Field


class ActivityLogResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True, populate_by_name=True)

    id: uuid.UUID
    workspace_id: uuid.UUID
    actor_id: uuid.UUID
    entity_type: str
    entity_id: uuid.UUID
    action: str
    metadata: dict[str, Any] | None = Field(None, validation_alias="activity_metadata")
    created_at: datetime
