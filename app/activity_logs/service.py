import uuid
from typing import Any

from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.activity_logs.models import ActivityLog
from app.activity_logs.repository import ActivityLogRepository
from app.activity_logs.schemas import ActivityLogResponse
from app.boards.repository import BoardRepository
from app.columns.repository import ColumnRepository
from app.comments.repository import CommentRepository
from app.projects.repository import ProjectRepository
from app.shared.enums import WorkspaceRole
from app.shared.permissions.policies import has_permission, Permission
from app.tasks.repository import TaskRepository
from app.users.models import User
from app.workspaces.repository import WorkspaceRepository


class ActivityLogService:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session
        self.activity_repo = ActivityLogRepository(session)
        self.workspace_repo = WorkspaceRepository(session)
        self.project_repo = ProjectRepository(session)
        self.board_repo = BoardRepository(session)
        self.column_repo = ColumnRepository(session)
        self.task_repo = TaskRepository(session)
        self.comment_repo = CommentRepository(session)

    async def record_activity(
        self,
        workspace_id: uuid.UUID,
        actor_id: uuid.UUID,
        entity_type: str,
        entity_id: uuid.UUID,
        action: str,
        metadata: dict[str, Any] | None = None,
    ) -> ActivityLogResponse:
        """
        Record a new activity event.
        Designed to allow future event-driven extraction (e.g. outbox pattern or direct publishing).
        """
        log = ActivityLog(
            workspace_id=workspace_id,
            actor_id=actor_id,
            entity_type=entity_type,
            entity_id=entity_id,
            action=action,
            activity_metadata=metadata,
        )
        created = await self.activity_repo.create(log)

        # Emit domain event for decoupling/downstream consumption
        await self._publish_domain_event(created)

        return ActivityLogResponse.model_validate(created)

    async def get_workspace_activity(
        self,
        workspace_id: uuid.UUID,
        current_user: User,
        limit: int = 50,
        offset: int = 0,
    ) -> list[ActivityLogResponse]:
        """Retrieve timeline activities for a workspace. Requires ACTIVITY_VIEW permission."""
        role = await self._get_workspace_role(workspace_id, current_user.id)
        if not has_permission(role, Permission.ACTIVITY_VIEW):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have permission to view activity logs for this workspace.",
            )

        logs = await self.activity_repo.get_workspace_activity(
            workspace_id=workspace_id,
            limit=limit,
            offset=offset,
        )
        return [ActivityLogResponse.model_validate(log) for log in logs]

    async def get_entity_activity(
        self,
        entity_type: str,
        entity_id: uuid.UUID,
        current_user: User,
        limit: int = 50,
        offset: int = 0,
    ) -> list[ActivityLogResponse]:
        """
        Retrieve timeline activities for a specific entity.
        Resolves entity's workspace context and validates permission.
        """
        workspace_id = await self._resolve_entity_workspace(entity_type, entity_id)

        role = await self._get_workspace_role(workspace_id, current_user.id)
        # Verify read access for the entity type itself
        if not await self._has_entity_view_permission(role, entity_type):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"You do not have permission to view this {entity_type.lower()}.",
            )

        logs = await self.activity_repo.get_entity_activity(
            entity_type=entity_type,
            entity_id=entity_id,
            limit=limit,
            offset=offset,
        )
        return [ActivityLogResponse.model_validate(log) for log in logs]

    # ------------------------------------------------------------------
    # Private / Extensibility Helpers
    # ------------------------------------------------------------------

    async def _publish_domain_event(self, log: ActivityLog) -> None:
        """
        TODO: Implement event-driven dispatch (e.g. publish to Kafka/RabbitMQ/Redis Stream,
        or write to a transactional outbox table for async background workers).
        This decouples activity logging from the primary web request transaction.
        """
        pass

    async def _get_workspace_role(
        self, workspace_id: uuid.UUID, user_id: uuid.UUID
    ) -> WorkspaceRole:
        membership = await self.workspace_repo.get_membership(workspace_id, user_id)
        if not membership:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not belong to this workspace.",
            )
        return membership.role

    async def _resolve_entity_workspace(
        self, entity_type: str, entity_id: uuid.UUID
    ) -> uuid.UUID:
        """Resolve the workspace_id of an entity using repositories only."""
        etype = entity_type.upper()
        if etype == "PROJECT":
            project = await self.project_repo.get_by_id(entity_id)
            if not project:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Project not found.",
                )
            return project.workspace_id

        elif etype == "BOARD":
            board = await self.board_repo.get_by_id(entity_id)
            if not board:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Board not found.",
                )
            project = await self.project_repo.get_by_id(board.project_id)
            if not project:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Project associated with board not found.",
                )
            return project.workspace_id

        elif etype == "TASK":
            task = await self.task_repo.get_by_id(entity_id)
            if not task:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Task not found.",
                )
            column = await self.column_repo.get_by_id(task.column_id)
            if not column:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Column associated with task not found.",
                )
            board = await self.board_repo.get_by_id(column.board_id)
            if not board:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Board associated with task not found.",
                )
            project = await self.project_repo.get_by_id(board.project_id)
            if not project:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Project associated with task not found.",
                )
            return project.workspace_id

        elif etype == "COMMENT":
            comment = await self.comment_repo.get_by_id(entity_id)
            if not comment:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Comment not found.",
                )
            task = await self.task_repo.get_by_id(comment.task_id)
            if not task:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Task associated with comment not found.",
                )
            column = await self.column_repo.get_by_id(task.column_id)
            if not column:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Column associated with comment not found.",
                )
            board = await self.board_repo.get_by_id(column.board_id)
            if not board:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Board associated with comment not found.",
                )
            project = await self.project_repo.get_by_id(board.project_id)
            if not project:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Project associated with comment not found.",
                )
            return project.workspace_id

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported entity type for activity resolution: {entity_type}",
        )

    async def _has_entity_view_permission(
        self, role: WorkspaceRole, entity_type: str
    ) -> bool:
        """Check if the user role allows viewing the underlying entity type."""
        etype = entity_type.upper()
        if etype == "PROJECT":
            return has_permission(role, Permission.PROJECT_VIEW)
        elif etype == "BOARD":
            return has_permission(role, Permission.BOARD_VIEW)
        elif etype in ("TASK", "COMMENT"):
            return has_permission(role, Permission.TASK_VIEW)
        return False
