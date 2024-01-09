import re
from typing import List

from python_usernames import is_safe_username
from sqlalchemy import func
from sqlmodel import Session, select

from src.domain import collections
from src.domain.users import schemas
from resources.exceptions import InvalidArgumentException


def get_user(session: Session, user_id: int) -> schemas.User:
    return session.get(schemas.User, user_id)


def get_user_by_tag(session: Session, tag: str) -> schemas.User:
    stmt = select(schemas.User).where(schemas.User.tag == tag)
    return session.exec(stmt).first()


def get_linked_users(
        session: Session,
        users_filter: schemas.LinkedUsersFilter,
) -> List[schemas.User]:
    stmt = select(schemas.User)
    if users_filter.parent_id is not None:
        stmt = (
            stmt.join(schemas.User.parent_user_links)
            .where(schemas.UserLink.parent_id == users_filter.parent_id)
            .where(schemas.UserLink.type == users_filter.type)
        )
    if users_filter.child_id is not None:
        stmt = (
            stmt.join(schemas.User.child_user_links)
            .where(schemas.UserLink.child_id == users_filter.child_id)
            .where(schemas.UserLink.type == users_filter.type)
        )

    return session.exec(stmt).all()


def upsert_user(
        session: Session,
        user: schemas.User,
) -> schemas.User:
    new_user = user.id is None

    if user.tag:
        if not validate_tag(user.tag).valid:
            return InvalidArgumentException

    user = session.merge(user)
    if new_user:
        collections.utils.insert_default_collections(session, user)
    session.commit()
    session.refresh(user)
    return user


def delete_user(session: Session, user: schemas.User):
    # TODO(arden) on delete cascade.
    session.delete(user)
    session.commit()


def get_user_link(
        session: Session, parent_user_id: int, child_user_id: int
) -> schemas.UserLink:
    stmt = select(schemas.UserLink).where(
        schemas.UserLink.parent_id == parent_user_id,
        schemas.UserLink.child_id == child_user_id,
    )
    return session.exec(stmt).one()


def upsert_user_link(
        session: Session,
        user_link: schemas.UserLink,
) -> schemas.UserLink:
    session.merge(user_link)
    session.commit()
    return user_link


def delete_user_link(session: Session, user_link: schemas.UserLink):
    session.delete(user_link)
    session.commit()


TAG_WARNING_UNSAFE = "Username does not meet community standards."
TAG_WARNING_CHAR = "Username may only use a-z and 0-9."
TAG_WARNING_DUPLICATE = "Username is already taken."


def validate_tag(tag: str) -> schemas.TagValidation:
    if tag == "":
        return schemas.TagValidation(
            valid=False,
            warning="",
        )

    tag_regex = "^[a-z0-9]+$"
    if not re.search(tag_regex, tag):
        return schemas.TagValidation(
            valid=False,
            warning=TAG_WARNING_CHAR,
        )

    if not is_safe_username(tag):
        return schemas.TagValidation(
            valid=False,
            warning=TAG_WARNING_UNSAFE,
        )

    return schemas.TagValidation(
        valid=True,
    )


def validate_new_tag(session: Session, tag: str) -> schemas.TagValidation:
    valid_tag = validate_tag(tag)
    if not valid_tag.valid:
        return valid_tag

    stmt = select(func.count(schemas.User.id)).where(schemas.User.tag == tag)
    count = session.exec(stmt).one()

    if count != 0:
        return schemas.TagValidation(
            valid=False,
            warning=TAG_WARNING_DUPLICATE,
        )

    return schemas.TagValidation(
        valid=True,
    )
