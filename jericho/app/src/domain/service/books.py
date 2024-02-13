from typing import List

from sqlmodel import Session, col, select

from resources.exceptions import InvalidArgumentException
import src.db.schema as schema
from olclient import OpenLibrary, Book as OlBook
from src.domain.utils import translate
from src.domain.utils.constants import OL_IDENTIFIER

DEFAULT_PAGE_LIMIT = 10
MAXIMUM_PATE_LIMIT = 100


def get_book(session: Session, book_id: int) -> schema.books.Book:
    return session.get(schema.books.Book, book_id)


def search_books(
        session: Session,
        ol: OpenLibrary,
        f: schema.books.OmniBookFilter,
        user_id: int,
) -> schema.books.SearchBookPage:
    _validate_filter(f)

    if not f.limit:
        f.limit = DEFAULT_PAGE_LIMIT

    results = ol.Work.q(f.q, f.offset, f.limit)
    print(results)
    page = schema.books.SearchBookPage(
        total_count=results.num_found,
    )

    # TODO fix summary and pages conversion in OL client.
    ol_books = [i.to_book() for i in results.docs]

    # TODO add user info to book page before returning.
    books_zip = _insert_missing_books_and_return(session, ol_books)
    for olb, b in books_zip:
        book_read = schema.books.UserBookRead(
            user_id=user_id,
            book=b,
            authors=[a['name'] for a in olb.authors],
        )
        page.books.append(book_read)

    return page


def upsert_book(session: Session, book: schema.books.Book) -> schema.books.Book:
    book = session.merge(book)
    session.commit()
    session.refresh(book)
    return book


def get_author(session: Session, author_id: int) -> schema.books.Author:
    return session.get(schema.books.Author, author_id)


def get_authors(
        session: Session,
        ol: OpenLibrary,
        q: str,
        offset: int = 0,
        limit: int = DEFAULT_PAGE_LIMIT,
):
    oas = ol.Author.q(q, offset, limit)

    return [translate.from_ol_author(oa) for oa in oas]


def upsert_author(session: Session, author: schema.books.Author) -> schema.books.Author:
    author = session.merge(author)
    session.commit()
    session.refresh(author)
    return author


def _validate_filter(
    f: schema.books.OmniBookFilter,
):
    if f.limit and f.limit > MAXIMUM_PATE_LIMIT:
        raise InvalidArgumentException


def _insert_missing_books_and_return(
        session: Session,
        ol_books: List[OlBook],
):
    # Ignore books that do not have an identifier.
    ol_books = [b for b in ol_books if (OL_IDENTIFIER in b.identifiers) and (b.identifiers[OL_IDENTIFIER][0] != "")]

    # For maintaining return order.
    order = dict()
    olids = []
    for i, b in enumerate(ol_books):
        olid = b.identifiers[OL_IDENTIFIER][0]
        order[olid] = i
        olids.append(olid)

    stmt = select(schema.books.Book).where(
        col(schema.books.Book.olid).in_(olids)
    )

    books_stored = session.exec(stmt).all()
    olids_stored = set([b.olid for b in books_stored])
    books_to_add = []

    for b in ol_books:
        olid = b.identifiers[OL_IDENTIFIER][0]
        if olid not in olids_stored:
            book = translate.from_ol_book(b)
            session.add(book)
            # TODO test need for commit here
            session.commit()
            print("BEFORE", book.id)
            session.refresh(book)
            print("AFTER", book.id)
            books_stored.append(book)

    books_return = [schema.books.Book()] * len(ol_books)
    for b in books_stored:
        books_return[order[b.olid]] = b

    return zip(ol_books, books_return)
