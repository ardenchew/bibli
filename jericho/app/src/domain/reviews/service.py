from typing import List

from sqlmodel import Session, select, update

from src.domain.reviews import constants, schemas, utils


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
        session: Session,
        reviews_filter: schemas.ReviewsFilter) -> List[schemas.Review]:
    stmt = utils.generate_query_statement(reviews_filter, True)
    return session.exec(stmt).all()


def upsert_review(
        session: Session,
        review: schemas.Review,
        comparison: schemas.Comparison,
):
    # if review has no reaction add without rank

    existing_review = session.exec(select(schemas.Review).where(
        schemas.Review.user_id == review.user_id,
        schemas.Review.book_id == review.book_id,
    )).first()

    if existing_review:
        utils.delete_review_sync_ratings(session, existing_review)

    left_review = None
    if comparison.less_than_id:
        left_review = get_review(session, review.user_id, comparison.less_than_id)

    equal_review = None
    if comparison.equal_to_id:
        equal_review = get_review(session, review.user_id, comparison.equal_to_id)

    right_review = None
    if comparison.greater_than_id:
        right_review = get_review(session, review.user_id, comparison.greater_than_id)

    max_rank = utils.get_max_rank(session, review.user_id, review.reaction)

    utils.validate_comparisons(
        review,
        max_rank=max_rank,
        left=left_review,
        equal=equal_review,
        right=right_review,
    )

    if equal_review:
        review.rank = equal_review.rank
        review.rating = equal_review.rating
        review.hidden = equal_review.hidden
        review = session.merge(review)
    else:
        review.rank = right_review.rank if right_review else max_rank + 1
        utils.add_review_sync_ratings(session, review)

    utils.sync_hidden(session, review.user_id)

    session.commit()

    return get_review(session, review.user_id, review.book_id)


def delete_review(session: Session, review: schemas.Review):
    user_id = review.user_id
    utils.delete_review_sync_ratings(session, review)
    utils.sync_hidden(session, user_id)
    session.commit()
