"""
Auth service — business logic and orchestration.

Responsibilities:
- Registration: validate uniqueness, hash password, create user, issue tokens.
- Login: verify credentials, issue tokens.
- Token refresh: validate refresh token, issue new token pair.
- Current user retrieval: decode access token, fetch user.

All database access goes through UserRepository.
No SQL here. No HTTP concerns here.
"""

from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.jwt import (
    TOKEN_TYPE_ACCESS,
    TOKEN_TYPE_REFRESH,
    create_access_token,
    create_refresh_token,
    verify_token,
)
from app.auth.schemas import (
    LoginRequest,
    RegisterRequest,
    TokenResponse,
)
from app.auth.security import hash_password, verify_password
from app.shared.enums import AuthProvider
from app.users.models import User
from app.users.repository import UserRepository


class AuthService:
    def __init__(self, session: AsyncSession) -> None:
        self.repo = UserRepository(session)
        self.session = session

    async def register(self, data: RegisterRequest) -> tuple[TokenResponse, str]:
        """Register a new user with email + password."""

        # Uniqueness checks
        if await self.repo.get_by_email(data.email):
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Email already registered.",
            )
        if await self.repo.get_by_username(data.username):
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Username already taken.",
            )

        user = User(
            email=data.email,
            username=data.username,
            full_name=data.full_name,
            hashed_password=hash_password(data.password),
            auth_provider=AuthProvider.EMAIL,
        )
        user = await self.repo.create(user)
        await self.session.commit()

        return self._build_auth_response(user)

    async def login(self, data: LoginRequest) -> tuple[TokenResponse, str]:
        """Authenticate with email + password."""

        user = await self.repo.get_by_email(data.email)
        if not user or not user.hashed_password:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password.",
            )

        if not verify_password(data.password, user.hashed_password):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password.",
            )

        if not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Account is deactivated.",
            )

        return self._build_auth_response(user)

    async def refresh(self, refresh_token: str) -> tuple[TokenResponse, str]:
        """Validate a refresh token and issue a new token pair."""

        user_id = verify_token(refresh_token, TOKEN_TYPE_REFRESH)
        if user_id is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid or expired refresh token.",
            )

        user = await self.repo.get_by_id(user_id)
        if not user or not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User not found or deactivated.",
            )

        new_refresh = create_refresh_token(user.id)
        return TokenResponse(
            access_token=create_access_token(user.id),
        ), new_refresh

    async def get_current_user(self, token: str) -> User:
        """Decode an access token and return the user. Used by dependencies."""

        user_id = verify_token(token, TOKEN_TYPE_ACCESS)
        if user_id is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid or expired access token.",
            )

        user = await self.repo.get_by_id(user_id)
        if not user or not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User not found or deactivated.",
            )

        return user

    # ------------------------------------------------------------------
    # Private helpers
    # ------------------------------------------------------------------

    @staticmethod
    def _build_auth_response(user: User) -> tuple[TokenResponse, str]:
        access_token = create_access_token(user.id)
        refresh_token = create_refresh_token(user.id)
        response = TokenResponse(
            access_token=access_token,
        )
        return response, refresh_token
