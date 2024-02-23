from fastapi import Depends, HTTPException, Request, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jwt import decode, get_unverified_header
from sqlmodel import Session

from src.auth.auth0 import get_rsa_public_key, jwk_to_pem
from src.auth.user import get_request_user_by_sub
from src.config import auth0_audience, auth0_domain
from src.database import get_session

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

    print(token_header)

    try:
        payload = decode(
            credentials.credentials,
            pem_key,
            # If necessary due to PEM formatting set options verify_signature false.
            # options={"verify_signature": False, "verify_aud": True},
            algorithms=token_header["alg"],
            audience=auth0_audience,
            issuer=auth0_domain,
        )
    except Exception as e:
        print(f"Credential Exception: {e}")
        raise credentials_exception

    request.state.user = get_request_user_by_sub(session, payload["sub"])
    print(f"User: {request.state.user}")
