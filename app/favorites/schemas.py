import uuid
from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field

from app.projects.schemas import ProjectResponse
from app.boards.schemas import BoardResponse


class FavoriteCreate(BaseModel):
    entity_type: str = Field(min_length=1, max_length=50, pattern="^(project|board)$")
    entity_id: uuid.UUID


class FavoriteResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    user_id: uuid.UUID
    entity_type: str
    entity_id: uuid.UUID
    created_at: datetime
    updated_at: datetime

    # Dynamically resolved details
    project: ProjectResponse | None = None
    board: BoardResponse | None = None
