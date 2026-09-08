from auth.jwt import create_access_token, create_refresh_token
from auth.security import (
    hash_password,
    verify_password,
)

from models.user import User

# =========================================================
# CONFIG JWT
# =========================================================
SECRET_KEY = "ta_cle_secrete"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60
REFRESH_TOKEN_EXPIRE_DAYS = 7

# =========================================================
# AUTHENTICATE USER
# =========================================================
def authenticate_user(db, username: str, password: str):
    user = db.query(User).filter(User.username == username).first()
#
    print("LOGIN username :", username)
#
    if not user:
        return None
#
    print("DB USER:", user.username)
    print("HASH:", user.hashed_password)
#

    if not verify_password(password, user.hashed_password):
        return None
    else:
        print("VERIFY RESULT", verify_password(password, user.hashed_password))

    return user


# =========================================================
# REGISTER USER (LOGIQUE SERVICE)
# =========================================================
def create_user(db, username: str, email: str, telephone: str, password: str, profil: str):
    from models.user import User, UserRole

    hashed = hash_password(password)

    new_user = User(
        username=username,
        email=email,
        telephone=telephone,
        profil=profil,  # règle métier obligatoire
        hashed_password=hashed
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return new_user