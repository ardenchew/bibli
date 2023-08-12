from typing import Optional

from sqlmodel import Field, SQLModel, UniqueConstraint, create_engine

from sql.config import pg_url


class Book(SQLModel, table=True):
    # __table_args__ = (
    #     UniqueConstraint("external_id", "external_source", name="external_unique_constraint")
    # )
    id: int = Field(default=None, primary_key=True)
    external_id: Optional[str] = None
    external_source: Optional[str] = None  # enum
    title: str


engine = create_engine(pg_url, echo=True)

# TODO(achew) use Alembic migrations.
def create_db_and_tables():
    SQLModel.metadata.create_all(engine)


if __name__ == "__main__":
    create_db_and_tables()
