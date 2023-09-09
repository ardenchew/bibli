from typing import List

from sqlmodel import Session, select

from src.domain.reviews import schemas, utils


def get_review(
    session: Session,
    user_id: int,
    book_id: int,
) -> schemas.Review:
    stmt = select(schemas.Review).where(
        schemas.Review.user_id == user_id,
        schemas.Review.book_id == book_id,
    )
    return session.exec(stmt).one()


def get_reviews(
    session: Session, reviews_filter: schemas.ReviewsFilter
) -> List[schemas.Review]:
    stmt = utils.generate_query_statement(reviews_filter, True)
    return session.exec(stmt).all()


def upsert_review(
    session: Session,
    review: schemas.Review,
    comparison: schemas.Comparison,
) -> schemas.Review:
    # if review has no reaction add without rank

    existing_review = session.exec(
        select(schemas.Review).where(
            schemas.Review.user_id == review.user_id,
            schemas.Review.book_id == review.book_id,
        )
    ).first()

    if existing_review:
        utils.delete_review_sync_ratings(session, existing_review)

    comparison_reviews = utils.get_comparison_reviews(
        session, review.user_id, comparison
    )
    max_rank = utils.get_max_rank(session, review.user_id, review.reaction)

    utils.validate_comparisons(
        review,
        comparison_reviews,
        max_rank=max_rank,
    )

    if comparison_reviews.equal_to:
        review = utils.merge_equal_to_review(
            review,
            comparison_reviews.equal_to,
        )
        review = session.merge(review)
    else:
        if comparison_reviews.greater_than:
            review.rank = comparison_reviews.greater_than.rank
        else:
            review.rank = max_rank + 1
        utils.add_review_sync_ratings(session, review)

    utils.sync_hide_rank(session, review.user_id)

    session.commit()

    return get_review(session, review.user_id, review.book_id)


def delete_review(session: Session, review: schemas.Review):
    user_id = review.user_id
    utils.delete_review_sync_ratings(session, review)
    utils.sync_hide_rank(session, user_id)
    session.commit()
