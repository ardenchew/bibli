from enum import Enum
from sqlmodel import Field, SQLModel
from typing import Optional


class UserBase(SQLModel):
    tag: str
    name: str
    info: Optional[str] = None


class User(UserBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    tag: str = Field(default=None, unique=True, index=True)


class RelationshipType(str, Enum):
    FOLLOW = 'follow'
    BLOCK = 'block'


class UserRelationshipBase(SQLModel):
    from_user_id: str
    to_user_id: str
    relationship_type: RelationshipType


class UserRelationship(UserRelationshipBase, table=True):
    from_user_id: str = Field(default=None, primary_key=True, foreign_key="user.id")
    to_user_id: str = Field(default=None, primary_key=True, foreign_key="user.id")
    relationship_type: str
