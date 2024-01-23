from datetime import date
from typing import List, Optional

from sqlmodel import Boolean, Column, Date, Field, Relationship, SQLModel


class TagBase(SQLModel):
    name: str = Field(default=None, primary_key=True)
    verified: bool = Field(sa_column=Column(Boolean))
    count: int


class Tag(TagBase, table=True):
    book_id: int = Field(default=None, primary_key=True, foreign_key="book.id")
    book: "Book" = Relationship(back_populates="tags")


class AuthorBase(SQLModel):
    name: str
    summary: Optional[str] = None
    olid: Optional[str]
    cover_link: Optional[str]


class Author(AuthorBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)


class AuthorRead(AuthorBase):
    id: Optional[int]


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
    id: Optional[int]
    tags: Optional[List[TagBase]]
    authors: List[AuthorRead]
