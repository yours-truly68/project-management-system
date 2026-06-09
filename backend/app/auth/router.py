"""
Auth router — thin HTTP layer.

Every endpoint delegates to AuthService. No business logic here.
"""

from fastapi import APIRouter, Depends, Request, Response, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.dependencies import get_current_user
from app.auth.schemas import (
    LoginRequest,
    RegisterRequest,
    TokenResponse,
)
from app.auth.service import AuthService
from app.database.session import get_db
from app.users.models import User
from app.users.schemas import UserResponse
from app.core.config import settings

router = APIRouter(prefix="/auth", tags=["auth"])


def _set_refresh_cookie(response: Response, refresh_token: str) -> None:
    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        httponly=True,
        secure=settings.is_production,
        samesite="lax",
        max_age=settings.REFRESH_TOKEN_EXPIRE_DAYS * 24 * 60 * 60,
        path="/",
    )


@router.post(
    "/register",
    response_model=TokenResponse,
    status_code=status.HTTP_201_CREATED,
)
async def register(
    data: RegisterRequest,
    response: Response,
    session: AsyncSession = Depends(get_db),
) -> TokenResponse:
    service = AuthService(session)
    res_data, refresh_token = await service.register(data)
    _set_refresh_cookie(response, refresh_token)
    return res_data


@router.post("/login", response_model=TokenResponse)
async def login(
    data: LoginRequest,
    response: Response,
    session: AsyncSession = Depends(get_db),
) -> TokenResponse:
    service = AuthService(session)
    res_data, refresh_token = await service.login(data)
    _set_refresh_cookie(response, refresh_token)
    return res_data


@router.post("/refresh", response_model=TokenResponse)
async def refresh(
    request: Request,
    response: Response,
    session: AsyncSession = Depends(get_db),
) -> TokenResponse:
    refresh_token = request.cookies.get("refresh_token")
    if not refresh_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing refresh token.",
        )

    service = AuthService(session)
    res_data, new_refresh_token = await service.refresh(refresh_token)
    _set_refresh_cookie(response, new_refresh_token)
    return res_data


@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
async def logout(response: Response) -> Response:
    """
    Clear the refresh token cookie and return HTTP 204 No Content.
    """
    response.delete_cookie(
        key="refresh_token",
        path="/",
        secure=settings.is_production,
        samesite="lax",
    )
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.get("/me", response_model=UserResponse)
async def me(user: User = Depends(get_current_user)) -> UserResponse:
    return UserResponse.model_validate(user)
