from typing import List

from fastapi import APIRouter, Depends
from sqlmodel import Session

from src.database import get_session
from src.domain.reviews import service, schemas

router = APIRouter(
    tags=["reviews"],
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
        comparisons: List[schemas.Comparison],
        session: Session = Depends(get_session),
):
    db_review = schemas.Review.from_orm(review)
    return service.upsert_review(session, db_review, comparisons)
