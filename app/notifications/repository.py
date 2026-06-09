import uuid
from datetime import datetime
from sqlalchemy import func, select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.notifications.models import Notification


class NotificationRepository:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    async def create(self, notification: Notification) -> Notification:
        self.session.add(notification)
        await self.session.flush()
        return notification

    async def bulk_create(self, notifications: list[Notification]) -> list[Notification]:
        self.session.add_all(notifications)
        await self.session.flush()
        return notifications

    async def get_user_notifications(
        self,
        user_id: uuid.UUID,
        is_read: bool | None = None,
        limit: int = 20,
        offset: int = 0,
    ) -> list[Notification]:
        """Fetch notifications for a user ordered by created_at descending (newest first)."""
        stmt = (
            select(Notification)
            .where(Notification.user_id == user_id)
            .order_by(Notification.created_at.desc())
            .limit(limit)
            .offset(offset)
        )
        if is_read is not None:
            stmt = stmt.where(Notification.is_read == is_read)

        result = await self.session.execute(stmt)
        return list(result.scalars().all())

    async def get_unread_count(self, user_id: uuid.UUID) -> int:
        """Get count of unread notifications for a user."""
        stmt = (
            select(func.count())
            .select_from(Notification)
            .where(
                Notification.user_id == user_id,
                Notification.is_read == False,  # noqa: E712
            )
        )
        result = await self.session.execute(stmt)
        return result.scalar() or 0

    async def mark_as_read(
        self, user_id: uuid.UUID, notification_ids: list[uuid.UUID]
    ) -> None:
        """Mark specific notifications as read for a user."""
        stmt = (
            update(Notification)
            .where(
                Notification.user_id == user_id,
                Notification.id.in_(notification_ids),
                Notification.is_read == False,  # noqa: E712
            )
            .values(is_read=True, read_at=func.now())
        )
        await self.session.execute(stmt)
        await self.session.flush()

    async def mark_all_as_read(self, user_id: uuid.UUID) -> None:
        """Mark all unread notifications as read for a user."""
        stmt = (
            update(Notification)
            .where(
                Notification.user_id == user_id,
                Notification.is_read == False,  # noqa: E712
            )
            .values(is_read=True, read_at=func.now())
        )
        await self.session.execute(stmt)
        await self.session.flush()
