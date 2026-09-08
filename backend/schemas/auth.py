from pydantic import BaseModel, EmailStr
from typing import Optional


# =========================================================
# REGISTER
# =========================================================
class RegisterSchema(BaseModel):
    username: str
    email: EmailStr
    telephone: str
    password: str  # ✅ obligatoire
    profil : str

# =========================================================
# LOGIN
# =========================================================
class LoginSchema(BaseModel):
    username: str
    password: str


# =========================================================
# TOKEN RESPONSE
# =========================================================
class TokenSchema(BaseModel):
    access_token: str
    refresh_token: Optional[str] = None
    token_type: str = "bearer"


# =========================================================
# REFRESH TOKEN REQUEST
# =========================================================
class RefreshTokenSchema(BaseModel):
    refresh_token: str


# =========================================================
# USER INFO IN TOKEN (payload JWT)
# =========================================================
class TokenDataSchema(BaseModel):
    user_id: int
    profil: str


# =========================================================
# RESPONSE USER AUTH (frontend login)
# =========================================================
class AuthUserSchema(BaseModel):
    id: int
    username: str
    email: Optional[str]
    telephone: Optional[str]
    profil: str
