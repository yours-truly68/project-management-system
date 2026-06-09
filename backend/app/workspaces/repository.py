"""
Workspace repository — database queries only.

No business logic. No authorization. No validation.
Those responsibilities belong to the service layer.
"""

import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.workspaces.models import Workspace, WorkspaceMember


class WorkspaceRepository:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    async def create(self, workspace: Workspace) -> Workspace:
        self.session.add(workspace)
        await self.session.flush()
        return workspace

    async def get_by_id(self, workspace_id: uuid.UUID) -> Workspace | None:
        return await self.session.get(Workspace, workspace_id)

    async def get_by_slug(self, slug: str) -> Workspace | None:
        stmt = select(Workspace).where(Workspace.slug == slug)
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()

    async def get_user_workspaces(self, user_id: uuid.UUID) -> list[Workspace]:
        """Return all workspaces where the user is a member."""
        stmt = (
            select(Workspace)
            .join(WorkspaceMember, WorkspaceMember.workspace_id == Workspace.id)
            .where(WorkspaceMember.user_id == user_id)
            .order_by(Workspace.created_at.desc())
        )
        result = await self.session.execute(stmt)
        return list(result.scalars().all())

    async def add_member(self, member: WorkspaceMember) -> WorkspaceMember:
        self.session.add(member)
        await self.session.flush()
        return member

    async def get_membership(
        self, workspace_id: uuid.UUID, user_id: uuid.UUID
    ) -> WorkspaceMember | None:
        """Look up a specific user's membership in a workspace."""
        stmt = select(WorkspaceMember).where(
            WorkspaceMember.workspace_id == workspace_id,
            WorkspaceMember.user_id == user_id,
        )
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()
