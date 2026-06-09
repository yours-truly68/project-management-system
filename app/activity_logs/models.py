import uuid as _uuid
from datetime import datetime
from typing import Any

from sqlalchemy import DateTime, ForeignKey, Index, String, func
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import Base
from app.database.mixins import UUIDMixin


class ActivityLog(UUIDMixin, Base):
    __tablename__ = "activity_logs"

    __table_args__ = (
        Index("ix_activity_logs_workspace_timeline", "workspace_id", "created_at"),
        Index("ix_activity_logs_actor_history", "actor_id", "created_at"),
        Index("ix_activity_logs_entity_history", "entity_type", "entity_id", "created_at"),
    )

    workspace_id: Mapped[_uuid.UUID] = mapped_column(
        ForeignKey("workspaces.id", ondelete="CASCADE"),
        nullable=False,
    )
    actor_id: Mapped[_uuid.UUID] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
    )
    entity_type: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
    )
    entity_id: Mapped[_uuid.UUID] = mapped_column(
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
        back_populates="activity_logs",
        foreign_keys=[workspace_id],
        lazy="raise",
    )
    actor: Mapped["User"] = relationship(  # type: ignore[name-defined]  # noqa: F821
        "User",
        foreign_keys=[actor_id],
        lazy="raise",
    )
