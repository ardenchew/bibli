from sqlmodel import Session

import src.db.schema as schema
from src.domain.service import books


def test_crud_book(session: Session):
    book = books.get_book(session, 1)
    assert book is None

    title = "Solito"
    book = books.upsert_book(session, schema.books.Book(title=title))
    assert book.id is not None
    assert book.title == title

    book = books.get_book(session, book.id)
    assert book is not None

    book.title = "A River Runs Through It"
    book = books.upsert_book(session, book)
    assert book is not None
    book = books.get_book(session, book.id)
    assert book is not None
    assert book.title != title
