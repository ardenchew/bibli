from fastapi.testclient import TestClient
from sqlmodel import Session, select

from src.domain.books import schemas, service


def test_get_book(client: TestClient, session: Session):
    book = service.create_book(session, schemas.Book(title="Demon Copperhead"))

    response = client.get(f"/books/{book.id}")
    data = response.json()

    assert response.status_code == 200
    assert data["id"] == book.id
    assert data["title"] == book.title
