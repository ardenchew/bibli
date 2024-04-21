from datetime import datetime
from typing import List, Optional

from fastapi import APIRouter, Depends, Request, UploadFile, File
from sqlmodel import Session
from pathlib import Path

import src.db.schema as schema
from resources.exceptions import NotFoundException
from src.auth.middleware import auth0_middleware
from src.database import get_session
from src.domain.service import users
from src.routers.authorization import authorize_request_user_action

user_router = APIRouter(
    prefix="/user",
    tags=["users"],
    responses={
        NotFoundException.status_code: {"description": NotFoundException.detail}
    },
    dependencies=[Depends(auth0_middleware)],
)


@user_router.get("/search/{q}", response_model=schema.users.UserPage)
async def search_users(
        request: Request,
        q: str,
        session: Session = Depends(get_session),
        offset: Optional[int] = None,
        limit: Optional[int] = None,
):
    f = schema.filter.Filter(
        q=q,
        offset=offset,
        limit=limit,
    )

    # TODO authorization.
    return users.search_users(session, f, request.state.user.id)



# TODO consider the collision of current against user_id below.
@user_router.get("/current", response_model=schema.users.UserRead)
async def get_user(
    request: Request,
    session: Session = Depends(get_session),
):
    if request.state.user.id:
        user = users.get_user(session, request.state.user.id)
        if user:
            return user
    # Initialize user with sub if no user found. This is lazy.
    return users.upsert_user(session, schema.users.User(sub=request.state.user.sub))


@user_router.get("/{user_id}", response_model=schema.users.UserRead)
async def get_user_by_id(
    request: Request,
    user_id: int,
    session: Session = Depends(get_session),
):
    user = users.get_user(session, user_id)
    if not user:
        raise NotFoundException
    user_read = users.add_current_user_links(session, [user], request.state.user.id)
    return user_read[0]


@user_router.get("/tag/{tag}", response_model=schema.users.UserRead)
async def get_user_by_tag(
    request: Request,
    tag: str,
    session: Session = Depends(get_session),
):
    user = users.get_user_by_tag(session, tag)
    if not user:
        raise NotFoundException
    user_read = users.add_current_user_links(session, [user], request.state.user.id)
    return user_read[0]


@user_router.put("", response_model=schema.users.UserRead)
async def put_user(
    request: Request,
    user: schema.users.UserPut,
    session: Session = Depends(get_session),
):
    # Clean this up to handle errors.
    authorize_request_user_action(request, user.id)

    # Create translation layer.
    # Check that this doesn't erase foreign relationships.
    db_user = users.get_user(session, user.id)
    db_user.name = user.name
    db_user.tag = user.tag
    db_user.bio = user.bio

    return users.upsert_user(session, db_user)


@user_router.delete("/{user_id}")
async def delete_user(
    request: Request,
    user_id: int,
    session: Session = Depends(get_session),
):
    # Clean this up to handle errors.
    authorize_request_user_action(request, user_id)

    user = users.get_user(session, user_id)
    if not user:
        raise NotFoundException
    users.delete_user(session, user)
    return


@user_router.get("/validate/tag", response_model=schema.users.TagValidation)
async def validate_tag(
    tag: str,
    session: Session = Depends(get_session),
):
    return users.validate_new_tag(session, tag)


users_router = APIRouter(
    prefix="/users",
    tags=["users"],
    responses={
        NotFoundException.status_code: {"description": NotFoundException.detail}
    },
    dependencies=[Depends(auth0_middleware)],
)


@user_router.post("/feedback", response_model=schema.users.FeedbackRead)
async def post_feedback(
    feedback: schema.users.FeedbackWrite,
    session: Session = Depends(get_session),
):
    return users.insert_feedback(session, feedback)


@user_router.put("/avatar/{user_id}", response_model=str)
async def put_avatar(
        user_id: int,
        file: UploadFile = File(...),
        session: Session = Depends(get_session),
):
    return users.upsert_avatar(session, user_id, file)


@users_router.get("/linked", response_model=List[schema.users.UserRead])
async def get_linked_users(
    request: Request,
    users_filter: schema.users.LinkedUsersFilter = Depends(),
    session: Session = Depends(get_session),
):
    us = users.get_linked_users(session, users_filter)
    return users.add_current_user_links(session, us, request.state.user.id)


@users_router.put("/link", response_model=schema.users.UserLinkRead)
async def put_user_link(
    user_link: schema.users.UserLinkPut, session: Session = Depends(get_session)
):
    db_user_link = schema.users.UserLink.from_orm(user_link)
    return users.upsert_user_link(session, db_user_link)


@users_router.delete("/link/{parent_user_id}/{child_user_id}")
async def delete_user_link(
    parent_user_id: int,
    child_user_id: int,
    session: Session = Depends(get_session),
):
    user_link = users.get_user_link(session, parent_user_id, child_user_id)
    if not user_link:
        raise NotFoundException
    users.delete_user_link(session, user_link)
    return
