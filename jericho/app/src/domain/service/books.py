from typing import Dict, List, Optional

from sqlmodel import Session, col, select

from resources.exceptions import InvalidArgumentException, NotFoundException
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


def get_book(session: Session, book_id: int, user_id: int) -> schema.books.UserBookRead:
    book = session.get(schema.books.Book, book_id)
    if not book:
        raise NotFoundException

    if book.summary is None and book.first_publication_date is None:
        # TODO if no summary is found should peruse editions for a summary.
        try:
            ol = OpenLibrary()
            work = ol.Work.get(book.olid)
            if work:
                print('WORK ', work)
                print('WORK.first ', work.first_publish_date)
                if book.summary is None and work.description:
                    book.summary = work.description
                if book.first_publication_date is None and work.first_publish_date:
                    book.first_publication_date = work.first_publish_date
                session.add(book)
                session.commit()
                session.refresh(book)
        except Exception as e:
            print(e)

    page = _books_to_page(session, [book], user_id, 0)
    return page.books[0]


def get_books(session: Session, f: schema.books.BookFilter, user_id: int) -> schema.books.BookPage:
    if not f.limit:
        f.limit = DEFAULT_PAGE_LIMIT

    stmt = select(schema.books.Book)

    if f.collection_ids:
        stmt = stmt.join(
            schema.collections.CollectionBookLink,
            (schema.books.Book.id ==
             schema.collections.CollectionBookLink.book_id),
        ).where(
            col(schema.collections.CollectionBookLink.collection_id).in_(f.collection_ids)
        )

    stmt = stmt.limit(f.limit)

    if not f.offset:
        stmt = stmt.offset(f.offset)

    results = session.exec(stmt).all()
    print(results)

    # return schema.books.Page(total_count=0)

    return _books_to_page(session, results, user_id, 0)


def search_books(
        session: Session,
        ol: OpenLibrary,
        f: schema.filter.Filter,
        user_id: int,
) -> schema.books.BookPage:
    _validate_filter(f)

    if not f.limit:
        f.limit = DEFAULT_PAGE_LIMIT

    results = ol.Work.q(f.q, f.offset, f.limit)

    # TODO fix summary and pages conversion in OL client.
    ol_books = [i.to_book() for i in results.docs]

    # TODO add user info to book page before returning.
    books = _insert_missing_books_and_return(session, ol_books)
    page = _books_to_page(session, books, user_id, results.num_found)

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
) -> List[schema.books.Book]:
    # Ignore books that do not have an identifier.
    olid_to_ol_book: Dict[str, OlBook] = {}
    olids = []  # must maintain order
    for b in ol_books:
        olids.append(b.olid)
        olid_to_ol_book[b.olid] = b

    # TODO add only books then use _books_to_page
    stmt = select(schema.books.Book).where(col(schema.books.Book.olid).in_(olids))
    results = session.exec(stmt).all()
    olid_to_book: Dict[str, schema.books.Book] = {}
    for b in results:
        olid_to_book[b.olid] = b

    for olid, b in olid_to_ol_book.items():
        if olid not in olid_to_book:
            book = translate.from_ol_book(b)

            reserved_authors = []
            for author in book.authors:
                a = session.exec(select(schema.books.Author).where(schema.books.Author.olid == author.olid)).first()
                if a:
                    reserved_authors.append(a)
                else:
                    a = schema.books.Author(name=author.name, olid=author.olid)
                    session.add(a)
                    session.flush()
                    session.refresh(a)
                    reserved_authors.append(a)

            book.authors = []

            try:
                session.add(book)
                session.flush()
                session.refresh(book)

                for a in reserved_authors:
                    link = schema.books.AuthorBookLink(book_id=book.id, author_id=a.id)
                    session.add(link)

                session.commit()
                book.authors = reserved_authors

                olid_to_book[olid] = book
            except Exception as e:
                session.rollback()
                print(e)

    return [olid_to_book[olid] for olid in olids if olid in olid_to_book]


def _books_to_page(session: Session, books: List[schema.books.Book], user_id: int, total_count: int) -> schema.books.BookPage:
    page = schema.books.BookPage(total_count=total_count)

    # Fetch collection ids for user owned.
    cul_stmt = select(schema.collections.CollectionUserLink
                      ).where((schema.collections.CollectionUserLink.user_id == user_id) &
                              (schema.collections.CollectionUserLink.type == schema.collections.CollectionUserLinkType.OWNER))

    cul_results = session.exec(cul_stmt).all()
    col_ids = [c.collection_id for c in cul_results]

    ids = [b.id for b in books]  # must maintain order
    print(ids)

    stmt = select(schema.books.Book, schema.collections.Collection, schema.reviews.Review).outerjoin(
        schema.collections.CollectionBookLink,
        ((schema.books.Book.id == schema.collections.CollectionBookLink.book_id) &
         (col(schema.collections.CollectionBookLink.collection_id).in_(col_ids)))
    ).outerjoin(
        schema.collections.Collection,
        (schema.collections.Collection.id ==
         schema.collections.CollectionBookLink.collection_id),
    ).outerjoin(
        schema.reviews.Review,
        (schema.books.Book.id == schema.reviews.Review.book_id) &
        (schema.reviews.Review.user_id == user_id),
    ).where(col(schema.books.Book.id).in_(ids))

    results = session.exec(stmt).all()
    id_results_dict: Dict[int, schema.books.UserBookRead] = {}
    for book, collection, review in results:
        if book.id in id_results_dict:
            if collection:
                id_results_dict[book.id].collections.append(collection)
        else:
            id_results_dict[book.id] = schema.books.UserBookRead(
                user_id=user_id,
                book=book,
                authors=[schema.books.AuthorRead.from_orm(a) for a in book.authors],
                collections=[collection] if collection else [],
                review=review,
            )

    page.books = [id_results_dict[i] for i in ids]
    return page
