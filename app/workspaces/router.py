"""
Workspace router — thin HTTP layer.

Every endpoint delegates to WorkspaceService. No business logic here.
"""

import uuid

from fastapi import APIRouter, Depends, Response, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.dependencies import get_current_user
from app.database.session import get_db
from app.users.models import User
from app.workspaces.schemas import (
    InviteMemberRequest,
    WorkspaceCreate,
    WorkspaceResponse,
    WorkspaceUpdate,
    WorkspaceMemberDetailResponse,
    WorkspaceMemberRoleUpdate,
)
from app.workspaces.service import WorkspaceService

router = APIRouter(prefix="/workspaces", tags=["workspaces"])


@router.post(
    "/",
    response_model=WorkspaceResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_workspace(
    data: WorkspaceCreate,
    user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_db),
) -> WorkspaceResponse:
    service = WorkspaceService(session)
    return await service.create_workspace(data, user)


@router.get("/", response_model=list[WorkspaceResponse])
async def list_workspaces(
    user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_db),
) -> list[WorkspaceResponse]:
    service = WorkspaceService(session)
    return await service.list_user_workspaces(user)


@router.get("/{workspace_id}", response_model=WorkspaceResponse)
async def get_workspace(
    workspace_id: uuid.UUID,
    user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_db),
) -> WorkspaceResponse:
    service = WorkspaceService(session)
    workspaces = await service.list_user_workspaces(user)
    for ws in workspaces:
        if ws.id == workspace_id:
            return ws
    from fastapi import HTTPException

    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail="Workspace not found.",
    )


@router.post(
    "/{workspace_id}/members",
    status_code=status.HTTP_201_CREATED,
)
async def invite_member(
    workspace_id: uuid.UUID,
    data: InviteMemberRequest,
    user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_db),
) -> dict[str, str]:
    service = WorkspaceService(session)
    await service.invite_member(workspace_id, data.email, data.role, user)
    return {"detail": "Member invited successfully."}


@router.delete(
    "/{workspace_id}/members/{user_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
async def remove_member(
    workspace_id: uuid.UUID,
    user_id: uuid.UUID,
    user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_db),
) -> Response:
    service = WorkspaceService(session)
    await service.remove_member(workspace_id, user_id, user)
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.patch("/{workspace_id}", response_model=WorkspaceResponse)
async def update_workspace(
    workspace_id: uuid.UUID,
    data: WorkspaceUpdate,
    user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_db),
) -> WorkspaceResponse:
    service = WorkspaceService(session)
    return await service.update_workspace(workspace_id, data, user)


@router.delete("/{workspace_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_workspace(
    workspace_id: uuid.UUID,
    user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_db),
) -> Response:
    service = WorkspaceService(session)
    await service.delete_workspace(workspace_id, user)
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.get(
    "/{workspace_id}/members", response_model=list[WorkspaceMemberDetailResponse]
)
async def list_workspace_members(
    workspace_id: uuid.UUID,
    user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_db),
) -> list[WorkspaceMemberDetailResponse]:
    service = WorkspaceService(session)
    return await service.list_workspace_members(workspace_id, user)


@router.patch(
    "/{workspace_id}/members/{user_id}", status_code=status.HTTP_204_NO_CONTENT
)
async def update_member_role(
    workspace_id: uuid.UUID,
    user_id: uuid.UUID,
    data: WorkspaceMemberRoleUpdate,
    user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_db),
) -> Response:
    service = WorkspaceService(session)
    await service.update_member_role(workspace_id, user_id, data.role, user)
    return Response(status_code=status.HTTP_204_NO_CONTENT)
