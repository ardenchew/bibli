from typing import Optional


class RequestUser:
    def __init__(
        self,
        sub: str,
        tag: Optional[str] = None,
        id: Optional[int] = None,
     ):
        self.sub = sub
        self.tag = tag
        self.id = id
