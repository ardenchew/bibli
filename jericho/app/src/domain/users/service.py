from sqlmodel import Session, select

from src.domain.users import schemas


def get_user(session: Session, user_tag: str) -> schemas.User:
    # should this take a requesting user id as well (to display relationship?)
    statement = select(schemas.User).where(schemas.User.tag == user_tag)
    user = session.exec(statement).one()
    return user


def get_users(session: Session) -> list[schemas.User]:
    pass


def put_user(session: Session, user: schemas.User) -> schemas.User:
    session.add(user)
    session.commit()
    return user


def delete_user(session: Session, user_tag: str):
    user = get_user(session, user_tag)
    session.delete(user)
    session.commit()
    pass


def upsert_user_relationship(session: Session, user_relationship: schemas.UserRelationship) -> schemas.UserRelationship:
    pass


def delete_user_relationship(session: Session, from_user_id: str, to_user_id: str):
    pass
