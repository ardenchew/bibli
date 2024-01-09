from typing import List

from fastapi import APIRouter, Depends
from sqlmodel import Session

from src.auth.middleware import auth0_middleware
from resources.exceptions import NotFoundException
from src.database import get_session
from src.domain.reviews import schemas, service

router = APIRouter(
    tags=["reviews"],
    dependencies=[Depends(auth0_middleware)],
)


@router.get("/reviews", response_model=List[schemas.ReviewRead])
async def get_reviews(
    review_filter: schemas.ReviewsFilter = Depends(),
    session: Session = Depends(get_session),
):
    return service.get_reviews(session, review_filter)


@router.put("/review", response_model=schemas.ReviewRead)
async def put_review(
    review: schemas.ReviewPut,
    comparison: schemas.Comparison = Depends(),
    session: Session = Depends(get_session),
):
    db_review = schemas.Review.from_orm(review)
    return service.upsert_review(session, db_review, comparison)


@router.delete("/review/{user_id}/{book_id}")
async def delete_review(
    user_id: int,
    book_id: int,
    session: Session = Depends(get_session),
):
    review = service.get_review(session, user_id, book_id)
    if not review:
        raise NotFoundException
    service.delete_review(session, review)
    return
