from fastapi import HTTPException, status

NotFoundException = HTTPException(
    status_code=status.HTTP_404_NOT_FOUND,
    detail="Not found"
)

NotAuthorizedException = HTTPException(
    status_code=status.HTTP_401_UNAUTHORIZED,
    detail="Not authorized"
)
