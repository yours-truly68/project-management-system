import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict


class MentionCreate(BaseModel):
    comment_id: uuid.UUID
    mentioned_user_id: uuid.UUID


class MentionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    comment_id: uuid.UUID
    mentioned_user_id: uuid.UUID
    created_at: datetime
