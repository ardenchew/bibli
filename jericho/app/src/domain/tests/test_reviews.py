from sqlmodel import Session

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

    c = session.exec(stmt).one()
    assert c == 0

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

    c = session.exec(stmt).one()
    assert c == 1
