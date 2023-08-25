from sqlmodel import Session

from src.domain.users import schemas, service


def test_crud_user(session: Session):
    user = service.get_user(session, 1)
    assert user is None

    user_input = schemas.User(
        name="Archer",
        tag="archer_the_good_boi",
        info="A waggin\' doggo that loves Emily Dickinson and Clifford."
    )

    user = service.upsert_user(session, user_input)
    assert user.id is not None

    user = service.get_user(session, user.id)
    assert user is not None
    assert user.tag == user_input.tag

    user.tag = "archer_the_naughty_boi"
    user = service.upsert_user(session, user)
    assert user is not None
    user = service.get_user(session, user.id)
    assert user is not None
    assert user.tag != user_input.tag

    service.delete_user(session, user)
    user = service.get_user(session, user.id)
    assert user is None


def test_crud_user_link(session: Session):
    user1 = schemas.User(tag="first", name="first")
    user1 = service.upsert_user(session, user1)

    user2 = schemas.User(tag="second", name="second")
    user2 = service.upsert_user(session, user2)

    link_input = schemas.UserLink(
        parent_id=user1.id,
        child_id=user2.id,
        type=schemas.UserLinkType.FOLLOW,
    )

    link = service.upsert_user_link(session, link_input)
    assert link.parent_id == link_input.parent_id
    assert link.child_id == link_input.child_id
    assert link.type == link_input.type

    q = schemas.LinkedUsersFilter(
        parent_id=link_input.parent_id,
        type=link_input.type,
    )

    users = service.get_linked_users(session, q)
    assert users is not None
    assert len(users) == 1
    assert users[0].id == user2.id
    assert users[0].tag == user2.tag
    assert users[0].name == user2.name

    link = service.get_user_link(session, user1.id, user2.id)
    assert link is not None

    service.delete_user_link(session, link)
    users = service.get_linked_users(session, q)
    assert len(users) == 0
