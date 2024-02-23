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


@router.get("/books/search/{q}", response_model=schema.books.BookPage)
async def search_books(
        request: Request,
        q: str,
        session: Session = Depends(get_session),
        offset: Optional[int] = None,
        limit: Optional[int] = None,
):
    f = schema.filter.Filter(
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


@router.post("/books", response_model=schema.books.BookPage)
async def get_books(
    request: Request,
    f: schema.books.BookFilter,
    session: Session = Depends(get_session),
):
    return books.get_books(session, f, request.state.user.id)
