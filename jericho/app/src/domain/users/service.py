from sqlmodel import Session, select, update, insert

from src.domain.users import schemas


def get_user(session: Session, user_id: int) -> schemas.User:
    return session.get(schemas.User, user_id)


# def get_linked_users(session: Session) -> list[schemas.User]:
#     pass


def upsert_user(session: Session, user: schemas.User) -> schemas.User:
    user = session.merge(user)
    session.commit()
    session.refresh(user)
    return user


def delete_user(session: Session, user: schemas.User):
    session.delete(user)
    session.commit()
    return


# def put_user_link(session: Session, user_link: schemas.UserLink) -> schemas.UserLink:
#     session.add(user_link)
#     session.commit()
#     return user_link
#
#
# def delete_user_relationship(session: Session, from_user_id: int, to_user_id: int):
#     statement = select(schemas.UserLink).where(
#         schemas.UserLink.from_user_id == from_user_id,
#         schemas.UserLink.to_user_id == to_user_id,
#     )
#     user_link = session.exec(statement).one()
#
#     session.delete(user_link)
#     session.commit()
#     return
