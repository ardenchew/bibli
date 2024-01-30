import src.db.schema as schema
from olclient import Author as OlAuthor
from olclient import Book as OlBook


def from_ol_book(ob: OlBook) -> schema.books.BookRead:
    return schema.books.BookRead(
        title=ob.title,
        subtitle=ob.subtitle,
        publication_date=ob.publish_date,
        pages=ob.pages,
        cover_link=ob.cover,
        olid=ob.identifiers["olid"][0],
        authors=[
            schema.books.AuthorRead(name=a["name"], olid=a["olid"]) for a in ob.authors
        ],
    )


def from_ol_author(oa: OlAuthor) -> schema.books.AuthorRead:
    return schema.books.AuthorRead(
        name=oa.name,
        summary=oa.bio,
        olid=oa.olid,
        cover_link=oa.cover,
    )
