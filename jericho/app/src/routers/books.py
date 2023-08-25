from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session

from resources.strings import NOT_FOUND_ERROR
from src.database import get_session
from src.domain.books import service, schemas

# TODO(arden) header dependencies.
router = APIRouter(
    tags=["books"],
)


@router.get("/book/{book_id}", response_model=schemas.BookRead)
async def get_book(book_id: int, session: Session = Depends(get_session)):
    book = service.get_book(session, book_id)
    if not book:
        raise HTTPException(status_code=404, detail=NOT_FOUND_ERROR)
    return book


@router.get("/author/{author_id}", response_model=schemas.AuthorRead)
async def get_author(author_id: int, session: Session = Depends(get_session)):
    author = service.get_author(session, author_id)
    if not author:
        raise HTTPException(status_code=404, detail=NOT_FOUND_ERROR)
    return author
