from src.config import pg_url
from sqlmodel import SQLModel, create_engine


engine = create_engine(pg_url, echo=True)


# TODO(arden) use Alembic migrations.
def create_db_and_tables():
    SQLModel.metadata.create_all(engine)
