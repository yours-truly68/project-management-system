import uuid
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.activity_logs.schemas import ActivityLogResponse
from app.activity_logs.service import ActivityLogService
from app.auth.dependencies import get_current_user
from app.database.session import get_db
from app.users.models import User

router = APIRouter(prefix="/activity-logs", tags=["activity-logs"])


@router.get("/workspace/{workspace_id}", response_model=list[ActivityLogResponse])
async def get_workspace_activity(
    workspace_id: uuid.UUID,
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0),
    user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_db),
) -> list[ActivityLogResponse]:
    service = ActivityLogService(session)
    return await service.get_workspace_activity(
        workspace_id=workspace_id,
        current_user=user,
        limit=limit,
        offset=offset,
    )


@router.get(
    "/entity/{entity_type}/{entity_id}", response_model=list[ActivityLogResponse]
)
async def get_entity_activity(
    entity_type: str,
    entity_id: uuid.UUID,
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0),
    user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_db),
) -> list[ActivityLogResponse]:
    service = ActivityLogService(session)
    return await service.get_entity_activity(
        entity_type=entity_type,
        entity_id=entity_id,
        current_user=user,
        limit=limit,
        offset=offset,
    )
