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
    # ol = OpenLibrary()
    return books.search_books_v2(session, f, request.state.user.id)


@router.get("/book/{book_id}", response_model=schema.books.UserBookRead)
async def get_book(
        request: Request,
        book_id: int,
        session: Session = Depends(get_session),
):
    book = books.get_book(session, book_id, request.state.user.id)
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


@router.get("/tags/{book_id}", response_model=List[schema.books.TagBookLink])
async def get_book(
        book_id: int,
        session: Session = Depends(get_session),
):
    return books.get_tags_from_book_id(session, book_id)


@router.get("/book/{book_id}/{user_id}", response_model=schema.books.UserBookRead)
async def get_user_book(
        book_id: int,
        user_id: int,
        session: Session = Depends(get_session),
):
    book = books.get_book(session, book_id, user_id)
    if not book:
        raise NotFoundException
    return book


@router.post("/books/{user_id}", response_model=schema.books.BookPage)
async def get_user_books(
        user_id: int,
        f: schema.books.BookFilter,
        session: Session = Depends(get_session),
):
    return books.get_books(session, f, user_id)


@router.get("/following/books/{book_id}/{parent_id}", response_model=List[schema.books.UserBookRead])
async def get_following_user_books(
        book_id: int,
        parent_id: int,
        session: Session = Depends(get_session),
):
    users_filter = schema.users.LinkedUsersFilter(
        parent_id=parent_id,
        type=schema.users.UserLinkType.FOLLOW,
    )
    us = users.get_linked_users(session, users_filter)

    bs: List[schema.books.UserBookRead] = []
    for u in us:
        b = books.get_book(session, book_id, u.id)
        if len(b.collections) > 0 or b.review:
            bs.append(b)

    return bs
