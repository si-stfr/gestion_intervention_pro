from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
from models.materiel import Materiel
from middleware.auth_middleware import get_current_user
from sqlalchemy import func

router = APIRouter(prefix="/materiels", tags=["Materiels"])


# 🔹 Récupérer tous les matériels
@router.get("/")
def get_all_materiels(
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    materiels = db.query(Materiel).all()

    total = db.query(func.count(Materiel.id)).scalar()

    return {
        "total" : total,
        "materiels" : materiels
    }

# 🔹 Récupérer un matériel par ID
@router.get("/{id}")
def get_materiel(
    id: int,
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    materiel = db.query(Materiel).filter(
        Materiel.id == id
    ).first()

    if not materiel:
        raise HTTPException(status_code=404, detail="Matériel introuvable")

    return materiel


# 🔹 Créer un matériel
@router.post("/")
def create_materiel(
    data: dict,
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    type_de_materiel = data["type_de_materiel"]

    if type_de_materiel == "Autres":
        type_de_materiel = data.get("autre_type") or "Non précisé"

    new_materiel = Materiel(
        type_de_materiel=type_de_materiel,
        marque_ou_modele=data["marque_ou_modele"],
        numero_de_serie=data["numero_de_serie"],
        utilisateur_concerne_id=data.get("utilisateur_concerne_id"),
        lieu_stockage = data["lieu_stockage"],
        intervention_id = data.get("intervention_id"),
        statut = data["statut"],
        quantite = data.get("quantite")
    )

    db.add(new_materiel)
    db.commit()
    db.refresh(new_materiel)

    return {
        "message": "Matériel ajouté avec succès",
        "data": {
            "id": new_materiel.id,
            "type_de_materiel": new_materiel.type_de_materiel,
            "marque_ou_modele": new_materiel.marque_ou_modele,
            "numero_de_serie": new_materiel.numero_de_serie,
            "utilisateur_concerne_id": new_materiel.utilisateur_concerne_id,
            "intervention_id": new_materiel.intervention_id,
            "lieu_stockage" : new_materiel.lieu_stockage,
            "statut": new_materiel.statut,
            "quantite": new_materiel.quantite
    }
    }


# 🔹 Modifier un matériel
@router.put("/{id}")
def update_materiel(
    id: int,
    data: dict,
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    materiel = db.query(Materiel).filter(
        Materiel.id == id
    ).first()

    if not materiel:
        raise HTTPException(
            status_code=404,
            detail="Matériel introuvable"
        )

    type_de_materiel = data["type_de_materiel"]

    if type_de_materiel == "Autres":
        type_de_materiel = data.get("autre_type") or "Non précisé"

    materiel.type_de_materiel = type_de_materiel
    materiel.marque_ou_modele = data["marque_ou_modele"]
    materiel.numero_de_serie = data["numero_de_serie"]
    materiel.lieu_stockage = data["lieu_stockage"]
    materiel.statut = data["statut"]
    materiel.quantite = data["quantite"]

    db.commit()
    db.refresh(materiel)

    return {
        "id": materiel.id,
        "type_de_materiel": materiel.type_de_materiel,
        "marque_ou_modele": materiel.marque_ou_modele,
        "numero_de_serie": materiel.numero_de_serie,
        "lieu_stockage": materiel.lieu_stockage,
        "statut": materiel.statut,
        "quantite": materiel.quantite
    }

# 🔹 Supprimer un matériel
@router.delete("/{id}")
def delete_materiel(
    id: int,
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    materiel = db.query(Materiel).filter(
        Materiel.id == id
    ).first()

    if not materiel:
        raise HTTPException(status_code=404, detail="Matériel introuvable")

    db.delete(materiel)
    db.commit()

    return {"message": "Matériel supprimé avec succès"}

