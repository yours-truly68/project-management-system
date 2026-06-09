import uuid
from fastapi import APIRouter, Depends, Query, Response, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.dependencies import get_current_user
from app.database.session import get_db
from app.notifications.schemas import NotificationResponse
from app.notifications.service import NotificationService
from app.users.models import User

router = APIRouter(prefix="/notifications", tags=["notifications"])


@router.get("/", response_model=list[NotificationResponse])
async def list_notifications(
    is_read: bool | None = Query(None),
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
    user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_db),
) -> list[NotificationResponse]:
    service = NotificationService(session)
    return await service.list_notifications(
        user_id=user.id,
        is_read=is_read,
        limit=limit,
        offset=offset,
    )


@router.patch("/{notification_id}/read", status_code=status.HTTP_204_NO_CONTENT)
async def mark_as_read(
    notification_id: uuid.UUID,
    user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_db),
) -> Response:
    service = NotificationService(session)
    await service.mark_as_read(user.id, [notification_id])
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.patch("/read-all", status_code=status.HTTP_204_NO_CONTENT)
async def mark_all_as_read(
    user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_db),
) -> Response:
    service = NotificationService(session)
    await service.mark_all_as_read(user.id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)
