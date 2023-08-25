from sqlmodel import Session

from src.domain.books import schemas


def get_book(session: Session, book_id: int) -> schemas.Book:
    return session.get(schemas.Book, book_id)


def upsert_book(session: Session, book: schemas.Book) -> schemas.Book:
    book = session.merge(book)
    session.commit()
    session.refresh(book)
    return book


def get_author(session: Session, author_id: int) -> schemas.Author:
    return session.get(schemas.Author, author_id)


def upsert_author(session: Session, author: schemas.Author) -> schemas.Author:
    author = session.merge(author)
    session.commit()
    session.refresh(author)
    return author
