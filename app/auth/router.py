"""
Auth router — thin HTTP layer.

Every endpoint delegates to AuthService. No business logic here.
"""

from fastapi import APIRouter, Depends, Response, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.dependencies import get_current_user
from app.auth.schemas import (
    AuthenticatedUserResponse,
    LoginRequest,
    RefreshTokenRequest,
    RegisterRequest,
    TokenResponse,
)
from app.auth.service import AuthService
from app.database.session import get_db
from app.users.models import User
from app.users.schemas import UserResponse

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post(
    "/register",
    response_model=AuthenticatedUserResponse,
    status_code=status.HTTP_201_CREATED,
)
async def register(
    data: RegisterRequest,
    session: AsyncSession = Depends(get_db),
) -> AuthenticatedUserResponse:
    service = AuthService(session)
    return await service.register(data)


@router.post("/login", response_model=AuthenticatedUserResponse)
async def login(
    data: LoginRequest,
    session: AsyncSession = Depends(get_db),
) -> AuthenticatedUserResponse:
    service = AuthService(session)
    return await service.login(data)


@router.post("/refresh", response_model=TokenResponse)
async def refresh(
    data: RefreshTokenRequest,
    session: AsyncSession = Depends(get_db),
) -> TokenResponse:
    service = AuthService(session)
    return await service.refresh(data.refresh_token)


@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
async def logout() -> Response:
    """
    Stateless JWT logout.

    The client is responsible for discarding the access token from memory.
    This endpoint exists so the frontend has a consistent API call and
    a place to clear the refresh token cookie in a future iteration.
    """
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.get("/me", response_model=UserResponse)
async def me(user: User = Depends(get_current_user)) -> UserResponse:
    return UserResponse.model_validate(user)
