from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from database import get_db
from models import user
from models.user import User
from models.refresh_token import RefreshToken

from schemas.auth import RegisterSchema, LoginSchema, AuthUserSchema

from services.auth_service import (
    authenticate_user,
    create_access_token,
    create_refresh_token,
    create_user,
)

from middleware.auth_middleware import get_current_user

from datetime import timedelta, datetime

router = APIRouter(prefix="/auth", tags=["Auth"])


# =========================================================
# REGISTER
# =========================================================
@router.post("/register", response_model=AuthUserSchema)
def register(user: RegisterSchema, db: Session = Depends(get_db)):

    # vérifie si utilisateur existe déjà
    existing_user = db.query(User).filter(User.username == user.username).first()

    if existing_user:
        raise HTTPException(status_code=400, detail="Utilisateur déjà existant")

    new_user = create_user(
        db=db,
        username=user.username,
        email=user.email,
        telephone=user.telephone,
        password=user.password,
        profil=user.profil,
    )

    return new_user


# =========================================================
# LOGIN
# =========================================================
@router.post("/login")
def login(user: LoginSchema, db: Session = Depends(get_db)):

    db_user = authenticate_user(db, user.username, user.password)

    if not db_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Identifiants incorrects"
        )

    access_token = create_access_token(
        data={"user_id": db_user.id, "profil": db_user.profil.value}
    )

    refresh_token = create_refresh_token(data={"user_id": db_user.id})

    # sauvegarde refresh token en base
    db_token = RefreshToken(
        token=refresh_token,
        user_id=db_user.id,
        expires_at=datetime.utcnow() + timedelta(days=7),
    )

    db.add(db_token)
    db.commit()

    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "user": {
            "id": db_user.id,
            "username": db_user.username,
            "email": db_user.email,
            "telephone": db_user.telephone,
            "profil": db_user.profil.value,
        },
    }


# =========================================================
# GET CURRENT USER
# =========================================================
@router.get("/me", response_model=AuthUserSchema)
def get_me(user=Depends(get_current_user)):

    return user


# =========================================================
# REFRESH TOKEN
# =========================================================
@router.post("/refresh")
def refresh_token(refresh_token: str, db: Session = Depends(get_db)):

    db_token = (
        db.query(RefreshToken).filter(RefreshToken.token == refresh_token).first()
    )

    if not db_token:
        raise HTTPException(status_code=401, detail="Refresh token invalide")

    user = db.query(User).filter(User.id == db_token.user_id).first()

    if not user:
        raise HTTPException(status_code=404, detail="Utilisateur introuvable")

    new_access_token = create_access_token(
        data={"user_id": user.id, "profil": user.profil.value}
    )

    return {"access_token": new_access_token, "token_type": "bearer"}


# =========================================================
# LOGOUT (OPTIONNEL MAIS PROPRE)
# =========================================================
@router.post("/logout")
def logout(refresh_token: str, db: Session = Depends(get_db)):

    db_token = (
        db.query(RefreshToken).filter(RefreshToken.token == refresh_token).first()
    )

    if db_token:
        db.delete(db_token)
        db.commit()

    return {"message": "Déconnecté avec succès"}
