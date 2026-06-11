import uuid
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from app.activities.models import Activity


class ActivityRepository:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    async def create(self, activity: Activity) -> Activity:
        self.session.add(activity)
        await self.session.flush()
        return activity

    async def list_activities(
        self,
        workspace_id: uuid.UUID,
        project_id: uuid.UUID | None = None,
        board_id: uuid.UUID | None = None,
    ) -> list[Activity]:
        stmt = (
            select(Activity)
            .where(Activity.workspace_id == workspace_id)
            .order_by(Activity.created_at.desc())
            .options(selectinload(Activity.actor))
        )
        if project_id is not None:
            stmt = stmt.where(Activity.project_id == project_id)
        if board_id is not None:
            stmt = stmt.where(Activity.board_id == board_id)

        result = await self.session.execute(stmt)
        return list(result.scalars().all())
