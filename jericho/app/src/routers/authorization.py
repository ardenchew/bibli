from typing import Optional

from fastapi import Request

from resources.exceptions import NotAuthorizedException
from src.auth.user import RequestUser


def authorize_request_user_action(
    request: Request,
    user_id: Optional[int],
):
    try:
        request.state.__getattr__("user")
    except KeyError:
        raise NotAuthorizedException

    if not isinstance(request.state.user, RequestUser):
        raise NotAuthorizedException

    print(vars(request.state.user))

    if request.state.user.id != user_id:
        raise NotAuthorizedException
