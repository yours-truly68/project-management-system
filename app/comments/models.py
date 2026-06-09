import uuid as _uuid

from sqlalchemy import ForeignKey, Index, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import Base
from app.database.mixins import TimestampMixin, UUIDMixin


class TaskComment(UUIDMixin, TimestampMixin, Base):
    __tablename__ = "task_comments"

    __table_args__ = (
        Index("ix_task_comments_task_id", "task_id"),
        Index("ix_task_comments_author_id", "author_id"),
    )

    task_id: Mapped[_uuid.UUID] = mapped_column(
        ForeignKey("tasks.id", ondelete="CASCADE"),
        nullable=False,
    )
    author_id: Mapped[_uuid.UUID] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
    )
    content: Mapped[str] = mapped_column(
        Text,
        nullable=False,
    )

    # Relationships
    task: Mapped["Task"] = relationship(  # type: ignore[name-defined]  # noqa: F821
        "Task",
        back_populates="comments",
        foreign_keys=[task_id],
        lazy="raise",
    )
    author: Mapped["User"] = relationship(  # type: ignore[name-defined]  # noqa: F821
        "User",
        foreign_keys=[author_id],
        lazy="raise",
    )
