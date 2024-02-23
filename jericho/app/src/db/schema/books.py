from datetime import date
from typing import List, Optional

from sqlmodel import Boolean, Column, Date, Field, Relationship, SQLModel

from src.db.schema.reviews import ReviewRead
from src.db.schema.collections import CollectionRead


class TagBase(SQLModel):
    name: str = Field(default=None, primary_key=True)
    verified: bool = Field(sa_column=Column(Boolean))
    count: int


class Tag(TagBase, table=True):
    book_id: int = Field(default=None, primary_key=True, foreign_key="book.id")
    book: "Book" = Relationship(back_populates="tags")


class BookBase(SQLModel):
    title: str
    subtitle: Optional[str]
    summary: Optional[str]
    publication_date: Optional[date] = Field(sa_column=Column(Date))
    pages: Optional[int] = None
    cover_link: Optional[str]
    olid: Optional[str] = Field(default=None, unique=True)


class Book(BookBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    tags: List[Tag] = Relationship(back_populates="book")


class BookRead(BookBase):
    id: int
    tags: Optional[List[TagBase]]


class UserBookRead(SQLModel):
    user_id: int
    book: BookRead
    review: Optional[ReviewRead]
    collections: Optional[List[CollectionRead]]
    # TODO use AuthorRead object as BookRead attribute.
    authors: List[str] = []


class BookPage(SQLModel):
    total_count: int
    books: List[UserBookRead] = []


class BookFilter(SQLModel):
    collection_ids: Optional[List[int]]
    offset: Optional[int] = None
    limit: Optional[int] = None
