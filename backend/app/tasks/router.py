import uuid
from fastapi import APIRouter, Depends, Response, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.dependencies import get_current_user
from app.database.session import get_db
from app.users.models import User
from app.tasks.schemas import (
    TaskCreate,
    TaskResponse,
    TaskUpdate,
    TaskMove,
    TaskReorder,
    TaskAssign,
)
from app.tasks.service import TaskService

router = APIRouter(prefix="/tasks", tags=["tasks"])


@router.post(
    "/",
    response_model=TaskResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_task(
    data: TaskCreate,
    user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_db),
) -> TaskResponse:
    service = TaskService(session)
    return await service.create_task(data, user)


@router.get("/{task_id}", response_model=TaskResponse)
async def get_task(
    task_id: uuid.UUID,
    user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_db),
) -> TaskResponse:
    service = TaskService(session)
    return await service.get_task(task_id, user)


@router.patch("/{task_id}", response_model=TaskResponse)
async def update_task(
    task_id: uuid.UUID,
    data: TaskUpdate,
    user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_db),
) -> TaskResponse:
    service = TaskService(session)
    return await service.update_task(task_id, data, user)


@router.delete(
    "/{task_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
async def delete_task(
    task_id: uuid.UUID,
    user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_db),
) -> Response:
    service = TaskService(session)
    await service.delete_task(task_id, user)
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.post("/{task_id}/move", response_model=TaskResponse)
async def move_task(
    task_id: uuid.UUID,
    data: TaskMove,
    user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_db),
) -> TaskResponse:
    service = TaskService(session)
    return await service.move_task(task_id, data, user)


@router.post("/{task_id}/assign", response_model=TaskResponse)
async def assign_task(
    task_id: uuid.UUID,
    data: TaskAssign,
    user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_db),
) -> TaskResponse:
    service = TaskService(session)
    return await service.assign_task(task_id, data, user)


@router.post(
    "/reorder",
    status_code=status.HTTP_204_NO_CONTENT,
)
async def reorder_tasks(
    column_id: uuid.UUID,
    data: TaskReorder,
    user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_db),
) -> Response:
    service = TaskService(session)
    await service.reorder_tasks(column_id, data, user)
    return Response(status_code=status.HTTP_204_NO_CONTENT)
