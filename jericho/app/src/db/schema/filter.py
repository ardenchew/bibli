from typing import Optional

from sqlmodel import SQLModel


class Filter(SQLModel):
    q: str
    offset: Optional[int] = None
    limit: Optional[int] = None
