from sqlalchemy import func
from sqlmodel import Session, col, select

from src.domain.collections import schemas


def generate_query_statement(
        collections_filter: schemas.CollectionsFilter,
        limit: int = None,
        count: bool = False,
):
    stmt = select(schemas.Collection) if not count else select(func.count(schemas.Review.book_id))
    if collections_filter.user_id is not None:
        stmt = stmt.where(schemas.Collection.user_id == collections_filter.user_id)
    if collections_filter.type is not None:
        stmt = stmt.where(schemas.Collection.type == collections_filter.type)
    if limit:
        stmt = stmt.limit(limit)
    return stmt


def insert_default_collections(
        session: Session,
        user_id: int,
):
    for default_type, default_type_name in schemas.DEFAULT_COLLECTION_TO_NAME:
        collection = schemas.Collection(
            name=default_type_name,
            type=default_type,
            user_id=user_id,
        )
        session.add(collection)
