import uuid
from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.columns.models import Column


class ColumnRepository:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    async def create(self, column: Column) -> Column:
        self.session.add(column)
        await self.session.flush()
        return column

    async def get_by_id(self, column_id: uuid.UUID) -> Column | None:
        return await self.session.get(Column, column_id)

    async def get_board_columns(self, board_id: uuid.UUID) -> list[Column]:
        """Fetch all columns for a board, ordered by position ascending."""
        stmt = (
            select(Column)
            .where(Column.board_id == board_id)
            .order_by(Column.position.asc())
        )
        result = await self.session.execute(stmt)
        return list(result.scalars().all())

    async def get_by_board_and_name(
        self, board_id: uuid.UUID, name: str
    ) -> Column | None:
        """Fetch a column by its name within a board (uq_columns_board_name)."""
        stmt = select(Column).where(
            Column.board_id == board_id,
            Column.name == name
        )
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()

    async def get_by_board_and_position(
        self, board_id: uuid.UUID, position: int
    ) -> Column | None:
        """Fetch a column by its position within a board (uq_columns_board_position)."""
        stmt = select(Column).where(
            Column.board_id == board_id,
            Column.position == position
        )
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()

    async def reorder_columns(self, ordered_ids: list[uuid.UUID]) -> None:
        """Update positions of columns according to their index in the ordered_ids list."""
        for index, column_id in enumerate(ordered_ids):
            stmt = (
                update(Column)
                .where(Column.id == column_id)
                .values(position=index)
            )
            await self.session.execute(stmt)
        await self.session.flush()

    async def update(self, column_id: uuid.UUID, data: dict) -> Column | None:
        stmt = (
            update(Column)
            .where(Column.id == column_id)
            .values(**data)
            .returning(Column)
        )
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()

    async def delete(self, column: Column) -> None:
        await self.session.delete(column)
        await self.session.flush()
