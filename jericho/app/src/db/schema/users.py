from datetime import datetime
from enum import Enum
from typing import List, Optional

from sqlmodel import Field, Relationship, SQLModel, Column, DateTime


class UserLinkType(str, Enum):
    FOLLOW = "follow"
    BLOCK = "block"


class UserLinkBase(SQLModel):
    parent_id: int = Field(
        default=None,
        primary_key=True,
        foreign_key="user.id",
    )
    child_id: int = Field(
        default=None,
        primary_key=True,
        foreign_key="user.id",
    )


class UserLink(UserLinkBase, table=True):
    type: str

    parent_user: "User" = Relationship(
        back_populates="child_user_links",
        sa_relationship_kwargs={
            "foreign_keys": "UserLink.parent_id",
        },
    )

    child_user: "User" = Relationship(
        back_populates="parent_user_links",
        sa_relationship_kwargs={
            "foreign_keys": "UserLink.child_id",
        },
    )


class UserLinkRead(UserLinkBase):
    type: UserLinkType


class UserLinkPut(UserLinkBase):
    type: UserLinkType


class UserLinkDelete(UserLinkBase):
    pass


class LinkedUsersFilter(SQLModel):
    parent_id: Optional[int] = None
    child_id: Optional[int] = None
    type: UserLinkType


class UserBase(SQLModel):
    name: Optional[str]
    tag: Optional[str] = Field(default=None, unique=True, index=True)
    bio: Optional[str]


# Uses the many-to-many self referencing feedback here:
# https://github.com/tiangolo/sqlmodel/issues/89
class User(UserBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    sub: str = Field(unique=True, index=True)
    avatar_filepath: Optional[str] = Field(unique=True)

    parent_user_links: List[UserLink] = Relationship(
        back_populates="child_user",
        sa_relationship_kwargs={
            "foreign_keys": "UserLink.child_id",
        },
    )
    child_user_links: List[UserLink] = Relationship(
        back_populates="parent_user",
        sa_relationship_kwargs={
            "foreign_keys": "UserLink.parent_id",
        },
    )

    collection_links: List["CollectionUserLink"] = Relationship(back_populates="user")


class UserRead(UserBase):
    id: int
    link: Optional[UserLinkType]
    avatar_filepath: Optional[str]


class UserPut(UserBase):
    id: Optional[int] = None


class UserPage(SQLModel):
    total_count: int
    users: List[UserRead] = []


class TagValidation(SQLModel):
    valid: bool
    warning: Optional[str]


class FeedbackBase(SQLModel):
    user_id: int = Field(foreign_key="user.id")
    comment: str


class Feedback(FeedbackBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    created_at: datetime = Field(
        default_factory=datetime.utcnow,
        # sa_column=Column(DateTime(timezone=True)),
        nullable=False,
        index=True,
    )


class FeedbackRead(FeedbackBase):
    id: int
    created_at: datetime


class FeedbackWrite(FeedbackBase):
    pass
