from typing import List, Set
import re

import src.db.schema as schema
from google_books_client.models import Book as GoogleBook


def tags_from_google_book_subjects(subjects: List[str]) -> Set[str]:
    tags: Set[str] = set()
    for subject in subjects:
        splits = re.split(r'[&/\\,]', subject)
        for split in splits:
            tag = split.strip().lower()
            if len(tag) > 40 or tag.count(' ') > 3 or tag == "general":
                continue
            tags.add(tag)
    return tags


def from_google_book(gb: GoogleBook) -> schema.books.Book:
    # Intentionally ignoring tags here.
    cover_link = gb.large_thumbnail if gb.large_thumbnail else gb.small_thumbnail
    if cover_link:
        cover_link = cover_link.replace('http://', 'https://')
    return schema.books.Book(
        gid=gb.id,
        title=gb.title,
        subtitle=gb.subtitle,
        pages=gb.page_count,
        cover_link=cover_link,
        authors=[schema.books.Author(name=a) for a in gb.authors] if gb.authors else [],
        summary=gb.description,
        isbn13=gb.ISBN_13,
        isbn10=gb.ISBN_10,
        publication_date=gb.published_date,
    )
