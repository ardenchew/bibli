# from typing import Dict, List
#
# from sqlmodel import Session, col, select
#
# import src.db.schema as schema
# from olclient import OpenLibrary, Book as OlBook
# from src.domain.utils import translate
#
# def search_books(
#         session: Session,
#         ol: OpenLibrary,
#         f: schema.filter.Filter,
#         user_id: int,
# ) -> schema.books.BookPage:
#     _validate_filter(f)
#
#     if not f.limit:
#         f.limit = DEFAULT_PAGE_LIMIT
#
#     results = ol.Work.q(f.q, f.offset, f.limit)
#
#     # TODO fix summary and pages conversion in OL client.
#     ol_books = [i.to_book() for i in results.docs]
#
#     # TODO add user info to book page before returning.
#     books = _insert_missing_books_and_return(session, ol_books)
#     page = _books_to_page(session, books, user_id, results.num_found)
#
#     return page
#
#
# def _insert_missing_books_and_return(
#         session: Session,
#         ol_books: List[OlBook],
# ) -> List[schema.books.Book]:
#     # Ignore books that do not have an identifier.
#     olid_to_ol_book: Dict[str, OlBook] = {}
#     olids = []  # must maintain order
#     for b in ol_books:
#         olids.append(b.olid)
#         olid_to_ol_book[b.olid] = b
#
#     # TODO add only books then use _books_to_page
#     stmt = select(schema.books.Book).where(col(schema.books.Book.olid).in_(olids))
#     results = session.exec(stmt).all()
#     olid_to_book: Dict[str, schema.books.Book] = {}
#     for b in results:
#         olid_to_book[b.olid] = b
#
#     for olid, b in olid_to_ol_book.items():
#         if olid not in olid_to_book:
#             book = translate.from_ol_book(b)
#
#             reserved_authors = []
#             for author in book.authors:
#                 a = session.exec(select(schema.books.Author).where(schema.books.Author.olid == author.olid)).first()
#                 if a:
#                     reserved_authors.append(a)
#                 else:
#                     a = schema.books.Author(name=author.name, olid=author.olid)
#                     session.add(a)
#                     session.flush()
#                     session.refresh(a)
#                     reserved_authors.append(a)
#
#             book.authors = []
#
#             try:
#                 session.add(book)
#                 session.flush()
#                 session.refresh(book)
#
#                 for a in reserved_authors:
#                     link = schema.books.AuthorBookLink(book_id=book.id, author_id=a.id)
#                     session.add(link)
#
#                 session.commit()
#                 book.authors = reserved_authors
#
#                 olid_to_book[olid] = book
#             except Exception as e:
#                 session.rollback()
#                 print(e)
#
#     return [olid_to_book[olid] for olid in olids if olid in olid_to_book]
#
#
# def from_ol_book(ob: OlBook) -> schema.books.Book:
#     return schema.books.Book(
#         title=ob.title,
#         subtitle=ob.subtitle,
#         pages=ob.pages,
#         cover_link=ob.cover,
#         olid=ob.olid,
#         authors=[schema.books.Author(name=a['name'], olid=a['olid']) for a in ob.authors],
#         summary=ob.description
#     )
