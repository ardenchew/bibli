from src.config import pg_url
from sqlmodel import Session, SQLModel, create_engine


engine = create_engine(pg_url, echo=True)


def get_session():
    with Session(engine) as db:
        yield db


# TODO(arden) use Alembic migrations.
def create_db_and_tables():
    SQLModel.metadata.create_all(engine)
