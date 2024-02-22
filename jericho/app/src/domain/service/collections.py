from typing import List

from sqlmodel import Session, select

import src.db.schema as schema


def _generate_query_statement(
    collections_filter: schema.collections.CollectionsFilter,
    limit: int = None,
):
    stmt = select(schema.collections.Collection)
    if collections_filter.user_id is not None:
        stmt = stmt.join(
            schema.collections.CollectionUserLink,
            (schema.collections.Collection.id == schema.collections.CollectionUserLink.collection_id),
        ).where(
            schema.collections.CollectionUserLink.user_id == collections_filter.user_id
        )
    if collections_filter.type is not None:
        stmt = stmt.where(schema.collections.Collection.type == collections_filter.type)
    if limit:
        stmt = stmt.limit(limit)
    return stmt


def get_collection(
    session: Session,
    collection_id: int,
) -> schema.collections.Collection:
    return session.get(schema.collections.Collection, collection_id)


def get_collections(
    session: Session,
    collections_filter: schema.collections.CollectionsFilter,
) -> List[schema.collections.Collection]:
    stmt = _generate_query_statement(collections_filter)
    return session.exec(stmt).all()


def upsert_collection(
    session: Session,
    collection: schema.collections.Collection,
) -> schema.collections.Collection:
    collection = session.merge(collection)
    session.commit()
    session.refresh(collection)
    return collection


def delete_collection(
    session: Session,
    collection: schema.collections.Collection,
):
    session.delete(collection)  # TODO(arden) sqlalchemy cascade on delete.
    session.commit()


def get_collection_book_link(
    session: Session,
    collection_id: int,
    book_id: int,
) -> schema.collections.CollectionBookLink:
    stmt = (
        select(schema.collections.CollectionBookLink)
        .where(
            schema.collections.CollectionBookLink.collection_id == collection_id,
        )
        .where(
            schema.collections.CollectionBookLink.book_id == book_id,
        )
    )
    return session.exec(stmt).one()


def insert_collection_book_link(
    session: Session,
    link: schema.collections.CollectionBookLink,
) -> schema.collections.CollectionBookLink:
    session.add(link)
    session.commit()
    session.refresh(link)
    return link


def patch_collection_book_link(
    session: Session,
    current_link: schema.collections.CollectionBookLink,
    new_link: schema.collections.CollectionBookLink,
) -> schema.collections.CollectionBookLink:
    session.delete(current_link)
    session.add(new_link)
    session.commit()
    session.refresh(new_link)
    return new_link


def delete_collection_book_link(
    session: Session,
    link: schema.collections.CollectionBookLink,
):
    session.delete(link)
    session.commit()
