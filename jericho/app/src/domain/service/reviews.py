from typing import List

from sqlalchemy import func
from sqlmodel import Session, col, select, delete

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

    _update_collections_from_review_insertion(session, review.user_id, review.book_id)

    session.commit()

    return get_review(session, review.user_id, review.book_id)


def delete_review(session: Session, review: schema.reviews.Review):
    user_id = review.user_id
    ratings.delete_review_sync_ratings(session, review)
    ratings.sync_hide_rank(session, user_id)
    session.commit()


# """
# DELETE FROM collectionbooklink
# USING collection, collectionuserlink
# WHERE collectionbooklink.collection_id = collection.id
# AND collection.type in ('saved', 'active')
# AND collectionbooklink.collection_id = collectionuserlink.collection_id
# AND collectionuserlink.user_id = 1
# AND collectionuserlink.type = 'owner'
# AND collectionbooklink.book_id = 763;
#
# SELECT collectionbooklink.collection_id, collectionbooklink.book_id
# FROM collectionbooklink
# JOIN collection ON collection.type IN ('saved', 'active')
# JOIN collectionuserlink ON collectionuserlink.user_id = 1
# WHERE collectionbooklink.book_id = 680;
# 2024-03-19 18:02:14,391 INFO sqlalchemy.engine.Engine [generated in 0.00173s] {'user_id_1': 1, 'book_id_1': 680, 'type_1_1': <CollectionType.SAVED: 'saved'>, 'type_1_2': <CollectionType.ACTIVE: 'active'>}
# """

def _update_collections_from_review_insertion(
        session: Session,  # does not commit
        user_id: int,
        book_id: int,
):
    """
    DELETE FROM collectionbooklink
        USING collection, collectionuserlink
    WHERE collectionbooklink.collection_id = collection.id
        AND collection.type in ('saved', 'active')
        AND collectionbooklink.collection_id = collectionuserlink.collection_id
        AND collectionuserlink.user_id = <user_id>
        AND collectionuserlink.type = 'owner'
        AND collectionbooklink.book_id = <book_id>;
    """
    session.query(schema.collections.CollectionBookLink). \
        filter(schema.collections.CollectionBookLink.collection_id == schema.collections.Collection.id). \
        filter(col(schema.collections.Collection.type).in_(['saved', 'active'])). \
        filter(schema.collections.CollectionBookLink.collection_id == schema.collections.CollectionUserLink.collection_id). \
        filter(schema.collections.CollectionUserLink.user_id == user_id). \
        filter(schema.collections.CollectionUserLink.type == 'owner'). \
        filter(schema.collections.CollectionBookLink.book_id == book_id). \
        delete(synchronize_session=False)

    complete_query_stmt = select(schema.collections.Collection).join(
        schema.collections.CollectionUserLink,
        (schema.collections.CollectionUserLink.collection_id == schema.collections.Collection.id)
    ).where(
        schema.collections.Collection.type == schema.collections.CollectionType.COMPLETE,
        schema.collections.CollectionUserLink.user_id == user_id,
        schema.collections.CollectionUserLink.type == schema.collections.CollectionUserLinkType.OWNER,
        )
    complete_collection = session.exec(complete_query_stmt).one()

    link = schema.collections.CollectionBookLink(
        collection_id=complete_collection.id,
        book_id=book_id,
    )
    session.merge(link)
