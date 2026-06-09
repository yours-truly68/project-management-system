import uuid
from typing import Any

from sqlalchemy.ext.asyncio import AsyncSession

from app.notifications.models import Notification
from app.notifications.repository import NotificationRepository
from app.notifications.schemas import NotificationResponse


class NotificationService:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session
        self.notification_repo = NotificationRepository(session)

    async def create_notification(
        self,
        user_id: uuid.UUID,
        type: str,
        title: str,
        body: str,
        payload: dict[str, Any] | None = None,
    ) -> NotificationResponse:
        """Create a new notification record and trigger realtime dispatch handlers."""
        notification = Notification(
            user_id=user_id,
            type=type,
            title=title,
            body=body,
            payload=payload,
        )
        created = await self.notification_repo.create(notification)

        # Dispatches events to messaging systems or socket connections
        await self._dispatch_realtime_events(created)

        await self.session.commit()
        await self.session.refresh(created)
        return NotificationResponse.model_validate(created)

    async def list_notifications(
        self,
        user_id: uuid.UUID,
        is_read: bool | None = None,
        limit: int = 20,
        offset: int = 0,
    ) -> list[NotificationResponse]:
        """Fetch notifications for the authenticated user."""
        notifications = await self.notification_repo.get_user_notifications(
            user_id=user_id,
            is_read=is_read,
            limit=limit,
            offset=offset,
        )
        return [NotificationResponse.model_validate(n) for n in notifications]

    async def get_unread_count(self, user_id: uuid.UUID) -> int:
        """Get the current unread notifications count for the user."""
        return await self.notification_repo.get_unread_count(user_id)

    async def mark_as_read(
        self, user_id: uuid.UUID, notification_ids: list[uuid.UUID]
    ) -> None:
        """Mark specific notifications as read for the authenticated user."""
        await self.notification_repo.mark_as_read(user_id, notification_ids)
        await self.session.commit()

    async def mark_all_as_read(self, user_id: uuid.UUID) -> None:
        """Mark all unread notifications as read for the authenticated user."""
        await self.notification_repo.mark_all_as_read(user_id)
        await self.session.commit()

    # ------------------------------------------------------------------
    # Private realtime dispatch hooks
    # ------------------------------------------------------------------

    async def _dispatch_realtime_events(self, notification: Notification) -> None:
        """
        Helper to publish new notifications to messaging streams and socket servers.
        
        TODO: Emit domain event for decoupling/downstream handlers (e.g. outbox pattern or kafka)
        TODO: Publish event to Redis Pub/Sub channel for multi-instance horizontal scaling
        TODO: Deliver message over active WebSocket connections to the target user (realtime client push)
        """
        pass
