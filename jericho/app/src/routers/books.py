from fastapi import APIRouter, HTTPException
from sqlmodel import Session
from src.database import engine
from src.domain.books import service, schemas
from sqlalchemy.exc import NoResultFound

# TODO(arden) header dependencies.
router = APIRouter(
    prefix="/books",
    tags=["books"],
)


@router.get("/{book_id}", response_model=schemas.BookRead)
async def get_book(book_id: int):
    with Session(engine) as db:
        try:
            book = service.get_book(db, book_id)
        except NoResultFound:
            raise HTTPException(status_code=404, detail="Hero not found")
        return book
