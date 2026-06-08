"""
JWT token creation and verification.

Token types:
- access:  Short-lived (15 min), stored in client memory.
- refresh: Long-lived (7 days), stored in HttpOnly cookie.

Both embed a "sub" (subject = user ID) and "type" claim so
the service layer can distinguish them and reject misuse
(e.g. using a refresh token as an access token).
"""

import uuid
from datetime import UTC, datetime, timedelta

from jose import JWTError, jwt

from app.core.config import settings

TOKEN_TYPE_ACCESS = "access"
TOKEN_TYPE_REFRESH = "refresh"


def create_access_token(user_id: uuid.UUID) -> str:
    expire = datetime.now(UTC) + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    payload = {
        "sub": str(user_id),
        "type": TOKEN_TYPE_ACCESS,
        "exp": expire,
    }
    return jwt.encode(
        payload,
        settings.JWT_SECRET.get_secret_value(),
        algorithm=settings.JWT_ALGORITHM,
    )


def create_refresh_token(user_id: uuid.UUID) -> str:
    expire = datetime.now(UTC) + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    payload = {
        "sub": str(user_id),
        "type": TOKEN_TYPE_REFRESH,
        "exp": expire,
    }
    return jwt.encode(
        payload,
        settings.JWT_SECRET.get_secret_value(),
        algorithm=settings.JWT_ALGORITHM,
    )


def verify_token(token: str, expected_type: str) -> uuid.UUID | None:
    """
    Decode and validate a JWT. Returns the user UUID if valid,
    None if expired, malformed, or wrong token type.
    """
    try:
        payload = jwt.decode(
            token,
            settings.JWT_SECRET.get_secret_value(),
            algorithms=[settings.JWT_ALGORITHM],
        )
    except JWTError:
        return None

    if payload.get("type") != expected_type:
        return None

    sub: str | None = payload.get("sub")
    if sub is None:
        return None

    try:
        return uuid.UUID(sub)
    except ValueError:
        return None
