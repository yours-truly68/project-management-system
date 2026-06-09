import uuid as _uuid

from sqlalchemy import ForeignKey, Index, Integer, String, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import Base
from app.database.mixins import TimestampMixin, UUIDMixin


class Column(UUIDMixin, TimestampMixin, Base):
    __tablename__ = "columns"

    __table_args__ = (
        UniqueConstraint("board_id", "position", name="uq_columns_board_position"),
        UniqueConstraint("board_id", "name", name="uq_columns_board_name"),
        Index("ix_columns_board_id", "board_id"),
        Index("ix_columns_position", "position"),
    )

    board_id: Mapped[_uuid.UUID] = mapped_column(
        ForeignKey("boards.id", ondelete="CASCADE"),
        nullable=False,
    )
    name: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
    )
    position: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
    )
    color: Mapped[str | None] = mapped_column(
        String(7),
        nullable=True,
    )

    # Relationships
    board: Mapped["Board"] = relationship(  # type: ignore[name-defined]  # noqa: F821
        "Board",
        back_populates="columns",
        foreign_keys=[board_id],
        lazy="raise",
    )
