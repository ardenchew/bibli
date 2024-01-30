from sqlalchemy import func
from sqlmodel import Session, select

import src.db.schema as schema
from src.domain.utils.constants import HIDE_REVIEW_THRESHOLD


def get_review_or_none(
    session: Session,
    user_id: int,
    book_id: int,
) -> schema.reviews.Review:
    stmt = select(schema.reviews.Review).where(
        schema.reviews.Review.user_id == user_id,
        schema.reviews.Review.book_id == book_id,
    )
    return session.exec(stmt).first()


def get_comparison_reviews(
    session: Session, user_id: int, comparison: schema.reviews.Comparison
) -> schema.reviews.ComparisonReviews:
    return schema.reviews.ComparisonReviews(
        less_than=get_review_or_none(
            session,
            user_id,
            comparison.less_than_id,
        ),
        equal_to=get_review_or_none(
            session,
            user_id,
            comparison.equal_to_id,
        ),
        greater_than=get_review_or_none(
            session,
            user_id,
            comparison.greater_than_id,
        ),
    )


def validate_comparisons(  # pylint: disable=R0912
    new: schema.reviews.Review,
    reviews: schema.reviews.ComparisonReviews,
    max_rank: int = None,
):
    if reviews.equal_to and (reviews.less_than or reviews.greater_than):
        raise ValueError

    if reviews.equal_to:
        if new.reaction != reviews.equal_to.reaction:
            raise ValueError
    elif reviews.less_than and reviews.greater_than:
        if reviews.greater_than.rank - reviews.less_than.rank != 1:
            raise ValueError
        if (reviews.less_than.reaction != new.reaction) or (
            reviews.greater_than.reaction != new.reaction
        ):
            raise ValueError
    elif reviews.less_than:
        if reviews.less_than.reaction != new.reaction:
            raise ValueError
        if reviews.less_than.rank != max_rank:
            raise ValueError
    elif reviews.greater_than:
        if reviews.greater_than.reaction != new.reaction:
            raise ValueError
        if reviews.greater_than.rank != 1:
            raise ValueError
    else:
        if max_rank and max_rank != 0:
            raise ValueError


def get_max_rank(
    session: Session,
    user_id: int,
    reaction: str,
) -> int:
    stmt = select(func.max(schema.reviews.Review.rank)).where(
        schema.reviews.Review.user_id == user_id,
        schema.reviews.Review.reaction == reaction,
    )

    rank = session.exec(stmt).first()

    return rank if rank else 0


def merge_equal_to_review(
    new: schema.reviews.Review, equal_to: schema.reviews.Review
) -> schema.reviews.Review:
    new.rank = equal_to.rank
    new.rating = equal_to.rating
    new.hide_rank = equal_to.hide_rank
    return new


def sync_hide_rank(
    session: Session,
    user_id: int,
):
    total_count = session.exec(
        select(func.count(schema.reviews.Review.book_id)).where(
            schema.reviews.Review.user_id == user_id,
        ),
    ).one()

    should_hide = total_count < HIDE_REVIEW_THRESHOLD

    reviews_to_update = session.exec(
        select(schema.reviews.Review).where(
            schema.reviews.Review.user_id == user_id,
            schema.reviews.Review.hide_rank != should_hide,
        )
    ).all()

    for review in reviews_to_update:
        review.hide_rank = should_hide
        session.merge(review)


def generate_rating(
    rank: int,
    max_rank: int,
    interval: schema.reviews.Interval,
):
    return ((rank * (interval.high - interval.low)) / max_rank) + interval.low


def add_review_sync_ratings(
    session: Session,
    review: schema.reviews.Review,
):
    interval = schema.reviews.REACTION_INTERVAL[review.reaction]

    current_max_rank = get_max_rank(session, review.user_id, review.reaction)
    max_rank = current_max_rank + 1 if current_max_rank else 1

    reviews_to_update = session.exec(
        select(schema.reviews.Review).where(
            schema.reviews.Review.user_id == review.user_id,
            schema.reviews.Review.reaction == review.reaction,
        )
    ).all()

    for review_to_update in reviews_to_update:
        if review_to_update.rank >= review.rank:
            review_to_update.rank += 1

        review_to_update.rating = generate_rating(
            review_to_update.rank, max_rank, interval
        )
        session.merge(review_to_update)

    review.rating = generate_rating(review.rank, max_rank, interval)
    session.merge(review)


def delete_review_sync_ratings(
    session: Session,
    review: schema.reviews.Review,
):
    equal_ranked_reviews = session.exec(
        select(schema.reviews.Review).where(
            schema.reviews.Review.user_id == review.user_id,
            schema.reviews.Review.reaction == review.reaction,
            schema.reviews.Review.rank == review.rank,
        )
    ).all()

    if len(equal_ranked_reviews) > 1:
        session.delete(review)
        return
    if len(equal_ranked_reviews) == 0:
        raise ValueError

    interval = schema.reviews.REACTION_INTERVAL[review.reaction]

    current_max_rank = get_max_rank(session, review.user_id, review.reaction)

    # If there are no more reviews left.
    if current_max_rank == 0:
        return

    max_rank = current_max_rank - 1
    rank_threshold = review.rank

    reviews_to_update = session.exec(
        select(schema.reviews.Review).where(
            schema.reviews.Review.user_id == review.user_id,
            schema.reviews.Review.reaction == review.reaction,
        )
    ).all()

    for review_to_update in reviews_to_update:
        if review_to_update.book_id == review.book_id:
            session.delete(review)
            continue

        if review_to_update.rank > rank_threshold:
            review_to_update.rank -= 1

        review_to_update.rating = generate_rating(
            review_to_update.rank, max_rank, interval
        )
        session.merge(review_to_update)
