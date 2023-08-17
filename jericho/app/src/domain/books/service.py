from sqlmodel import Session, select
from src.domain.books import schemas


def get_book(db: Session, book_id: int):
    statement = select(schemas.Book).where(schemas.Book.id == book_id)
    book = db.exec(statement).one()
    return book
