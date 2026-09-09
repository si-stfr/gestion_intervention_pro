from datetime import datetime, timedelta
from jose import jwt, JWTError
from passlib.context import CryptContext

# =========================================================
# CONFIGURATION JWT
# =========================================================

SECRET_KEY = "ta_cle_secrete"
ALGORITHM = "HS256"

ACCESS_TOKEN_EXPIRE_MINUTES = 60
REFRESH_TOKEN_EXPIRE_DAYS = 7


# =========================================================
# HASH PASSWORD
# =========================================================

pwd_context = CryptContext(
    schemes=["bcrypt"],
    deprecated="auto"
)


# =========================================================
# HASH PASSWORD
# =========================================================
def hash_password(password: str):
    return pwd_context.hash(password)


# =========================================================
# VERIFY PASSWORD
# =========================================================
def verify_password(plain_password: str, hashed_password: str):
    try:
        return pwd_context.verify(plain_password, hashed_password)
    except Exception as e:
        print("❌ HASH INVALID:", hashed_password)
        print("❌ ERROR:", e)
        return False


# =========================================================
# CREATE ACCESS TOKEN
# =========================================================
def create_access_token(data: dict):

    to_encode = data.copy()

    expire = datetime.utcnow() + timedelta(
        minutes=ACCESS_TOKEN_EXPIRE_MINUTES
    )

    to_encode.update({
        "exp": expire,
        "type": "access"
    })

    encoded_jwt = jwt.encode(
        to_encode,
        SECRET_KEY,
        algorithm=ALGORITHM
    )

    return encoded_jwt


# =========================================================
# CREATE REFRESH TOKEN
# =========================================================
def create_refresh_token(data: dict):

    to_encode = data.copy()

    expire = datetime.utcnow() + timedelta(
        days=REFRESH_TOKEN_EXPIRE_DAYS
    )

    to_encode.update({
        "exp": expire,
        "type": "refresh"
    })

    encoded_jwt = jwt.encode(
        to_encode,
        SECRET_KEY,
        algorithm=ALGORITHM
    )

    return encoded_jwt


# =========================================================
# VERIFY TOKEN
# =========================================================
def verify_token(token: str):

    try:

        payload = jwt.decode(
            token,
            SECRET_KEY,
            algorithms=[ALGORITHM]
        )

        return payload

    except JWTError:
        return None


# =========================================================
# VERIFY ACCESS TOKEN
# =========================================================
def verify_access_token(token: str):

    payload = verify_token(token)

    if not payload:
        return None

    if payload.get("type") != "access":
        return None

    return payload


# =========================================================
# VERIFY REFRESH TOKEN
# =========================================================
def verify_refresh_token(token: str):

    payload = verify_token(token)

    if not payload:
        return None

    if payload.get("type") != "refresh":
        return None

    return payload


# =========================================================
# EXTRACT USER ID
# =========================================================
def get_user_id_from_token(token: str):

    payload = verify_access_token(token)

    if not payload:
        return None

    return payload.get("user_id")