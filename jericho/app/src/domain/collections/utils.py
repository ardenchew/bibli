from sqlmodel import Session, select

from src.domain.collections.schemas import (DEFAULT_COLLECTION_TO_NAME,
                                            Collection, CollectionsFilter)
from src.domain.users.schemas import User


def generate_query_statement(
    collections_filter: CollectionsFilter,
    limit: int = None,
):
    stmt = select(Collection)
    if collections_filter.user_id is not None:
        stmt = stmt.where(Collection.user_id == collections_filter.user_id)
    if collections_filter.type is not None:
        stmt = stmt.where(Collection.type == collections_filter.type)
    if limit:
        stmt = stmt.limit(limit)
    return stmt


def insert_default_collections(
    session: Session,
    user: User,
):
    for default_type, default_type_name in DEFAULT_COLLECTION_TO_NAME.items():
        collection = Collection(
            name=default_type_name,
            type=default_type,
            user=user,
        )
        session.add(collection)
