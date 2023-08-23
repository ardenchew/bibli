from fastapi.testclient import TestClient
from sqlmodel import Session


def test_get_book(client: TestClient, session: Session):
    from src.domain.books import schemas, service

    book = service.create_book(session, schemas.Book(title="Demon Copperhead"))

    response = client.get(f"/books/{book.id}")
    data = response.json()

    assert response.status_code == 200
    assert data["id"] == book.id
    assert data["title"] == book.title

    response = client.get(f"/books/{book.id + 1}")
    data = response.json()

    assert response.status_code == 404
    assert data["detail"] == "book not found"


def test_crud_user(client: TestClient, session: Session):
    from src.domain.users import schemas

    user = schemas.User(
        name="Archer",
        tag="archer_the_good_boi",
        info="A waggin\' doggo that loves Emily Dickinson and Clifford."
    )

    response = client.get(f"/user/1")
    data = response.json()

    assert response.status_code == 404
    assert data["detail"] == "user not found"

    response = client.put("/user/", json=user.dict())
    data = response.json()

    assert response.status_code == 200
    assert data["tag"] == user.tag
    assert data["name"] == user.name
    assert data["info"] == user.info
    assert data["id"] is not None

    user.id = data["id"]
    user.tag = None

    response = client.put("/user/", json=user.dict())

    assert response.status_code == 422

    user.tag = "archer_the_naughty_boi"

    response = client.put("/user/", json=user.dict())
    data = response.json()

    assert response.status_code == 200
    assert data["tag"] == user.tag



    # response = client.get(f"/users/{user.tag}")
    # data = response.json()
    #
    # assert response.status_code == 200
    # assert data["id"] == user.id
    # assert data["tag"] == user.tag
    # assert data["name"] == user.name
    # assert data["info"] == user.info
    #
    # response = client.get(f"/users/clifford")
    # data = response.json()
    #
    # assert response.status_code == 404
    # assert data["detail"] == "user not found"


