from fastapi import Depends, HTTPException, Request, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jwt import decode, get_unverified_header
from jwt.exceptions import DecodeError
from sqlmodel import Session, select

from src.auth.user import RequestUser
from src.config import auth0_audience, auth0_domain
from src.database import get_session
from src.domain.users import schemas
from src.auth.auth0 import get_rsa_public_key, jwk_to_pem


bearer = HTTPBearer()


async def auth0_middleware(
        request: Request,
        credentials: HTTPAuthorizationCredentials = Depends(bearer),
        session: Session = Depends(get_session),
):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    token_header = get_unverified_header(credentials.credentials)
    rsa_key = get_rsa_public_key(token_header)
    pem_key = jwk_to_pem(rsa_key)

    try:
        payload = decode(
            credentials.credentials,
            pem_key,
            # If necessary due to PEM formatting set options verify_signature false.
            # options={"verify_signature": False, "verify_aud": True},
            algorithms=token_header['alg'],
            audience=auth0_audience,
            issuer=auth0_domain,
        )
        print(payload)
    except DecodeError:
        raise credentials_exception

    request_user = RequestUser(sub=payload['sub'])

    stmt = select(schemas.User).where(schemas.User.sub == request_user.sub)
    db_user = session.exec(stmt).first()

    if db_user:
        inject_request_user(request_user, db_user)

    request.state.user = request_user


def inject_request_user(
    request_user: RequestUser,
    db_user: schemas.User,
):
    request_user.id = db_user.id
    request_user.tag = db_user.tag
