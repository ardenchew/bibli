import pytest
from fastapi.testclient import TestClient
from psycopg import Connection
from sqlmodel import Session, SQLModel, create_engine

from main import app
from src.database import get_session, generate_db_connection_url


@pytest.fixture(name="session")
def session_fixture(postgresql: Connection):
    url = generate_db_connection_url(
        user=postgresql.info.user,
        password=postgresql.info.password,
        host=postgresql.info.host,
        protocol="postgresql+psycopg2",
        port=postgresql.info.port,
        database=postgresql.info.dbname,
    )
    engine = create_engine(url)
    SQLModel.metadata.create_all(engine)
    with Session(engine) as session:
        yield session


@pytest.fixture(name="client")
def client_fixture(session: Session):
    def get_session_override():
        return session

    app.dependency_overrides[get_session] = get_session_override

    client = TestClient(app)
    yield client
    app.dependency_overrides.clear()
