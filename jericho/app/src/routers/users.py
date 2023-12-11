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


# TODO consider the collision of current against user_id below.
@user_router.get("/current", response_model=schemas.UserRead)
async def get_user(
        request: Request,
        session: Session = Depends(get_session),
):
    print("request", request.state.user.sub)
    if request.state.user.id:
        user = service.get_user(session, request.state.user.id)
        if user:
            return user
    raise NotFoundException


@user_router.get("/{user_id}", response_model=schemas.UserRead)
async def get_user_by_id(
    user_id: int,
    session: Session = Depends(get_session),
):
    user = service.get_user(session, user_id)
    if not user:
        raise NotFoundException
    return user


@user_router.get("/tag/{tag}", response_model=schemas.UserRead)
async def get_user_by_tag(
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
    # Clean this up to handle errors.
    authorize_request_user_action(request, user.id)

    # Create translation layer.
    # Check that this doesn't erase foreign relationships.
    db_user = schemas.User(
        sub=request.state.user.sub,
        id=user.id,
        name=user.name,
        tag=user.tag,
    )
    return service.upsert_user(session, db_user)


@user_router.delete("/{user_id}")
async def delete_user(
    request: Request,
    user_id: int,
    session: Session = Depends(get_session),
):
    # Clean this up to handle errors.
    authorize_request_user_action(request, user_id)

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
