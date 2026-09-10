# Middleware de sécurité : vérification du JWT

from fastapi import Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from jwt_utils import decode_token

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")

def get_current_user(token: str = Depends(oauth2_scheme)):
    payload = decode_token(token)

    # Token invalide
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid token")

    # Mauvais type de token
    if payload.get("type") != "access":
        raise HTTPException(status_code=401, detail="Wrong token type")

    return payload