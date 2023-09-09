from enum import Enum
from typing import List, Optional

from sqlmodel import Field, Relationship, SQLModel


class CollectionType(str, Enum):
    SAVED = 'saved'
    ACTIVE = 'active'
    COMPLETE = 'complete'


DEFAULT_COLLECTION_TO_NAME = {
    CollectionType.SAVED: "Saved",
    CollectionType.ACTIVE: "Active",
    CollectionType.COMPLETE: "Complete",
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

    user: Optional["User"] = Relationship(back_populates="collections")


class CollectionRead(CollectionBase):
    id: int
    type: Optional[CollectionType]


class CollectionPut(CollectionBase):
    pass


class CollectionsFilter(SQLModel):
    user_id: Optional[int] = None
    type: Optional[CollectionType]
