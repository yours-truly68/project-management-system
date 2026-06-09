"""
Workspace service — business logic and authorization.

Authorization rules follow PERMISSIONS_MATRIX.md:
- Create workspace: any authenticated user.
- Invite/remove members: OWNER and ADMIN only.
- Admin cannot remove OWNER or other ADMINs.
- Owner cannot remove themselves (must transfer ownership first).
- List workspaces: returns only workspaces the user belongs to.
"""

import uuid

from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.shared.enums import WorkspaceRole
from app.shared.permissions.policies import has_permission, Permission
from app.users.models import User
from app.users.repository import UserRepository
from app.workspaces.models import Workspace, WorkspaceMember
from app.workspaces.repository import WorkspaceRepository
from app.workspaces.schemas import WorkspaceCreate, WorkspaceResponse

ROLE_HIERARCHY = {
    WorkspaceRole.OWNER: 3,
    WorkspaceRole.ADMIN: 2,
    WorkspaceRole.MEMBER: 1,
}


class WorkspaceService:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session
        self.workspace_repo = WorkspaceRepository(session)
        self.user_repo = UserRepository(session)

    async def create_workspace(
        self, data: WorkspaceCreate, owner: User
    ) -> WorkspaceResponse:
        """Create a workspace and add the creator as OWNER."""

        if await self.workspace_repo.get_by_slug(data.slug):
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="A workspace with this slug already exists.",
            )

        workspace = Workspace(
            name=data.name,
            slug=data.slug,
            description=data.description,
            owner_id=owner.id,
        )
        workspace = await self.workspace_repo.create(workspace)

        owner_member = WorkspaceMember(
            workspace_id=workspace.id,
            user_id=owner.id,
            role=WorkspaceRole.OWNER,
        )
        await self.workspace_repo.add_member(owner_member)
        await self.session.commit()

        return WorkspaceResponse.model_validate(workspace)

    async def list_user_workspaces(self, user: User) -> list[WorkspaceResponse]:
        """Return all workspaces the user belongs to."""
        workspaces = await self.workspace_repo.get_user_workspaces(user.id)
        return [WorkspaceResponse.model_validate(w) for w in workspaces]

    async def invite_member(
        self,
        workspace_id: uuid.UUID,
        invitee_email: str,
        role: WorkspaceRole,
        current_user: User,
    ) -> None:
        """Add a user to a workspace. Requires WORKSPACE_INVITE_MEMBERS permission."""

        actor_role = await self._get_membership_role(workspace_id, current_user.id)
        if not has_permission(actor_role, Permission.WORKSPACE_INVITE_MEMBERS):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have permission to invite members.",
            )

        # Cannot invite someone as OWNER — ownership is transferred, not invited
        if role == WorkspaceRole.OWNER:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot invite a member as OWNER. Use ownership transfer.",
            )

        invitee = await self.user_repo.get_by_email(invitee_email)
        if not invitee:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found.",
            )

        existing = await self.workspace_repo.get_membership(workspace_id, invitee.id)
        if existing:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="User is already a member of this workspace.",
            )

        member = WorkspaceMember(
            workspace_id=workspace_id,
            user_id=invitee.id,
            role=role,
        )
        await self.workspace_repo.add_member(member)
        await self.session.commit()

    async def remove_member(
        self,
        workspace_id: uuid.UUID,
        target_user_id: uuid.UUID,
        current_user: User,
    ) -> None:
        """Remove a member from a workspace. Requires WORKSPACE_REMOVE_MEMBERS permission."""

        actor_role = await self._get_membership_role(workspace_id, current_user.id)
        if not has_permission(actor_role, Permission.WORKSPACE_REMOVE_MEMBERS):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have permission to remove members.",
            )

        target_membership = await self.workspace_repo.get_membership(
            workspace_id, target_user_id
        )
        if not target_membership:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Member not found in this workspace.",
            )

        # Owner cannot remove themselves
        if (
            target_user_id == current_user.id
            and target_membership.role == WorkspaceRole.OWNER
        ):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Owner cannot remove themselves. Transfer ownership first.",
            )

        # Actor cannot remove members of equal or higher hierarchy rank
        if target_user_id != current_user.id:
            actor_rank = ROLE_HIERARCHY.get(actor_role, 0)
            target_rank = ROLE_HIERARCHY.get(target_membership.role, 0)
            if actor_rank <= target_rank:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="You do not have permission to remove members of equal or higher rank.",
                )

        await self.session.delete(target_membership)
        await self.session.commit()

    # ------------------------------------------------------------------
    # Private helpers
    # ------------------------------------------------------------------

    async def _get_membership_role(
        self, workspace_id: uuid.UUID, user_id: uuid.UUID
    ) -> WorkspaceRole:
        """Fetch the member's role or raise an access error."""
        membership = await self.workspace_repo.get_membership(workspace_id, user_id)
        if not membership:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not belong to this workspace.",
            )
        return membership.role
