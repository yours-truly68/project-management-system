"""replace_project_is_archived_with_archived_at

Revision ID: 4bb26a8ac9da
Revises: 380d877eef40
Create Date: 2026-06-10 07:12:20.613502

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa



# revision identifiers, used by Alembic.
revision: str = '4bb26a8ac9da'
down_revision: Union[str, Sequence[str], None] = '380d877eef40'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.add_column("projects", sa.Column("archived_at", sa.DateTime(timezone=True), nullable=True))
    op.execute("UPDATE projects SET archived_at = NOW() WHERE is_archived = TRUE")
    op.drop_column("projects", "is_archived")
    op.create_index("ix_projects_archived_at", "projects", ["archived_at"])


def downgrade() -> None:
    """Downgrade schema."""
    op.add_column("projects", sa.Column("is_archived", sa.Boolean(), nullable=False, server_default="false"))
    op.execute("UPDATE projects SET is_archived = TRUE WHERE archived_at IS NOT NULL")
    op.drop_index("ix_projects_archived_at", table_name="projects")
    op.drop_column("projects", "archived_at")

