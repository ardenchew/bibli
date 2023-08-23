from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.exc import NoResultFound
from sqlmodel import Session

from src.database import get_session
from src.domain.users import service, schemas

user_router = APIRouter(
    prefix="/user",
    tags=["users"],
)


@user_router.get("/{user_id}", response_model=schemas.User)
async def get_user(user_id: int, session: Session = Depends(get_session)):
    try:
        user = service.get_user(session, user_id)
    except NoResultFound:
        raise HTTPException(status_code=404, detail="user not found")
    return user


@user_router.put("/", response_model=schemas.User)
async def put_user(user: schemas.UserPut, session: Session = Depends(get_session)):
    db_user = schemas.User.from_orm(user)
    db_user = service.put_user(session, db_user)
    return db_user


@user_router.delete("/{user_tag}")
async def delete_user(user_id: int, session: Session = Depends(get_session)):
    try:
        service.delete_user(session, user_id)
    except NoResultFound:
        raise HTTPException(status_code=404, detail="user not found")
    return
