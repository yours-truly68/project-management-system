import uuid
from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.comments.models import TaskComment


class CommentRepository:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    async def create(self, comment: TaskComment) -> TaskComment:
        self.session.add(comment)
        await self.session.flush()
        return comment

    async def get_by_id(self, comment_id: uuid.UUID) -> TaskComment | None:
        return await self.session.get(TaskComment, comment_id)

    async def get_task_comments(self, task_id: uuid.UUID) -> list[TaskComment]:
        """Fetch all comments for a task ordered chronologically."""
        stmt = (
            select(TaskComment)
            .where(TaskComment.task_id == task_id)
            .order_by(TaskComment.created_at.asc())
        )
        result = await self.session.execute(stmt)
        return list(result.scalars().all())

    async def update(self, comment_id: uuid.UUID, data: dict) -> TaskComment | None:
        stmt = (
            update(TaskComment)
            .where(TaskComment.id == comment_id)
            .values(**data)
            .returning(TaskComment)
        )
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()

    async def delete(self, comment: TaskComment) -> None:
        await self.session.delete(comment)
        await self.session.flush()
