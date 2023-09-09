from datetime import date
from enum import Enum
from typing import List, Optional

from sqlmodel import Boolean, Column, Date, Field, Relationship, SQLModel


class TagBase(SQLModel):
    name: str = Field(default=None, primary_key=True)
    verified: bool = Field(sa_column=Column(Boolean))
    count: int


class Tag(TagBase, table=True):
    book_id: int = Field(default=None, primary_key=True, foreign_key="book.id")
    book: "Book" = Relationship(back_populates="tags")


class BookAuthorLinkType(str, Enum):
    PRIMARY = "primary"
    TRANSLATOR = "translator"
    READER = "reader"


class BookAuthorLinkBase(SQLModel):
    book_id: int = Field(
        default=None,
        primary_key=True,
        foreign_key="book.id",
    )
    author_id: int = Field(
        default=None,
        primary_key=True,
        foreign_key="author.id",
    )
    type: Optional[str] = None


class BookAuthorLink(BookAuthorLinkBase, table=True):
    book: "Book" = Relationship(back_populates="author_links")
    author: "Author" = Relationship(back_populates="book_links")


class BookBase(SQLModel):
    title: str
    summary: Optional[str]
    publication_date: Optional[date] = Field(sa_column=Column(Date))
    pages: Optional[int] = None
    # TODO(arden) add ISBN.


class Book(BookBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)

    author_links: List[BookAuthorLink] = Relationship(back_populates="book")
    tags: List[Tag] = Relationship(back_populates="book")


class BookRead(BookBase):
    id: int
    author_links: List[BookAuthorLinkBase]
    tags: List[TagBase]


class AuthorBase(SQLModel):
    name: str
    summary: Optional[str] = None


class Author(AuthorBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)

    book_links: List[BookAuthorLink] = Relationship(back_populates="author")


class AuthorRead(AuthorBase):
    id: int
