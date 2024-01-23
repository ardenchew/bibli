from sqlmodel import Session

from olclient import OpenLibrary
from src.domain.books import schemas, translate


def get_book(session: Session, book_id: int) -> schemas.Book:
    return session.get(schemas.Book, book_id)


def get_books(
        session: Session,
        ol: OpenLibrary,
        q: str,
        offset: int | None = None,
        limit: int | None = None,
):
    obs = ol.Work.q(q, offset, limit)

    return [translate.from_ol_book(ob) for ob in obs]


def upsert_book(session: Session, book: schemas.Book) -> schemas.Book:
    book = session.merge(book)
    session.commit()
    session.refresh(book)
    return book


def get_author(session: Session, author_id: int) -> schemas.Author:
    return session.get(schemas.Author, author_id)


def get_authors(
        session: Session,
        ol: OpenLibrary,
        q: str,
        offset: int | None = None,
        limit: int | None = None,
):
    oas = ol.Author.q(q, offset, limit)

    return [translate.from_ol_author(oa) for oa in oas]


def upsert_author(session: Session, author: schemas.Author) -> schemas.Author:
    author = session.merge(author)
    session.commit()
    session.refresh(author)
    return author
