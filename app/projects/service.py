import uuid
from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.shared.enums import WorkspaceRole
from app.users.models import User
from app.projects.models import Project
from app.projects.repository import ProjectRepository
from app.projects.schemas import ProjectCreate, ProjectResponse, ProjectUpdate
from app.workspaces.repository import WorkspaceRepository
from app.shared.permissions.policies import has_permission, Permission


class ProjectService:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session
        self.project_repo = ProjectRepository(session)
        self.workspace_repo = WorkspaceRepository(session)

    async def create_project(
        self, data: ProjectCreate, current_user: User
    ) -> ProjectResponse:
        """Create a project within a workspace. Requires PROJECT_CREATE permission."""
        role = await self._get_workspace_role(data.workspace_id, current_user.id)
        if not has_permission(role, Permission.PROJECT_CREATE):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have permission to create projects.",
            )

        # Check project key uniqueness within the workspace
        existing_project = await self.project_repo.get_by_key(
            workspace_id=data.workspace_id, key=data.key
        )
        if existing_project:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Project key '{data.key}' already exists in this workspace.",
            )

        project = Project(
            workspace_id=data.workspace_id,
            name=data.name,
            key=data.key.upper(),
            description=data.description,
            created_by=current_user.id,
        )
        project = await self.project_repo.create(project)
        await self.session.commit()
        await self.session.refresh(project)

        return ProjectResponse.model_validate(project)

    async def list_workspace_projects(
        self,
        workspace_id: uuid.UUID,
        current_user: User,
        include_archived: bool = False,
    ) -> list[ProjectResponse]:
        """List all projects in a workspace. Requires PROJECT_VIEW permission."""
        role = await self._get_workspace_role(workspace_id, current_user.id)
        if not has_permission(role, Permission.PROJECT_VIEW):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have permission to view projects in this workspace.",
            )

        projects = await self.project_repo.list_workspace_projects(
            workspace_id=workspace_id, include_archived=include_archived
        )
        return [ProjectResponse.model_validate(p) for p in projects]

    async def get_project(
        self, project_id: uuid.UUID, current_user: User
    ) -> ProjectResponse:
        """Get project by ID. Requires PROJECT_VIEW permission."""
        project = await self.project_repo.get_by_id(project_id)
        if not project:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Project not found.",
            )

        role = await self._get_workspace_role(project.workspace_id, current_user.id)
        if not has_permission(role, Permission.PROJECT_VIEW):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have permission to view this project.",
            )
        return ProjectResponse.model_validate(project)

    async def update_project(
        self, project_id: uuid.UUID, data: ProjectUpdate, current_user: User
    ) -> ProjectResponse:
        """Update project details. Requires PROJECT_UPDATE permission."""
        project = await self.project_repo.get_by_id(project_id)
        if not project:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Project not found.",
            )

        role = await self._get_workspace_role(project.workspace_id, current_user.id)
        if not has_permission(role, Permission.PROJECT_UPDATE):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have permission to update this project.",
            )

        update_dict = data.model_dump(exclude_unset=True)

        # If key is changing, validate uniqueness
        if "key" in update_dict and update_dict["key"] != project.key:
            normalized_key = update_dict["key"].upper()
            existing_project = await self.project_repo.get_by_key(
                workspace_id=project.workspace_id, key=normalized_key
            )
            if existing_project and existing_project.id != project_id:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail=f"Project key '{normalized_key}' already exists in this workspace.",
                )
            update_dict["key"] = normalized_key

        updated_project = await self.project_repo.update(project_id, update_dict)
        await self.session.commit()
        await self.session.refresh(updated_project)

        return ProjectResponse.model_validate(updated_project)

    async def delete_project(self, project_id: uuid.UUID, current_user: User) -> None:
        """Delete a project. Requires PROJECT_DELETE permission."""
        project = await self.project_repo.get_by_id(project_id)
        if not project:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Project not found.",
            )

        role = await self._get_workspace_role(project.workspace_id, current_user.id)
        if not has_permission(role, Permission.PROJECT_DELETE):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have permission to delete this project.",
            )

        await self.project_repo.delete(project)
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
