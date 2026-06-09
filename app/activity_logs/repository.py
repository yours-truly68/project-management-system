import uuid
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.activity_logs.models import ActivityLog


class ActivityLogRepository:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    async def create(self, log: ActivityLog) -> ActivityLog:
        self.session.add(log)
        await self.session.flush()
        return log

    async def bulk_create(self, logs: list[ActivityLog]) -> list[ActivityLog]:
        self.session.add_all(logs)
        await self.session.flush()
        return logs

    async def get_workspace_activity(
        self,
        workspace_id: uuid.UUID,
        limit: int = 50,
        offset: int = 0,
    ) -> list[ActivityLog]:
        """Fetch chronological activity logs for a workspace (newest first)."""
        stmt = (
            select(ActivityLog)
            .where(ActivityLog.workspace_id == workspace_id)
            .order_by(ActivityLog.created_at.desc())
            .limit(limit)
            .offset(offset)
        )
        result = await self.session.execute(stmt)
        return list(result.scalars().all())

    async def get_entity_activity(
        self,
        entity_type: str,
        entity_id: uuid.UUID,
        limit: int = 50,
        offset: int = 0,
    ) -> list[ActivityLog]:
        """Fetch chronological activity logs for a specific entity (newest first)."""
        stmt = (
            select(ActivityLog)
            .where(
                ActivityLog.entity_type == entity_type,
                ActivityLog.entity_id == entity_id,
            )
            .order_by(ActivityLog.created_at.desc())
            .limit(limit)
            .offset(offset)
        )
        result = await self.session.execute(stmt)
        return list(result.scalars().all())
