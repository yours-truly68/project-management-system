import uuid
from fastapi import APIRouter, Depends, Response, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.dependencies import get_current_user
from app.database.session import get_db
from app.users.models import User
from app.columns.schemas import ColumnCreate, ColumnResponse, ColumnUpdate, ColumnReorder
from app.columns.service import ColumnService

router = APIRouter(prefix="/columns", tags=["columns"])


@router.post(
    "/",
    response_model=ColumnResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_column(
    data: ColumnCreate,
    user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_db),
) -> ColumnResponse:
    service = ColumnService(session)
    return await service.create_column(data, user)


@router.get("/", response_model=list[ColumnResponse])
async def list_board_columns(
    board_id: uuid.UUID,
    user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_db),
) -> list[ColumnResponse]:
    service = ColumnService(session)
    return await service.list_board_columns(board_id, user)


@router.patch("/{column_id}", response_model=ColumnResponse)
async def update_column(
    column_id: uuid.UUID,
    data: ColumnUpdate,
    user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_db),
) -> ColumnResponse:
    service = ColumnService(session)
    return await service.update_column(column_id, data, user)


@router.delete(
    "/{column_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
async def delete_column(
    column_id: uuid.UUID,
    user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_db),
) -> Response:
    service = ColumnService(session)
    await service.delete_column(column_id, user)
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.post(
    "/reorder",
    status_code=status.HTTP_204_NO_CONTENT,
)
async def reorder_columns(
    board_id: uuid.UUID,
    data: ColumnReorder,
    user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_db),
) -> Response:
    service = ColumnService(session)
    await service.reorder_columns(board_id, data, user)
    return Response(status_code=status.HTTP_204_NO_CONTENT)
