import uuid
from fastapi import APIRouter, Depends, Response, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.dependencies import get_current_user
from app.database.session import get_db
from app.users.models import User
from app.favorites.schemas import FavoriteCreate, FavoriteResponse
from app.favorites.service import FavoriteService

router = APIRouter(prefix="/favorites", tags=["favorites"])


@router.get("/", response_model=list[FavoriteResponse])
async def list_favorites(
    user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_db),
) -> list[FavoriteResponse]:
    service = FavoriteService(session)
    return await service.list_favorites(user)


@router.post(
    "/",
    response_model=FavoriteResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_favorite(
    data: FavoriteCreate,
    user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_db),
) -> FavoriteResponse:
    service = FavoriteService(session)
    return await service.create_favorite(data, user)


@router.delete(
    "/{favorite_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
async def delete_favorite(
    favorite_id: uuid.UUID,
    user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_db),
) -> Response:
    service = FavoriteService(session)
    await service.delete_favorite(favorite_id, user)
    return Response(status_code=status.HTTP_204_NO_CONTENT)
