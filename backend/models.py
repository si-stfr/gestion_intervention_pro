# Définition des tables SQL via SQLAlchemy (ORM)

from sqlalchemy import Column, Integer, String, Date, Float, Enum, ForeignKey, DateTime
from database import Base

# Table USERS : gestion des comptes utilisateurs
class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True)
    username = Column(String(200), unique=True)
    profil = Column(Enum("Admin", "Chef", "Intervenant"))

# Table INTEGRATION : gestion des interventions
class Integration(Base):
    __tablename__ = "integration"

    ID = Column(Integer, primary_key=True, index=True)

    # relation vers utilisateur
    User = Column(Integer, ForeignKey("users.id"))

    Profil = Column(Enum('Admin','Chef','Intervenant'))
    Date_de_debut = Column(Date)
    Echeance = Column(Date)
    Date_de_fin = Column(Date)

    Longitude = Column(Float)
    Latitude = Column(Float)

    Descriptif = Column(String(500))

    Statut = Column(Enum('Signalé','En cours','Abouti'))

# Table refresh tokens (JWT)
class RefreshToken(Base):
    __tablename__ = "refresh_tokens"

    id = Column(Integer, primary_key=True)
    token = Column(String(500))
    user_id = Column(Integer)
    expires_at = Column(DateTime)