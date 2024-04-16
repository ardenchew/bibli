
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
