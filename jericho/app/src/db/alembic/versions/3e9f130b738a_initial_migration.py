"""Initial migration

Revision ID: 3e9f130b738a
Revises: 
Create Date: 2024-02-21 15:53:50.615517

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
import sqlmodel


# revision identifiers, used by Alembic.
revision: str = '3e9f130b738a'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.create_table('book',
    sa.Column('publication_date', sa.Date(), nullable=True),
    sa.Column('title', sqlmodel.sql.sqltypes.AutoString(), nullable=False),
    sa.Column('subtitle', sqlmodel.sql.sqltypes.AutoString(), nullable=True),
    sa.Column('summary', sqlmodel.sql.sqltypes.AutoString(), nullable=True),
    sa.Column('pages', sa.Integer(), nullable=True),
    sa.Column('cover_link', sqlmodel.sql.sqltypes.AutoString(), nullable=True),
    sa.Column('olid', sqlmodel.sql.sqltypes.AutoString(), nullable=True),
    sa.Column('id', sa.Integer(), nullable=False),
    sa.PrimaryKeyConstraint('id'),
    sa.UniqueConstraint('olid')
    )
    op.create_table('user',
    sa.Column('name', sqlmodel.sql.sqltypes.AutoString(), nullable=True),
    sa.Column('tag', sqlmodel.sql.sqltypes.AutoString(), nullable=True),
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('sub', sqlmodel.sql.sqltypes.AutoString(), nullable=False),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_user_sub'), 'user', ['sub'], unique=True)
    op.create_index(op.f('ix_user_tag'), 'user', ['tag'], unique=True)
    op.create_table('collection',
    sa.Column('name', sqlmodel.sql.sqltypes.AutoString(), nullable=False),
    sa.Column('user_id', sa.Integer(), nullable=True),
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('type', sqlmodel.sql.sqltypes.AutoString(), nullable=True),
    sa.ForeignKeyConstraint(['user_id'], ['user.id'], ),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_table('review',
    sa.Column('user_id', sa.Integer(), nullable=False),
    sa.Column('book_id', sa.Integer(), nullable=False),
    sa.Column('notes', sqlmodel.sql.sqltypes.AutoString(), nullable=True),
    sa.Column('rating', sa.Float(), nullable=True),
    sa.Column('hide_rank', sa.Boolean(), nullable=False),
    sa.Column('rank', sa.Integer(), nullable=True),
    sa.Column('reaction', sqlmodel.sql.sqltypes.AutoString(), nullable=False),
    sa.ForeignKeyConstraint(['book_id'], ['book.id'], ),
    sa.ForeignKeyConstraint(['user_id'], ['user.id'], ),
    sa.PrimaryKeyConstraint('user_id', 'book_id')
    )
    op.create_index(op.f('ix_review_rating'), 'review', ['rating'], unique=False)
    op.create_table('tag',
    sa.Column('verified', sa.Boolean(), nullable=True),
    sa.Column('name', sqlmodel.sql.sqltypes.AutoString(), nullable=False),
    sa.Column('count', sa.Integer(), nullable=False),
    sa.Column('book_id', sa.Integer(), nullable=False),
    sa.ForeignKeyConstraint(['book_id'], ['book.id'], ),
    sa.PrimaryKeyConstraint('name', 'book_id')
    )
    op.create_table('userlink',
    sa.Column('parent_id', sa.Integer(), nullable=False),
    sa.Column('child_id', sa.Integer(), nullable=False),
    sa.Column('type', sqlmodel.sql.sqltypes.AutoString(), nullable=False),
    sa.ForeignKeyConstraint(['child_id'], ['user.id'], ),
    sa.ForeignKeyConstraint(['parent_id'], ['user.id'], ),
    sa.PrimaryKeyConstraint('parent_id', 'child_id')
    )
    op.create_table('collectionbooklink',
    sa.Column('collection_id', sa.Integer(), nullable=False),
    sa.Column('book_id', sa.Integer(), nullable=False),
    sa.ForeignKeyConstraint(['book_id'], ['book.id'], ),
    sa.ForeignKeyConstraint(['collection_id'], ['collection.id'], ),
    sa.PrimaryKeyConstraint('collection_id', 'book_id')
    )
    # ### end Alembic commands ###


def downgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_table('collectionbooklink')
    op.drop_table('userlink')
    op.drop_table('tag')
    op.drop_index(op.f('ix_review_rating'), table_name='review')
    op.drop_table('review')
    op.drop_table('collection')
    op.drop_index(op.f('ix_user_tag'), table_name='user')
    op.drop_index(op.f('ix_user_sub'), table_name='user')
    op.drop_table('user')
    op.drop_table('book')
    # ### end Alembic commands ###
