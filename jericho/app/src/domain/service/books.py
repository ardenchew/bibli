from typing import Dict, List, Optional, Set

from sqlmodel import Session, col, select
from google_books_client.api import GoogleBooksAPI
from google_books_client.models import Book as GoogleBook

from resources.exceptions import InvalidArgumentException, NotFoundException
import src.db.schema as schema
from olclient import OpenLibrary, Book as OlBook
from src.domain.utils import translate
from src.domain.utils.constants import OL_IDENTIFIER

DEFAULT_PAGE_LIMIT = 10
MAXIMUM_PATE_LIMIT = 100

googleClient = GoogleBooksAPI()
GOOGLE_TAG_SIGNIFICANCE = 10


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


def add_tags_if_not_exist(session: Session, tags: Set[str]):
    for tag in tags:
        # Check if the tag exists in the database
        existing_tag = session.exec(select(schema.books.Tag).where(schema.books.Tag.name == tag)).first()
        if not existing_tag:
            # Tag does not exist, so add it to the database
            new_tag = schema.books.Tag(name=tag)
            session.add(new_tag)
    session.commit()


def add_tag_links_if_not_exist(session: Session, tags: Set[str], book_id: int):
    for tag in tags:
        # Check if the tag exists in the database
        existing_link = session.exec(select(schema.books.TagBookLink).where((schema.books.TagBookLink.tag_name == tag) & (
                    schema.books.TagBookLink.book_id == book_id))).first()
        if not existing_link:
            # Tag does not exist, so add it to the database
            new_link = schema.books.TagBookLink(tag_name=tag, book_id=book_id, count=GOOGLE_TAG_SIGNIFICANCE)
            session.add(new_link)
    session.commit()


def get_tags_from_book_id(session: Session, book_id: int) -> List[schema.books.TagBookLink]:
    stmt = select(schema.books.TagBookLink).where(schema.books.TagBookLink.book_id == book_id).order_by(col(schema.books.TagBookLink.count).desc())
    tag_links = session.exec(stmt).all()
    if tag_links:
        return tag_links

    book = session.get(schema.books.Book, book_id)
    google_book = googleClient.get_book_by_id(book.gid)
    tags = translate.tags_from_google_book_subjects(google_book.subjects)

    add_tags_if_not_exist(session, tags)
    add_tag_links_if_not_exist(session, tags, book_id)
    return session.exec(stmt).all()


# TODO do a refresh here.
def get_book(session: Session, book_id: int, user_id: int) -> schema.books.UserBookRead:
    book = session.get(schema.books.Book, book_id)
    if not book:
        raise NotFoundException

    # google_book = googleClient.get_book_by_id(book.gid)
    # refresh_book = translate.from_google_book(google_book)

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

    return _books_to_page(session, results, user_id, 0)


def upsert_book(session: Session, book: schema.books.Book) -> schema.books.Book:
    book = session.merge(book)
    session.commit()
    session.refresh(book)
    return book


def search_books_v2(
        session: Session,
        f: schema.filter.Filter,
        user_id: int,
) -> schema.books.BookPage:
    results = googleClient.search_book(search_term=filter_to_search_term(f))

    # TOOD UPDATE THE GOOGLE CLIENT TO TAKE LIMITS
    results_trimmed = results.get_all_results()[:f.limit if f.limit else DEFAULT_PAGE_LIMIT]

    books = _insert_missing_books_and_return_v2(session, results_trimmed)
    page = _books_to_page(session, books, user_id, results.total_results)
    return page


def _insert_missing_books_and_return_v2(
        session: Session,
        google_books: List[GoogleBook],
) -> List[schema.books.Book]:
    gid_to_google_book: Dict[str, GoogleBook] = {}
    gids = []
    for b in google_books:
        gids.append(b.id)
        gid_to_google_book[b.id] = b

    stmt = select(schema.books.Book).where(col(schema.books.Book.gid).in_(gids))
    results = session.exec(stmt).all()
    gid_to_book: Dict[str, schema.books.Book] = {}
    for b in results:
        gid_to_book[b.gid] = b

    for gid, b in gid_to_google_book.items():
        if gid not in gid_to_book:
            book = translate.from_google_book(b)

            reserved_authors = []
            for author in book.authors:
                a = session.exec(select(schema.books.Author).where(schema.books.Author.name == author.name)).first()
                if a:
                    reserved_authors.append(a)
                else:
                    a = schema.books.Author(name=author.name)
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

                gid_to_book[gid] = book
            except Exception as e:
                session.rollback()
                print(e)

    return [gid_to_book[gid] for gid in gids if gid in gid_to_book]


def filter_to_search_term(f: schema.filter.Filter) -> str:
    _validate_filter(f)
    search_term = f.q
    # if not f.limit:
    #     f.limit = DEFAULT_PAGE_LIMIT
    # search_term += f"&maxResults={f.limit}"
    # if f.offset:
    #     search_term += f"&startIndex={f.offset}"
    return search_term


def _validate_filter(
        f: schema.filter.Filter,
):
    if f.limit and f.limit > MAXIMUM_PATE_LIMIT:
        raise InvalidArgumentException


def _books_to_page(session: Session, books: List[schema.books.Book], user_id: int, total_count: int) -> schema.books.BookPage:
    page = schema.books.BookPage(total_count=total_count)

    # Fetch collection ids for user owned.
    cul_stmt = select(schema.collections.CollectionUserLink
                      ).where((schema.collections.CollectionUserLink.user_id == user_id) &
                              (schema.collections.CollectionUserLink.type == schema.collections.CollectionUserLinkType.OWNER))

    cul_results = session.exec(cul_stmt).all()
    col_ids = [c.collection_id for c in cul_results]

    ids = [b.id for b in books]  # must maintain order

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
                id_results_dict[book.id].collections.append(schema.collections.CollectionRead.from_orm(collection))
        else:
            id_results_dict[book.id] = schema.books.UserBookRead(
                user_id=user_id,
                book=book,
                authors=[schema.books.AuthorRead.from_orm(a) for a in book.authors],
                collections=[schema.collections.CollectionRead.from_orm(collection)] if collection else [],
                review=review,
            )

    page.books = [id_results_dict[i] for i in ids]
    return page
