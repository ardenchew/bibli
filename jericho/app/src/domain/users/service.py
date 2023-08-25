from sqlmodel import Session, select

from src.domain.users import schemas


def get_user(session: Session, user_id: int) -> schemas.User:
    return session.get(schemas.User, user_id)


def get_linked_users(session: Session, q: schemas.LinkedUsersFilter) -> list[schemas.User]:
    stmt = select(schemas.User)
    if q.parent_id is not None:
        stmt = stmt.join(
            schemas.User.parent_user_links).where(
            schemas.UserLink.parent_id == q.parent_id).where(
            schemas.UserLink.type == q.type
        )
    if q.child_id is not None:
        stmt = stmt.join(
            schemas.User.child_user_links).where(
            schemas.UserLink.child_id == q.child_id).where(
            schemas.UserLink.type == q.type
        )

    return session.exec(stmt).all()


def upsert_user(session: Session, user: schemas.User) -> schemas.User:
    # TODO(achew) add regex tag validation and gracefully handle tag collisions.
    user = session.merge(user)
    session.commit()
    session.refresh(user)
    return user


def delete_user(session: Session, user: schemas.User):
    session.delete(user)
    session.commit()
    return


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
    return
