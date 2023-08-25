from sqlmodel import Session, SQLModel, create_engine

from src.config import pg_user, pg_password, pg_host


def get_session():
    with Session(engine) as session:
        yield session


# TODO(arden) use Alembic migrations.
def create_db_and_tables():
    SQLModel.metadata.create_all(engine)


pg_url = f"postgresql://{pg_user}:{pg_password}@{pg_host}:5432/jericho"
engine = create_engine(pg_url, echo=True)
