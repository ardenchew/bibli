from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session
from typing import List

from resources.exceptions import NotFoundException
from src.database import get_session
from src.domain.books import schemas, service

from olclient.openlibrary import OpenLibrary
from olclient.helper_classes.results import Results

# TODO(arden) header dependencies.
router = APIRouter(
    tags=["books"],
)


@router.get("/book/{book_id}", response_model=schemas.BookRead)
async def get_book(book_id: int, session: Session = Depends(get_session)):
    book = service.get_book(session, book_id)
    if not book:
        raise NotFoundException
    return book


@router.get("/author/{author_id}", response_model=schemas.AuthorRead)
async def get_author(author_id: int, session: Session = Depends(get_session)):
    author = service.get_author(session, author_id)
    if not author:
        raise NotFoundException
    return author


@router.get("/authors", response_model=List[schemas.AuthorRead])
async def get_authors(
        q: str,
        offset: int | None = None,
        limit: int | None = None,
        session: Session = Depends(get_session),
):
    ol = OpenLibrary()
    return service.get_authors(session, ol, q, offset, limit)


@router.get("/books", response_model=List[schemas.BookRead])
async def get_books(
    q: str,
    offset: int | None = None,
    limit: int | None = None,
    session: Session = Depends(get_session),
):
    ol = OpenLibrary()
    return service.get_books(session, ol, q, offset, limit)


@router.get("/olclient")
async def getol(title: str):
    ol = OpenLibrary()
    books = ol.Work.q(title)
    print(books[0])
    print(books[0].authors[0])

    olid = books[0].authors[0]['olid']
    print(olid)

    author = ol.Author.get(olid)
    print(author)


