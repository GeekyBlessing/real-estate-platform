"""Widen listing price to a 64 bit column

listings.price_in_minor_units stores the price in kobo as a plain 32
bit Integer, which tops out around 21.4 million Naira. That is an
ordinary sale price for a property in Lagos, not an edge case, and
the first real end to end test of a duplex sale listing (85 million
Naira) overflowed it. BigInteger removes the ceiling instead of
patching around it with a price cap the product was never asked for.

Revision ID: a0e354781263
Revises: c7e29a4f1b3d
Create Date: 2026-09-08
"""

from alembic import op
import sqlalchemy as sa

revision = "a0e354781263"
down_revision = "c7e29a4f1b3d"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.alter_column(
        "listings",
        "price_in_minor_units",
        existing_type=sa.Integer(),
        type_=sa.BigInteger(),
        existing_nullable=False,
    )


def downgrade() -> None:
    op.alter_column(
        "listings",
        "price_in_minor_units",
        existing_type=sa.BigInteger(),
        type_=sa.Integer(),
        existing_nullable=False,
    )
