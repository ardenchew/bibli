from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session

from resources.strings import NOT_FOUND_ERROR
from src.database import get_session
from src.domain.users import service, schemas

user_router = APIRouter(
    prefix="/user",
    tags=["users"],
    responses={404: {"descriptions": NOT_FOUND_ERROR}}
)


@user_router.get("/{user_id}", response_model=schemas.User)
async def get_user(user_id: int, session: Session = Depends(get_session)):
    user = service.get_user(session, user_id)
    if not user:
        raise HTTPException(status_code=404, detail=NOT_FOUND_ERROR)
    return user


@user_router.put("/", response_model=schemas.User)
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
