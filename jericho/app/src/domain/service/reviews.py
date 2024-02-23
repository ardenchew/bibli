from typing import List

from sqlalchemy import func
from sqlmodel import Session, col, select

import src.db.schema as schema
from src.domain.utils import ratings


def _generate_query_statement(
    reviews_filter: schema.reviews.ReviewsFilter,
    order_by: bool = False,
    limit: int = None,
    count: bool = False,
):
    stmt = (
        select(schema.reviews.Review)
        if not count
        else select(func.count(schema.reviews.Review.book_id))
    )
    if reviews_filter.user_id is not None:
        stmt = stmt.where(schema.reviews.Review.user_id == reviews_filter.user_id)
    if reviews_filter.book_id is not None:
        stmt = stmt.where(schema.reviews.Review.book_id == reviews_filter.book_id)
    if order_by:
        stmt = stmt.order_by(col(schema.reviews.Review.rating).desc())
    if limit:
        stmt = stmt.limit(limit)
    return stmt


def get_review(
    session: Session,
    user_id: int,
    book_id: int,
) -> schema.reviews.Review:
    stmt = select(schema.reviews.Review).where(
        schema.reviews.Review.user_id == user_id,
        schema.reviews.Review.book_id == book_id,
    )
    return session.exec(stmt).one()


def get_reviews(
    session: Session, reviews_filter: schema.reviews.ReviewsFilter
) -> List[schema.reviews.Review]:
    stmt = _generate_query_statement(reviews_filter, True)
    return session.exec(stmt).all()


def upsert_review(
    session: Session,
    review: schema.reviews.Review,
    comparison: schema.reviews.Comparison,
) -> schema.reviews.Review:
    # if review has no reaction add without rank

    existing_review = session.exec(
        select(schema.reviews.Review).where(
            schema.reviews.Review.user_id == review.user_id,
            schema.reviews.Review.book_id == review.book_id,
        )
    ).first()

    if existing_review:
        ratings.delete_review_sync_ratings(session, existing_review)

    comparison_reviews = ratings.get_comparison_reviews(
        session, review.user_id, comparison
    )
    max_rank = ratings.get_max_rank(session, review.user_id, review.reaction)

    ratings.validate_comparisons(
        review,
        comparison_reviews,
        max_rank=max_rank,
    )

    if comparison_reviews.equal_to:
        review = ratings.merge_equal_to_review(
            review,
            comparison_reviews.equal_to,
        )
        review = session.merge(review)
    else:
        if comparison_reviews.greater_than:
            review.rank = comparison_reviews.greater_than.rank
        else:
            review.rank = max_rank + 1
        ratings.add_review_sync_ratings(session, review)

    ratings.sync_hide_rank(session, review.user_id)

    session.commit()

    return get_review(session, review.user_id, review.book_id)


def delete_review(session: Session, review: schema.reviews.Review):
    user_id = review.user_id
    ratings.delete_review_sync_ratings(session, review)
    ratings.sync_hide_rank(session, user_id)
    session.commit()
