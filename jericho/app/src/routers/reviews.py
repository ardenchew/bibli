from typing import List

from fastapi import APIRouter, Depends
from sqlmodel import Session

import src.db.schema as schema
from resources.exceptions import NotFoundException
from src.auth.middleware import auth0_middleware
from src.database import get_session
from src.domain.service import reviews

router = APIRouter(
    tags=["reviews"],
    dependencies=[Depends(auth0_middleware)],
)


@router.get("/reviews", response_model=List[schema.reviews.ReviewRead])
async def get_reviews(
    review_filter: schema.reviews.ReviewsFilter = Depends(),
    session: Session = Depends(get_session),
):
    return reviews.get_reviews(session, review_filter)


@router.put("/review", response_model=schema.reviews.ReviewRead)
async def put_review(
    review: schema.reviews.ReviewPut,
    comparison: schema.reviews.Comparison = Depends(),
    session: Session = Depends(get_session),
):
    db_review = schema.reviews.Review.from_orm(review)
    return reviews.upsert_review(session, db_review, comparison)


@router.delete("/review/{user_id}/{book_id}")
async def delete_review(
    user_id: int,
    book_id: int,
    session: Session = Depends(get_session),
):
    review = reviews.get_review(session, user_id, book_id)
    if not review:
        raise NotFoundException
    reviews.delete_review(session, review)
    return
