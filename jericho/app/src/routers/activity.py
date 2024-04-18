
from fastapi import APIRouter, Depends, Request
from sqlmodel import Session

import src.db.schema as schema
from src.auth.middleware import auth0_middleware
from src.database import get_session
from src.domain.service import activity

# TODO(arden) header dependencies.
router = APIRouter(
    tags=["activity"],
    dependencies=[Depends(auth0_middleware)],
)


@router.post("/activities", response_model=schema.activity.ActivityPage)
async def get_activities(
        f: schema.activity.ActivityFilter,
        session: Session = Depends(get_session),
):
    return activity.get_activities(session, f)


@router.get("/activity/{activity_id}", response_model=schema.activity.ActivityRead)
async def get_activity(
        activity_id: int,
        session: Session = Depends(get_session),
):
    return activity.get_activity(session, activity_id)


@router.put("/activity/comment", response_model=schema.activity.ActivityCommentRead)
async def put_activity_comment(
        comment: schema.activity.ActivityCommentWrite,
        session: Session = Depends(get_session),
):
    return activity.upsert_activity_comment(session, comment)


@router.delete("/activity/comment/{comment_id}")
async def delete_activity_comment(
        comment_id: int,
        session: Session = Depends(get_session),
):
    activity.delete_activity_comment(session, comment_id)


@router.post("/activity/reaction", response_model=schema.activity.ActivityReactionRead)
async def insert_activity_reaction(
        reaction: schema.activity.ActivityReaction,
        session: Session = Depends(get_session),
):
    return activity.insert_activity_reaction(session, reaction)


@router.delete("/activity/reaction")
async def delete_activity_reaction(
        reaction: schema.activity.ActivityReaction,
        session: Session = Depends(get_session),
):
    activity.delete_activity_reaction(
        session,
        reaction
    )
