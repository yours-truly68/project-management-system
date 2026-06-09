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
from app.workspaces.schemas import (
    WorkspaceCreate,
    WorkspaceResponse,
    WorkspaceUpdate,
    WorkspaceMemberDetailResponse,
)

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

    async def update_workspace(
        self, workspace_id: uuid.UUID, data: WorkspaceUpdate, current_user: User
    ) -> WorkspaceResponse:
        """Update workspace details. Requires WORKSPACE_UPDATE permission."""
        actor_role = await self._get_membership_role(workspace_id, current_user.id)
        if not has_permission(actor_role, Permission.WORKSPACE_UPDATE):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have permission to update this workspace.",
            )

        workspace = await self.workspace_repo.get_by_id(workspace_id)
        if not workspace:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Workspace not found.",
            )

        if data.slug is not None and data.slug != workspace.slug:
            existing = await self.workspace_repo.get_by_slug(data.slug)
            if existing:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="A workspace with this slug already exists.",
                )

        if data.name is not None:
            workspace.name = data.name
        if data.slug is not None:
            workspace.slug = data.slug
        if data.description is not None:
            workspace.description = data.description

        await self.workspace_repo.update(workspace)
        await self.session.commit()
        return WorkspaceResponse.model_validate(workspace)

    async def delete_workspace(
        self, workspace_id: uuid.UUID, current_user: User
    ) -> None:
        """Delete a workspace. Requires WORKSPACE_DELETE permission (restricted to OWNER)."""
        actor_role = await self._get_membership_role(workspace_id, current_user.id)
        if not has_permission(actor_role, Permission.WORKSPACE_DELETE):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have permission to delete this workspace.",
            )

        workspace = await self.workspace_repo.get_by_id(workspace_id)
        if not workspace:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Workspace not found.",
            )

        await self.workspace_repo.delete(workspace)
        await self.session.commit()

    async def list_workspace_members(
        self, workspace_id: uuid.UUID, current_user: User
    ) -> list[WorkspaceMemberDetailResponse]:
        """List all members of a workspace, joined with their User records."""
        # Require caller to belong to the workspace
        await self._get_membership_role(workspace_id, current_user.id)

        members_detailed = await self.workspace_repo.get_workspace_members_detailed(
            workspace_id
        )
        return [
            WorkspaceMemberDetailResponse(
                id=member.id,
                user_id=user.id,
                role=member.role,
                email=user.email,
                username=user.username,
                full_name=user.full_name,
                avatar_url=user.avatar_url,
                created_at=member.created_at,
            )
            for member, user in members_detailed
        ]

    async def update_member_role(
        self,
        workspace_id: uuid.UUID,
        target_user_id: uuid.UUID,
        new_role: WorkspaceRole,
        current_user: User,
    ) -> None:
        """Update a member's role. Requires WORKSPACE_CHANGE_ROLE permission and hierarchy validation."""
        actor_role = await self._get_membership_role(workspace_id, current_user.id)
        if not has_permission(actor_role, Permission.WORKSPACE_CHANGE_ROLE):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have permission to change member roles.",
            )

        target_membership = await self.workspace_repo.get_membership(
            workspace_id, target_user_id
        )
        if not target_membership:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Member not found in this workspace.",
            )

        if target_user_id == current_user.id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="You cannot change your own role.",
            )

        if new_role == WorkspaceRole.OWNER:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot change a member's role to OWNER. Use ownership transfer.",
            )

        if target_membership.role == WorkspaceRole.OWNER:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot change the OWNER's role. Transfer ownership first.",
            )

        actor_rank = ROLE_HIERARCHY.get(actor_role, 0)
        target_rank = ROLE_HIERARCHY.get(target_membership.role, 0)
        new_rank = ROLE_HIERARCHY.get(new_role, 0)

        if actor_rank <= target_rank:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have permission to modify a member with equal or higher rank.",
            )

        if actor_rank <= new_rank:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have permission to promote a member to equal or higher rank than yours.",
            )

        target_membership.role = new_role
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
