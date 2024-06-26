from datetime import datetime
from typing import List, Optional

from sqlmodel import Field, Relationship, SQLModel, Column, DateTime
from src.db.schema.users import UserRead, User
from src.db.schema.collections import CollectionRead, Collection
from src.db.schema.reviews import ReviewRead, Review
from src.db.schema.books import BookRead, Book


class FollowUserActivity(SQLModel, table=True):
    activity_id: int = Field(foreign_key="activity.id", primary_key=True)
    follower_user_id: int = Field(foreign_key="user.id")
    following_user_id: int = Field(foreign_key="user.id")

    follower: User = Relationship(
        sa_relationship_kwargs={
            "foreign_keys": "FollowUserActivity.follower_user_id",
            "backref": "follower_user_id",
        },
    )
    following: User = Relationship(
        sa_relationship_kwargs={
            "foreign_keys": "FollowUserActivity.following_user_id",
            "backref": "following_user_id",
        },
    )


class FollowUserActivityRead(SQLModel):
    follower: UserRead
    following: UserRead


class ReviewActivity(SQLModel, table=True):
    activity_id: int = Field(foreign_key="activity.id", primary_key=True)
    user_id: int = Field(foreign_key="user.id")
    review_id: int = Field(foreign_key="review.id")

    user: User = Relationship(
        sa_relationship_kwargs={
            "foreign_keys": "ReviewActivity.user_id",
            "backref": "r_user_id",
        },
    )
    review: Review = Relationship(
        sa_relationship_kwargs={
            "foreign_keys": "ReviewActivity.review_id",
            "backref": "review.id",
        },
    )


class ReviewActivityRead(SQLModel):
    user: UserRead
    review: ReviewRead


class AddToCollectionActivity(SQLModel, table=True):
    activity_id: int = Field(foreign_key="activity.id", primary_key=True)
    user_id: int = Field(foreign_key="user.id")
    collection_id: int = Field(foreign_key="collection.id")
    book_id: int = Field(foreign_key="book.id")

    user: User = Relationship(
        sa_relationship_kwargs={
            "foreign_keys": "AddToCollectionActivity.user_id",
            "backref": "atc_user_id",
        },
    )
    collection: Collection = Relationship(
        sa_relationship_kwargs={
            "foreign_keys": "AddToCollectionActivity.collection_id",
            "backref": "collection.id",
        },
    )
    book: Book = Relationship(
        sa_relationship_kwargs={
            "foreign_keys": "AddToCollectionActivity.book_id",
            "backref": "book.id",
        },
    )


class AddToCollectionActivityRead(SQLModel):
    user: UserRead
    collection: CollectionRead
    book: BookRead


class ActivityReaction(SQLModel, table=True):
    activity_id: int = Field(default=None, primary_key=True, foreign_key="activity.id")
    user_id: int = Field(default=None, primary_key=True, foreign_key="user.id")

    activity: "Activity" = Relationship(back_populates="reactions")


class ActivityReactionRead(SQLModel):
    user_id: int


class ActivityCommentBase(SQLModel):
    activity_id: int = Field(foreign_key="activity.id")
    user_id: int = Field(foreign_key="user.id")
    comment: str


class ActivityComment(ActivityCommentBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    created_at: datetime = Field(
        default_factory=datetime.utcnow,
        # sa_column=Column(DateTime(timezone=True)),
        nullable=False,
        index=True,
    )

    activity: "Activity" = Relationship(back_populates="comments")


class ActivityCommentRead(ActivityCommentBase):
    id: int
    created_at: datetime


class ActivityCommentWrite(ActivityCommentBase):
    pass


class Activity(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    created_at: Optional[datetime] = Field(
        default_factory=datetime.utcnow,
        # sa_column=Column(DateTime(timezone=True)),
        nullable=False,
        index=True,
    )

    reactions: List[ActivityReaction] = Relationship(back_populates="activity")
    comments: List[ActivityComment] = Relationship(back_populates="activity")


class ActivityRead(SQLModel):
    id: int
    created_at: datetime
    add_to_collection: Optional[AddToCollectionActivityRead] = None
    review: Optional[ReviewActivityRead] = None
    follow_user: Optional[FollowUserActivityRead] = None
    reactions: List[ActivityReactionRead] = None
    comments: List[ActivityCommentRead] = None


class ActivityCursor(SQLModel):
    id: int
    created_at: datetime


class ActivityFilter(SQLModel):
    cursor: Optional[ActivityCursor]
    limit: Optional[int]

    following_user_id: Optional[int]
    primary_user_id: Optional[int]


class ActivityPage(SQLModel):
    next_cursor: Optional[ActivityCursor]
    activities: List[ActivityRead]
