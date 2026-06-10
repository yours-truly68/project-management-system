"""
Project repository — database queries only.

No business logic. No authorization. No validation.
Those responsibilities belong to the service layer.
"""

import uuid
from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.projects.models import Project


class ProjectRepository:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    async def create(self, project: Project) -> Project:
        self.session.add(project)
        await self.session.flush()
        return project

    async def get_by_id(self, project_id: uuid.UUID) -> Project | None:
        return await self.session.get(Project, project_id)

    async def get_by_key(self, workspace_id: uuid.UUID, key: str) -> Project | None:
        """Fetch a project by its unique key within a workspace."""
        stmt = select(Project).where(
            Project.workspace_id == workspace_id, Project.key == key
        )
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()

    async def list_workspace_projects(
        self, workspace_id: uuid.UUID, include_archived: bool = False
    ) -> list[Project]:
        """List all projects in a workspace, optionally including archived ones."""
        stmt = select(Project).where(Project.workspace_id == workspace_id)
        if not include_archived:
            stmt = stmt.where(Project.archived_at.is_(None))
        stmt = stmt.order_by(Project.created_at.desc())

        result = await self.session.execute(stmt)
        return list(result.scalars().all())

    async def update(self, project_id: uuid.UUID, data: dict) -> Project | None:
        """Update specific fields of a project and return the refreshed instance."""
        stmt = (
            update(Project)
            .where(Project.id == project_id)
            .values(**data)
            .returning(Project)
        )
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()

    async def delete(self, project: Project) -> None:
        """Delete a project record."""
        await self.session.delete(project)
        await self.session.flush()
