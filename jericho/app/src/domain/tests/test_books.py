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


def test_crud_author(session: Session):
    author = service.get_author(session, 1)
    assert author is None

    author_input = schemas.Author(
        name="Virginia Woolfe",
        summary="""Adeline Virginia Woolf was an English writer. 
        She is considered one of the most important modernist 
        20th-century authors and a pioneer in the use of 
        stream of consciousness as a narrative device.""",
    )
    author = service.upsert_author(session, author_input)
    assert author.id is not None
    assert author.name == author_input.name

    author = service.get_author(session, author.id)
    assert author is not None

    author.name = "Virginia Woolf",
    author = service.upsert_author(session, author)
    assert author is not None
    author = service.get_author(session, author.id)
    assert author is not None
    assert author.name != author_input.name

