from sqlmodel import Session, select

from src.domain.books import schemas


def get_book(session: Session, book_id: int) -> schemas.Book:
    statement = select(schemas.Book).where(schemas.Book.id == book_id)
    book = session.exec(statement).one()
    return book


def create_book(session: Session, book: schemas.Book) -> schemas.Book:
    session.add(book)
    session.commit()
    return book
