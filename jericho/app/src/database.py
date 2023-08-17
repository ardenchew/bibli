from src.config import pg_url
from sqlmodel import Field, SQLModel, UniqueConstraint, create_engine
from typing import Optional


class Book(SQLModel, table=True):
    # __table_args__ = (
    #     UniqueConstraint("external_id", "external_source", name="external_unique_constraint")
    # )
    id: Optional[int] = Field(default=None, primary_key=True)
    external_id: Optional[str] = None
    external_source: Optional[str] = None  # enum
    title: str


engine = create_engine(pg_url, echo=True)


# TODO(arden) use Alembic migrations.
def create_db_and_tables():
    SQLModel.metadata.create_all(engine)
