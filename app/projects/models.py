"""
Project ORM model.

A project lives inside a workspace and contains boards, columns, and tasks.
The `key` field is a short uppercase identifier (e.g. "PMS", "INFRA") used
as a prefix for task IDs within the project (PMS-42). It must be unique
within its workspace but can be reused across different workspaces.

is_archived from DATABASE_SCHEMA_V1.md is included for soft-archive support
defined in the Permissions Matrix (OWNER/ADMIN can archive projects).
"""

import uuid as _uuid
from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Index, String, Text, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import Base
from app.database.mixins import TimestampMixin, UUIDMixin


class Project(UUIDMixin, TimestampMixin, Base):
    __tablename__ = "projects"

    __table_args__ = (
        UniqueConstraint("workspace_id", "key", name="uq_projects_workspace_key"),
        Index("ix_projects_workspace_id", "workspace_id"),
        Index("ix_projects_created_by", "created_by"),
        Index("ix_projects_archived_at", "archived_at"),
    )

    workspace_id: Mapped[_uuid.UUID] = mapped_column(
        ForeignKey("workspaces.id", ondelete="CASCADE"),
        nullable=False,
    )
    name: Mapped[str] = mapped_column(
        String(150),
        nullable=False,
    )
    key: Mapped[str] = mapped_column(
        String(10),
        nullable=False,
    )
    description: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )
    created_by: Mapped[_uuid.UUID] = mapped_column(
        ForeignKey("users.id", ondelete="RESTRICT"),
        nullable=False,
    )
    archived_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
        default=None,
    )

    # Relationships
    workspace: Mapped["Workspace"] = relationship(  # type: ignore[name-defined]  # noqa: F821
        "Workspace",
        back_populates="projects",
        foreign_keys=[workspace_id],
        lazy="raise",
    )
    boards: Mapped[list["Board"]] = relationship(  # type: ignore[name-defined]  # noqa: F821
        "Board",
        back_populates="project",
        cascade="all, delete-orphan",
        passive_deletes=True,
        lazy="raise",
    )
    creator: Mapped["User"] = relationship(  # type: ignore[name-defined]  # noqa: F821
        "User",
        foreign_keys=[created_by],
        lazy="raise",
    )
