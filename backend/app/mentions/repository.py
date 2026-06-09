import uuid
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.mentions.models import Mention


class MentionRepository:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    async def create(self, mention: Mention) -> Mention:
        self.session.add(mention)
        await self.session.flush()
        return mention

    async def get_by_id(self, mention_id: uuid.UUID) -> Mention | None:
        return await self.session.get(Mention, mention_id)

    async def get_comment_mentions(self, comment_id: uuid.UUID) -> list[Mention]:
        stmt = select(Mention).where(Mention.comment_id == comment_id)
        result = await self.session.execute(stmt)
        return list(result.scalars().all())

    async def get_by_comment_and_user(
        self, comment_id: uuid.UUID, user_id: uuid.UUID
    ) -> Mention | None:
        stmt = select(Mention).where(
            Mention.comment_id == comment_id,
            Mention.mentioned_user_id == user_id,
        )
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()

    async def delete(self, mention: Mention) -> None:
        await self.session.delete(mention)
        await self.session.flush()
