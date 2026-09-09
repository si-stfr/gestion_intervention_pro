from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import jwt, JWTError
from sqlalchemy.orm import Session

from database import get_db
from models.user import User

# =========================================================
# CONFIG JWT (doit être IDENTIQUE à auth_service)
# =========================================================
SECRET_KEY = "ta_cle_secrete"
ALGORITHM = "HS256"

security = HTTPBearer(auto_error=False)


# =========================================================
# GET CURRENT USER (UTILISÉ PARTOUT)
# =========================================================
def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
):

    if not credentials:
        raise HTTPException(
            status_code=401,
            detail="Not authenticated"
        )
    
    token = credentials.credentials

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])

        user_id = payload.get("user_id")

        if user_id is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token invalide"
            )

    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token expiré ou invalide"
        )

    user = db.query(User).filter(User.id == user_id).first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Utilisateur introuvable"
        )

    return user


# =========================================================
# ROLE CHECK (ADMIN ONLY)
# =========================================================
def require_admin(user=Depends(get_current_user)):
    if user.profil.value != "ADMIN":
        raise HTTPException(
            status_code=403,
            detail="Accès réservé aux administrateurs"
        )
    return user