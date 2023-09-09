from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session

from resources.strings import NOT_FOUND_ERROR
from src.database import get_session
from src.domain.collections import schemas, service

# TODO(arden) header dependencies.
router = APIRouter(
    tags=["collections"],
)


@router.get(
    "/collection/{collection_id}",
    response_model=schemas.CollectionRead,
)
async def get_collection(
    collection_id: int,
    session: Session = Depends(get_session),
):
    collection = service.get_collection(session, collection_id)
    if not collection:
        raise HTTPException(status_code=404, detail=NOT_FOUND_ERROR)
    return collection


@router.get("/collections", response_model=List[schemas.CollectionRead])
async def get_collections(
    collection_filter: schemas.CollectionsFilter = Depends(),
    session: Session = Depends(get_session),
):
    return service.get_collections(session, collection_filter)


@router.put("/collection", response_model=schemas.CollectionRead)
async def put_collection(
    collection: schemas.CollectionPut,
    session: Session = Depends(get_session),
):
    db_collection = schemas.Collection.from_orm(collection)
    return service.upsert_collection(session, db_collection)


@router.delete("/collection/{collection_id}")
async def delete_collection(
    collection_id: int,
    session: Session = Depends(get_session),
):
    collection = service.get_collection(session, collection_id)
    if not collection:
        raise HTTPException(status_code=404, detail=NOT_FOUND_ERROR)
    service.delete_collection(session, collection)
    return


@router.post(
    "/collection_book_link",
    response_model=schemas.CollectionBookLink,
)
async def post_collection_book_link(
    link: schemas.CollectionBookLink, session: Session = Depends(get_session)
):
    db_link = schemas.CollectionBookLink.from_orm(link)
    return service.insert_collection_book_link(session, db_link)


@router.patch(
    "/collection_book_link",
    response_model=schemas.CollectionBookLink,
)
async def patch_collection_book_link(
    current_link: schemas.CollectionBookLink,
    new_link: schemas.CollectionBookLink,
    session: Session = Depends(get_session),
):
    db_current_link = service.get_collection_book_link(
        session, current_link.collection_id, current_link.book_id
    )
    db_new_link = schemas.CollectionBookLink.from_orm(new_link)
    return service.patch_collection_book_link(
        session,
        db_current_link,
        db_new_link,
    )


@router.delete("/collection_book_link")
async def delete_collection_book_link(
    link: schemas.CollectionBookLink,
    session: Session = Depends(get_session),
):
    db_link = service.get_collection_book_link(
        session, link.collection_id, link.book_id
    )
    service.delete_collection_book_link(session, db_link)
    return
