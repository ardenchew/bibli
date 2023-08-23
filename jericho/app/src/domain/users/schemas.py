from enum import Enum
from sqlmodel import Field, SQLModel
from typing import Optional


class UserBase(SQLModel):
    name: str
    info: Optional[str] = None


class User(UserBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    tag: str = Field(default=None, unique=True, index=True)


class UserRead(UserBase):
    id: int
    tag: str


class UserPut(UserBase):
    id: Optional[int] = None
    tag: str


# class UserLinkType(str, Enum):
#     FOLLOW = 'follow'
#     BLOCK = 'block'
#
#
# class UserLinkBase(SQLModel):
#     from_user_id: str
#     to_user_id: str
#     relationship_type: UserLinkType
#
#
# class UserLink(UserLinkBase, table=True):
#     from_user_id: int = Field(default=None, primary_key=True, foreign_key="user.id")
#     to_user_id: int = Field(default=None, primary_key=True, foreign_key="user.id")
#     relationship_type: str
