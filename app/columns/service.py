import uuid
from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.users.models import User
from app.columns.models import Column
from app.columns.repository import ColumnRepository
from app.columns.schemas import (
    ColumnCreate,
    ColumnResponse,
    ColumnUpdate,
    ColumnReorder,
)
from app.boards.repository import BoardRepository
from app.projects.repository import ProjectRepository
from app.workspaces.repository import WorkspaceRepository
from app.shared.permissions.policies import has_permission, WorkspaceRole, Permission


class ColumnService:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session
        self.column_repo = ColumnRepository(session)
        self.board_repo = BoardRepository(session)
        self.project_repo = ProjectRepository(session)
        self.workspace_repo = WorkspaceRepository(session)

    async def create_column(
        self, data: ColumnCreate, current_user: User
    ) -> ColumnResponse:
        board = await self.board_repo.get_by_id(data.board_id)
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

        role = await self._get_workspace_role(project.workspace_id, current_user.id)
        if not has_permission(role, Permission.COLUMN_CREATE):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have permission to create columns.",
            )

        # Enforce name uniqueness inside the board
        existing_name = await self.column_repo.get_by_board_and_name(
            data.board_id, data.name
        )
        if existing_name:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Column with name '{data.name}' already exists on this board.",
            )

        # Shift existing columns to accommodate the new column's position
        cols = await self.column_repo.get_board_columns(data.board_id)
        target_pos = max(0, min(data.position, len(cols)))

        column = Column(
            board_id=data.board_id,
            name=data.name,
            position=target_pos,
            color=data.color,
        )
        column = await self.column_repo.create(column)

        # Re-index all positions sequentially
        ordered_ids = [c.id for c in cols]
        ordered_ids.insert(target_pos, column.id)
        await self.column_repo.reorder_columns(ordered_ids)

        await self.session.commit()
        await self.session.refresh(column)

        return ColumnResponse.model_validate(column)

    async def list_board_columns(
        self, board_id: uuid.UUID, current_user: User
    ) -> list[ColumnResponse]:
        board = await self.board_repo.get_by_id(board_id)
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

        role = await self._get_workspace_role(project.workspace_id, current_user.id)
        if not has_permission(role, Permission.COLUMN_VIEW):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have permission to view this board's columns.",
            )

        columns = await self.column_repo.get_board_columns(board_id)
        return [ColumnResponse.model_validate(c) for c in columns]

    async def reorder_columns(
        self, board_id: uuid.UUID, data: ColumnReorder, current_user: User
    ) -> None:
        board = await self.board_repo.get_by_id(board_id)
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

        role = await self._get_workspace_role(project.workspace_id, current_user.id)
        if not has_permission(role, Permission.COLUMN_REORDER):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have permission to reorder columns.",
            )

        # Validate that all incoming IDs match this board
        cols = await self.column_repo.get_board_columns(board_id)
        existing_ids = {c.id for c in cols}
        incoming_ids = set(data.ordered_ids)

        if not incoming_ids.issubset(existing_ids):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="One or more column IDs do not belong to this board.",
            )

        await self.column_repo.reorder_columns(data.ordered_ids)
        await self.session.commit()

    async def update_column(
        self, column_id: uuid.UUID, data: ColumnUpdate, current_user: User
    ) -> ColumnResponse:
        column = await self.column_repo.get_by_id(column_id)
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

        role = await self._get_workspace_role(project.workspace_id, current_user.id)
        if not has_permission(role, Permission.COLUMN_RENAME):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have permission to update columns.",
            )

        update_dict = data.model_dump(exclude_unset=True)

        # Enforce name uniqueness inside the board if changing name
        if "name" in update_dict and update_dict["name"] != column.name:
            existing_name = await self.column_repo.get_by_board_and_name(
                column.board_id, update_dict["name"]
            )
            if existing_name and existing_name.id != column_id:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail=f"Column with name '{update_dict['name']}' already exists on this board.",
                )

        # Shift positions safely if updating position
        if "position" in update_dict and update_dict["position"] != column.position:
            cols = await self.column_repo.get_board_columns(column.board_id)
            ordered_ids = [c.id for c in cols if c.id != column_id]
            target_pos = max(0, min(update_dict["position"], len(ordered_ids)))
            ordered_ids.insert(target_pos, column_id)
            await self.column_repo.reorder_columns(ordered_ids)
            # Remove position from dictionary to prevent double updates or conflicts
            del update_dict["position"]

        updated_column = await self.column_repo.update(column_id, update_dict)
        await self.session.commit()
        await self.session.refresh(updated_column)

        return ColumnResponse.model_validate(updated_column)

    async def delete_column(self, column_id: uuid.UUID, current_user: User) -> None:
        column = await self.column_repo.get_by_id(column_id)
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

        role = await self._get_workspace_role(project.workspace_id, current_user.id)
        if not has_permission(role, Permission.COLUMN_DELETE):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have permission to delete columns.",
            )

        # Delete the column
        await self.column_repo.delete(column)

        # Close the gap in positions
        cols = await self.column_repo.get_board_columns(column.board_id)
        remaining_ids = [c.id for c in cols if c.id != column_id]
        await self.column_repo.reorder_columns(remaining_ids)

        await self.session.commit()

    # ------------------------------------------------------------------
    # Private helpers
    # ------------------------------------------------------------------

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
