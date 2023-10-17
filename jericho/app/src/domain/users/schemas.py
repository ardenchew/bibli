from enum import Enum
from typing import List, Optional

from sqlmodel import Field, Relationship, SQLModel


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


# Uses the many-to-many self referencing feedback here:
# https://github.com/tiangolo/sqlmodel/issues/89
class User(UserBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)

    sub: str = Field(unique=True, index=True)

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
    collections: List["Collection"] = Relationship(  # noqa: F821
        back_populates="user",
    )


class UserRead(UserBase):
    id: int


class UserPut(UserBase):
    id: Optional[int] = None
