"""
Async database engine and session management.

- Engine is created once at module level (singleton). echo mirrors the
  ENVIRONMENT setting so SQL logging is automatic in development.
- async_sessionmaker produces properly-typed AsyncSession instances.
  expire_on_commit=False prevents MissingGreenlet errors when accessing
  attributes after commit within the same request.
- get_db is an async generator for FastAPI Depends(). The async-with
  block guarantees the session is closed on both success and failure.
"""

from collections.abc import AsyncGenerator

from sqlalchemy.ext.asyncio import (
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)

from app.core.config import settings

engine = create_async_engine(
    settings.DATABASE_URL,
    echo=settings.ENVIRONMENT.value == "development",
    pool_size=5,
    max_overflow=10,
)

async_session_factory = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
)


async def get_db() -> AsyncGenerator[AsyncSession]:
    """Yield an async session and guarantee cleanup."""
    async with async_session_factory() as session:
        yield session
