from enum import Enum
from typing import Optional

from sqlmodel import Field, SQLModel


class Reaction(str, Enum):
    POSITIVE = 'positive'
    NEGATIVE = 'negative'
    NEUTRAL = 'neutral'


class ReviewBase(SQLModel):
    user_id: int = Field(default=None, primary_key=True, foreign_key="user.id")
    book_id: int = Field(default=None, primary_key=True, foreign_key="book.id")
    notes: Optional[str] = None


class Review(ReviewBase, table=True):
    rating: Optional[float] = None
    reaction: Optional[str] = None


class ReviewRead(ReviewBase):
    rating: Optional[float] = None
    reaction: Optional[Reaction] = None


class ReviewPut(ReviewBase):
    reaction: Optional[Reaction] = None


class ComparisonOperator(str, Enum):
    EQ = '='
    GT = '>'
    LT = '<'


class Comparison(SQLModel):
    left_id: int
    right_id: int
    operator: ComparisonOperator


class ReviewsFilter(SQLModel):
    book_id: Optional[int] = None
    user_id: Optional[int] = None
