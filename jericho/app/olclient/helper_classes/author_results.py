from typing import List

from olclient.common import Author


class AuthorResults:
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
        """An aggregate OpenLibrary Work summarizing all Editions of an Author"""

        def __init__(
            self, key, name: str = "", bio="", photos: List[int] = [], **kwargs
        ):
            """
            Args:
                key (unicode) - a '/<type>/<OLID>' uri, e.g. '/authors/OLXXXXXX'
                name (unicode)
                bio (unicode) [optional]
            """
            self.key = key
            self.name = name
            self.bio = bio
            self.cover = f"https://covers.openlibrary.org/a/olid/{key}-M.jpg"
            if len(photos) > 0:
                self.cover = f"https://covers.openlibrary.org/a/id/{photos[0]}-M.jpg"

        def to_author(self):
            """Converts an OpenLibrary Search API Results Document to a
            standardized Author
            """
            return Author(
                name=self.name,
                olid=self.key,
                bio=self.bio,
                cover=self.cover,
            )
