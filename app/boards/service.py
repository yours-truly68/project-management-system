import uuid
from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.shared.enums import WorkspaceRole
from app.users.models import User
from app.boards.models import Board
from app.boards.repository import BoardRepository
from app.boards.schemas import BoardCreate, BoardResponse, BoardUpdate
from app.projects.repository import ProjectRepository
from app.workspaces.repository import WorkspaceRepository
from app.workspaces.models import WorkspaceMember


class BoardService:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session
        self.board_repo = BoardRepository(session)
        self.project_repo = ProjectRepository(session)
        self.workspace_repo = WorkspaceRepository(session)

    async def create_board(
        self, data: BoardCreate, current_user: User
    ) -> BoardResponse:
        project = await self.project_repo.get_by_id(data.project_id)
        if not project:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Project not found.",
            )

        # Enforce OWNER or ADMIN role on the workspace
        await self._require_role(
            workspace_id=project.workspace_id,
            user_id=current_user.id,
            allowed_roles={WorkspaceRole.OWNER, WorkspaceRole.ADMIN},
        )

        # Enforce board name uniqueness within project
        existing = await self.board_repo.get_by_project_and_name(
            project_id=data.project_id, name=data.name
        )
        if existing:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Board with name '{data.name}' already exists in this project.",
            )

        board = Board(
            project_id=data.project_id,
            name=data.name,
            description=data.description,
            created_by=current_user.id,
        )
        board = await self.board_repo.create(board)
        await self.session.commit()

        return BoardResponse.model_validate(board)

    async def list_project_boards(
        self, project_id: uuid.UUID, current_user: User
    ) -> list[BoardResponse]:
        project = await self.project_repo.get_by_id(project_id)
        if not project:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Project not found.",
            )

        # Enforce workspace membership
        await self._require_role(
            workspace_id=project.workspace_id,
            user_id=current_user.id,
            allowed_roles={WorkspaceRole.OWNER, WorkspaceRole.ADMIN, WorkspaceRole.MEMBER},
        )

        boards = await self.board_repo.get_by_project(project_id)
        return [BoardResponse.model_validate(b) for b in boards]

    async def get_board(
        self, board_id: uuid.UUID, current_user: User
    ) -> BoardResponse:
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

        # Enforce workspace membership
        await self._require_role(
            workspace_id=project.workspace_id,
            user_id=current_user.id,
            allowed_roles={WorkspaceRole.OWNER, WorkspaceRole.ADMIN, WorkspaceRole.MEMBER},
        )

        return BoardResponse.model_validate(board)

    async def update_board(
        self, board_id: uuid.UUID, data: BoardUpdate, current_user: User
    ) -> BoardResponse:
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

        # Enforce OWNER or ADMIN role on the workspace
        await self._require_role(
            workspace_id=project.workspace_id,
            user_id=current_user.id,
            allowed_roles={WorkspaceRole.OWNER, WorkspaceRole.ADMIN},
        )

        update_dict = data.model_dump(exclude_unset=True)

        if "name" in update_dict and update_dict["name"] != board.name:
            existing = await self.board_repo.get_by_project_and_name(
                project_id=board.project_id, name=update_dict["name"]
            )
            if existing and existing.id != board_id:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail=f"Board with name '{update_dict['name']}' already exists in this project.",
                )

        updated_board = await self.board_repo.update(board_id, update_dict)
        await self.session.commit()

        return BoardResponse.model_validate(updated_board)

    async def delete_board(self, board_id: uuid.UUID, current_user: User) -> None:
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

        # Enforce OWNER or ADMIN role on the workspace
        await self._require_role(
            workspace_id=project.workspace_id,
            user_id=current_user.id,
            allowed_roles={WorkspaceRole.OWNER, WorkspaceRole.ADMIN},
        )

        await self.board_repo.delete(board)
        await self.session.commit()

    # ------------------------------------------------------------------
    # Private helpers
    # ------------------------------------------------------------------

    async def _require_role(
        self,
        workspace_id: uuid.UUID,
        user_id: uuid.UUID,
        allowed_roles: set[WorkspaceRole],
    ) -> WorkspaceMember:
        membership = await self.workspace_repo.get_membership(workspace_id, user_id)
        if not membership or membership.role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have permission to perform this action in this workspace.",
            )
        return membership
