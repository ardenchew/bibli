from collections import namedtuple
from enum import Enum
from typing import Optional

from sqlmodel import Field, SQLModel


class Reaction(str, Enum):
    POSITIVE = "positive"
    NEGATIVE = "negative"
    NEUTRAL = "neutral"


Interval = namedtuple("Interval", ["low", "high"])


REACTION_INTERVAL = {
    Reaction.NEGATIVE: Interval(0.0, 10.0 / 3),
    Reaction.NEUTRAL: Interval(10.0 / 3, 20.0 / 3),
    Reaction.POSITIVE: Interval(20.0 / 3, 10.0),
}


class Comparison(SQLModel):
    less_than_id: Optional[int] = None
    equal_to_id: Optional[int] = None
    greater_than_id: Optional[int] = None


class ReviewBase(SQLModel):
    user_id: int = Field(foreign_key="user.id")
    book_id: int = Field(foreign_key="book.id")
    notes: Optional[str] = None


class Review(ReviewBase, table=True):
    id: int = Field(default=None, primary_key=True)
    rating: float = Field(default=None, index=True)
    hide_rank: bool = Field(default=False)
    rank: int = Field(default=None)
    reaction: str


class ReviewRead(ReviewBase):
    id: Optional[int]
    rating: float
    reaction: Reaction
    hide_rank: bool
    rank: int
    # Include book object for comparison searching here.


class ReviewPut(ReviewBase):
    reaction: Reaction
    comparison: Comparison


class ComparisonReviews(SQLModel):
    less_than: Optional[Review]
    equal_to: Optional[Review]
    greater_than: Optional[Review]


class ReviewsFilter(SQLModel):
    book_id: Optional[int] = None
    user_id: Optional[int] = None
