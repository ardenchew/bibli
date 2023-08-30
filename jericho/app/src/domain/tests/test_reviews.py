from pytest import raises
from sqlalchemy import func
from sqlmodel import Session, col, select

from src.domain import books, reviews, users


def test_reviews_get_count(session: Session):
    book = books.service.upsert_book(
        session,
        books.schemas.Book(
            title="t",
        )
    )

    user = users.service.upsert_user(
        session,
        users.schemas.User(
            name="Arden",
            tag="ardenchew"
        )
    )

    stmt = reviews.utils.generate_query_statement(
        reviews.schemas.ReviewsFilter(user_id=user.id),
        count=True,
    )

    count = session.exec(stmt).one()
    assert count == 0

    reviews.service.upsert_review(
        session,
        reviews.schemas.Review(
            user_id=user.id,
            book_id=book.id,
            hidden=True,
            rating=4,
            reaction='neutral',
        ),
        comparison=reviews.schemas.Comparison(),
    )

    count = session.exec(stmt).one()
    assert count == 1


def test_get_review_or_none(session: Session):
    book = books.service.upsert_book(
        session,
        books.schemas.Book(
            title="t",
        )
    )

    user = users.service.upsert_user(
        session,
        users.schemas.User(
            name="Arden",
            tag="ardenchew"
        )
    )

    review = reviews.utils.get_review_or_none(session, user.id, book.id)
    assert review is None

    reviews.service.upsert_review(
        session,
        reviews.schemas.Review(
            user_id=user.id,
            book_id=book.id,
            reaction=reviews.schemas.Reaction.POSITIVE,
        ),
        comparison=reviews.schemas.Comparison(),
    )

    review = reviews.utils.get_review_or_none(session, user.id, book.id)
    assert review is not None


def test_get_comparison_reviews(session: Session):
    book = books.service.upsert_book(
        session,
        books.schemas.Book(
            title="t",
        )
    )

    user = users.service.upsert_user(
        session,
        users.schemas.User(
            name="Arden",
            tag="ardenchew"
        )
    )

    comparison_reviews = reviews.utils.get_comparison_reviews(
        session,
        user.id,
        reviews.schemas.Comparison(
            less_than_id=book.id,
            equal_to_id=book.id,
            greater_than_id=book.id,
        ),
    )
    assert comparison_reviews.less_than is None
    assert comparison_reviews.equal_to is None
    assert comparison_reviews.greater_than is None

    reviews.service.upsert_review(
        session,
        reviews.schemas.Review(
            user_id=user.id,
            book_id=book.id,
            reaction=reviews.schemas.Reaction.POSITIVE,
        ),
        comparison=reviews.schemas.Comparison(),
    )

    comparison_reviews = reviews.utils.get_comparison_reviews(
        session,
        user.id,
        reviews.schemas.Comparison(
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

    base_new_review = reviews.schemas.Review(
        user_id=user_id,
        book_id=1,
        reaction=reviews.schemas.Reaction.POSITIVE,
    )

    test_cases = [
        {
            'new': base_new_review,
            'reviews': reviews.schemas.ComparisonReviews(),
            'max_rank': 0,
            'error': False,
        },
        {
            'new': base_new_review,
            'reviews': reviews.schemas.ComparisonReviews(
                less_than=reviews.schemas.Review(
                    user_id=user_id,
                    book_id=2,
                    rank=1,
                    reaction=reviews.schemas.Reaction.POSITIVE,
                ),
                equal_to=reviews.schemas.Review(
                    user_id=user_id,
                    book_id=3,
                    rank=2,
                    reaction=reviews.schemas.Reaction.POSITIVE,
                ),
                greater_than=reviews.schemas.Review(
                    user_id=user_id,
                    book_id=4,
                    rank=3,
                    reaction=reviews.schemas.Reaction.POSITIVE,
                ),
            ),
            'max_rank': 3,
            'error': True,
        },
        {
            'new': base_new_review,
            'reviews': reviews.schemas.ComparisonReviews(
                equal_to=reviews.schemas.Review(
                    user_id=user_id,
                    book_id=2,
                    rank=1,
                    reaction=reviews.schemas.Reaction.NEGATIVE,
                ),
            ),
            'max_rank': 1,
            'error': True,
        },
        {
            'new': base_new_review,
            'reviews': reviews.schemas.ComparisonReviews(
                less_than=reviews.schemas.Review(
                    user_id=user_id,
                    book_id=2,
                    rank=1,
                    reaction=reviews.schemas.Reaction.POSITIVE,
                ),
                greater_than=reviews.schemas.Review(
                    user_id=user_id,
                    book_id=4,
                    rank=3,
                    reaction=reviews.schemas.Reaction.POSITIVE,
                ),
            ),
            'max_rank': 3,
            'error': True,
        },
        {
            'new': base_new_review,
            'reviews': reviews.schemas.ComparisonReviews(
                less_than=reviews.schemas.Review(
                    user_id=user_id,
                    book_id=2,
                    rank=3,
                    reaction=reviews.schemas.Reaction.POSITIVE,
                ),
            ),
            'max_rank': 4,
            'error': True,
        },
        {
            'new': base_new_review,
            'reviews': reviews.schemas.ComparisonReviews(
                greater_than=reviews.schemas.Review(
                    user_id=user_id,
                    book_id=2,
                    rank=2,
                    reaction=reviews.schemas.Reaction.POSITIVE,
                ),
            ),
            'max_rank': 1,
            'error': True,
        },
    ]

    for test_case in test_cases:
        if test_case['error']:
            with raises(ValueError):
                reviews.utils.validate_comparisons(
                    test_case['new'],
                    test_case['reviews'],
                    max_rank=test_case['max_rank'],
                )
        else:
            reviews.utils.validate_comparisons(
                test_case['new'],
                test_case['reviews'],
                max_rank=test_case['max_rank'],
            )


def test_get_max_rank(session: Session):
    book = books.service.upsert_book(
        session,
        books.schemas.Book(
            title="t",
        )
    )

    user = users.service.upsert_user(
        session,
        users.schemas.User(
            name="Arden",
            tag="ardenchew"
        )
    )

    max_rank = reviews.utils.get_max_rank(
        session,
        user.id,
        reviews.utils.schemas.Reaction.POSITIVE,
    )

    assert max_rank == 0

    review = reviews.service.upsert_review(
        session,
        reviews.schemas.Review(
            user_id=user.id,
            book_id=book.id,
            reaction=reviews.schemas.Reaction.POSITIVE,
        ),
        comparison=reviews.schemas.Comparison(),
    )

    max_rank = reviews.utils.get_max_rank(
        session,
        user.id,
        reviews.utils.schemas.Reaction.NEGATIVE,
    )

    assert max_rank == 0

    max_rank = reviews.utils.get_max_rank(
        session,
        user.id,
        review.reaction,
    )

    assert max_rank == 1


def test_sync_hide_rank(session: Session):
    user = users.service.upsert_user(
        session,
        users.schemas.User(
            name="Arden",
            tag="ardenchew"
        )
    )

    for i in range(reviews.constants.HIDE_REVIEW_THRESHOLD):
        books.service.upsert_book(
            session,
            books.schemas.Book(
                title=str(i)
            )
        )

    for i in range(reviews.constants.HIDE_REVIEW_THRESHOLD - 1):
        if i == 0:
            review = reviews.service.upsert_review(
                session,
                reviews.schemas.Review(
                    user_id=user.id,
                    book_id=i+1,
                    reaction=reviews.schemas.Reaction.POSITIVE,
                ),
                reviews.schemas.Comparison(),
            )
        else:
            review = reviews.service.upsert_review(
                session,
                reviews.schemas.Review(
                    user_id=user.id,
                    book_id=i+1,
                    reaction=reviews.schemas.Reaction.POSITIVE,
                ),
                reviews.schemas.Comparison(
                    less_than_id=review.book_id,
                ),
            )

        books.service.upsert_book(
            session,
            books.schemas.Book(
                title=str(i)
            )
        )

    num_hidden = session.exec(
        select(func.count(reviews.schemas.Review.book_id)).where(
            reviews.schemas.Review.user_id == user.id,
            reviews.schemas.Review.hide_rank,
            ),
    ).one()

    assert num_hidden == reviews.constants.HIDE_REVIEW_THRESHOLD - 1

    review = reviews.service.upsert_review(
        session,
        reviews.schemas.Review(
            user_id=user.id,
            book_id=reviews.constants.HIDE_REVIEW_THRESHOLD,
            reaction=reviews.schemas.Reaction.POSITIVE,
        ),
        reviews.schemas.Comparison(
            less_than_id=review.book_id,
        ),
    )

    num_hidden = session.exec(
        select(func.count(reviews.schemas.Review.book_id)).where(
            reviews.schemas.Review.user_id == user.id,
            reviews.schemas.Review.hide_rank,
            ),
    ).one()

    assert num_hidden == 0

    reviews.service.delete_review(
        session,
        review,
    )

    num_hidden = session.exec(
        select(func.count(reviews.schemas.Review.book_id)).where(
            reviews.schemas.Review.user_id == user.id,
            reviews.schemas.Review.hide_rank,
            ),
    ).one()

    assert num_hidden == reviews.constants.HIDE_REVIEW_THRESHOLD - 1


def test_add_review_sync_ratings(session: Session):
    user = users.service.upsert_user(
        session,
        users.schemas.User(
            name="Arden",
            tag="ardenchew"
        )
    )

    book = books.service.upsert_book(
        session,
        books.schemas.Book(
            title="t",
        )
    )

    # Add first one.
    reviews.utils.add_review_sync_ratings(
        session,
        reviews.schemas.Review(
            user_id=user.id,
            book_id=book.id,
            rank=1,
            reaction=reviews.schemas.Reaction.NEUTRAL,
        )
    )

    synced_reviews = session.exec(
        select(reviews.schemas.Review).where(
            reviews.schemas.Review.user_id == user.id,
            reviews.schemas.Review.reaction == reviews.schemas.Reaction.NEUTRAL,
            ).order_by(
            col(reviews.schemas.Review.rating).desc()
        )
    ).all()

    neutral_high = reviews.schemas.REACTION_INTERVAL[reviews.schemas.Reaction.NEUTRAL].high

    assert len(synced_reviews) == 1
    assert synced_reviews[0].reaction == reviews.schemas.Reaction.NEUTRAL
    assert synced_reviews[0].rank == 1
    assert synced_reviews[0].rating == neutral_high

    # Add one above.
    book = books.service.upsert_book(
        session,
        books.schemas.Book(
            title="t",
        )
    )

    reviews.utils.add_review_sync_ratings(
        session,
        reviews.schemas.Review(
            user_id=user.id,
            book_id=book.id,
            rank=2,
            reaction=reviews.schemas.Reaction.NEUTRAL,
        )
    )

    synced_reviews = session.exec(
        select(reviews.schemas.Review).where(
            reviews.schemas.Review.user_id == user.id,
            reviews.schemas.Review.reaction == reviews.schemas.Reaction.NEUTRAL,
            ).order_by(
            col(reviews.schemas.Review.rating).desc()
        )
    ).all()

    assert len(synced_reviews) == 2
    assert synced_reviews[0].book_id == book.id
    assert synced_reviews[0].reaction == reviews.schemas.Reaction.NEUTRAL
    assert synced_reviews[0].rank == 2
    assert synced_reviews[0].rating == neutral_high
    assert synced_reviews[1].book_id != book.id
    assert synced_reviews[1].reaction == reviews.schemas.Reaction.NEUTRAL
    assert synced_reviews[1].rank == 1
    assert synced_reviews[1].rating != neutral_high

    # Add one in between.
    book = books.service.upsert_book(
        session,
        books.schemas.Book(
            title="t",
        )
    )

    reviews.utils.add_review_sync_ratings(
        session,
        reviews.schemas.Review(
            user_id=user.id,
            book_id=book.id,
            rank=2,
            reaction=reviews.schemas.Reaction.NEUTRAL,
        )
    )

    synced_reviews = session.exec(
        select(reviews.schemas.Review).where(
            reviews.schemas.Review.user_id == user.id,
            reviews.schemas.Review.reaction == reviews.schemas.Reaction.NEUTRAL,
            ).order_by(
            col(reviews.schemas.Review.rating).desc()
        )
    ).all()

    assert len(synced_reviews) == 3
    assert synced_reviews[0].book_id != book.id
    assert synced_reviews[0].reaction == reviews.schemas.Reaction.NEUTRAL
    assert synced_reviews[0].rank == 3
    assert synced_reviews[0].rating == neutral_high
    assert synced_reviews[1].book_id == book.id
    assert synced_reviews[1].reaction == reviews.schemas.Reaction.NEUTRAL
    assert synced_reviews[1].rank == 2
    assert synced_reviews[1].rating < synced_reviews[0].rating
    assert synced_reviews[2].book_id != book.id
    assert synced_reviews[2].reaction == reviews.schemas.Reaction.NEUTRAL
    assert synced_reviews[2].rank == 1
    assert synced_reviews[2].rating < synced_reviews[1].rating


def test_delete_review_sync_ratings(session: Session):
    user = users.service.upsert_user(
        session,
        users.schemas.User(
            name="Arden",
            tag="ardenchew"
        )
    )

    book1 = books.service.upsert_book(
        session,
        books.schemas.Book(
            title="t",
        )
    )

    # Add first review.
    reviews.utils.add_review_sync_ratings(
        session,
        reviews.schemas.Review(
            user_id=user.id,
            book_id=book1.id,
            rank=1,
            reaction=reviews.schemas.Reaction.NEGATIVE,
        )
    )

    book2 = books.service.upsert_book(
        session,
        books.schemas.Book(
            title="i",
        )
    )

    # Add second review.
    reviews.utils.add_review_sync_ratings(
        session,
        reviews.schemas.Review(
            user_id=user.id,
            book_id=book2.id,
            rank=1,
            reaction=reviews.schemas.Reaction.NEGATIVE,
        )
    )

    review = reviews.utils.get_review_or_none(session, user.id, book2.id)

    reviews.utils.delete_review_sync_ratings(
        session,
        review,
    )

    negative_high = reviews.schemas.REACTION_INTERVAL[reviews.schemas.Reaction.NEGATIVE].high

    synced_reviews = session.exec(
        select(reviews.schemas.Review).where(
            reviews.schemas.Review.user_id == user.id,
            reviews.schemas.Review.reaction == reviews.schemas.Reaction.NEGATIVE,
            ).order_by(
            col(reviews.schemas.Review.rating).desc()
        )
    ).all()

    assert len(synced_reviews) == 1
    assert synced_reviews[0].book_id == book1.id
    assert synced_reviews[0].reaction == reviews.schemas.Reaction.NEGATIVE
    assert synced_reviews[0].rank == 1
    assert synced_reviews[0].rating == negative_high

    review = reviews.utils.get_review_or_none(session, user.id, book1.id)

    reviews.utils.delete_review_sync_ratings(
        session,
        review
    )

    synced_reviews = session.exec(
        select(reviews.schemas.Review).where(
            reviews.schemas.Review.user_id == user.id,
            reviews.schemas.Review.reaction == reviews.schemas.Reaction.NEGATIVE,
            ).order_by(
            col(reviews.schemas.Review.rating).desc()
        )
    ).all()

    assert len(synced_reviews) == 0
