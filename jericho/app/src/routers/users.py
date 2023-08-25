from typing import List

from sqlmodel import Session
from fastapi import APIRouter, Depends, HTTPException

from resources.strings import NOT_FOUND_ERROR
from src.database import get_session
from src.domain.users import service, schemas

user_router = APIRouter(
    prefix="/user",
    tags=["users"],
    responses={404: {"descriptions": NOT_FOUND_ERROR}}
)


@user_router.get("/{user_id}", response_model=schemas.UserRead)
async def get_user(user_id: int, session: Session = Depends(get_session)):
    user = service.get_user(session, user_id)
    if not user:
        raise HTTPException(status_code=404, detail=NOT_FOUND_ERROR)
    return user


@user_router.put("", response_model=schemas.UserRead)
async def put_user(user: schemas.UserPut, session: Session = Depends(get_session)):
    db_user = schemas.User.from_orm(user)
    return service.upsert_user(session, db_user)


@user_router.delete("/{user_id}")
async def delete_user(user_id: int, session: Session = Depends(get_session)):
    user = service.get_user(session, user_id)
    if not user:
        raise HTTPException(status_code=404, detail=NOT_FOUND_ERROR)
    service.delete_user(session, user)
    return


users_router = APIRouter(
    prefix="/users",
    tags=["users"],
    responses={404: {"descriptions": NOT_FOUND_ERROR}}
)


@users_router.get("/linked", response_model=List[schemas.UserRead])
async def get_linked_users(
        users_filter: schemas.LinkedUsersFilter = Depends(),
        session: Session = Depends(get_session),
):
    return service.get_linked_users(session, users_filter)


@users_router.put("/link", response_model=schemas.UserLinkRead)
async def put_user_link(user_link: schemas.UserLinkPut, session: Session = Depends(get_session)):
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
        raise HTTPException(status_code=404, detail=NOT_FOUND_ERROR)
    service.delete_user_link(session, user_link)
    return
