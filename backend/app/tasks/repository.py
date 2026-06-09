import uuid
from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.tasks.models import Task


class TaskRepository:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    async def create(self, task: Task) -> Task:
        self.session.add(task)
        await self.session.flush()
        return task

    async def get_by_id(
        self, task_id: uuid.UUID, for_update: bool = False
    ) -> Task | None:
        if for_update:
            stmt = select(Task).where(Task.id == task_id).with_for_update()
            result = await self.session.execute(stmt)
            return result.scalar_one_or_none()
        return await self.session.get(Task, task_id)

    async def get_column_tasks(
        self, column_id: uuid.UUID, for_update: bool = False
    ) -> list[Task]:
        """Fetch all tasks in a column ordered by position ascending."""
        stmt = (
            select(Task)
            .where(Task.column_id == column_id)
            .order_by(Task.position.asc())
        )
        if for_update:
            stmt = stmt.with_for_update()
        result = await self.session.execute(stmt)
        return list(result.scalars().all())

    async def update(self, task_id: uuid.UUID, data: dict) -> Task | None:
        stmt = update(Task).where(Task.id == task_id).values(**data).returning(Task)
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()

    async def delete(self, task: Task) -> None:
        await self.session.delete(task)
        await self.session.flush()

    async def bulk_update_positions(self, mappings: list[dict]) -> None:
        """
        Perform high-performance bulk update of task positions.
        mappings should be a list of dicts, each containing 'id' and 'position'.
        Example: [{'id': uuid1, 'position': 0}, {'id': uuid2, 'position': 1}]
        """
        if not mappings:
            return
        await self.session.execute(update(Task), mappings)
        await self.session.flush()

    async def move_task(
        self,
        task_id: uuid.UUID,
        target_column_id: uuid.UUID,
        target_position: int,
    ) -> Task | None:
        """Directly move a task to a target column and position."""
        stmt = (
            update(Task)
            .where(Task.id == task_id)
            .values(column_id=target_column_id, position=target_position)
            .returning(Task)
        )
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()
