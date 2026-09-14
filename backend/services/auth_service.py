import hashlib
import os
import secrets
from datetime import datetime, timedelta

from auth.jwt import create_access_token, create_refresh_token
from auth.security import (
    hash_password,
    verify_password,
)

from models.user import User
from models.password_reset_token import PasswordResetToken
from services.email_service import send_email

RESET_TOKEN_EXPIRE_MINUTES = 60

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


# =========================================================
# MOT DE PASSE OUBLIÉ
# =========================================================
def _hash_token(raw_token: str) -> str:
    return hashlib.sha256(raw_token.encode("utf-8")).hexdigest()


def request_password_reset(db, email: str):
    """
    Si un compte existe avec cet email, envoie un lien de réinitialisation.
    Ne révèle jamais si l'email existe ou non (protection contre l'énumération de comptes).
    """
    user = db.query(User).filter(User.email == email).first()

    if not user:
        return

    raw_token = secrets.token_urlsafe(32)

    reset_token = PasswordResetToken(
        token_hash=_hash_token(raw_token),
        user_id=user.id,
        expires_at=datetime.utcnow() + timedelta(minutes=RESET_TOKEN_EXPIRE_MINUTES),
    )

    db.add(reset_token)
    db.commit()

    frontend_url = os.getenv("FRONTEND_URL", "http://127.0.0.1:5175").rstrip("/")
    reset_link = f"{frontend_url}/reset-password?token={raw_token}"

    send_email(
        to_email=user.email,
        subject="Réinitialisation de votre mot de passe",
        html_body=(
            f"<p>Bonjour {user.username},</p>"
            "<p>Une demande de réinitialisation de mot de passe a été effectuée pour votre compte.</p>"
            f'<p><a href="{reset_link}">Cliquez ici pour choisir un nouveau mot de passe</a></p>'
            f"<p>Ce lien expire dans {RESET_TOKEN_EXPIRE_MINUTES} minutes. "
            "Si vous n'êtes pas à l'origine de cette demande, ignorez cet email.</p>"
        ),
        text_body=(
            f"Bonjour {user.username},\n\n"
            "Une demande de réinitialisation de mot de passe a été effectuée pour votre compte.\n"
            f"Lien de réinitialisation (valable {RESET_TOKEN_EXPIRE_MINUTES} minutes) : {reset_link}\n\n"
            "Si vous n'êtes pas à l'origine de cette demande, ignorez cet email."
        ),
    )


def reset_password(db, raw_token: str, new_password: str) -> bool:
    token_hash = _hash_token(raw_token)

    reset_token = (
        db.query(PasswordResetToken)
        .filter(PasswordResetToken.token_hash == token_hash)
        .first()
    )

    if not reset_token:
        return False

    if reset_token.used or reset_token.expires_at < datetime.utcnow():
        return False

    user = db.query(User).filter(User.id == reset_token.user_id).first()

    if not user:
        return False

    user.hashed_password = hash_password(new_password)
    reset_token.used = True

    # invalide les autres liens en attente pour ce compte
    db.query(PasswordResetToken).filter(
        PasswordResetToken.user_id == user.id,
        PasswordResetToken.id != reset_token.id,
        PasswordResetToken.used == False,  # noqa: E712
    ).update({"used": True})

    db.commit()

    return True