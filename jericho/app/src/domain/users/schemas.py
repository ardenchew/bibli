from enum import Enum
from sqlmodel import Field, Relationship, SQLModel
from typing import List, Optional


class UserLinkType(str, Enum):
    FOLLOW = 'follow'
    BLOCK = 'block'


class UserLinkBase(SQLModel):
    pass


class UserLink(UserLinkBase, table=True):
    parent_id: int = Field(default=None, primary_key=True, foreign_key="user.id")
    child_id: int = Field(default=None, primary_key=True, foreign_key="user.id")
    relationship_type: str

    parent_user: "User" = Relationship(
        back_populates="child_user_links",
        sa_relationship_kwargs=dict(
            foreign_keys="UserLink.parent_id",
        )
    )

    child_user: "User" = Relationship(
        back_populates="parent_user_links",
        sa_relationship_kwargs=dict(
            foreign_keys="UserLink.child_id",
        )
    )


class UserLinkRead(UserLinkBase):
    parent_id: int
    child_id: int
    relationship_type: UserLinkType


class UserLinkPut(UserLinkBase):
    parent_id: int
    child_id: int
    relationship_type: UserLinkType


class UserLinkDelete(UserLinkBase):
    parent_id: int
    child_id: int


class LinkedUsersFilter(SQLModel):
    parent_id: Optional[int]
    child_id: Optional[int]
    relationship_type: UserLinkType


class UserBase(SQLModel):
    name: str
    info: Optional[str] = None


# Uses the many-to-many self referencing feedback here: https://github.com/tiangolo/sqlmodel/issues/89
class User(UserBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    tag: str = Field(default=None, unique=True, index=True)

    parent_user_links: List[UserLink] = Relationship(
        back_populates="child_user",
        sa_relationship_kwargs=dict(
            foreign_keys="UserLink.child_id",
        ),
    )
    child_user_links: List[UserLink] = Relationship(
        back_populates="parent_user",
        sa_relationship_kwargs=dict(
            foreign_keys="UserLink.parent_id",
        ),
    )


class UserRead(UserBase):
    id: int
    tag: str


class UserPut(UserBase):
    id: Optional[int] = None
    tag: str
