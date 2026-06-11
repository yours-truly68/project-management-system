import uuid
from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.shared.enums import WorkspaceRole
from app.users.models import User
from app.favorites.models import Favorite
from app.favorites.repository import FavoriteRepository
from app.favorites.schemas import FavoriteCreate, FavoriteResponse
from app.projects.repository import ProjectRepository
from app.projects.schemas import ProjectResponse
from app.boards.repository import BoardRepository
from app.boards.schemas import BoardResponse
from app.workspaces.repository import WorkspaceRepository
from app.shared.permissions.policies import has_permission, Permission


class FavoriteService:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session
        self.fav_repo = FavoriteRepository(session)
        self.project_repo = ProjectRepository(session)
        self.board_repo = BoardRepository(session)
        self.workspace_repo = WorkspaceRepository(session)

    async def list_favorites(self, current_user: User) -> list[FavoriteResponse]:
        favorites = await self.fav_repo.list_by_user(current_user.id)
        results = []

        for fav in favorites:
            if fav.entity_type == "project":
                project = await self.project_repo.get_by_id(fav.entity_id)
                if not project or project.archived_at is not None:
                    continue
                try:
                    role = await self._get_workspace_role(project.workspace_id, current_user.id)
                    if not has_permission(role, Permission.PROJECT_VIEW):
                        continue
                except HTTPException:
                    continue

                response = FavoriteResponse.model_validate(fav)
                response.project = ProjectResponse.model_validate(project)
                results.append(response)

            elif fav.entity_type == "board":
                board = await self.board_repo.get_by_id(fav.entity_id)
                if not board:
                    continue
                project = await self.project_repo.get_by_id(board.project_id)
                if not project or project.archived_at is not None:
                    continue
                try:
                    role = await self._get_workspace_role(project.workspace_id, current_user.id)
                    if not has_permission(role, Permission.BOARD_VIEW):
                        continue
                except HTTPException:
                    continue

                response = FavoriteResponse.model_validate(fav)
                response.board = BoardResponse.model_validate(board)
                response.project = ProjectResponse.model_validate(project)
                results.append(response)

        return results

    async def create_favorite(
        self, data: FavoriteCreate, current_user: User
    ) -> FavoriteResponse:
        # Check duplicate
        existing = await self.fav_repo.get_by_user_and_entity(
            current_user.id, data.entity_type, data.entity_id
        )
        if existing:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="This entity is already favorited.",
            )

        if data.entity_type == "project":
            project = await self.project_repo.get_by_id(data.entity_id)
            if not project:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Project not found.",
                )
            if project.archived_at is not None:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Cannot favorite an archived project.",
                )

            role = await self._get_workspace_role(project.workspace_id, current_user.id)
            if not has_permission(role, Permission.PROJECT_VIEW):
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="You do not have permission to view this project.",
                )

            favorite = Favorite(
                user_id=current_user.id,
                entity_type=data.entity_type,
                entity_id=data.entity_id,
            )
            favorite = await self.fav_repo.create(favorite)
            await self.session.commit()
            await self.session.refresh(favorite)

            response = FavoriteResponse.model_validate(favorite)
            response.project = ProjectResponse.model_validate(project)
            return response

        elif data.entity_type == "board":
            board = await self.board_repo.get_by_id(data.entity_id)
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
            if project.archived_at is not None:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Cannot favorite a board belonging to an archived project.",
                )

            role = await self._get_workspace_role(project.workspace_id, current_user.id)
            if not has_permission(role, Permission.BOARD_VIEW):
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="You do not have permission to view this board.",
                )

            favorite = Favorite(
                user_id=current_user.id,
                entity_type=data.entity_type,
                entity_id=data.entity_id,
            )
            favorite = await self.fav_repo.create(favorite)
            await self.session.commit()
            await self.session.refresh(favorite)

            response = FavoriteResponse.model_validate(favorite)
            response.board = BoardResponse.model_validate(board)
            response.project = ProjectResponse.model_validate(project)
            return response

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Unsupported entity type.",
        )

    async def delete_favorite(self, favorite_id: uuid.UUID, current_user: User) -> None:
        favorite = await self.fav_repo.get_by_id(favorite_id)
        if not favorite:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Favorite not found.",
            )

        if favorite.user_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have permission to delete this favorite.",
            )

        await self.fav_repo.delete(favorite)
        await self.session.commit()

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
