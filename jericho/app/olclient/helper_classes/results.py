from typing import Optional

from olclient.common import Book
from olclient.utils import extract_olid_from_url


class Results:
    """Container for the results of the Search API"""

    def __init__(self, start=0, num_found=0, docs=None, **kwargs):
        self.start = start
        self.num_found = num_found
        self.docs = [self.Document(**doc) for doc in docs] or []

    @property
    def first(self):
        if self.docs:
            return self.docs[0]

    class Document:
        """An aggregate OpenLibrary Work summarizing all Editions of a Book"""

        def __init__(
            self,
            key,
            title: str = "",
            subtitle: Optional[str] = None,
            subject: Optional[str] = None,
            author_name="",
            author_key=None,
            edition_key=None,
            language="",
            publisher=None,
            publish_date=None,
            publish_place=None,
            first_publish_year=None,
            isbns=None,
            lccn=None,
            oclc=None,
            id_goodreads=None,
            id_librarything=None,
            cover_i=None,
            cover_edition_key=None,
            number_of_pages_median=None,
            description=None,
            **kwargs,
        ):
            """
            Args:
                key (unicode) - a '/<type>/<OLID>' uri, e.g. '/works/OLXXXXXX'
                title (unicode)
                subtitle (unicode) [optional]
                subject (list of unicode) [optional]
                author_name (list of unicode)
                author_key (list of unicode) - list of author OLIDs
                edition_key (list of unicode) - list of edition OLIDs
                language (unicode)
                publisher (list of unicode)
                publish_date (list unicode)
                publish_place (list unicode)
                first_publish_year (int)
                isbns (list unicode)
                lccn (list unicode)
                oclc (list unicode)
                id_goodreads (list unicode)
                id_librarything (list unicode)
            """
            work_olid = extract_olid_from_url(key, "works")
            edition_olids = edition_key

            self.olid = work_olid
            self.title = title
            self.subtitle = subtitle
            self.subjects = subject
            # XXX test that during the zip, author_name and author_key
            # correspond to each other one-to-one, in order
            self.authors = [
                {"name": name, "olid": author_olid}
                for (name, author_olid) in zip(author_name or [], author_key or [])
            ]
            self.publishers = publisher
            self.publish_dates = publish_date
            self.publish_places = publish_place
            self.first_publish_year = first_publish_year
            self.edition_olids = edition_olids
            self.language = language
            self.cover = ""
            if cover_i:
                self.cover = f"https://covers.openlibrary.org/b/id/{cover_i}-M.jpg"
            elif cover_edition_key:
                self.cover = (
                    f"https://covers.openlibrary.org/b/olid/{cover_edition_key}-M.jpg"
                )
            self.cover_edition_key = cover_edition_key

            # These keys all map to [lists] of (usually one) unicode ids
            self.identifiers = {
                "olid": [work_olid],
                "isbns": isbns or [],
                "oclc": oclc or [],
                "lccn": lccn or [],
                "goodreads": id_goodreads or [],
                "librarything": id_librarything or [],
            }
            self.number_of_pages = number_of_pages_median
            self.description = description
            print("DESCRIPTION: ", description)

        def to_book(self):
            """Converts an OpenLibrary Search API Results Document to a
            standardized Book
            """

            return Book(
                title=self.title,
                subtitle=self.subtitle,
                identifiers=self.identifiers,
                olid=self.olid,
                authors=self.authors,
                publisher=self.publishers,
                publish_date=self.first_publish_year,
                cover=self.cover,
                primary_edition=self.edition_olids[0],
                number_of_pages=self.number_of_pages,
                cover_edition_key=self.cover_edition_key,
                description=self.description,
            )
