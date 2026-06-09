import uuid as _uuid
from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Index, Integer, String, Text, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import Base
from app.database.mixins import TimestampMixin, UUIDMixin
from app.shared.enums import Priority


class Task(UUIDMixin, TimestampMixin, Base):
    __tablename__ = "tasks"

    __table_args__ = (
        UniqueConstraint("column_id", "position", name="uq_tasks_column_position"),
        Index("ix_tasks_column_id", "column_id"),
        Index("ix_tasks_assignee_id", "assignee_id"),
        Index("ix_tasks_reporter_id", "reporter_id"),
        Index("ix_tasks_position", "position"),
    )

    column_id: Mapped[_uuid.UUID] = mapped_column(
        ForeignKey("columns.id", ondelete="CASCADE"),
        nullable=False,
    )
    title: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
    )
    description: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )
    priority: Mapped[Priority] = mapped_column(
        String(20),
        nullable=False,
        default=Priority.MEDIUM,
        server_default=Priority.MEDIUM.value,
    )
    assignee_id: Mapped[_uuid.UUID | None] = mapped_column(
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
    )
    reporter_id: Mapped[_uuid.UUID | None] = mapped_column(
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
    )
    due_date: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )
    position: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
    )

    # Relationships
    column: Mapped["Column"] = relationship(  # type: ignore[name-defined]  # noqa: F821
        "Column",
        back_populates="tasks",
        foreign_keys=[column_id],
        lazy="raise",
    )
    assignee: Mapped["User"] = relationship(  # type: ignore[name-defined]  # noqa: F821
        "User",
        foreign_keys=[assignee_id],
        lazy="raise",
    )
    reporter: Mapped["User"] = relationship(  # type: ignore[name-defined]  # noqa: F821
        "User",
        foreign_keys=[reporter_id],
        lazy="raise",
    )
    comments: Mapped[list["TaskComment"]] = relationship(  # type: ignore[name-defined]  # noqa: F821
        "TaskComment",
        back_populates="task",
        cascade="all, delete-orphan",
        passive_deletes=True,
        lazy="raise",
    )
