"""
User repository — database queries only.

No business logic. No authorization. No validation.
Those responsibilities belong to the service layer.
"""

import uuid

from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.users.models import User


class UserRepository:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    async def get_by_id(self, user_id: uuid.UUID) -> User | None:
        return await self.session.get(User, user_id)

    async def get_by_email(self, email: str) -> User | None:
        stmt = select(User).where(User.email == email)
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()

    async def get_by_username(self, username: str) -> User | None:
        stmt = select(User).where(User.username == username)
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()

    async def create(self, user: User) -> User:
        self.session.add(user)
        await self.session.flush()
        return user

    async def update(self, user_id: uuid.UUID, data: dict) -> User | None:
        """Update specific fields and return the refreshed user."""
        stmt = (
            update(User)
            .where(User.id == user_id)
            .values(**data)
            .returning(User)
        )
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()
