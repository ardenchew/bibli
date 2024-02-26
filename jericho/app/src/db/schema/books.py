from datetime import date
from typing import List, Optional

from sqlmodel import Boolean, Column, Date, Field, Relationship, SQLModel

from src.db.schema.reviews import ReviewRead
from src.db.schema.collections import CollectionRead


class TagBookLink(SQLModel, table=True):
    tag_name: str = Field(default=None, primary_key=True, foreign_key="tag.name")
    book_id: int = Field(default=None, primary_key=True, foreign_key="book.id")
    count: int
    book: "Book" = Relationship(back_populates="tag_links")


class Tag(SQLModel, table=True):
    name: str = Field(default=None, primary_key=True, unique=True)


class AuthorBookLink(SQLModel, table=True):
    author_id: int = Field(
        default=None, primary_key=True, foreign_key="author.id"
    )
    book_id: int = Field(
        default=None, primary_key=True, foreign_key="book.id"
    )


class AuthorBase(SQLModel):
    name: str


class Author(AuthorBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(default=None, unique=True)
    books: List["Book"] = Relationship(back_populates="authors", link_model=AuthorBookLink)


class AuthorRead(AuthorBase):
    id: int


class BookBase(SQLModel):
    title: str
    subtitle: Optional[str]
    summary: Optional[str]
    publication_date: Optional[date] = Field(default=None, sa_column=Column(Date))
    pages: Optional[int] = None
    cover_link: Optional[str]
    gid: Optional[str] = Field(default=None, unique=True)
    isbn13: Optional[str]
    isbn10: Optional[str]


class Book(BookBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    tag_links: List[TagBookLink] = Relationship(back_populates="book")
    authors: List[Author] = Relationship(back_populates="books", link_model=AuthorBookLink)


class BookRead(BookBase):
    id: int


class UserBookRead(SQLModel):
    user_id: int
    book: BookRead
    review: Optional[ReviewRead]
    collections: Optional[List[CollectionRead]]
    # TODO use AuthorRead object as BookRead attribute.
    authors: List[AuthorRead] = []


class BookPage(SQLModel):
    total_count: int
    books: List[UserBookRead] = []


class BookFilter(SQLModel):
    collection_ids: Optional[List[int]]
    offset: Optional[int] = None
    limit: Optional[int] = None
