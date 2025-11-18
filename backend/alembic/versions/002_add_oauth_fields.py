"""Add OAuth fields to users

Revision ID: 002
Revises: 001
Create Date: 2025-11-16

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '002'
down_revision = '001'
branch_labels = None
depends_on = None


def upgrade() -> None:
    """Add OAuth fields to users table."""
    # Make password_hash nullable for OAuth users
    op.alter_column('users', 'password_hash', nullable=True)

    # Add OAuth provider field
    op.add_column(
        'users',
        sa.Column('oauth_provider', sa.String(length=50), nullable=True)
    )

    # Add OAuth subject (user ID from provider)
    op.add_column(
        'users',
        sa.Column('oauth_sub', sa.String(length=255), nullable=True)
    )

    # Add profile picture URL
    op.add_column(
        'users',
        sa.Column('picture', sa.String(length=500), nullable=True)
    )

    # Add email verification flag
    op.add_column(
        'users',
        sa.Column('is_email_verified', sa.Boolean(), nullable=True, server_default='false')
    )

    # Create index on oauth_sub for faster lookups
    op.create_index('ix_users_oauth_sub', 'users', ['oauth_sub'])


def downgrade() -> None:
    """Remove OAuth fields from users table."""
    op.drop_index('ix_users_oauth_sub', table_name='users')
    op.drop_column('users', 'is_email_verified')
    op.drop_column('users', 'picture')
    op.drop_column('users', 'oauth_sub')
    op.drop_column('users', 'oauth_provider')
    op.alter_column('users', 'password_hash', nullable=False)
