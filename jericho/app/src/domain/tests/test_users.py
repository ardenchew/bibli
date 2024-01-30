from sqlmodel import Session

import src.db.schema as schema
from src.domain.service import users


def test_crud_user(session: Session):
    user = users.get_user(session, 1)
    assert user is None

    user_input = schema.users.User(
        name="Archer",
        tag="archer_the_good_boi",
        info="A waggin' doggo that loves Emily Dickinson and Clifford.",
    )

    user = users.upsert_user(session, user_input)
    assert user.id is not None

    user = users.get_user(session, user.id)
    assert user is not None
    assert user.tag == user_input.tag

    user.tag = "archer_the_naughty_boi"
    user = users.upsert_user(session, user)
    assert user is not None
    user = users.get_user(session, user.id)
    assert user is not None
    assert user.tag != user_input.tag

    users.delete_user(session, user)
    user = users.get_user(session, user.id)
    assert user is None


def test_crud_user_link(session: Session):
    user1 = schema.users.User(tag="first", name="first")
    user1 = users.upsert_user(session, user1)

    user2 = schema.users.User(tag="second", name="second")
    user2 = users.upsert_user(session, user2)

    link_input = schema.users.UserLink(
        parent_id=user1.id,
        child_id=user2.id,
        type=schema.users.UserLinkType.FOLLOW,
    )

    link = users.upsert_user_link(session, link_input)
    assert link.parent_id == link_input.parent_id
    assert link.child_id == link_input.child_id
    assert link.type == link_input.type

    user_filter = schema.users.LinkedUsersFilter(
        parent_id=link_input.parent_id,
        type=link_input.type,
    )

    user_list = users.get_linked_users(session, user_filter)
    assert user_list is not None
    assert len(user_list) == 1
    assert user_list[0].id == user2.id
    assert user_list[0].tag == user2.tag
    assert user_list[0].name == user2.name

    link = user_list.get_user_link(session, user1.id, user2.id)
    assert link is not None

    users.delete_user_link(session, link)
    user_list = users.get_linked_users(session, user_filter)
    assert len(user_list) == 0
