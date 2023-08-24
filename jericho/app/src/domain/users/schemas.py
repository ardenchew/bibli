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


class UserLinkPut(SQLModel):
    parent_id: int
    child_id: int
    relationship_type: UserLinkType


class UserLinkDelete(SQLModel):
    parent_id: int
    child_id: int


class UserBase(SQLModel):
    name: str
    info: Optional[str] = None


# Uses the many-to-many self referencing feedback here: https://github.com/tiangolo/sqlmodel/issues/89
class User(UserBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    tag: str = Field(default=None, unique=True, index=True)

    parent_users: List["User"] = Relationship(
        back_populates="child_users",
        link_model=UserLink,
        sa_relationship_kwargs=dict(
            primaryjoin="User.id==UserLink.child_id",
            secondaryjoin="User.id==UserLink.parent_id",
        ),
    )
    child_users: List["User"] = Relationship(
        back_populates="parent_users",
        link_model=UserLink,
        sa_relationship_kwargs=dict(
            primaryjoin="User.id==UserLink.parent_id",
            secondaryjoin="User.id==UserLink.child_id",
        ),
    )


class UserRead(UserBase):
    id: int
    tag: str


class UserPut(UserBase):
    id: Optional[int] = None
    tag: str
