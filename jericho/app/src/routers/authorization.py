from fastapi import Request

from resources.exceptions import NotAuthorizedException
from src.auth.user import RequestUser


def authorize_request_user_action(
        request: Request,
        tag: str,
):
    try:
        request.state.__getattr__("user")
    except KeyError:
        raise NotAuthorizedException

    if not isinstance(request.state.user, RequestUser):
        raise NotAuthorizedException

    if request.state.user.tag != tag:
        raise NotAuthorizedException
