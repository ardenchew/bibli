from typing import Optional

from sqlalchemy import func, update
from sqlmodel import Session, col, select, update

from src.domain.reviews import constants, schemas


def generate_query_statement(
        reviews_filter: schemas.ReviewsFilter,
        order_by: bool = False,
        limit: int = None,
        count: bool = False,
):
    stmt = select(schemas.Review) if not count else select(func.count(schemas.Review.book_id))
    if reviews_filter.user_id is not None:
        stmt = stmt.where(schemas.Review.user_id == reviews_filter.user_id)
    if reviews_filter.book_id is not None:
        stmt = stmt.where(schemas.Review.book_id == reviews_filter.book_id)
    if order_by:
        stmt = stmt.order_by(col(schemas.Review.rating).desc())
    if limit:
        stmt = stmt.limit(limit)
    return stmt


def validate_comparisons(
        new: schemas.Review,
        max_rank: int = None,
        left: schemas.Review = None,
        equal: schemas.Review = None,
        right: schemas.Review = None,
):
    if equal and (left or right):
        raise ValueError

    if equal:
        if new.reaction != equal.reaction:
            raise ValueError
    elif left and right:
        if right.rank - left.rank != 1:
            raise ValueError
        if (left.reaction != new.reaction) or (right.reaction != new.reaction):
            raise ValueError
    elif left:
        if left.reaction != new.reaction:
            raise ValueError
        if left.rank != max_rank:
            raise ValueError
    elif right:
        if right.reaction != new.reaction:
            raise ValueError
        if right.rank != 1:
            raise ValueError
    else:
        if max_rank and max_rank != 0:
            raise ValueError


def get_max_rank(
        session: Session,
        user_id: int,
        reaction: str,
) -> int:
    stmt = select(func.max(schemas.Review.rank)).where(
        schemas.Review.user_id == user_id,
        schemas.Review.reaction == reaction,
    )

    rank = session.exec(stmt).first()

    return rank if rank else 0


def sync_hidden(
        session: Session,
        user_id: int,
):
    total_count = session.exec(
        select(func.count(schemas.Review.book_id)).where(
            schemas.Review.user_id == user_id,
        ),
    ).one()

    should_hide = total_count < constants.HIDE_REVIEW_THRESHOLD

    reviews_to_update = session.exec(select(schemas.Review).where(
        schemas.Review.user_id == user_id,
        schemas.Review.hidden != should_hide,
    )).all()

    for review in reviews_to_update:
        review.hidden = should_hide
        session.merge(review)


def generate_rating(
        rank: int,
        max_rank: int,
        interval: schemas.Interval,
):
    return ((rank * (interval.high - interval.low)) / max_rank) + interval.low


def add_review_sync_ratings(
        session: Session,
        review: schemas.Review,
):
    interval = schemas.REACTION_INTERVAL[review.reaction]

    current_max_rank = get_max_rank(session, review.user_id, review.reaction)
    max_rank = current_max_rank + 1 if current_max_rank else 1

    reviews_to_update = session.exec(select(schemas.Review).where(
        schemas.Review.user_id == review.user_id,
        schemas.Review.reaction == review.reaction,
    )).all()

    for review_to_update in reviews_to_update:
        if review_to_update.rank >= review.rank:
            review_to_update.rank += 1

        review_to_update.rating = generate_rating(review_to_update.rank, max_rank, interval)
        session.merge(review_to_update)

    review.rating = generate_rating(review.rank, max_rank, interval)
    session.merge(review)


def delete_review_sync_ratings(
        session: Session,
        review: schemas.Review,
):
    equal_ranked_reviews = session.exec(select(schemas.Review).where(
        schemas.Review.user_id == review.user_id,
        schemas.Review.reaction == review.reaction,
        schemas.Review.rank == review.rank,
    )).all()

    if len(equal_ranked_reviews) > 1:
        session.delete(review)
        return
    elif len(equal_ranked_reviews) == 0:
        raise ValueError

    interval = schemas.REACTION_INTERVAL[review.reaction]

    current_max_rank = get_max_rank(session, review.user_id, review.reaction)

    # If there are no more reviews left.
    if current_max_rank == 0:
        return

    max_rank = current_max_rank - 1
    rank_threshold = review.rank

    reviews_to_update = session.exec(select(schemas.Review).where(
        schemas.Review.user_id == review.user_id,
        schemas.Review.reaction == review.reaction,
    )).all()

    for review_to_update in reviews_to_update:
        if review_to_update.book_id == review.book_id:
            session.delete(review)
            continue

        if review_to_update.rank > rank_threshold:
            review_to_update.rank -= 1

        review_to_update.rating = generate_rating(review_to_update.rank, max_rank, interval)
        session.merge(review_to_update)
