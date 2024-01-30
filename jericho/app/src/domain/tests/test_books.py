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


def test_crud_author(session: Session):
    author = books.get_author(session, 1)
    assert author is None

    author_input = schema.books.Author(
        name="Virginia Woolfe",
        summary="""Adeline Virginia Woolf was an English writer.
        She is considered one of the most important modernist
        20th-century authors and a pioneer in the use of
        stream of consciousness as a narrative device.""",
    )
    author = books.upsert_author(session, author_input)
    assert author.id is not None
    assert author.name == author_input.name

    author = books.get_author(session, author.id)
    assert author is not None

    author.name = "Virginia Woolf"
    author = books.upsert_author(session, author)
    assert author is not None
    author = books.get_author(session, author.id)
    assert author is not None
    assert author.name != author_input.name
