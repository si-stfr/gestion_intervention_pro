from datetime import datetime, timedelta
from jose import jwt, JWTError
from passlib.context import CryptContext

SECRET_KEY = "ta_cle_secrete"
ALGORITHM = "HS256"

ACCESS_EXPIRE_MIN = 30
REFRESH_EXPIRE_DAYS = 7

def create_access_token(data: dict):
    payload = data.copy()
    payload["type"] = "access"
    payload["exp"] = datetime.utcnow() + timedelta(minutes=ACCESS_EXPIRE_MIN)
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)


def create_refresh_token(data: dict):
    payload = data.copy()
    payload["type"] = "refresh"
    payload["exp"] = datetime.utcnow() + timedelta(days=REFRESH_EXPIRE_DAYS)
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)


def decode_token(token: str):
    print("TOKEN RECU:", token)

    decoded = jwt.decode(
        token,
        SECRET_KEY,
        algorithms=[ALGORITHM]
    )

    print("DECODED:", decoded)
    return decoded