from sqlmodel import Session

from src.domain.books import schemas


def get_book(session: Session, book_id: int) -> schemas.Book:
    return session.get(schemas.Book, book_id)


def upsert_book(session: Session, book: schemas.Book) -> schemas.Book:
    book = session.merge(book)
    session.commit()
    session.refresh(book)
    return book
