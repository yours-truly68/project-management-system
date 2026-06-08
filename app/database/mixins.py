"""
Reusable column mixins for ORM models.

Design decisions:
- UUIDv7 (from uuid6) gives time-sortable primary keys without exposing
  sequential integers. Unlike UUIDv4, they are index-friendly because
  the timestamp prefix keeps inserts roughly ordered.
- Timestamps use datetime.now(UTC) for timezone-aware values.
  server_default is omitted intentionally — we let Python control the
  clock so tests can mock time consistently, and we avoid coupling to
  a specific database's timestamp function syntax.
- onupdate fires on Python-side UPDATE statements via the ORM. For raw
  SQL or bulk updates outside the ORM, a database-level trigger is the
  correct complement (not handled here).
"""

import uuid as _uuid
from datetime import UTC, datetime

from sqlalchemy import DateTime
from sqlalchemy.orm import Mapped, mapped_column
from uuid6 import uuid7


class UUIDMixin:
    """Provides a UUIDv7 primary key column."""

    id: Mapped[_uuid.UUID] = mapped_column(
        primary_key=True,
        default=uuid7,
    )


class TimestampMixin:
    """Provides created_at and updated_at columns with timezone-aware datetimes."""

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(UTC),
        nullable=False,
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(UTC),
        onupdate=lambda: datetime.now(UTC),
        nullable=False,
    )
