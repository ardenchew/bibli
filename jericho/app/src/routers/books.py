from typing import List, Optional

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


@router.get("/books/search/{q}", response_model=schema.books.SearchBookPage)
async def search_books(
        request: Request,
        q: str,
        session: Session = Depends(get_session),
        offset: Optional[int] = None,
        limit: Optional[int] = None,

):
    f = schema.books.OmniBookFilter(
        q=q,
        offset=offset,
        limit=limit,
    )

    # TODO authorization.
    ol = OpenLibrary()
    return books.search_books(session, ol, f, request.state.user.id)


@router.get("/book/{book_id}", response_model=schema.books.BookRead)
async def get_book(book_id: int, session: Session = Depends(get_session)):
    book = books.get_book(session, book_id)
    if not book:
        raise NotFoundException
    return book


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
