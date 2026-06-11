import uuid
from fastapi import APIRouter, Depends, Response, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.dependencies import get_current_user
from app.database.session import get_db
from app.users.models import User
from app.boards.schemas import (
    BoardCreate,
    BoardResponse,
    BoardUpdate,
    UserBoardPreferenceResponse,
    UserBoardPreferenceUpdate,
)
from app.boards.service import BoardService


router = APIRouter(prefix="/boards", tags=["boards"])


@router.post(
    "/",
    response_model=BoardResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_board(
    data: BoardCreate,
    user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_db),
) -> BoardResponse:
    service = BoardService(session)
    return await service.create_board(data, user)


@router.get("/", response_model=list[BoardResponse])
async def list_project_boards(
    project_id: uuid.UUID,
    user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_db),
) -> list[BoardResponse]:
    service = BoardService(session)
    return await service.list_project_boards(project_id, user)


@router.get("/{board_id}", response_model=BoardResponse)
async def get_board(
    board_id: uuid.UUID,
    user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_db),
) -> BoardResponse:
    service = BoardService(session)
    return await service.get_board(board_id, user)


@router.patch("/{board_id}", response_model=BoardResponse)
async def update_board(
    board_id: uuid.UUID,
    data: BoardUpdate,
    user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_db),
) -> BoardResponse:
    service = BoardService(session)
    return await service.update_board(board_id, data, user)


@router.delete(
    "/{board_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
async def delete_board(
    board_id: uuid.UUID,
    user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_db),
) -> Response:
    service = BoardService(session)
    await service.delete_board(board_id, user)
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.get("/{board_id}/preference", response_model=UserBoardPreferenceResponse)
async def get_user_board_preference(
    board_id: uuid.UUID,
    user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_db),
) -> UserBoardPreferenceResponse:
    service = BoardService(session)
    return await service.get_user_board_preference(board_id, user)


@router.put("/{board_id}/preference", response_model=UserBoardPreferenceResponse)
async def save_user_board_preference(
    board_id: uuid.UUID,
    data: UserBoardPreferenceUpdate,
    user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_db),
) -> UserBoardPreferenceResponse:
    service = BoardService(session)
    return await service.save_user_board_preference(board_id, data, user)

