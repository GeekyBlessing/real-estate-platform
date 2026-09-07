"""Real listing media upload pipeline

Extends listing_media (previously schema-only, see the initial
migration's comment) to actually back the upload/reorder/attach/delete
API in app/modules/media/router.py: listing_id becomes nullable so a
photo can exist and be previewed before the listing it belongs to has
been created, owner_user_id tracks who uploaded it until then, and
is_primary/thumbnail_url/content_type/width/height/byte_size record
what the real upload pipeline actually knows about each image once
Pillow has processed it.

Revision ID: b4a1f9c7d2e6
Revises: e32364b937b4
Create Date: 2026-09-07
"""

from alembic import op
import sqlalchemy as sa

revision = "b4a1f9c7d2e6"
down_revision = "e32364b937b4"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.alter_column("listing_media", "listing_id", existing_type=sa.UUID(), nullable=True)
    op.add_column("listing_media", sa.Column("owner_user_id", sa.UUID(), nullable=True))
    op.add_column("listing_media", sa.Column("thumbnail_url", sa.String(length=1024), nullable=True))
    op.add_column("listing_media", sa.Column("content_type", sa.String(length=32), nullable=True))
    op.add_column("listing_media", sa.Column("width", sa.Integer(), nullable=True))
    op.add_column("listing_media", sa.Column("height", sa.Integer(), nullable=True))
    op.add_column("listing_media", sa.Column("byte_size", sa.Integer(), nullable=True))
    op.add_column("listing_media", sa.Column("is_primary", sa.Boolean(), nullable=False, server_default=sa.false()))
    op.create_foreign_key(
        "fk_listing_media_owner_user_id", "listing_media", "users", ["owner_user_id"], ["id"], ondelete="CASCADE"
    )
    op.create_index(op.f("ix_listing_media_owner_user_id"), "listing_media", ["owner_user_id"], unique=False)


def downgrade() -> None:
    op.drop_index(op.f("ix_listing_media_owner_user_id"), table_name="listing_media")
    op.drop_constraint("fk_listing_media_owner_user_id", "listing_media", type_="foreignkey")
    op.drop_column("listing_media", "is_primary")
    op.drop_column("listing_media", "byte_size")
    op.drop_column("listing_media", "height")
    op.drop_column("listing_media", "width")
    op.drop_column("listing_media", "content_type")
    op.drop_column("listing_media", "thumbnail_url")
    op.drop_column("listing_media", "owner_user_id")
    op.alter_column("listing_media", "listing_id", existing_type=sa.UUID(), nullable=False)
