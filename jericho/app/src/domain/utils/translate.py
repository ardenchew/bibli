from typing import List

import src.db.schema as schema
from olclient import Book as OlBook


def from_ol_book(ob: OlBook) -> schema.books.Book:
    return schema.books.Book(
        title=ob.title,
        subtitle=ob.subtitle,
        publication_date=ob.publish_date,
        pages=ob.pages,
        cover_link=ob.cover,
        olid=ob.identifiers["olid"][0],
    )
