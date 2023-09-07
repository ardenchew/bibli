from typing import List

from sqlmodel import Session, select

from src.domain import collections
from src.domain.users import schemas


def get_user(session: Session, user_id: int) -> schemas.User:
    return session.get(schemas.User, user_id)


def get_linked_users(
        session: Session,
        users_filter: schemas.LinkedUsersFilter,
) -> List[schemas.User]:
    stmt = select(schemas.User)
    if users_filter.parent_id is not None:
        stmt = stmt.join(
            schemas.User.parent_user_links).where(
            schemas.UserLink.parent_id == users_filter.parent_id).where(
            schemas.UserLink.type == users_filter.type
        )
    if users_filter.child_id is not None:
        stmt = stmt.join(
            schemas.User.child_user_links).where(
            schemas.UserLink.child_id == users_filter.child_id).where(
            schemas.UserLink.type == users_filter.type
        )

    return session.exec(stmt).all()


def upsert_user(session: Session, user: schemas.User) -> schemas.User:
    new_user = user.id is None
    # TODO(arden) add regex tag validation and gracefully handle tag collisions.
    user = session.merge(user)
    if new_user:
        collections.utils.insert_default_collections(session, user.id)
    session.commit()
    session.refresh(user)
    return user


def delete_user(session: Session, user: schemas.User):
    # TODO(arden) on delete cascade.
    session.delete(user)
    session.commit()


def get_user_link(session: Session, parent_user_id: int, child_user_id: int) -> schemas.UserLink:
    stmt = select(schemas.UserLink).where(
        schemas.UserLink.parent_id == parent_user_id,
        schemas.UserLink.child_id == child_user_id,
    )
    return session.exec(stmt).one()


def upsert_user_link(session: Session, user_link: schemas.UserLink) -> schemas.UserLink:
    session.merge(user_link)
    session.commit()
    return user_link


def delete_user_link(session: Session, user_link: schemas.UserLink):
    session.delete(user_link)
    session.commit()
