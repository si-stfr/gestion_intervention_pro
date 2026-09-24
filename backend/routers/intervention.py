from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.orm import Session, joinedload, selectinload
from datetime import datetime, date
from sqlalchemy import select
import json

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
    TECHNICIEN_BUFFER_DAYS,
    compute_statut,
    send_to_manager,
    validate_intervention,
    normalize_piece_jointe,
    cleanup_old_completed_interventions,
    send_completion_notification_email,
)

router = APIRouter(prefix="/intervention", tags=["Intervention"])


# =========================================================
# GET ALL INTERVENTIONS
# =========================================================
@router.get("/")
def get_all(db: Session = Depends(get_db), user=Depends(get_current_user)):

    cleanup_old_completed_interventions(db)

    interventions = (
        db.query(Intervention)
        .options(
            joinedload(Intervention.demandeur),
            joinedload(Intervention.technicien),
            joinedload(Intervention.manager),
            selectinload(Intervention.materiels),
        )
        .all()
    )

    all_quantites_rows = db.execute(
        select(
            intervention_materiel.c.intervention_id,
            intervention_materiel.c.materiel_id,
            intervention_materiel.c.quantite,
        )
    ).all()

    quantites_par_intervention = {}
    for intervention_id, materiel_id, qte in all_quantites_rows:
        quantites_par_intervention.setdefault(intervention_id, {})[materiel_id] = qte

    result = []

    for i in interventions:

        statut = compute_statut(i)

        quantites = quantites_par_intervention.get(i.id, {})
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
                "demandeur_nom": i.demandeur_nom,
                "demandeur_prenom": i.demandeur_prenom,
                "demandeur_email": i.demandeur_email,
                "demandeur_telephone": i.demandeur_telephone,
                "cree_par_id": i.cree_par_id,
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
                "type_intervention": (
                    i.type_intervention.value if i.type_intervention else None
                ),
                # =========================
                # DETAILS
                # =========================
                "type_intervention_autre": i.type_intervention_autre,
                "services_de_la_commune": (
                    json.loads(i.services_de_la_commune)
                    if i.services_de_la_commune
                    else []
                ),
                "sites_de_la_commune": (
                    json.loads(i.sites_de_la_commune) if i.sites_de_la_commune else []
                ),
                # =========================
                # DATES
                # =========================
                "date_debut": i.date_debut.isoformat() if i.date_debut else None,
                "date_fin": i.date_fin.isoformat() if i.date_fin else None,
                "date_verification": (
                    i.date_verification.isoformat() if i.date_verification else None
                ),
                # =========================
                # LOCALISATION
                # =========================
                "lieu": i.lieu,
                "latitude": i.latitude,
                "longitude": i.longitude,
                "commentaire": i.commentaire,
                # =========================
                # COMPLETION TECHNICIEN
                # =========================
                "diagnostique_effectue": i.diagnostique_effectue,
                "actions_realisees": i.actions_realisees,
                "resultat_intervention": i.resultat_intervention,
                # =========================
                # META
                # =========================
                "created_at": i.created_at,
                "piece_jointe": i.piece_jointe,
                # =========================
                # RELATIONS (DISPLAY ONLY)
                # =========================
                "demandeur_name": i.demandeur_nom or (i.demandeur.username if i.demandeur else None),
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

    # l'utilisateur connecté devient le propriétaire technique de la fiche
    # (indépendant du "Demandeur" texte libre saisi dans le formulaire)
    data["cree_par_id"] = user.id

    # seuls le Technicien et l'Admin peuvent choisir les dates de début/fin
    if user.profil.value == "INTERVENANT":
        today_str = date.today().isoformat()
        data["date_debut"] = today_str
        data["date_fin"] = today_str

    # création via service
    try:
        intervention = create_intervention(db, data)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

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

    # seuls le Technicien et l'Admin peuvent modifier les dates de début/fin
    if user.profil.value == "INTERVENANT":
        update_data.pop("date_debut", None)
        update_data.pop("date_fin", None)

    # Une intervention "En attente de validation" doit toujours avoir un manager
    # assigné, sinon elle reste invisible/inaccessible pour tout manager.
    resulting_statut = update_data.get("statut", intervention.statut)
    resulting_statut = (
        resulting_statut.value if hasattr(resulting_statut, "value") else resulting_statut
    )
    resulting_manager_id = update_data.get("manager_id", intervention.manager_id)
    if resulting_statut == "EN_ATTENTE_VALIDATION" and not resulting_manager_id:
        raise HTTPException(
            status_code=400,
            detail="Un manager doit être assigné pour mettre une intervention en attente de validation",
        )

    if (
        "technicien_id" in update_data
        and update_data["technicien_id"] != intervention.technicien_id
    ):
        resulting_date_debut = update_data.get("date_debut", intervention.date_debut)
        resulting_date_fin = update_data.get("date_fin", intervention.date_fin)
        if not is_technicien_available(
            db,
            update_data["technicien_id"],
            resulting_date_debut,
            resulting_date_fin,
            exclude_id=id,
        ):
            raise HTTPException(
                status_code=400,
                detail="Ce technicien n'est pas disponible : il a déjà une intervention sur "
                "cette période ou une intervention prévue dans moins de "
                f"{TECHNICIEN_BUFFER_DAYS} jours.",
            )

    previous_statut = (
        intervention.statut.value
        if hasattr(intervention.statut, "value")
        else intervention.statut
    )

    try:
        result = update_intervention(db, intervention, update_data)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    if (
        resulting_statut in ["ABOUTI", "IMPOSSIBLE"]
        and resulting_statut != previous_statut
    ):
        send_completion_notification_email(intervention)

    return result


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

    try:
        return update_intervention(db, intervention, update_data)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


def update_intervention(db, intervention, update_data):
    if update_data.get("piece_jointe"):
        update_data["piece_jointe"] = normalize_piece_jointe(update_data["piece_jointe"])

    for field in ["services_de_la_commune", "sites_de_la_commune"]:
        if isinstance(update_data.get(field), list):
            update_data[field] = json.dumps(update_data[field], ensure_ascii=False)

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

    try:
        return send_to_manager(
            db, intervention, data["manager_id"], data["date_verification"]
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


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

    try:
        return validate_intervention(
            db,
            intervention,
            data["statut"],
            data.get("commentaire"),
            data.get("piece_jointe"),
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


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
    # que les interventions qu'il a lui-même créées
    if user.profil.value == "INTERVENANT" and intervention.cree_par_id != user.id:
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
