import uuid as _uuid
from sqlalchemy import ForeignKey, Index, String, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import Base
from app.database.mixins import TimestampMixin, UUIDMixin


class Favorite(UUIDMixin, TimestampMixin, Base):
    __tablename__ = "favorites"

    __table_args__ = (
        UniqueConstraint("user_id", "entity_type", "entity_id", name="uq_favorites_user_entity_id"),
        Index("ix_favorites_user_id", "user_id"),
        Index("ix_favorites_entity", "entity_type", "entity_id"),
    )

    user_id: Mapped[_uuid.UUID] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
    )
    entity_type: Mapped[str] = mapped_column(
        String(50),  # "project", "board", etc.
        nullable=False,
    )
    entity_id: Mapped[_uuid.UUID] = mapped_column(
        nullable=False,
    )

    # Relationships
    user: Mapped["User"] = relationship(  # type: ignore[name-defined]  # noqa: F821
        "User",
        foreign_keys=[user_id],
        lazy="raise",
    )
