from pydantic import BaseModel, EmailStr
from typing import Optional


# =========================================================
# CREATE USER (REGISTER)
# =========================================================
class UserCreate(BaseModel):
    username: str
    email: EmailStr
    telephone: str
    password: str  # utilisé uniquement à la création


# =========================================================
# LOGIN USER
# =========================================================
class UserLogin(BaseModel):
    username: str
    password: str


# =========================================================
# UPDATE USER (ADMIN / SELF UPDATE LIMITÉ)
# =========================================================
class UserUpdate(BaseModel):
    username: Optional[str] = None
    email: Optional[EmailStr] = None
    telephone: Optional[str] = None
    profil: Optional[str] = None  # Admin uniquement
    password: Optional[str] = None

# =========================================================
# RESPONSE USER (CE QUI EST RENVOYÉ AU FRONT)
# =========================================================
class UserResponse(BaseModel):
    id: int
    username: str
    email: Optional[str]
    telephone: Optional[str]
    profil: str

    class Config:
        from_attributes = True


# =========================================================
# PUBLIC USER (VERSION SÉCURISÉE)
# =========================================================
class UserPublic(BaseModel):
    id: int
    username: str
    profil: str

    class Config:
        from_attributes = True


# =========================================================
# TOKEN PAYLOAD (JWT)
# =========================================================
class TokenData(BaseModel):
    user_id: int
    profil: str