"""
Project router — thin HTTP layer.

Every endpoint delegates to ProjectService. No business logic here.
"""

import uuid
from fastapi import APIRouter, Depends, Response, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.dependencies import get_current_user
from app.database.session import get_db
from app.users.models import User
from app.projects.schemas import (
    ProjectCreate,
    ProjectResponse,
    ProjectUpdate,
)
from app.projects.service import ProjectService

router = APIRouter(prefix="/projects", tags=["projects"])


@router.post(
    "/",
    response_model=ProjectResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_project(
    data: ProjectCreate,
    user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_db),
) -> ProjectResponse:
    service = ProjectService(session)
    return await service.create_project(data, user)


@router.get("/", response_model=list[ProjectResponse])
async def list_workspace_projects(
    workspace_id: uuid.UUID,
    include_archived: bool = False,
    user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_db),
) -> list[ProjectResponse]:
    service = ProjectService(session)
    return await service.list_workspace_projects(
        workspace_id=workspace_id,
        current_user=user,
        include_archived=include_archived,
    )


@router.get("/{project_id}", response_model=ProjectResponse)
async def get_project(
    project_id: uuid.UUID,
    user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_db),
) -> ProjectResponse:
    service = ProjectService(session)
    return await service.get_project(project_id, user)


@router.patch("/{project_id}", response_model=ProjectResponse)
async def update_project(
    project_id: uuid.UUID,
    data: ProjectUpdate,
    user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_db),
) -> ProjectResponse:
    service = ProjectService(session)
    return await service.update_project(project_id, data, user)


@router.delete(
    "/{project_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
async def delete_project(
    project_id: uuid.UUID,
    user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_db),
) -> Response:
    service = ProjectService(session)
    await service.delete_project(project_id, user)
    return Response(status_code=status.HTTP_204_NO_CONTENT)
