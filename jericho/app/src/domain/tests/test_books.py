from sqlmodel import Session

from src.domain.books import schemas, service


def test_crud_book(session: Session):
    book = service.get_book(session, 1)
    assert book is None

    title = "Solito"
    book = service.upsert_book(session, schemas.Book(title=title))
    assert book.id is not None
    assert book.title == title

    book = service.get_book(session, book.id)
    assert book is not None

    book.title = "A River Runs Through It"
    book = service.upsert_book(session, book)
    assert book is not None
    book = service.get_book(session, book.id)
    assert book is not None
    assert book.title != title

