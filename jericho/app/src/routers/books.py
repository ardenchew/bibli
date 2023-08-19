from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.exc import NoResultFound
from sqlmodel import Session

from src.database import get_session
from src.domain.books import service, schemas

# TODO(arden) header dependencies.
router = APIRouter(
    prefix="/books",
    tags=["books"],
)


@router.get("/{book_id}", response_model=schemas.BookRead)
async def get_book(book_id: int, session: Session = Depends(get_session)):
    try:
        book = service.get_book(session, book_id)
    except NoResultFound:
        raise HTTPException(status_code=404, detail="Hero not found")
    return book
