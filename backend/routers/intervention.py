from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.orm import Session
from datetime import datetime
from sqlalchemy import select

from database import get_db
from models import user
from models.intervention import Intervention, StatutIntervention, ResultatIntervention
from schemas.intervention import InterventionUpdate, InterventionTechnicienUpdate
from models.user import User
from models.intervention_matériel import intervention_materiel

from middleware.auth_middleware import get_current_user, require_admin

from services.intervention_service import (
    create_intervention,
    update_intervention,
    assign_technicien,
    is_technicien_available,
    compute_statut,
    send_to_manager,
    validate_intervention,
)

router = APIRouter(prefix="/intervention", tags=["Intervention"])


# =========================================================
# GET ALL INTERVENTIONS
# =========================================================
@router.get("/")
def get_all(db: Session = Depends(get_db), user=Depends(get_current_user)):

    interventions = db.query(Intervention).all()

    result = []

    for i in interventions:

        statut = compute_statut(i)

        rows = db.execute(
            select(
                intervention_materiel.c.materiel_id, intervention_materiel.c.quantite
            ).where(intervention_materiel.c.intervention_id == i.id)
        ).all()

        quantites = {materiel_id: qte for materiel_id, qte in rows}
        result.append(
            {
                # =========================
                # IDENTIFIANTS
                # =========================
                "id": i.id,
                # =========================
                # STATUT
                # =========================
                "statut": statut,
                # =========================
                # DATE DE LA DEMANDE
                # =========================
                "Date_de_la_demande": (
                    i.Date_de_la_demande.isoformat() if i.Date_de_la_demande else None
                ),
                # =========================
                # IDS
                # =========================
                "demandeur_id": i.demandeur_id,
                "technicien_id": i.technicien_id,
                "manager_id": i.manager_id,
                # =========================
                # INFOS PRINCIPALES
                # =========================
                "titre": i.titre,
                "description_de_la_panne": i.description_de_la_panne,
                # =========================
                # ENUMS (valeurs propres)
                # =========================
                "source_demande": i.source_demande.value if i.source_demande else None,
                "urgence": i.urgence.value if i.urgence else None,
                "impact": i.impact.value if i.impact else None,
                "priorite": i.priorite.value if i.priorite else None,
                "type_intervention": (
                    i.type_intervention.value if i.type_intervention else None
                ),
                # =========================
                # DETAILS
                # =========================
                "type_intervention_autre": i.type_intervention_autre,
                # =========================
                # DATES
                # =========================
                "date_debut": i.date_debut.isoformat() if i.date_debut else None,
                "echeance": i.echeance.isoformat() if i.echeance else None,
                "date_fin": i.date_fin.isoformat() if i.date_fin else None,
                "date_verification": (
                    i.date_verification.isoformat() if i.date_verification else None
                ),
                # =========================
                # LOCALISATION
                # =========================
                "lieu": i.lieu,
                "commentaire": i.commentaire,
                # =========================
                # COMPLETION TECHNICIEN
                # =========================
                "diagnostique_effectue": i.diagnostique_effectue,
                "actions_realisees": i.actions_realisees,
                "actions_autre": i.actions_autre,
                "resultat_intervention": i.resultat_intervention,
                # =========================
                # META
                # =========================
                "created_at": i.created_at,
                # =========================
                # RELATIONS (DISPLAY ONLY)
                # =========================
                "demandeur_name": i.demandeur.username if i.demandeur else None,
                "technicien_name": i.technicien.username if i.technicien else None,
                "manager_name": i.manager.username if i.manager else None,
                "materiels": [
                    {
                        "id": m.id,
                        "marque_ou_modele": m.marque_ou_modele,
                        "numero_de_serie": m.numero_de_serie,
                        "quantite": quantites.get(m.id, 1),
                    }
                    for m in i.materiels
                ],
            }
        )

    return result  # ✅ ICI SEULEMENT


# =========================================================
# USERS PUBLIC (pour dropdown frontend)
# =========================================================
@router.get("/users/public")
def get_users_public(db: Session = Depends(get_db), user=Depends(get_current_user)):

    users = db.query(User).all()

    return [
        {
            "id": u.id,
            "username": u.username,
            "profil": u.profil.value if u.profil else None,
        }
        for u in users
    ]


# =========================================================
# GET ALL TECHNICIEN
# =========================================================
@router.get("/technicien")
def get_technicien_interventions(
    db: Session = Depends(get_db), user=Depends(get_current_user)
):

    if user.profil.value != "TECHNICIEN":
        raise HTTPException(status_code=403)

    interventions = (
        db.query(Intervention).filter(Intervention.technicien_id == user.id).all()
    )

    return interventions


# =========================================================
# GET ALL MANAGER
# =========================================================
@router.get("/manager")
def get_manager_interventions(
    db: Session = Depends(get_db), user=Depends(get_current_user)
):

    if user.profil.value != "MANAGER":
        raise HTTPException(status_code=403)

    interventions = (
        db.query(Intervention)
        .filter(
            Intervention.manager_id == user.id,
            Intervention.statut == StatutIntervention.EN_ATTENTE_VALIDATION,
        )
        .all()
    )

    return interventions


# =========================================================
# CREATE INTERVENTION
# =========================================================
@router.post("/")
def create(data: dict, db: Session = Depends(get_db), user=Depends(get_current_user)):

    # seuls Admin et Intervenant peuvent créer
    if user.profil.value not in ["ADMIN", "INTERVENANT"]:
        raise HTTPException(status_code=403)

    # création via service
    intervention = create_intervention(db, data)

    return intervention


# =========================================================
# UPDATE INTERVENTION
# =========================================================


@router.put("/{id}")
def update(
    id: int,
    data: InterventionUpdate,
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    # print("ROUTE ADMIN")
    intervention = db.query(Intervention).filter(Intervention.id == id).first()

    if not intervention:
        raise HTTPException(404, "Intervention introuvable")

    update_data = data.model_dump(exclude_unset=True, exclude_none=True)

    return update_intervention(db, intervention, update_data)


@router.put("/{id}/technicien")
def update_technicien(
    id: int,
    data: InterventionTechnicienUpdate,
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    intervention = db.query(Intervention).filter(Intervention.id == id).first()

    if not intervention:
        raise HTTPException(404, "Intervention introuvable")

    update_data = data.model_dump(exclude_unset=True, exclude_none=True)

    # Le technicien termine l'intervention :
    # le statut passe automatiquement en attente de validation.
    update_data["statut"] = "EN_ATTENTE_VALIDATION"

    if "resultat_intervention" in update_data:
        value = update_data["resultat_intervention"]

        update_data["resultat_intervention"] = (
            value.value if isinstance(value, ResultatIntervention) else value
        )

    return update_intervention(db, intervention, update_data)


def update_intervention(db, intervention, update_data):
    for key, value in update_data.items():
        setattr(intervention, key, value)

    db.commit()
    db.refresh(intervention)

    return intervention


# =========================================================
# ASSIGN TECHNICIEN
# =========================================================
@router.post("/{id}/assign/{technicien_id}")
def assign(
    id: int,
    technicien_id: int,
    db: Session = Depends(get_db),
    user=Depends(require_admin),
):

    intervention = db.query(Intervention).filter(Intervention.id == id).first()

    if not intervention:
        raise HTTPException(status_code=404)

    try:
        assign_technicien(db, intervention, technicien_id)
        db.commit()

    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    return {"message": "Technicien assigné"}


# =========================================================
# SEND TO MANAGER
# =========================================================
@router.post("/{id}/send-manager")
def send_manager(
    id: int, data: dict, db: Session = Depends(get_db), user=Depends(get_current_user)
):

    intervention = db.query(Intervention).filter(Intervention.id == id).first()

    if not intervention:
        raise HTTPException(status_code=404)

    if user.profil.value != "TECHNICIEN":
        raise HTTPException(status_code=403)

    if intervention.technicien_id != user.id:
        raise HTTPException(status_code=403)

    return send_to_manager(
        db, intervention, data["manager_id"], data["date_verification"]
    )


# =========================================================
# VALIDATION MANAGER
# =========================================================
@router.put("/{id}/validate")
def validate(
    id: int, data: dict, db: Session = Depends(get_db), user=Depends(get_current_user)
):

    if user.profil.value != "MANAGER":
        raise HTTPException(status_code=403)

    intervention = db.query(Intervention).filter(Intervention.id == id).first()

    if not intervention:
        raise HTTPException(status_code=404)

    if intervention.manager_id != user.id:
        raise HTTPException(status_code=403)

    if intervention.manager_id != user.id:
        raise HTTPException(status_code=403)

    return validate_intervention(
        db, intervention, data["statut"], data.get("commentaire")
    )


# =========================================================
# DELETE INTERVENTION
# =========================================================
@router.delete("/{id}")
def delete(id: int, db: Session = Depends(get_db), user=Depends(get_current_user)):

    intervention = db.query(Intervention).filter(Intervention.id == id).first()

    if not intervention:
        raise HTTPException(status_code=404)

    # =========================================
    # AUTORISATIONS
    # =========================================
    if user.profil.value not in ["ADMIN", "INTERVENANT"]:
        raise HTTPException(status_code=403)

    # un intervenant ne peut supprimer
    # que ses propres interventions
    if user.profil.value == "INTERVENANT" and intervention.demandeur_id != user.id:
        raise HTTPException(status_code=403)

    # =========================================
    # DELETE
    # =========================================
    db.delete(intervention)
    db.commit()

    return {"message": "Intervention supprimée"}


@router.get("/late")
def get_late_interventions(
    db: Session = Depends(get_db), user=Depends(get_current_user)
):

    interventions = db.query(Intervention).all()

    late = []

    for i in interventions:

        statut = compute_statut(i)

        if statut == "EN_RETARD":
            # filtre rôle
            if user.profil == "TECHNICIEN" and i.technicien_id == user.id:
                late.append(i)

            if user.profil == "ADMIN" or user.profil == "INTERVENANT":
                late.append(i)

        if statut == "EN_ATTENTE_VALIDATION":
            if user.profil == "MANAGER" and i.manager_id == user.id:
                late.append(i)
    return late
