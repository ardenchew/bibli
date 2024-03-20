from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session

import src.db.schema as schema
from resources.exceptions import NotFoundException
from src.auth.middleware import auth0_middleware
from src.database import get_session
from src.domain.service import collections

# TODO(arden) header dependencies.
router = APIRouter(
    tags=["collections"],
    dependencies=[Depends(auth0_middleware)],
)


@router.get(
    "/collection/{collection_id}",
    response_model=schema.collections.CollectionRead,
)
async def get_collection(
    collection_id: int,
    session: Session = Depends(get_session),
):
    collection = collections.get_collection(session, collection_id)
    if not collection:
        raise NotFoundException
    return collection


@router.get("/collections", response_model=List[schema.collections.CollectionRead])
async def get_collections(
    collection_filter: schema.collections.CollectionsFilter = Depends(),
    session: Session = Depends(get_session),
):
    return collections.get_collections(session, collection_filter)


@router.get("/collection/user/link/{collection_id}/{user_id}", response_model=Optional[schema.collections.CollectionUserLinkRead])
async def get_collection_user_link(
        collection_id: int,
        user_id: int,
        session: Session = Depends(get_session),
):
    return collections.get_collection_user_link(session, collection_id, user_id)


@router.put("/collection/user/link", response_model=schema.collections.CollectionUserLinkRead)
async def put_collection_user_link(
        link: schema.collections.CollectionUserLinkPut,
        session: Session = Depends(get_session),
):
    db_link = schema.collections.CollectionUserLink.from_orm(link)
    print("DB LINK", db_link)
    return collections.upsert_collection_user_link(session, db_link)


@router.delete("/collection/user/link/{collection_id}/{user_id}")
async def delete_collection_user_link(
        collection_id: int,
        user_id: int,
        session: Session = Depends(get_session),
):
    collections.delete_collection_user_link(session, collection_id, user_id)
    return


@router.put("/collection", response_model=schema.collections.CollectionRead)
async def put_collection(
    collection: schema.collections.CollectionPut,
    session: Session = Depends(get_session),
):
    db_collection = schema.collections.Collection.from_orm(collection)
    return collections.upsert_collection(session, db_collection)


@router.delete("/collection/{collection_id}")
async def delete_collection(
    collection_id: int,
    session: Session = Depends(get_session),
):
    collection = session.get(schema.collections.Collection, collection_id)
    if not collection:
        raise NotFoundException
    collections.delete_collection(session, collection)
    return


@router.post(
    "/collection_book_link",
    response_model=schema.collections.CollectionBookLink,
)
async def post_collection_book_link(
    link: schema.collections.CollectionBookLink, session: Session = Depends(get_session)
):
    db_link = schema.collections.CollectionBookLink.from_orm(link)
    return collections.insert_collection_book_link(session, db_link)


@router.patch(
    "/collection_book_link",
    response_model=schema.collections.CollectionBookLink,
)
async def patch_collection_book_link(
    current_link: schema.collections.CollectionBookLink,
    new_link: schema.collections.CollectionBookLink,
    session: Session = Depends(get_session),
):
    db_current_link = collections.get_collection_book_link(
        session, current_link.collection_id, current_link.book_id
    )
    db_new_link = schema.collections.CollectionBookLink.from_orm(new_link)
    return collections.patch_collection_book_link(
        session,
        db_current_link,
        db_new_link,
    )


@router.delete("/collection_book_link")
async def delete_collection_book_link(
    link: schema.collections.CollectionBookLink,
    session: Session = Depends(get_session),
):
    db_link = collections.get_collection_book_link(
        session, link.collection_id, link.book_id
    )
    collections.delete_collection_book_link(session, db_link)
    return
