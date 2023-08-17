from src.database import Book
from fastapi import APIRouter


# TODO(arden) header dependencies.
router = APIRouter(
    prefix="/books",
    tags=["books"],
)


@router.get("/{book_id}", response_model=Book)
async def get_book(book_id: int):
    return book_read(book_id)

