from typing import List

from sqlmodel import Session

from src.domain.collections import schemas, utils


def get_collection(
        session: Session,
        collection_id: int,
) -> schemas.Collection:
    return session.get(schemas.Collection, collection_id)


def get_collections(
        session: Session,
        collections_filter: schemas.CollectionsFilter,
) -> List[schemas.Collection]:
    stmt = utils.generate_query_statement(collections_filter)
    return session.exec(stmt).all()


def upsert_collection(
        session: Session,
        collection: schemas.Collection,
) -> schemas.Collection:
    collection = session.merge(collection)
    session.commit()
    session.refresh(collection)
    return collection


def delete_collection(
        session: Session,
        collection: schemas.Collection,
):
    session.delete(collection)  # TODO(arden) sqlalchemy cascade on delete.
    session.commit()


def insert_collection_book_link(
        session: Session,
        link: schemas.CollectionBookLink,
) -> schemas.CollectionBookLink:
    session.add(link)
    session.commit()
    session.refresh(link)
    return link


def patch_collection_book_link(
        session: Session,
        current_link: schemas.CollectionBookLink,
        new_link: schemas.CollectionBookLink,
) -> schemas.CollectionBookLink:
    session.delete(current_link)
    session.add(new_link)
    session.commit()
    session.refresh(new_link)
    return new_link


def delete_collection_book_link(
        session: Session,
        link: schemas.CollectionBookLink,
):
    session.delete(link)
    session.commit()
