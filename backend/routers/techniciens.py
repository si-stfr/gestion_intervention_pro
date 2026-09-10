from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List
from datetime import date

from database import get_db
from models.user import User
from models.intervention import Intervention

router = APIRouter(prefix="/techniciens", tags=["Techniciens"])


# ---------------------------------------------------------
# Liste de tous les techniciens
# ---------------------------------------------------------
@router.get("/")
def get_techniciens(db: Session = Depends(get_db)):
    techniciens = db.query(User).filter(User.profil == "Technicien").all()

    return [
        {
            "id": t.id,
            "username": t.username,
            "email": getattr(t, "email", None),
            "telephone": getattr(t, "telephone", None),
        }
        for t in techniciens
    ]


# ---------------------------------------------------------
# Vérifier la disponibilité d'un technicien
# ---------------------------------------------------------
@router.get("/disponibilite/{technicien_id}")
def check_disponibilite(
    technicien_id: int,
    start_date: date = Query(...),
    end_date: date = Query(...),
    db: Session = Depends(get_db),
):
    if end_date < start_date:
        raise HTTPException(
            status_code=400,
            detail="La date de fin ne peut pas être avant la date de début."
        )

    interventions = db.query(Intervention).filter(
        Intervention.technicien_disponible == technicien_id
    ).all()

    for i in interventions:
        # conflit de planning
        if (
            i.date_debut <= end_date
            and i.date_fin >= start_date
        ):
            return {
                "disponible": False,
                "conflit": {
                    "intervention_id": i.id,
                    "debut": i.date_debut,
                    "fin": i.date_fin,
                }
            }

    return {"disponible": True}


# ---------------------------------------------------------
# Liste des techniciens disponibles pour une période
# ---------------------------------------------------------
@router.get("/disponibles")
def get_techniciens_disponibles(
    start_date: date = Query(...),
    end_date: date = Query(...),
    db: Session = Depends(get_db),
):
    techniciens = db.query(User).filter(User.profil == "Technicien").all()

    disponibles = []

    for t in techniciens:
        conflits = db.query(Intervention).filter(
            Intervention.technicien_disponible == t.id,
            Intervention.date_debut <= end_date,
            Intervention.date_fin >= start_date
        ).count()

        if conflits == 0:
            disponibles.append({
                "id": t.id,
                "username": t.username
            })

    return disponibles