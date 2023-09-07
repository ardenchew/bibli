from enum import Enum
from typing import List, Optional

from sqlmodel import Field, Relationship, SQLModel


class CollectionType(str, Enum):
    BOOKMARKED = 'bookmarked'
    READING = 'reading'
    FINISHED = 'finished'


DEFAULT_COLLECTION_TO_NAME = {
    CollectionType.BOOKMARKED: "Bookmarked",
    CollectionType.READING: "Reading",
    CollectionType.FINISHED: "Finished",
}


class CollectionBookLink(SQLModel, table=True):
    collection_id: int = Field(default=None, primary_key=True, foreign_key="collection.id")
    book_id: int = Field(default=None, primary_key=True, foreign_key="book.id")


class CollectionBase(SQLModel):
    name: str  # TODO(arden) make unique constraint on name + user_id.
    user_id: Optional[int] = Field(default=None, foreign_key="user.id")


class Collection(CollectionBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    type: Optional[str] = None
    # # TODO(arden) probably don't want each book to load every collection its on.
    # books: List["Book"] = Relationship(back_populates="collections")


class CollectionRead(CollectionBase):
    id: int
    type: Optional[CollectionType]
    # books: List["BookRead"]


class CollectionPut(CollectionBase):
    pass


class CollectionsFilter(SQLModel):
    user_id: Optional[int] = None
    type: Optional[CollectionType]
