# Gestion utilisateurs (ADMIN uniquement)

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import SessionLocal
from models import User
from middleware.security import get_current_user

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# GET USERS
@router.get("/")
def get_users(db: Session = Depends(get_db), user=Depends(get_current_user)):

    if user["role"] != "Admin":
        raise HTTPException(403)

    return db.query(User).all()

# CREATE USER
@router.post("/")
def create_user(data: dict, db: Session = Depends(get_db), user=Depends(get_current_user)):

    if user["role"] != "Admin":
        raise HTTPException(403)

    new_user = User(**data)

    db.add(new_user)
    db.commit()

    return {"msg": "created"}

# DELETE USER
@router.delete("/{id}")
def delete_user(id: int, db: Session = Depends(get_db), user=Depends(get_current_user)):

    if user["role"] != "Admin":
        raise HTTPException(403)

    u = db.query(User).get(id)

    db.delete(u)
    db.commit()

    return {"msg": "deleted"}