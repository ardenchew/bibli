from datetime import datetime
from enum import Enum
from typing import Optional, List

from sqlmodel import Field, Relationship, SQLModel, Column, DateTime


class CollectionType(str, Enum):
    SAVED = "saved"
    ACTIVE = "active"
    COMPLETE = "complete"


DEFAULT_COLLECTION_TO_NAME = {
    CollectionType.SAVED: "Bookmarked",
    CollectionType.ACTIVE: "Reading",
    CollectionType.COMPLETE: "Finished",
}


class CollectionUserLinkType(str, Enum):
    OWNER = "owner"
    COLLABORATOR = "collaborator"
    FOLLOWER = "follower"


class CollectionBookLink(SQLModel, table=True):
    collection_id: int = Field(
        default=None, primary_key=True, foreign_key="collection.id"
    )
    book_id: int = Field(default=None, primary_key=True, foreign_key="book.id")
    collection: "Collection" = Relationship(back_populates="book_links")


class CollectionUserLinkBase(SQLModel):
    collection_id: int
    user_id: int
    type: CollectionUserLinkType


class CollectionUserLink(CollectionUserLinkBase, table=True):
    collection_id: int = Field(
        default=None, primary_key=True, foreign_key="collection.id"
    )
    user_id: int = Field(default=None, primary_key=True, foreign_key="user.id")
    created_at: datetime = Field(
        default_factory=datetime.utcnow,
        # sa_column=Column(DateTime(timezone=True)),
        nullable=False,
        index=True,
    )

    collection: "Collection" = Relationship(back_populates="user_links")
    user: "User" = Relationship(back_populates="collection_links")


class CollectionUserLinkRead(CollectionUserLinkBase):
    created_at: datetime


class CollectionUserLinkPut(CollectionUserLinkBase):
    pass


class CollectionBase(SQLModel):
    name: str  # TODO(arden) make unique constraint on name + user_id.


class Collection(CollectionBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    type: Optional[str] = None

    user_links: List[CollectionUserLink] = Relationship(back_populates="collection")
    book_links: List[CollectionBookLink] = Relationship(back_populates="collection")


class CollectionRead(CollectionBase):
    id: int
    type: Optional[CollectionType]
    count: Optional[int]

    user_links: List[CollectionUserLinkRead]


class CollectionPut(CollectionBase):
    id: Optional[int]


class CollectionsFilter(SQLModel):
    user_id: Optional[int] = None
    user_link_type: Optional[CollectionUserLinkType]
    type: Optional[CollectionType]
