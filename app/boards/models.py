import uuid as _uuid

from sqlalchemy import ForeignKey, Index, String, Text, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import Base
from app.database.mixins import TimestampMixin, UUIDMixin


class Board(UUIDMixin, TimestampMixin, Base):
    __tablename__ = "boards"

    __table_args__ = (
        UniqueConstraint("project_id", "name", name="uq_boards_project_name"),
        Index("ix_boards_project_id", "project_id"),
        Index("ix_boards_created_by", "created_by"),
    )

    project_id: Mapped[_uuid.UUID] = mapped_column(
        ForeignKey("projects.id", ondelete="CASCADE"),
        nullable=False,
    )
    name: Mapped[str] = mapped_column(
        String(100),
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

    # Relationships
    project: Mapped["Project"] = relationship(  # type: ignore[name-defined]  # noqa: F821
        "Project",
        foreign_keys=[project_id],
        lazy="raise",
    )
    creator: Mapped["User"] = relationship(  # type: ignore[name-defined]  # noqa: F821
        "User",
        foreign_keys=[created_by],
        lazy="raise",
    )
