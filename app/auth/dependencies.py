"""
FastAPI dependencies for authentication.

Wires together the Bearer token extraction, database session,
and AuthService to produce a ready-to-use Depends() callable.

Usage in routers:
    @router.get("/me")
    async def me(user: User = Depends(get_current_user)):
        ...
"""

from fastapi import Depends
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.service import AuthService
from app.database.session import get_db
from app.users.models import User

bearer_scheme = HTTPBearer()


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
    session: AsyncSession = Depends(get_db),
) -> User:
    """Extract Bearer token, verify it, and return the authenticated user."""
    service = AuthService(session)
    return await service.get_current_user(credentials.credentials)
