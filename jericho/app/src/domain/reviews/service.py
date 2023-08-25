from typing import List

from sqlmodel import Session, select

from src.domain.reviews import schemas


def get_reviews(
        session: Session,
        reviews_filter: schemas.ReviewsFilter) -> List[schemas.Review]:
    stmt = select(schemas.Review)
    if reviews_filter.user_id is not None:
        stmt = stmt.where(schemas.Review.user_id == reviews_filter.user_id)
    if reviews_filter.book_id is not None:
        stmt = stmt.where(schemas.Review.book_id == reviews_filter.book_id)
    return session.exec(stmt).all()


def upsert_review(
        session: Session,
        review: schemas.Review,
        comparisons: List[schemas.Comparison],
):
    review = session.merge(review)
    session.commit()
    session.refresh(review)
    return review
