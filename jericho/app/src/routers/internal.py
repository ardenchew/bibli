from fastapi import APIRouter

router = APIRouter(
    tags=["internal"],
)


@router.get("/health")
async def health():
    return {"message": "OK"}
