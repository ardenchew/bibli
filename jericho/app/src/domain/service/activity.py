from typing import List

from sqlmodel import col, Session, select
from sqlalchemy import func

import src.db.schema as schema

DEFAULT_PAGE_LIMIT = 25


def _get_follow_user_ids(
    session: Session,
    user_id: int,
) -> List[int]:
    stmt = select(
        schema.users.UserLink
    ).where(
        (schema.users.UserLink.parent_id == user_id) &
        (schema.users.UserLink.type == schema.users.UserLinkType.FOLLOW),
    )

    links = session.exec(stmt).all()
    return [link.child_id for link in links]


def _get_follow_collection_ids(
        session: Session,
        user_id: int,
) -> List[int]:
    stmt = select(
        schema.collections.CollectionUserLink
    ).where(
        (schema.collections.CollectionUserLink.user_id == user_id) &
        (schema.collections.CollectionUserLink.type == schema.collections.CollectionUserLinkType.FOLLOWER),
    )

    links = session.exec(stmt).all()
    return [link.collection_id for link in links]


def _get_linked_read_activity_model(
    activity: schema.activity.Activity,
    atc: schema.activity.AddToCollectionActivity,
    r: schema.activity.ReviewActivity,
    fu: schema.activity.FollowUserActivity,
) -> schema.activity.ActivityRead:
    activity_read = schema.activity.ActivityRead(
        id=activity.id,
        created_at=activity.created_at,
    )
    if atc:
        activity_read.add_to_collection = schema.activity.AddToCollectionActivityRead.from_orm(atc)
    if r:
        activity_read.review = schema.activity.ReviewActivityRead.from_orm(r)
    if fu:
        activity_read.follow_user = schema.activity.FollowUserActivityRead.from_orm(fu)
    if len(activity.reactions) > 0:
        activity_read.reactions = [schema.activity.ActivityReactionRead.from_orm(r) for r in activity.reactions]
    if len(activity.comments) > 0:
        comments = [schema.activity.ActivityCommentRead.from_orm(c) for c in activity.comments]
        comments.sort(key=lambda comment: comment.created_at, reverse=False)
        activity_read.comments = [schema.activity.ActivityCommentRead.from_orm(c) for c in activity.comments]

    return activity_read


def get_activities(
        session: Session,
        f: schema.activity.ActivityFilter,
) -> schema.activity.ActivityPage:
    stmt = select(
        schema.activity.Activity,
        schema.activity.AddToCollectionActivity,
        schema.activity.ReviewActivity,
        schema.activity.FollowUserActivity,
    ).join(
        schema.activity.AddToCollectionActivity,
        isouter=True,
    ).join(
        schema.activity.ReviewActivity,
        isouter=True,
    ).join(
        schema.activity.FollowUserActivity,
        isouter=True,
    )

    if f.cursor:
        stmt = stmt.where(
            (schema.activity.Activity.created_at < f.cursor.created_at) |
            ((schema.activity.Activity.created_at == f.cursor.created_at) &
             (schema.activity.Activity.id >= f.cursor.id)),
        )

    if f.following_user_id:
        user_ids = _get_follow_user_ids(session, f.following_user_id)
        collection_ids = _get_follow_collection_ids(session, f.following_user_id)
        stmt = stmt.where(
            col(schema.activity.AddToCollectionActivity.user_id).in_(user_ids) |
            col(schema.activity.AddToCollectionActivity.collection_id).in_(collection_ids) |
            col(schema.activity.ReviewActivity.user_id).in_(user_ids) |
            col(schema.activity.FollowUserActivity.follower_user_id).in_(user_ids) |
            col(schema.activity.FollowUserActivity.following_user_id).in_(user_ids),
        )

    if f.primary_user_id:
        stmt = stmt.where(
            (schema.activity.AddToCollectionActivity.user_id == f.primary_user_id) |
            (schema.activity.ReviewActivity.user_id == f.primary_user_id) |
            (schema.activity.FollowUserActivity.follower_user_id == f.primary_user_id),
        )

    if not f.limit:
        f.limit = DEFAULT_PAGE_LIMIT
    f.limit += 1  # for cursor

    stmt = stmt.limit(f.limit)

    stmt = stmt.order_by(
        col(schema.activity.Activity.created_at).desc(),
        col(schema.activity.Activity.id).asc(),
    )

    results = session.exec(stmt).all()
    activities_read = []
    for activity, atc, r, fu in results:
        activity_read = _get_linked_read_activity_model(activity, atc, r, fu)
        activities_read.append(activity_read)

    next_cursor = None
    if len(activities_read) == f.limit:
        cursor_activity = activities_read.pop()
        next_cursor = schema.activity.ActivityCursor(
            id=cursor_activity.id,
            created_at=cursor_activity.created_at,
        )

    return schema.activity.ActivityPage(
        next_cursor=next_cursor,
        activities=activities_read,
    )


def get_activity(
    session: Session,
    activity_id: int,
) -> schema.activity.ActivityRead:
    stmt = select(
        schema.activity.Activity,
        schema.activity.AddToCollectionActivity,
        schema.activity.ReviewActivity,
        schema.activity.FollowUserActivity,
    ).join(
        schema.activity.AddToCollectionActivity,
        isouter=True,
    ).join(
        schema.activity.ReviewActivity,
        isouter=True,
    ).join(
        schema.activity.FollowUserActivity,
        isouter=True,
    ).where(
        schema.activity.Activity.id == activity_id,
    )

    activity, atc, r, fu = session.exec(stmt).one()
    activity_read = _get_linked_read_activity_model(activity, atc, r, fu)

    return activity_read


def upsert_activity_comment(
    session: Session,
    comment: schema.activity.ActivityCommentWrite,
) -> schema.activity.ActivityCommentRead:
    db_comment = schema.activity.ActivityComment.from_orm(comment)
    db_comment = session.merge(db_comment)
    session.commit()
    session.refresh(db_comment)
    return schema.activity.ActivityCommentRead.from_orm(db_comment)


def delete_activity_comment(
    session: Session,
    comment_id: int,
):
    stmt = select(schema.activity.ActivityComment).where(schema.activity.ActivityComment.id == comment_id)
    comment = session.exec(stmt).one()
    session.delete(comment)
    session.commit()


def insert_activity_reaction(
        session: Session,
        reaction: schema.activity.ActivityReaction,
) -> schema.activity.ActivityReactionRead:
    session.add(reaction)
    session.commit()
    return schema.activity.ActivityReactionRead.from_orm(reaction)


def delete_activity_reaction(
        session: Session,
        reaction: schema.activity.ActivityReaction,
):
    stmt = select(schema.activity.ActivityReaction).where(
        (schema.activity.ActivityReaction.activity_id == reaction.activity_id) &
        (schema.activity.ActivityReaction.user_id == reaction.user_id),
    )
    reaction = session.exec(stmt).one()
    session.delete(reaction)
    session.commit()
