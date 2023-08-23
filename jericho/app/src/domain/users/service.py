from sqlmodel import Session, select

from src.domain.users import schemas


def get_user(session: Session, user_id: int) -> schemas.User:
    # should this take a requesting user id as well (to display relationship?)
    statement = select(schemas.User).where(schemas.User.id == user_id)
    user = session.exec(statement).one()
    return user


# def get_linked_users(session: Session) -> list[schemas.User]:
#     pass


def put_user(session: Session, user: schemas.User) -> schemas.User:
    # if user.id is None:
    #     session.add(user)
    # else:
    #     db_user = get_user(session, user.id)
    #     print("user", user)
    #     print("db_user", db_user)
    #     for k, v in user.dict().items():
    #         setattr(db_user, k, v)
    #     session.add(db_user)
    print("user", user)
    session.add(user)
    session.commit()
    return user


def delete_user(session: Session, user_id: int):
    statement = select(schemas.User).where(schemas.User.tag == user_id)
    user = session.exec(statement).one()

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
