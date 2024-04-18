import re
from typing import List

from python_usernames import is_safe_username
from sqlalchemy import func
from sqlmodel import Session, select, col

import src.db.schema as schema
from resources.exceptions import InvalidArgumentException

DEFAULT_PAGE_LIMIT = 10
MAXIMUM_PATE_LIMIT = 100


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
        )
        session.add(collection)
        collection_user_link = schema.collections.CollectionUserLink(
            collection=collection,
            user=user,
            type=schema.collections.CollectionUserLinkType.OWNER,
        )
        session.add(collection_user_link)


def search_users(
        session: Session,
        f: schema.filter.Filter,
        user_id: int,
) -> schema.users.UserPage:
    _validate_filter(f)

    if not f.limit:
        f.limit = DEFAULT_PAGE_LIMIT
    if not f.offset:
        f.offset = 0

    count_query = select(func.count(schema.users.User.id)) \
        .where(col(schema.users.User.name).ilike(f"{f.q}%") |
                col(schema.users.User.tag).ilike(f"{f.q}%"))

    page = schema.users.UserPage(
        total_count=session.exec(count_query).one()
    )

    user_query = select(schema.users.User, schema.users.UserLink) \
        .join(schema.users.UserLink,
              (schema.users.User.id == schema.users.UserLink.child_id) &
              (schema.users.UserLink.parent_id == user_id),
              isouter=True) \
        .where(col(schema.users.User.name).ilike(f"{f.q}%") |
                col(schema.users.User.tag).ilike(f"{f.q}%")) \
        .order_by(col(schema.users.UserLink.type).asc(),
                  col(schema.users.User.tag).asc()) \
        .limit(f.limit) \
        .offset(f.offset)

    users = session.exec(user_query).all()

    for user, user_link in users:
        page_user = schema.users.UserRead(
            id=user.id,
            name=user.name,
            tag=user.tag,
        )
        if user_link:
            page_user.link = user_link.type

        page.users.append(page_user)

    return page


def _validate_filter(
        f: schema.filter.Filter,
):
    if f.limit and f.limit > MAXIMUM_PATE_LIMIT:
        raise InvalidArgumentException


def get_user(session: Session, user_id: int) -> schema.users.User:
    return session.get(schema.users.User, user_id)


def add_current_user_links(session: Session, users: List[schema.users.User], user_id: int) -> List[schema.users.UserRead]:
    # Fetch all relevant UserLink records in a single query
    user_links = (
        session.query(schema.users.UserLink)
        .filter(schema.users.UserLink.parent_id == user_id, col(schema.users.UserLink.child_id).in_([user.id for user in users]))
        .all()
    )

    # Create a dictionary to store user links by child_id
    user_links_dict = {(link.child_id, link.parent_id): link for link in user_links}

    # Iterate through the users and match the links
    user_read_list = []
    for user in users:
        user_read = schema.users.UserRead.from_orm(user)
        user_link = user_links_dict.get((user.id, user_id))
        if user_link:
            user_read.link = schema.users.UserLinkType(user_link.type)
        else:
            user_read.link = None
        user_read_list.append(user_read)

    return user_read_list


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

    # TODO doesn't safeguard against no user filter provided.
    return session.exec(stmt).all()


def upsert_user(
        session: Session,
        user: schema.users.User,
) -> schema.users.User:
    new_user = user.id is None
    print(new_user)

    if user.tag:
        if not validate_tag(user.tag).valid:
            print(validate_tag(user.tag).warning)
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


tag_length_minimum = 2

TAG_WARNING_UNSAFE = "Username does not meet community standards."
TAG_WARNING_CHAR = "Username may only use a-z and 0-9."
TAG_WARNING_DUPLICATE = "Username is already taken."
TAG_WARNING_LENGTH = f"Username is too short."


def validate_tag(tag: str) -> schema.users.TagValidation:
    if tag == "":
        return schema.users.TagValidation(
            valid=False,
            warning="",
        )

    if len(tag) < tag_length_minimum:
        return schema.users.TagValidation(
            valid=False,
            warning=TAG_WARNING_LENGTH,
        )

    tag_regex = "^[a-z0-9-_]+$"
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


def insert_feedback(
    session: Session,
    feedback: schema.users.FeedbackWrite,
) -> schema.users.FeedbackRead:
    db_feedback = schema.users.Feedback.from_orm(feedback)
    session.add(db_feedback)
    session.commit()
    return schema.users.FeedbackRead.from_orm(db_feedback)
