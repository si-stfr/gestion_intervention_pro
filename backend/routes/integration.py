# Routes API pour les interventions

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func

from database import SessionLocal
from models import Integration, User
from middleware.security import get_current_user

router = APIRouter()

# Connexion DB
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# =========================
# GET toutes les interventions
# =========================
@router.get("/")
def get_all(db: Session = Depends(get_db), user=Depends(get_current_user)):

    results = db.query(Integration, User).join(
        User,
        Integration.User == User.id
    ).all()

    # transformation JSON pour frontend
    return [
        {
            "ID": integration.ID,
            "UserId": user.username,
            "Profil": integration.Profil,
            "Statut": integration.Statut,
            "Descriptif": integration.Descriptif,
            "Date_de_debut": integration.Date_de_debut,
            "Echeance": integration.Echeance,
            "Date_de_fin": integration.Date_de_fin,
            "Latitude": integration.Latitude,
            "Longitude": integration.Longitude
        }
        for integration, user in results
    ]

# =========================
# CREATE intervention
# =========================
@router.post("/")
def create_intervention(data: dict, db: Session = Depends(get_db), user=Depends(get_current_user)):

    db_user = db.query(User).filter(User.id == data["User"]).first()

    if not db_user:
        raise HTTPException(status_code=404, detail="Utilisateur introuvable")

    intervention = Integration(
        User=db_user.id,
        Profil=db_user.profil,
        Statut=data["Statut"],
        Descriptif=data["Descriptif"],
        Date_de_debut=data["Date_de_debut"],
        Echeance=data["Echeance"],
        Date_de_fin=data["Date_de_fin"],
        Latitude=data["Latitude"],
        Longitude=data["Longitude"]
    )

    db.add(intervention)
    db.commit()

    return {"message": "Intervention ajoutée"}

# =========================
# UPDATE intervention
# =========================
@router.put("/{id}")
def update_intervention(id: int, data: dict, db: Session = Depends(get_db), user=Depends(get_current_user)):

    intervention = db.query(Integration).filter(Integration.ID == id).first()

    if not intervention:
        raise HTTPException(status_code=404)

    user_id = data.get("User")

    db_user = db.query(User).filter(User.id == user_id).first()

    if not db_user:
        raise HTTPException(status_code=404, detail="Utilisateur introuvable")

    intervention.User = db_user.id

    intervention.User = db_user.id
    intervention.Statut = data["Statut"]
    intervention.Descriptif = data["Descriptif"]
    intervention.Date_de_debut = data["Date_de_debut"]
    intervention.Echeance = data["Echeance"]
    intervention.Date_de_fin = data["Date_de_fin"]
    intervention.Latitude = data["Latitude"]
    intervention.Longitude = data["Longitude"]

    db.commit()

    return {"message": "Intervention modifiée"}

# =========================
# DELETE intervention
# =========================
@router.delete("/{id}")
def delete_intervention(id: int, db: Session = Depends(get_db), user=Depends(get_current_user)):

    intervention = db.query(Integration).filter(Integration.ID == id).first()

    if not intervention:
        raise HTTPException(status_code=404)

    db.delete(intervention)
    db.commit()

    return {"message": "Intervention supprimée"}

# =========================
# STATS
# =========================
@router.get("/stats")
def get_stats(db: Session = Depends(get_db), user=Depends(get_current_user)):

    result = db.query(
        Integration.Statut,
        func.count(Integration.ID)
    ).group_by(Integration.Statut).all()

    return {status: count for status, count in result}