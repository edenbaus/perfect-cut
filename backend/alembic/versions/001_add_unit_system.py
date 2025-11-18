"""Add unit_system column to projects

Revision ID: 001
Revises:
Create Date: 2025-11-16

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '001'
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    """Add unit_system column to projects table."""
    op.add_column(
        'projects',
        sa.Column('unit_system', sa.String(length=20), nullable=True, server_default='imperial')
    )

    # Update existing rows to have default value
    op.execute("UPDATE projects SET unit_system = 'imperial' WHERE unit_system IS NULL")

    # Make the column non-nullable after setting defaults
    op.alter_column('projects', 'unit_system', nullable=False)


def downgrade() -> None:
    """Remove unit_system column from projects table."""
    op.drop_column('projects', 'unit_system')
