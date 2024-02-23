"""first publication date

Revision ID: 1d5901a47aba
Revises: 7bf135e1e044
Create Date: 2024-02-23 02:59:15.888714

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
import sqlmodel


# revision identifiers, used by Alembic.
revision: str = '1d5901a47aba'
down_revision: Union[str, None] = '7bf135e1e044'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.add_column('book', sa.Column('first_publication_date', sqlmodel.sql.sqltypes.AutoString(), nullable=True))
    # ### end Alembic commands ###


def downgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_column('book', 'first_publication_date')
    # ### end Alembic commands ###
