import uuid
from fastapi import APIRouter, Depends, Response, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.dependencies import get_current_user
from app.comments.schemas import CommentCreate, CommentResponse, CommentUpdate
from app.comments.service import CommentService
from app.database.session import get_db
from app.users.models import User

router = APIRouter(prefix="/comments", tags=["comments"])


@router.post(
    "/",
    response_model=CommentResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_comment(
    data: CommentCreate,
    user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_db),
) -> CommentResponse:
    service = CommentService(session)
    return await service.create_comment(data, user)


@router.get("/task/{task_id}", response_model=list[CommentResponse])
async def list_task_comments(
    task_id: uuid.UUID,
    user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_db),
) -> list[CommentResponse]:
    service = CommentService(session)
    return await service.list_task_comments(task_id, user)


@router.patch("/{comment_id}", response_model=CommentResponse)
async def update_comment(
    comment_id: uuid.UUID,
    data: CommentUpdate,
    user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_db),
) -> CommentResponse:
    service = CommentService(session)
    return await service.update_comment(comment_id, data, user)


@router.delete(
    "/{comment_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
async def delete_comment(
    comment_id: uuid.UUID,
    user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_db),
) -> Response:
    service = CommentService(session)
    await service.delete_comment(comment_id, user)
    return Response(status_code=status.HTTP_204_NO_CONTENT)
