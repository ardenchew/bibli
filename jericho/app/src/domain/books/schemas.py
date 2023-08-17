from sqlmodel import Field, SQLModel
from typing import Optional


class BookBase(SQLModel):
    title: str


class Book(BookBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    external_id: Optional[str] = None
    external_source: Optional[str] = None  # enum


class BookRead(BookBase):
    id: int
