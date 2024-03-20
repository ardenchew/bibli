from typing import List, Optional

from sqlmodel import Session, select, delete, col

import src.db.schema as schema
from resources.exceptions import InvalidArgumentException, NotFoundException


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
) -> schema.collections.CollectionRead:
    c = session.get(schema.collections.Collection, collection_id)
    cr = schema.collections.CollectionRead.from_orm(c)
    cr.user_links = [schema.collections.CollectionUserLinkRead.from_orm(l) for l in c.user_links]

    return cr


def get_collections(
    session: Session,
    collections_filter: schema.collections.CollectionsFilter,
) -> List[schema.collections.CollectionRead]:
    stmt = _generate_query_statement(collections_filter)
    collections = session.exec(stmt).all()

    collections_read: List[schema.collections.CollectionRead] = []
    for c in collections:
        cr = schema.collections.CollectionRead.from_orm(c)
        cr.user_links = [schema.collections.CollectionUserLinkRead.from_orm(l) for l in c.user_links]
        collections_read.append(cr)
    return collections_read


def get_collection_user_link(
        session: Session,
        collection_id: int,
        user_id: int,
) -> Optional[schema.collections.CollectionUserLinkRead]:
    stmt = select(schema.collections.CollectionUserLink).where(
        schema.collections.CollectionUserLink.collection_id == collection_id,
        schema.collections.CollectionUserLink.user_id == user_id,
    )
    return session.exec(stmt).first()


def upsert_collection_user_link(
        session: Session,
        link: schema.collections.CollectionUserLink,
) -> schema.collections.CollectionUserLinkRead:
    # TODO prevent people from adding themselves as owner/collaborator.
    session.merge(link)
    session.commit()
    return schema.collections.CollectionUserLinkRead.from_orm(link)


def delete_collection_user_link(
        session: Session,
        collection_id: int,
        user_id: int,
):
    stmt = select(schema.collections.CollectionUserLink).where(
        schema.collections.CollectionUserLink.collection_id == collection_id,
        schema.collections.CollectionUserLink.user_id == user_id,
        )
    link = session.exec(stmt).first()

    if not link:
        raise NotFoundException

    if link.type == schema.collections.CollectionUserLinkType.OWNER:
        raise InvalidArgumentException

    session.delete(link)
    session.commit()


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
    stmt = delete(schema.collections.CollectionUserLink).where(
        schema.collections.CollectionUserLink.collection_id == collection.id
    )
    session.execute(stmt)
    session.delete(collection)
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

