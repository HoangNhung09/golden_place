"""add user profile fields

Revision ID: 20260521_add_user_profile_fields
Revises:
Create Date: 2026-05-21
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "20260521_add_user_profile_fields"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("users", sa.Column("date_of_birth", sa.Date(), nullable=True))
    op.add_column("users", sa.Column("gender", sa.String(length=20), nullable=True))
    op.add_column("users", sa.Column("address", sa.String(length=500), nullable=True))
    op.add_column("users", sa.Column("nationality", sa.String(length=100), nullable=True))
    op.add_column("users", sa.Column("id_number", sa.String(length=100), nullable=True))
    op.add_column("users", sa.Column("membership_tier", sa.String(length=50), nullable=False, server_default="Gold"))
    op.add_column("users", sa.Column("reward_points", sa.Integer(), nullable=False, server_default="0"))
    op.add_column("users", sa.Column("total_points", sa.Integer(), nullable=False, server_default="0"))
    op.add_column("users", sa.Column("used_points", sa.Integer(), nullable=False, server_default="0"))


def downgrade() -> None:
    op.drop_column("users", "used_points")
    op.drop_column("users", "total_points")
    op.drop_column("users", "reward_points")
    op.drop_column("users", "membership_tier")
    op.drop_column("users", "id_number")
    op.drop_column("users", "nationality")
    op.drop_column("users", "address")
    op.drop_column("users", "gender")
    op.drop_column("users", "date_of_birth")
