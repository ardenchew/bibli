from olclient import Author as OlAuthor
from olclient import Book as OlBook
from src.domain.books import schemas


def from_ol_book(ob: OlBook) -> schemas.BookRead:
    return schemas.BookRead(
        title=ob.title,
        subtitle=ob.subtitle,
        publication_date=ob.publish_date,
        pages=ob.pages,
        cover_link=ob.cover,
        olid=ob.identifiers['olid'][0],
        authors=[schemas.AuthorRead(name=a['name'], olid=a['olid']) for a in ob.authors],
    )


def from_ol_author(oa: OlAuthor) -> schemas.AuthorRead:
    return schemas.AuthorRead(
        name=oa.name,
        summary=oa.bio,
        olid=oa.olid,
        cover_link=oa.cover,
    )
