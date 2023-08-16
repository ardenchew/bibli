from sql.database import Book, engine

from sqlmodel import Field, Session, SQLModel, create_engine, select


def book_read(book_id: int) -> Book:
    with Session(engine) as session:
        statement = select(Book).where(Book.id == book_id)
        book = session.exec(statement).one()
        return book
