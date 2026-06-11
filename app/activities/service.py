import uuid
from typing import Any
from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.activities.models import Activity
from app.activities.repository import ActivityRepository
from app.workspaces.repository import WorkspaceRepository
from app.users.models import User


class ActivityService:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session
        self.repository = ActivityRepository(session)
        self.workspace_repo = WorkspaceRepository(session)

    async def create_activity(
        self,
        workspace_id: uuid.UUID,
        actor_id: uuid.UUID,
        action: str,
        project_id: uuid.UUID | None = None,
        board_id: uuid.UUID | None = None,
        task_id: uuid.UUID | None = None,
        metadata: dict[str, Any] | None = None,
    ) -> Activity:
        activity = Activity(
            workspace_id=workspace_id,
            actor_id=actor_id,
            action=action,
            project_id=project_id,
            board_id=board_id,
            task_id=task_id,
            activity_metadata=metadata,
        )
        return await self.repository.create(activity)

    async def get_workspace_activities(
        self,
        workspace_id: uuid.UUID,
        current_user: User,
        project_id: uuid.UUID | None = None,
        board_id: uuid.UUID | None = None,
    ) -> list[Activity]:
        membership = await self.workspace_repo.get_membership(
            workspace_id, current_user.id
        )
        if not membership:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not belong to this workspace.",
            )

        return await self.repository.list_activities(
            workspace_id=workspace_id,
            project_id=project_id,
            board_id=board_id,
        )
