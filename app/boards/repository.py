import uuid
from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.boards.models import Board, UserBoardPreference


class BoardRepository:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    async def get_preference(
        self, user_id: uuid.UUID, board_id: uuid.UUID
    ) -> UserBoardPreference | None:
        stmt = select(UserBoardPreference).where(
            UserBoardPreference.user_id == user_id,
            UserBoardPreference.board_id == board_id,
        )
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()

    async def save_preference(
        self, user_id: uuid.UUID, board_id: uuid.UUID, view_type: str
    ) -> UserBoardPreference:
        pref = await self.get_preference(user_id, board_id)
        if pref:
            pref.view_type = view_type
        else:
            pref = UserBoardPreference(
                user_id=user_id,
                board_id=board_id,
                view_type=view_type,
            )
            self.session.add(pref)
        await self.session.flush()
        return pref

    async def create(self, board: Board) -> Board:

        self.session.add(board)
        await self.session.flush()
        return board

    async def get_by_id(self, board_id: uuid.UUID) -> Board | None:
        return await self.session.get(Board, board_id)

    async def get_by_project(self, project_id: uuid.UUID) -> list[Board]:
        """Fetch all boards belonging to a project."""
        stmt = (
            select(Board)
            .where(Board.project_id == project_id)
            .order_by(Board.created_at.desc())
        )
        result = await self.session.execute(stmt)
        return list(result.scalars().all())

    async def get_by_project_and_name(
        self, project_id: uuid.UUID, name: str
    ) -> Board | None:
        """Fetch a board by name within a project (to validate uq_boards_project_name)."""
        stmt = select(Board).where(Board.project_id == project_id, Board.name == name)
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()

    async def update(self, board_id: uuid.UUID, data: dict) -> Board | None:
        stmt = update(Board).where(Board.id == board_id).values(**data).returning(Board)
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()

    async def delete(self, board: Board) -> None:
        await self.session.delete(board)
        await self.session.flush()
