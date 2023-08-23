from fastapi.testclient import TestClient
from sqlmodel import Session, select

from src.domain.books import schemas, service


def test_get_book(client: TestClient, session: Session):
    title = "Solito"
    book = service.upsert_book(session, schemas.Book(title=title))

    assert book.id is not None
    assert book.title == title

    read = service.get_book(session, book.id)

    assert read.title == book.title
