from sqlmodel import Session, SQLModel, create_engine

from src.config import pg_user, pg_password, pg_host


def get_session():
    with Session(engine) as session:
        yield session


# TODO(arden) use Alembic migrations.
def create_db_and_tables():
    SQLModel.metadata.create_all(engine)


def generate_db_connection_url(
    user: str,
    password: str,
    host: str,
    protocol: str = "postgresql",
    port: str = 5432,
    database: str = "jericho",
) -> str:
    return f"{protocol}://{user}:{password}@{host}:{port}/{database}"


pg_url = generate_db_connection_url(pg_user, pg_password, pg_host)
engine = create_engine(pg_url, echo=True)
