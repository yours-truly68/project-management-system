import uuid

from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.boards.repository import BoardRepository
from app.columns.repository import ColumnRepository
from app.comments.models import TaskComment
from app.comments.repository import CommentRepository
from app.comments.schemas import CommentCreate, CommentResponse, CommentUpdate
from app.projects.repository import ProjectRepository
from app.shared.enums import WorkspaceRole
from app.shared.permissions.policies import has_permission, Permission
from app.tasks.repository import TaskRepository
from app.users.models import User
from app.workspaces.repository import WorkspaceRepository


class CommentService:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session
        self.comment_repo = CommentRepository(session)
        self.task_repo = TaskRepository(session)
        self.column_repo = ColumnRepository(session)
        self.board_repo = BoardRepository(session)
        self.project_repo = ProjectRepository(session)
        self.workspace_repo = WorkspaceRepository(session)

    async def create_comment(
        self, data: CommentCreate, current_user: User
    ) -> CommentResponse:
        """Create a comment on a task. Requires task workspace access and COMMENT_CREATE permission."""
        task = await self.task_repo.get_by_id(data.task_id)
        if not task:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Task not found.",
            )

        role = await self._get_task_workspace_role(data.task_id, current_user.id)
        if not has_permission(role, Permission.COMMENT_CREATE):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have permission to comment on this task.",
            )

        comment = TaskComment(
            task_id=data.task_id,
            author_id=current_user.id,
            content=data.content,
        )
        comment = await self.comment_repo.create(comment)

        # TODO: Parse Mentions from comment content (future integration)
        # TODO: Create Activity Log for comment creation (future integration)
        # TODO: Dispatch Notification to task subscribers/assignee/reporter (future integration)

        await self.session.commit()
        await self.session.refresh(comment)
        return CommentResponse.model_validate(comment)

    async def update_comment(
        self, comment_id: uuid.UUID, data: CommentUpdate, current_user: User
    ) -> CommentResponse:
        """Update an existing comment. Requires COMMENT_EDIT_OWN permission if author."""
        comment = await self.comment_repo.get_by_id(comment_id)
        if not comment:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Comment not found.",
            )

        role = await self._get_task_workspace_role(comment.task_id, current_user.id)

        is_author = comment.author_id == current_user.id
        can_edit = is_author and has_permission(
            role, Permission.COMMENT_EDIT_OWN, is_resource_creator=True
        )

        if not can_edit:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have permission to edit this comment.",
            )

        updated = await self.comment_repo.update(comment_id, {"content": data.content})

        # TODO: Parse Mentions in updated comment content (future integration)
        # TODO: Log activity for comment update (future integration)

        await self.session.commit()
        await self.session.refresh(updated)
        return CommentResponse.model_validate(updated)

    async def delete_comment(self, comment_id: uuid.UUID, current_user: User) -> None:
        """Delete a comment. Requires COMMENT_DELETE_ANY or COMMENT_DELETE_OWN permission if author."""
        comment = await self.comment_repo.get_by_id(comment_id)
        if not comment:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Comment not found.",
            )

        role = await self._get_task_workspace_role(comment.task_id, current_user.id)

        is_author = comment.author_id == current_user.id
        can_delete = has_permission(role, Permission.COMMENT_DELETE_ANY) or (
            is_author
            and has_permission(
                role, Permission.COMMENT_DELETE_OWN, is_resource_creator=True
            )
        )

        if not can_delete:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have permission to delete this comment.",
            )

        await self.comment_repo.delete(comment)

        # TODO: Log activity for comment deletion (future integration)

        await self.session.commit()

    async def list_task_comments(
        self, task_id: uuid.UUID, current_user: User
    ) -> list[CommentResponse]:
        """List all comments of a task. Requires TASK_VIEW permission on task workspace."""
        task = await self.task_repo.get_by_id(task_id)
        if not task:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Task not found.",
            )

        role = await self._get_task_workspace_role(task_id, current_user.id)
        if not has_permission(role, Permission.TASK_VIEW):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have permission to view comments of this task.",
            )

        comments = await self.comment_repo.get_task_comments(task_id)
        return [CommentResponse.model_validate(c) for c in comments]

    # ------------------------------------------------------------------
    # Private helpers
    # ------------------------------------------------------------------

    async def _get_task_workspace_role(
        self, task_id: uuid.UUID, user_id: uuid.UUID
    ) -> WorkspaceRole:
        """Resolve workspace role of user for task context."""
        task = await self.task_repo.get_by_id(task_id)
        if not task:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Task not found.",
            )

        column = await self.column_repo.get_by_id(task.column_id)
        if not column:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Column not found.",
            )

        board = await self.board_repo.get_by_id(column.board_id)
        if not board:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Board not found.",
            )

        project = await self.project_repo.get_by_id(board.project_id)
        if not project:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Project not found.",
            )

        membership = await self.workspace_repo.get_membership(
            project.workspace_id, user_id
        )
        if not membership:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not belong to this workspace.",
            )
        return membership.role
