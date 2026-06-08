"""
Async database engine and session factory.

Design decisions:
- create_async_engine is created once at module level (singleton).
  Pool settings are tuned for a typical SaaS workload; adjust per environment.
- async_sessionmaker (not the legacy sessionmaker with class_=AsyncSession)
  produces properly-typed AsyncSession instances.
- get_db is an async generator for use as a FastAPI Depends() dependency.
  It guarantees the session is closed even on unhandled exceptions.
- expire_on_commit=False prevents lazy-load surprises after commit —
  objects remain usable without re-querying inside the same request.
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
    echo=settings.DEBUG,
    pool_size=5,
    max_overflow=10,
)

async_session_factory = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
)


async def get_db() -> AsyncGenerator[AsyncSession]:
    """FastAPI dependency that yields an async database session."""
    async with async_session_factory() as session:
        yield session
