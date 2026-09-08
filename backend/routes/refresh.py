from fastapi import APIRouter, HTTPException
from auth import decode_token, create_access_token

router = APIRouter()

@router.post("/refresh")
def refresh(data: dict):

    token = data.get("token")
    payload = decode_token(token)

    if not payload or payload.get("type") != "refresh":
        raise HTTPException(401, "Invalid refresh token")

    new_access = create_access_token({
        "sub": payload["sub"],
        "id": payload["id"],
        "role": payload.get("role")
    })

    return {"access_token": new_access}