import uuid as _uuid
from datetime import datetime
from typing import Any

from sqlalchemy import DateTime, ForeignKey, Index, String, func
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import Base
from app.database.mixins import UUIDMixin


class Activity(UUIDMixin, Base):
    __tablename__ = "activities"

    __table_args__ = (
        Index("ix_activities_workspace_id_created_at", "workspace_id", "created_at"),
        Index("ix_activities_project_id_created_at", "project_id", "created_at"),
        Index("ix_activities_board_id_created_at", "board_id", "created_at"),
        Index("ix_activities_task_id_created_at", "task_id", "created_at"),
        Index("ix_activities_actor_id", "actor_id"),
    )

    workspace_id: Mapped[_uuid.UUID] = mapped_column(
        ForeignKey("workspaces.id", ondelete="CASCADE"),
        nullable=False,
    )
    project_id: Mapped[_uuid.UUID | None] = mapped_column(
        ForeignKey("projects.id", ondelete="CASCADE"),
        nullable=True,
    )
    board_id: Mapped[_uuid.UUID | None] = mapped_column(
        ForeignKey("boards.id", ondelete="CASCADE"),
        nullable=True,
    )
    task_id: Mapped[_uuid.UUID | None] = mapped_column(
        ForeignKey("tasks.id", ondelete="SET NULL"),
        nullable=True,
    )
    actor_id: Mapped[_uuid.UUID] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
    )
    action: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
    )
    activity_metadata: Mapped[dict[str, Any] | None] = mapped_column(
        "metadata",
        JSONB,
        nullable=True,
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    # Relationships
    workspace: Mapped["Workspace"] = relationship(  # type: ignore[name-defined]  # noqa: F821
        "Workspace",
        foreign_keys=[workspace_id],
        lazy="raise",
    )
    actor: Mapped["User"] = relationship(  # type: ignore[name-defined]  # noqa: F821
        "User",
        foreign_keys=[actor_id],
        lazy="raise",
    )
    project: Mapped["Project"] = relationship(  # type: ignore[name-defined]  # noqa: F821
        "Project",
        foreign_keys=[project_id],
        lazy="raise",
    )
    board: Mapped["Board"] = relationship(  # type: ignore[name-defined]  # noqa: F821
        "Board",
        foreign_keys=[board_id],
        lazy="raise",
    )
    task: Mapped["Task"] = relationship(  # type: ignore[name-defined]  # noqa: F821
        "Task",
        foreign_keys=[task_id],
        lazy="raise",
    )
