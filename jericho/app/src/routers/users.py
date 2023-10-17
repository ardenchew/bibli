from typing import List

from fastapi import APIRouter, Depends, Request
from sqlmodel import Session

from resources.exceptions import NotFoundException
from src.routers.authorization import authorize_request_user_action
from src.auth.middleware import auth0_middleware
from src.database import get_session
from src.domain.users import schemas, service


user_router = APIRouter(
    prefix="/user",
    tags=["users"],
    responses={NotFoundException.status_code: {"description": NotFoundException.detail}},
    dependencies=[Depends(auth0_middleware)],
)


@user_router.get("/{tag}", response_model=schemas.UserRead)
async def get_user(
    tag: str,
    session: Session = Depends(get_session),
):
    user = service.get_user_by_tag(session, tag)
    if not user:
        raise NotFoundException
    return user


@user_router.put("", response_model=schemas.UserRead)
async def put_user(
    request: Request,
    user: schemas.UserPut,
    session: Session = Depends(get_session),
):
    print("request", request.state.user.tag)
    print("userput", user)
    # Clean this up to handle errors.
    if request.state.user.tag and user.tag:
        authorize_request_user_action(request, user.tag)

    # Create translation layer.
    # Check that this doesn't erase foreign relationships.
    # Given tight relationship between API and db models consider sub to id linkage table.
    db_user = schemas.User(
        name=user.name,
        tag=user.tag,
        sub=request.state.user.sub
    )
    return service.upsert_user(session, db_user)


@user_router.delete("/{user_id}")
async def delete_user(user_id: int, session: Session = Depends(get_session)):
    user = service.get_user(session, user_id)
    if not user:
        raise NotFoundException
    service.delete_user(session, user)
    return


users_router = APIRouter(
    prefix="/users",
    tags=["users"],
    responses={NotFoundException.status_code: {"description": NotFoundException.detail}},
    dependencies=[Depends(auth0_middleware)],
)


@users_router.get("/linked", response_model=List[schemas.UserRead])
async def get_linked_users(
    users_filter: schemas.LinkedUsersFilter = Depends(),
    session: Session = Depends(get_session),
):
    return service.get_linked_users(session, users_filter)


@users_router.put("/link", response_model=schemas.UserLinkRead)
async def put_user_link(
    user_link: schemas.UserLinkPut, session: Session = Depends(get_session)
):
    db_user_link = schemas.UserLink.from_orm(user_link)
    return service.upsert_user_link(session, db_user_link)


@users_router.delete("/link/{parent_user_id}/{child_user_id}")
async def delete_user_link(
    parent_user_id: int,
    child_user_id: int,
    session: Session = Depends(get_session),
):
    user_link = service.get_user_link(session, parent_user_id, child_user_id)
    if not user_link:
        raise NotFoundException
    service.delete_user_link(session, user_link)
    return
