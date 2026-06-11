import uuid
from sqlalchemy import select, and_
from sqlalchemy.ext.asyncio import AsyncSession
from app.favorites.models import Favorite


class FavoriteRepository:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    async def get_by_id(self, favorite_id: uuid.UUID) -> Favorite | None:
        return await self.session.get(Favorite, favorite_id)

    async def get_by_user_and_entity(
        self, user_id: uuid.UUID, entity_type: str, entity_id: uuid.UUID
    ) -> Favorite | None:
        stmt = select(Favorite).where(
            and_(
                Favorite.user_id == user_id,
                Favorite.entity_type == entity_type,
                Favorite.entity_id == entity_id,
            )
        )
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()

    async def list_by_user(self, user_id: uuid.UUID) -> list[Favorite]:
        stmt = select(Favorite).where(Favorite.user_id == user_id).order_by(Favorite.created_at.desc())
        result = await self.session.execute(stmt)
        return list(result.scalars().all())

    async def create(self, favorite: Favorite) -> Favorite:
        self.session.add(favorite)
        await self.session.flush()
        return favorite

    async def delete(self, favorite: Favorite) -> None:
        await self.session.delete(favorite)
        await self.session.flush()
