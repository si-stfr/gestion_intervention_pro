from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import SessionLocal
from models import User
from auth import create_access_token, create_refresh_token
from middleware.security import get_current_user
from jwt_utils import decode_token

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.post("/login")
def login(data: dict, db: Session = Depends(get_db)):

    user = db.query(User).filter(
        User.username == data["user"],
        User.profil == data["profil"]
    ).first()

    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    access_token = create_access_token({
        "sub": user.username,
        "role": user.profil,
        "id": user.id
    })

    refresh_token = create_refresh_token({
        "sub": user.username,
        "role": user.profil,
        "id": user.id
    })

    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "user": {
            "id": user.id,
            "username": user.username,
            "role": user.profil
        }
    }

@router.post("/refresh")
def refresh(data: dict):

    print("REFRESH REQUEST:", data)

    token = data.get("token")

    print("TOKEN RECEIVED:", token)

    payload = decode_token(token)

    print("PAYLOAD:", payload)

    if not payload:
        raise HTTPException(status_code=401, detail="Invalid refresh token")

    if payload.get("type") != "refresh":
        raise HTTPException(status_code=401, detail="Wrong token type")

    new_access = create_access_token({
        "sub": payload["sub"],
        "role": payload["role"],
        "id": payload["id"]
    })

    return {
        "access_token": new_access
    }