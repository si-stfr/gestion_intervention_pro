from sqlalchemy import Column, Integer, String, Enum
from database import Base
import enum
from sqlalchemy.orm import relationship

# =========================================================
# ENUM DES ROLES UTILISATEURS
# =========================================================
class UserRole(str, enum.Enum):
    ADMIN = "ADMIN"
    TECHNICIEN = "TECHNICIEN"
    INTERVENANT = "INTERVENANT"
    MANAGER = "MANAGER"


# =========================================================
# TABLE USERS
# =========================================================
class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)

    username = Column(String(150), unique=True, nullable=False)

    email = Column(String(255), unique=True, nullable=False)

    telephone = Column(String(30), nullable=True)

    # rôle utilisateur
    profil = Column(
        Enum(UserRole),
        default=UserRole.INTERVENANT,
        nullable=False
    )

    # mot de passe hashé (JAMAIS en clair)
    hashed_password = Column(String(255), nullable=False)

    refresh_tokens = relationship(
        "RefreshToken",
        back_populates="user",
        cascade="all, delete"
    )

    def __repr__(self):
        return f"<User {self.username} ({self.profil})>"