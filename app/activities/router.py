import uuid
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.dependencies import get_current_user
from app.database.session import get_db
from app.users.models import User
from app.activities.schemas import ActivityResponse
from app.activities.service import ActivityService

router = APIRouter(prefix="/activities", tags=["activities"])


@router.get("/", response_model=list[ActivityResponse])
async def list_activities(
    workspace_id: uuid.UUID = Query(...),
    project_id: uuid.UUID | None = Query(None),
    board_id: uuid.UUID | None = Query(None),
    user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_db),
) -> list[ActivityResponse]:
    service = ActivityService(session)
    activities = await service.get_workspace_activities(
        workspace_id=workspace_id,
        current_user=user,
        project_id=project_id,
        board_id=board_id,
    )
    return activities
