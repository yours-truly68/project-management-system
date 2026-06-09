import uuid as _uuid
from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Index, UniqueConstraint, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import Base
from app.database.mixins import UUIDMixin


class Mention(UUIDMixin, Base):
    __tablename__ = "mentions"

    __table_args__ = (
        UniqueConstraint("comment_id", "mentioned_user_id", name="uq_mentions_comment_user"),
        Index("ix_mentions_mentioned_user_id", "mentioned_user_id"),
    )

    comment_id: Mapped[_uuid.UUID] = mapped_column(
        ForeignKey("task_comments.id", ondelete="CASCADE"),
        nullable=False,
    )
    mentioned_user_id: Mapped[_uuid.UUID] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    # Relationships
    comment: Mapped["TaskComment"] = relationship(  # type: ignore[name-defined]  # noqa: F821
        "TaskComment",
        back_populates="mentions",
        foreign_keys=[comment_id],
        lazy="raise",
    )
    mentioned_user: Mapped["User"] = relationship(  # type: ignore[name-defined]  # noqa: F821
        "User",
        foreign_keys=[mentioned_user_id],
        lazy="raise",
    )
