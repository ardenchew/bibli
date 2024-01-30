from typing import List

from fastapi import APIRouter, Depends, Request
from sqlmodel import Session

import src.db.schema as schema
from olclient.openlibrary import OpenLibrary
from resources.exceptions import NotFoundException
from src.auth.middleware import auth0_middleware
from src.database import get_session
from src.domain.service import books, users

# TODO(arden) header dependencies.
router = APIRouter(
    tags=["books"],
    dependencies=[Depends(auth0_middleware)],
)


@router.get("/book/{book_id}", response_model=schema.books.BookRead)
async def get_book(book_id: int, session: Session = Depends(get_session)):
    book = books.get_book(session, book_id)
    if not book:
        raise NotFoundException
    return book


@router.get("/books", response_model=List[schema.books.BookRead])
async def get_books(
    f: schema.books.BookFilter,
    request: Request,
    session: Session = Depends(get_session),
):
    # TODO authorization.
    ol = OpenLibrary()
    if request.state.user.id:
        user = users.get_user(session, request.state.user.id)
        if user:
            return user
    return books.get_books(session, ol, f)


@router.get("/author/{author_id}", response_model=schema.books.AuthorRead)
async def get_author(author_id: int, session: Session = Depends(get_session)):
    author = books.get_author(session, author_id)
    if not author:
        raise NotFoundException
    return author


@router.get("/authors", response_model=List[schema.books.AuthorRead])
async def get_authors(
    q: str,
    offset: int | None = None,
    limit: int | None = None,
    session: Session = Depends(get_session),
):
    ol = OpenLibrary()
    return books.get_authors(session, ol, q, offset, limit)


@router.get("/olclient")
async def getol(title: str):
    ol = OpenLibrary()
    books = ol.Work.q(title)
    print(books[0])
    print(books[0].authors[0])

    olid = books[0].authors[0]["olid"]
    print(olid)

    author = ol.Author.get(olid)
    print(author)
