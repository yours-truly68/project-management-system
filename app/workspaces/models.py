"""
Workspace and WorkspaceMember ORM models.

Workspace is the top-level organizational container. Every project,
board, and task lives beneath one workspace.

WorkspaceMember is the join table between users and workspaces with a role.
It uses UUIDMixin for its own PK (not a composite PK) so individual
membership records can be referenced directly by ID if needed.

WorkspaceMember only carries created_at, not updated_at — role changes
are tracked via activity logs, not by mutating the membership row.
"""

import uuid as _uuid
from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Index, String, Text, UniqueConstraint, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import Base
from app.database.mixins import TimestampMixin, UUIDMixin
from app.shared.enums import WorkspaceRole


class Workspace(UUIDMixin, TimestampMixin, Base):
    __tablename__ = "workspaces"

    name: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
    )
    slug: Mapped[str] = mapped_column(
        String(100),
        unique=True,
        index=True,
        nullable=False,
    )
    description: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )
    owner_id: Mapped[_uuid.UUID] = mapped_column(
        ForeignKey("users.id", ondelete="RESTRICT"),
        nullable=False,
        index=True,
    )

    # Relationships
    owner: Mapped["User"] = relationship(  # type: ignore[name-defined]  # noqa: F821
        "User",
        foreign_keys=[owner_id],
        lazy="raise",
    )
    members: Mapped[list["WorkspaceMember"]] = relationship(
        "WorkspaceMember",
        back_populates="workspace",
        cascade="all, delete-orphan",
        passive_deletes=True,
        lazy="raise",
    )
    projects: Mapped[list["Project"]] = relationship(  # type: ignore[name-defined]  # noqa: F821
        "Project",
        back_populates="workspace",
        cascade="all, delete-orphan",
        passive_deletes=True,
        lazy="raise",
    )
    activity_logs: Mapped[list["ActivityLog"]] = relationship(  # type: ignore[name-defined]  # noqa: F821
        "ActivityLog",
        back_populates="workspace",
        cascade="all, delete-orphan",
        passive_deletes=True,
        lazy="raise",
    )


class WorkspaceMember(UUIDMixin, Base):
    """
    Workspace membership record.

    Uses only created_at (no updated_at) — membership rows are not
    mutated; role changes should create a new record or be managed
    via a dedicated update path with activity logging.
    """

    __tablename__ = "workspace_members"

    __table_args__ = (
        UniqueConstraint("workspace_id", "user_id", name="uq_workspace_members_workspace_user"),
        Index("ix_workspace_members_workspace_id", "workspace_id"),
        Index("ix_workspace_members_user_id", "user_id"),
    )

    workspace_id: Mapped[_uuid.UUID] = mapped_column(
        ForeignKey("workspaces.id", ondelete="CASCADE"),
        nullable=False,
    )
    user_id: Mapped[_uuid.UUID] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
    )
    role: Mapped[WorkspaceRole] = mapped_column(
        nullable=False,
        default=WorkspaceRole.MEMBER,
        server_default=WorkspaceRole.MEMBER.value,
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    # Relationships
    workspace: Mapped["Workspace"] = relationship(
        "Workspace",
        back_populates="members",
        lazy="raise",
    )
    user: Mapped["User"] = relationship(  # type: ignore[name-defined]  # noqa: F821
        "User",
        foreign_keys=[user_id],
        lazy="raise",
    )
