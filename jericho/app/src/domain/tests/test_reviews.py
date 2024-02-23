from pytest import raises
from sqlalchemy import func
from sqlmodel import Session, col, select

import src.db.schema as schema
from src.domain.service import books, reviews, users
from src.domain.utils import constants, ratings


def test_reviews_get_count(session: Session):
    book = books.upsert_book(
        session,
        schema.books.Book(
            title="t",
        ),
    )

    user = users.upsert_user(session, schema.users.User(name="Arden", tag="ardenchew"))

    stmt = reviews._generate_query_statement(
        schema.reviews.ReviewsFilter(user_id=user.id),
        count=True,
    )

    count = session.exec(stmt).one()
    assert count == 0

    reviews.upsert_review(
        session,
        schema.reviews.Review(
            user_id=user.id,
            book_id=book.id,
            hidden=True,
            rating=4,
            reaction="neutral",
        ),
        comparison=schema.reviews.Comparison(),
    )

    count = session.exec(stmt).one()
    assert count == 1


def test_get_review_or_none(session: Session):
    book = books.upsert_book(
        session,
        schema.books.Book(
            title="t",
        ),
    )

    user = users.upsert_user(session, schema.users.User(name="Arden", tag="ardenchew"))

    review = ratings.get_review_or_none(session, user.id, book.id)
    assert review is None

    reviews.upsert_review(
        session,
        schema.reviews.Review(
            user_id=user.id,
            book_id=book.id,
            reaction=schema.reviews.Reaction.POSITIVE,
        ),
        comparison=schema.reviews.Comparison(),
    )

    review = ratings.get_review_or_none(session, user.id, book.id)
    assert review is not None


def test_get_comparison_reviews(session: Session):
    book = books.upsert_book(
        session,
        schema.books.Book(
            title="t",
        ),
    )

    user = users.upsert_user(session, schema.users.User(name="Arden", tag="ardenchew"))

    comparison_reviews = ratings.get_comparison_reviews(
        session,
        user.id,
        schema.reviews.Comparison(
            less_than_id=book.id,
            equal_to_id=book.id,
            greater_than_id=book.id,
        ),
    )
    assert comparison_reviews.less_than is None
    assert comparison_reviews.equal_to is None
    assert comparison_reviews.greater_than is None

    reviews.upsert_review(
        session,
        schema.reviews.Review(
            user_id=user.id,
            book_id=book.id,
            reaction=schema.reviews.Reaction.POSITIVE,
        ),
        comparison=schema.reviews.Comparison(),
    )

    comparison_reviews = ratings.get_comparison_reviews(
        session,
        user.id,
        schema.reviews.Comparison(
            less_than_id=book.id,
            equal_to_id=book.id,
            greater_than_id=book.id,
        ),
    )
    assert comparison_reviews.less_than is not None
    assert comparison_reviews.equal_to is not None
    assert comparison_reviews.greater_than is not None


def test_validate_comparisons():
    user_id = 1

    base_new_review = schema.reviews.Review(
        user_id=user_id,
        book_id=1,
        reaction=schema.reviews.Reaction.POSITIVE,
    )

    test_cases = [
        {
            "new": base_new_review,
            "reviews": schema.reviews.ComparisonReviews(),
            "max_rank": 0,
            "error": False,
        },
        {
            "new": base_new_review,
            "reviews": schema.reviews.ComparisonReviews(
                less_than=schema.reviews.Review(
                    user_id=user_id,
                    book_id=2,
                    rank=1,
                    reaction=schema.reviews.Reaction.POSITIVE,
                ),
                equal_to=schema.reviews.Review(
                    user_id=user_id,
                    book_id=3,
                    rank=2,
                    reaction=schema.reviews.Reaction.POSITIVE,
                ),
                greater_than=schema.reviews.Review(
                    user_id=user_id,
                    book_id=4,
                    rank=3,
                    reaction=schema.reviews.Reaction.POSITIVE,
                ),
            ),
            "max_rank": 3,
            "error": True,
        },
        {
            "new": base_new_review,
            "reviews": schema.reviews.ComparisonReviews(
                equal_to=schema.reviews.Review(
                    user_id=user_id,
                    book_id=2,
                    rank=1,
                    reaction=schema.reviews.Reaction.NEGATIVE,
                ),
            ),
            "max_rank": 1,
            "error": True,
        },
        {
            "new": base_new_review,
            "reviews": schema.reviews.ComparisonReviews(
                less_than=schema.reviews.Review(
                    user_id=user_id,
                    book_id=2,
                    rank=1,
                    reaction=schema.reviews.Reaction.POSITIVE,
                ),
                greater_than=schema.reviews.Review(
                    user_id=user_id,
                    book_id=4,
                    rank=3,
                    reaction=schema.reviews.Reaction.POSITIVE,
                ),
            ),
            "max_rank": 3,
            "error": True,
        },
        {
            "new": base_new_review,
            "reviews": schema.reviews.ComparisonReviews(
                less_than=schema.reviews.Review(
                    user_id=user_id,
                    book_id=2,
                    rank=3,
                    reaction=schema.reviews.Reaction.POSITIVE,
                ),
            ),
            "max_rank": 4,
            "error": True,
        },
        {
            "new": base_new_review,
            "reviews": schema.reviews.ComparisonReviews(
                greater_than=schema.reviews.Review(
                    user_id=user_id,
                    book_id=2,
                    rank=2,
                    reaction=schema.reviews.Reaction.POSITIVE,
                ),
            ),
            "max_rank": 1,
            "error": True,
        },
    ]

    for test_case in test_cases:
        if test_case["error"]:
            with raises(ValueError):
                reviews.utils.validate_comparisons(
                    test_case["new"],
                    test_case["reviews"],
                    max_rank=test_case["max_rank"],
                )
        else:
            reviews.utils.validate_comparisons(
                test_case["new"],
                test_case["reviews"],
                max_rank=test_case["max_rank"],
            )


def test_get_max_rank(session: Session):
    book = books.upsert_book(
        session,
        schema.books.Book(
            title="t",
        ),
    )

    user = users.upsert_user(session, schema.users.User(name="Arden", tag="ardenchew"))

    max_rank = ratings.get_max_rank(
        session,
        user.id,
        schema.reviews.Reaction.POSITIVE,
    )

    assert max_rank == 0

    review = reviews.upsert_review(
        session,
        schema.reviews.Review(
            user_id=user.id,
            book_id=book.id,
            reaction=schema.reviews.Reaction.POSITIVE,
        ),
        comparison=schema.reviews.Comparison(),
    )

    max_rank = ratings.get_max_rank(
        session,
        user.id,
        schema.reviews.Reaction.NEGATIVE,
    )

    assert max_rank == 0

    max_rank = ratings.get_max_rank(
        session,
        user.id,
        review.reaction,
    )

    assert max_rank == 1


def test_sync_hide_rank(session: Session):
    user = users.upsert_user(session, schema.users.User(name="Arden", tag="ardenchew"))

    for i in range(constants.HIDE_REVIEW_THRESHOLD):
        books.upsert_book(session, schema.books.Book(title=str(i)))

    for i in range(constants.HIDE_REVIEW_THRESHOLD - 1):
        if i == 0:
            review = reviews.upsert_review(
                session,
                schema.reviews.Review(
                    user_id=user.id,
                    book_id=i + 1,
                    reaction=schema.reviews.Reaction.POSITIVE,
                ),
                schema.reviews.Comparison(),
            )
        else:
            review = reviews.upsert_review(
                session,
                schema.reviews.Review(
                    user_id=user.id,
                    book_id=i + 1,
                    reaction=schema.reviews.Reaction.POSITIVE,
                ),
                schema.reviews.Comparison(
                    less_than_id=review.book_id,
                ),
            )

        books.upsert_book(session, schema.books.Book(title=str(i)))

    num_hidden = session.exec(
        select(func.count(schema.reviews.Review.book_id)).where(
            schema.reviews.Review.user_id == user.id,
            schema.reviews.Review.hide_rank,
        ),
    ).one()

    assert num_hidden == constants.HIDE_REVIEW_THRESHOLD - 1

    review = reviews.upsert_review(
        session,
        schema.reviews.Review(
            user_id=user.id,
            book_id=constants.HIDE_REVIEW_THRESHOLD,
            reaction=schema.reviews.Reaction.POSITIVE,
        ),
        schema.reviews.Comparison(
            less_than_id=review.book_id,
        ),
    )

    num_hidden = session.exec(
        select(func.count(schema.reviews.Review.book_id)).where(
            schema.reviews.Review.user_id == user.id,
            schema.reviews.Review.hide_rank,
        ),
    ).one()

    assert num_hidden == 0

    reviews.delete_review(
        session,
        review,
    )

    num_hidden = session.exec(
        select(func.count(schema.reviews.Review.book_id)).where(
            schema.reviews.Review.user_id == user.id,
            schema.reviews.Review.hide_rank,
        ),
    ).one()

    assert num_hidden == constants.HIDE_REVIEW_THRESHOLD - 1


def test_add_review_sync_ratings(session: Session):
    user = users.upsert_user(session, schema.users.User(name="Arden", tag="ardenchew"))

    book = books.upsert_book(
        session,
        schema.books.Book(
            title="t",
        ),
    )

    # Add first one.
    ratings.add_review_sync_ratings(
        session,
        schema.reviews.Review(
            user_id=user.id,
            book_id=book.id,
            rank=1,
            reaction=schema.reviews.Reaction.NEUTRAL,
        ),
    )

    synced_reviews = session.exec(
        select(schema.reviews.Review)
        .where(
            schema.reviews.Review.user_id == user.id,
            schema.reviews.Review.reaction == schema.reviews.Reaction.NEUTRAL,
        )
        .order_by(col(schema.reviews.Review.rating).desc())
    ).all()

    neutral_high = schema.reviews.REACTION_INTERVAL[
        schema.reviews.Reaction.NEUTRAL
    ].high

    assert len(synced_reviews) == 1
    assert synced_reviews[0].reaction == schema.reviews.Reaction.NEUTRAL
    assert synced_reviews[0].rank == 1
    assert synced_reviews[0].rating == neutral_high

    # Add one above.
    book = books.upsert_book(
        session,
        schema.books.Book(
            title="t",
        ),
    )

    ratings.add_review_sync_ratings(
        session,
        schema.reviews.Review(
            user_id=user.id,
            book_id=book.id,
            rank=2,
            reaction=schema.reviews.Reaction.NEUTRAL,
        ),
    )

    synced_reviews = session.exec(
        select(schema.reviews.Review)
        .where(
            schema.reviews.Review.user_id == user.id,
            schema.reviews.Review.reaction == schema.reviews.Reaction.NEUTRAL,
        )
        .order_by(col(schema.reviews.Review.rating).desc())
    ).all()

    assert len(synced_reviews) == 2
    assert synced_reviews[0].book_id == book.id
    assert synced_reviews[0].reaction == schema.reviews.Reaction.NEUTRAL
    assert synced_reviews[0].rank == 2
    assert synced_reviews[0].rating == neutral_high
    assert synced_reviews[1].book_id != book.id
    assert synced_reviews[1].reaction == schema.reviews.Reaction.NEUTRAL
    assert synced_reviews[1].rank == 1
    assert synced_reviews[1].rating != neutral_high

    # Add one in between.
    book = books.upsert_book(
        session,
        schema.books.Book(
            title="t",
        ),
    )

    ratings.add_review_sync_ratings(
        session,
        schema.reviews.Review(
            user_id=user.id,
            book_id=book.id,
            rank=2,
            reaction=schema.reviews.Reaction.NEUTRAL,
        ),
    )

    synced_reviews = session.exec(
        select(schema.reviews.Review)
        .where(
            schema.reviews.Review.user_id == user.id,
            schema.reviews.Review.reaction == schema.reviews.Reaction.NEUTRAL,
        )
        .order_by(col(schema.reviews.Review.rating).desc())
    ).all()

    assert len(synced_reviews) == 3
    assert synced_reviews[0].book_id != book.id
    assert synced_reviews[0].reaction == schema.reviews.Reaction.NEUTRAL
    assert synced_reviews[0].rank == 3
    assert synced_reviews[0].rating == neutral_high
    assert synced_reviews[1].book_id == book.id
    assert synced_reviews[1].reaction == schema.reviews.Reaction.NEUTRAL
    assert synced_reviews[1].rank == 2
    assert synced_reviews[1].rating < synced_reviews[0].rating
    assert synced_reviews[2].book_id != book.id
    assert synced_reviews[2].reaction == schema.reviews.Reaction.NEUTRAL
    assert synced_reviews[2].rank == 1
    assert synced_reviews[2].rating < synced_reviews[1].rating


def test_delete_review_sync_ratings(session: Session):
    user = users.upsert_user(session, schema.users.User(name="Arden", tag="ardenchew"))

    book1 = books.upsert_book(
        session,
        schema.books.Book(
            title="t",
        ),
    )

    # Add first review.
    ratings.add_review_sync_ratings(
        session,
        schema.reviews.Review(
            user_id=user.id,
            book_id=book1.id,
            rank=1,
            reaction=schema.reviews.Reaction.NEGATIVE,
        ),
    )

    book2 = books.upsert_book(
        session,
        schema.books.Book(
            title="i",
        ),
    )

    # Add second review.
    ratings.add_review_sync_ratings(
        session,
        schema.reviews.Review(
            user_id=user.id,
            book_id=book2.id,
            rank=1,
            reaction=schema.reviews.Reaction.NEGATIVE,
        ),
    )

    review = ratings.get_review_or_none(session, user.id, book2.id)

    ratings.delete_review_sync_ratings(
        session,
        review,
    )

    negative_high = schema.reviews.REACTION_INTERVAL[
        schema.reviews.Reaction.NEGATIVE
    ].high

    synced_reviews = session.exec(
        select(schema.reviews.Review)
        .where(
            schema.reviews.Review.user_id == user.id,
            schema.reviews.Review.reaction == schema.reviews.Reaction.NEGATIVE,
        )
        .order_by(col(schema.reviews.Review.rating).desc())
    ).all()

    assert len(synced_reviews) == 1
    assert synced_reviews[0].book_id == book1.id
    assert synced_reviews[0].reaction == schema.reviews.Reaction.NEGATIVE
    assert synced_reviews[0].rank == 1
    assert synced_reviews[0].rating == negative_high

    review = ratings.get_review_or_none(session, user.id, book1.id)

    ratings.delete_review_sync_ratings(session, review)

    synced_reviews = session.exec(
        select(schema.reviews.Review)
        .where(
            schema.reviews.Review.user_id == user.id,
            schema.reviews.Review.reaction == schema.reviews.Reaction.NEGATIVE,
        )
        .order_by(col(schema.reviews.Review.rating).desc())
    ).all()

    assert len(synced_reviews) == 0
