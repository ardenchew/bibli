import re
from typing import List

from python_usernames import is_safe_username
from sqlalchemy import func
from sqlmodel import Session, select

import src.db.schema as schema
from resources.exceptions import InvalidArgumentException


def _insert_default_collections(
    session: Session,
    user: schema.users.User,
):
    for (
        default_type,
        default_type_name,
    ) in schema.collections.DEFAULT_COLLECTION_TO_NAME.items():
        collection = schema.collections.Collection(
            name=default_type_name,
            type=default_type,
            user=user,
        )
        session.add(collection)


def get_user(session: Session, user_id: int) -> schema.users.User:
    return session.get(schema.users.User, user_id)


def get_user_by_tag(session: Session, tag: str) -> schema.users.User:
    stmt = select(schema.users.User).where(schema.users.User.tag == tag)
    return session.exec(stmt).first()


def get_linked_users(
    session: Session,
    users_filter: schema.users.LinkedUsersFilter,
) -> List[schema.users.User]:
    stmt = select(schema.users.User)
    if users_filter.parent_id is not None:
        stmt = (
            stmt.join(schema.users.User.parent_user_links)
            .where(schema.users.UserLink.parent_id == users_filter.parent_id)
            .where(schema.users.UserLink.type == users_filter.type)
        )
    if users_filter.child_id is not None:
        stmt = (
            stmt.join(schema.users.User.child_user_links)
            .where(schema.users.UserLink.child_id == users_filter.child_id)
            .where(schema.users.UserLink.type == users_filter.type)
        )

    return session.exec(stmt).all()


def upsert_user(
    session: Session,
    user: schema.users.User,
) -> schema.users.User:
    new_user = user.id is None

    if user.tag:
        if not validate_tag(user.tag).valid:
            return InvalidArgumentException

    user = session.merge(user)
    if new_user:
        _insert_default_collections(session, user)
    session.commit()
    session.refresh(user)
    return user


def delete_user(session: Session, user: schema.users.User):
    # TODO(arden) on delete cascade.
    session.delete(user)
    session.commit()


def get_user_link(
    session: Session, parent_user_id: int, child_user_id: int
) -> schema.users.UserLink:
    stmt = select(schema.users.UserLink).where(
        schema.users.UserLink.parent_id == parent_user_id,
        schema.users.UserLink.child_id == child_user_id,
    )
    return session.exec(stmt).one()


def upsert_user_link(
    session: Session,
    user_link: schema.users.UserLink,
) -> schema.users.UserLink:
    session.merge(user_link)
    session.commit()
    return user_link


def delete_user_link(session: Session, user_link: schema.users.UserLink):
    session.delete(user_link)
    session.commit()


TAG_WARNING_UNSAFE = "Username does not meet community standards."
TAG_WARNING_CHAR = "Username may only use a-z and 0-9."
TAG_WARNING_DUPLICATE = "Username is already taken."


def validate_tag(tag: str) -> schema.users.TagValidation:
    if tag == "":
        return schema.users.TagValidation(
            valid=False,
            warning="",
        )

    tag_regex = "^[a-z0-9]+$"
    if not re.search(tag_regex, tag):
        return schema.users.TagValidation(
            valid=False,
            warning=TAG_WARNING_CHAR,
        )

    if not is_safe_username(tag):
        return schema.users.TagValidation(
            valid=False,
            warning=TAG_WARNING_UNSAFE,
        )

    return schema.users.TagValidation(
        valid=True,
    )


def validate_new_tag(session: Session, tag: str) -> schema.users.TagValidation:
    valid_tag = validate_tag(tag)
    if not valid_tag.valid:
        return valid_tag

    stmt = select(func.count(schema.users.User.id)).where(schema.users.User.tag == tag)
    count = session.exec(stmt).one()

    if count != 0:
        return schema.users.TagValidation(
            valid=False,
            warning=TAG_WARNING_DUPLICATE,
        )

    return schema.users.TagValidation(
        valid=True,
    )
