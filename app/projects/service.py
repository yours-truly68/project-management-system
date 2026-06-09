"""
Project service — business logic and authorization.

Authorization rules follow PERMISSIONS_MATRIX.md:
- Create Project: OWNER, ADMIN only.
- View Project: OWNER, ADMIN, MEMBER.
- Update Project (including Archive): OWNER, ADMIN only.
- Delete Project: OWNER only.
"""

import uuid
from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.shared.enums import WorkspaceRole
from app.users.models import User
from app.projects.models import Project
from app.projects.repository import ProjectRepository
from app.projects.schemas import ProjectCreate, ProjectResponse, ProjectUpdate
from app.workspaces.repository import WorkspaceRepository
from app.workspaces.models import WorkspaceMember


class ProjectService:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session
        self.project_repo = ProjectRepository(session)
        self.workspace_repo = WorkspaceRepository(session)

    async def create_project(
        self, data: ProjectCreate, current_user: User
    ) -> ProjectResponse:
        """Create a project within a workspace. Requires OWNER or ADMIN role."""
        # Validate workspace membership & role
        await self._require_role(
            workspace_id=data.workspace_id,
            user_id=current_user.id,
            allowed_roles={WorkspaceRole.OWNER, WorkspaceRole.ADMIN},
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

        return ProjectResponse.model_validate(project)

    async def list_workspace_projects(
        self, workspace_id: uuid.UUID, current_user: User, include_archived: bool = False
    ) -> list[ProjectResponse]:
        """List all projects in a workspace. Requires workspace membership."""
        # Any membership role allows viewing projects
        await self._require_role(
            workspace_id=workspace_id,
            user_id=current_user.id,
            allowed_roles={WorkspaceRole.OWNER, WorkspaceRole.ADMIN, WorkspaceRole.MEMBER},
        )

        projects = await self.project_repo.list_workspace_projects(
            workspace_id=workspace_id, include_archived=include_archived
        )
        return [ProjectResponse.model_validate(p) for p in projects]

    async def get_project(
        self, project_id: uuid.UUID, current_user: User
    ) -> ProjectResponse:
        """Get project by ID. Requires workspace membership."""
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
        return ProjectResponse.model_validate(project)

    async def update_project(
        self, project_id: uuid.UUID, data: ProjectUpdate, current_user: User
    ) -> ProjectResponse:
        """Update project details. Requires OWNER or ADMIN role."""
        project = await self.project_repo.get_by_id(project_id)
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

        return ProjectResponse.model_validate(updated_project)

    async def delete_project(self, project_id: uuid.UUID, current_user: User) -> None:
        """Delete a project. Requires OWNER role."""
        project = await self.project_repo.get_by_id(project_id)
        if not project:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Project not found.",
            )

        # Only OWNER can delete projects (as per PERMISSIONS_MATRIX.md)
        await self._require_role(
            workspace_id=project.workspace_id,
            user_id=current_user.id,
            allowed_roles={WorkspaceRole.OWNER},
        )

        await self.project_repo.delete(project)
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
        """Assert the user has one of the allowed roles in the workspace."""
        membership = await self.workspace_repo.get_membership(workspace_id, user_id)
        if not membership or membership.role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have permission to perform this action in this workspace.",
            )
        return membership
