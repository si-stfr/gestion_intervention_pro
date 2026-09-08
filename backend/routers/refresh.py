from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime

from database import get_db
from auth.jwt import create_access_token
from models.refresh_token import RefreshToken
from models.user import User

router = APIRouter(prefix="/refresh", tags=["Refresh Token"])

# 🔹 Rafraîchir le token
@router.post("/")
def refresh_token(data: dict, db: Session = Depends(get_db)):
    refresh_token = data.get("refresh_token")

    if not refresh_token:
        raise HTTPException(status_code=400, detail="Refresh token manquant")

    # Vérifier si le token existe en base
    token_db = db.query(RefreshToken).filter(
        RefreshToken.token == refresh_token
    ).first()

    if not token_db:
        raise HTTPException(status_code=401, detail="Refresh token invalide")

    # Vérifier expiration
    if token_db.expires_at < datetime.utcnow():
        raise HTTPException(status_code=401, detail="Refresh token expiré")

    # Récupérer l'utilisateur
    user = db.query(User).filter(User.id == token_db.user_id).first()

    if not user:
        raise HTTPException(status_code=404, detail="Utilisateur introuvable")

    # Créer nouveau access token
    access_token = create_access_token(
        data={"sub": str(user.id), "role": user.profil}
    )

    return {
        "access_token": access_token,
        "token_type": "bearer"
    }


# 🔹 (Optionnel) Supprimer un refresh token (logout)
@router.delete("/")
def revoke_refresh_token(data: dict, db: Session = Depends(get_db)):
    refresh_token = data.get("refresh_token")

    token_db = db.query(RefreshToken).filter(
        RefreshToken.token == refresh_token
    ).first()

    if not token_db:
        raise HTTPException(status_code=404, detail="Token introuvable")

    db.delete(token_db)
    db.commit()

    return {"message": "Token révoqué avec succès"}