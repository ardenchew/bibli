import random
from typing import Dict, List, Optional

from sqlmodel import Session, col, select

from resources.exceptions import InvalidArgumentException
import src.db.schema as schema
from olclient import OpenLibrary, Book as OlBook
from src.domain.utils import translate
from src.domain.utils.constants import OL_IDENTIFIER

DEFAULT_PAGE_LIMIT = 10
MAXIMUM_PATE_LIMIT = 100


class UserBookCollectionResult:
    def __init__(
            self,
            ol_book: OlBook,
            book: schema.books.Book,
            collections: Optional[List[schema.collections.Collection]] = [],
            review: Optional[schema.reviews.Review] = None,
    ):
        self.ol_book = ol_book
        self.book = book
        self.collections = collections
        self.review = review


def get_book(session: Session, book_id: int) -> schema.books.Book:
    return session.get(schema.books.Book, book_id)


def search_books(
        session: Session,
        ol: OpenLibrary,
        f: schema.filter.Filter,
        user_id: int,
) -> schema.books.SearchBookPage:
    _validate_filter(f)

    if not f.limit:
        f.limit = DEFAULT_PAGE_LIMIT

    results = ol.Work.q(f.q, f.offset, f.limit)
    page = schema.books.SearchBookPage(
        total_count=results.num_found,
    )

    # TODO fix summary and pages conversion in OL client.
    ol_books = [i.to_book() for i in results.docs]

    # TODO add user info to book page before returning.
    user_book_collections = _insert_missing_books_and_return(session, ol_books, user_id)
    for ubc in user_book_collections:
        # rating = random.uniform(0.0, 10.0)
        # if rating < 3.4:
        #     reaction = schema.reviews.Reaction.NEGATIVE
        # elif rating < 6.8:
        #     reaction = schema.reviews.Reaction.NEUTRAL
        # else:
        #     reaction = schema.reviews.Reaction.POSITIVE

        book_read = schema.books.UserBookRead(
            user_id=user_id,
            book=ubc.book,
            authors=[a['name'] for a in ubc.ol_book.authors],
            collections=ubc.collections,
            review=ubc.review,
        )
        page.books.append(book_read)

    return page


def upsert_book(session: Session, book: schema.books.Book) -> schema.books.Book:
    book = session.merge(book)
    session.commit()
    session.refresh(book)
    return book


def _validate_filter(
        f: schema.filter.Filter,
):
    if f.limit and f.limit > MAXIMUM_PATE_LIMIT:
        raise InvalidArgumentException


def _insert_missing_books_and_return(
        session: Session,
        ol_books: List[OlBook],
        user_id: int,
) -> List[UserBookCollectionResult]:
    # Ignore books that do not have an identifier.
    olid_to_ol_book: Dict[str, OlBook] = {}
    olids = []  # must maintain order
    for b in ol_books:
        if (OL_IDENTIFIER in b.identifiers) and (b.identifiers[OL_IDENTIFIER][0] != ""):
            olid = b.identifiers[OL_IDENTIFIER][0]
            olids.append(olid)
            olid_to_ol_book[olid] = b

    stmt = select(schema.books.Book, schema.collections.Collection, schema.reviews.Review).outerjoin(
        schema.collections.CollectionBookLink,
        (schema.books.Book.id == schema.collections.CollectionBookLink.book_id)
    ).outerjoin(
        schema.collections.Collection,
        (schema.collections.Collection.id ==
         schema.collections.CollectionBookLink.collection_id) &
        (schema.collections.Collection.user_id == user_id),
    ).outerjoin(
        schema.reviews.Review,
        (schema.books.Book.id == schema.reviews.Review.book_id) &
        (schema.reviews.Review.user_id == user_id),
    ).where(
        col(schema.books.Book.olid).in_(olids)
    )

    results = session.exec(stmt).all()
    olid_results_dict: Dict[str, UserBookCollectionResult] = {}
    for book, collection, review in results:
        if book.olid in olid_results_dict:
            olid_results_dict[book.olid].collections.append(collection)
        else:
            olid_results_dict[book.olid] = UserBookCollectionResult(
                ol_book=olid_to_ol_book[book.olid],
                book=book,
                collections=[collection] if collection else [],
                review=review,
            )

    for b in ol_books:
        olid = b.identifiers[OL_IDENTIFIER][0]
        if olid not in olid_results_dict:
            book = translate.from_ol_book(b)
            session.add(book)
            session.commit()
            olid_results_dict[olid] = UserBookCollectionResult(
                ol_book=olid_to_ol_book[olid],
                book=book,
            )

    return [olid_results_dict[olid] for olid in olids]
