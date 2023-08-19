from fastapi.testclient import TestClient
from sqlmodel import Session, select

from src.domain.books import schemas


def test_get_book(client: TestClient, session: Session):
    # Insert book into database.
    book = schemas.Book(title="Demon Copperhead")
    session.add(book)
    session.commit()

    book = session.exec(select(schemas.Book)).one()

    response = client.get(f"/books/{book.id}")
    data = response.json()

    assert response.status_code == 200
    assert data["id"] == book.id
    assert data["title"] == book.title
