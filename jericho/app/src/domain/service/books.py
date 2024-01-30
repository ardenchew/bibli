from sqlmodel import Session

import src.db.schema as schema
from olclient import OpenLibrary
from src.domain.utils import translate

DEFAULT_PAGE_LIMIT = 10
MAXIMUM_PATE_LIMIT = 100


def get_book(session: Session, book_id: int) -> schema.books.Book:
    return session.get(schema.books.Book, book_id)


def get_books(
    session: Session,
    ol: OpenLibrary,
    f: schema.books.BookFilter,
):
    obs = ol.Work.q(filter.q, filter.offset, filter.limit)

    return [translate.from_ol_book(ob) for ob in obs]


def upsert_book(session: Session, book: schema.books.Book) -> schema.books.Book:
    book = session.merge(book)
    session.commit()
    session.refresh(book)
    return book


def get_author(session: Session, author_id: int) -> schema.books.Author:
    return session.get(schema.books.Author, author_id)


def get_authors(
    session: Session,
    ol: OpenLibrary,
    q: str,
    offset: int = 0,
    limit: int = DEFAULT_PAGE_LIMIT,
):
    oas = ol.Author.q(q, offset, limit)

    return [translate.from_ol_author(oa) for oa in oas]


def upsert_author(session: Session, author: schema.books.Author) -> schema.books.Author:
    author = session.merge(author)
    session.commit()
    session.refresh(author)
    return author
