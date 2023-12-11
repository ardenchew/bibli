from typing import Optional

from sqlmodel import Session, select

from src.domain.users import schemas


class RequestUser:
    def __init__(
            self,
            sub: str,
            id: Optional[int] = None,
    ):
        self.sub = sub
        self.id = id


def get_request_user_by_sub(session: Session, sub: str) -> RequestUser:
    request_user = RequestUser(sub=sub)

    stmt = select(schemas.User).where(schemas.User.sub == sub)
    user = session.exec(stmt).first()

    if user:
        inject_request_user(request_user, user)

    return request_user


def inject_request_user(
        request_user: RequestUser,
        user: schemas.User,
):
    request_user.id = user.id
