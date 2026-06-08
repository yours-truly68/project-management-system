"""
Reusable column mixins for ORM models.

UUIDMixin — UUIDv7 primary key. Time-sortable and B-tree friendly
  unlike UUIDv4 which scatters inserts across index pages. Generated in
  the application layer per AI_CONTEXT.md.

TimestampMixin — Timezone-aware created_at / updated_at.
  Uses server_default=func.now() per project standards so the database
  clock governs the initial value even for raw SQL or bulk inserts.
  onupdate=func.now() fires on ORM-level updates; a database trigger
  is the correct complement for raw SQL updates (not handled here).
"""

import uuid as _uuid
from datetime import datetime

from sqlalchemy import DateTime, func
from sqlalchemy.orm import Mapped, mapped_column
from uuid6 import uuid7


class UUIDMixin:
    """UUIDv7 primary key generated in the application layer."""

    id: Mapped[_uuid.UUID] = mapped_column(
        primary_key=True,
        default=uuid7,
    )


class TimestampMixin:
    """Timezone-aware created_at / updated_at columns."""

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )
