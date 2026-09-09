from datetime import date, datetime
from sqlalchemy.orm import Session

from models.intervention import Intervention, StatutIntervention
from models.user import User
from models.materiel import Materiel
from models.intervention_matériel import intervention_materiel

MANUAL_STATUTS = [
    StatutIntervention.EN_ATTENTE_VALIDATION.value,
    StatutIntervention.ABOUTI.value,
    StatutIntervention.IMPOSSIBLE.value,
    StatutIntervention.RESOLU.value,
]


# =========================================================
# UTIL : CHECK CHEVAUCHEMENT INTERVENTION TECHNICIEN
# =========================================================
def is_technicien_available(
    db: Session,
    Technicien_id: int,
    date_debut: datetime,
    date_fin: datetime,
    exclude_id=None,
):
    """
    Vérifie si un technicien est libre sur une période donnée
    """

    query = db.query(Intervention).filter(Intervention.technicien_id == Technicien_id)

    if exclude_id:
        query = query.filter(Intervention.id != exclude_id)

    interventions = query.all()

    for i in interventions:
        i_debut = to_date(i.date_debut)
        i_fin = to_date(i.date_fin)
        # chevauchement de planning
        if not (date_fin < i_debut or date_debut > i_fin):
            return False

    return True


# =========================================================
# VALIDATION DATES
# =========================================================
def validate_dates(date_debut, date_fin):
    """
    - date_fin ne peut pas être avant date_debut
    - doit être logique
    """

    if date_fin < date_debut:
        raise ValueError("La date de fin ne peut pas être avant la date de début")


def to_date(value):
    if value is None:
        return None
    if isinstance(value, date):
        return value
    return datetime.strptime(value, "%Y-%m-%d").date()


# =========================================================
# STATUT AUTOMATIQUE
# =========================================================
def compute_statut(intervention):

    statut = (
        intervention.statut.value
        if hasattr(intervention.statut, "value")
        else intervention.statut
    )

    # 🔒 LOCK MANAGER / WORKFLOW
    if hasattr(intervention, "lock_statut") and intervention.lock_statut:
        return statut

    if intervention.lock_statut:
        return statut

    if statut in ["ABOUTI", "IMPOSSIBLE"]:
        return statut

    echeance = intervention.echeance

    today = datetime.now().date()

    date_fin = to_date(intervention.date_fin)
    date_debut = to_date(intervention.date_debut)

    if date_fin and today > date_fin:
        return "EN_RETARD"

    if echeance and today > echeance:
        return "EN_RETARD"

    return statut


# =========================================================
# ASSIGNATION TECHNICIEN AVEC CONTRAINTE PLANNING
# =========================================================
def assign_technicien(db: Session, intervention: Intervention, technicien_id: int):

    technicien = db.query(User).filter(User.id == technicien_id).first()

    if not technicien:
        raise ValueError("Technicien introuvable")

    if (
        technicien.profil.value
        if hasattr(technicien.profil, "value")
        else technicien.profil
    ) != "TECHNICIEN":
        raise ValueError("L'utilisateur n'est pas un technicien")

    if not is_technicien_available(
        db, technicien_id, intervention.date_debut, intervention.date_fin
    ):
        raise ValueError("Technicien indisponible sur cette période")

    intervention.technicien_id = technicien_id


# =========================================================
# ASSIGNATION MANAGER AVEC CONTRAINTE DE PLANNING
# =========================================================
def assign_manager(db: Session, intervention: Intervention, manager_id: int):

    manager = db.query(User).filter(User.id == manager_id).first()

    if not manager:
        raise ValueError("Manager introuvable")

    if (
        manager.profil.value if hasattr(manager.profil, "value") else manager.profil
    ) != "MANAGER":
        raise ValueError("L'utilisateur n'est pas un manager")

    intervention.manager_id = manager_id


# =========================================================
# VALIDATION INTERVENTION PAR MANAGER
# =========================================================
def validate_intervention(
    db: Session, intervention: Intervention, statut: str, commentaire: str | None = None
):

    if statut not in [
        StatutIntervention.ABOUTI.value,
        StatutIntervention.IMPOSSIBLE.value,
    ]:
        raise ValueError("Statut invalide")

    intervention.statut = StatutIntervention(statut)

    if commentaire:
        intervention.commentaire = commentaire

    db.commit()
    db.refresh(intervention)

    return intervention


# =========================================================
# ENVOYER AU MANAGER (MÉTHODE SERVICE)
# =========================================================
def send_to_manager(
    db: Session, intervention: Intervention, manager_id: int, date_verification
):
    print("BEFORE:", intervention.statut)

    manager = db.query(User).filter(User.id == manager_id).first()

    if not manager:
        raise ValueError("Manager introuvable")

    if (
        manager.profil.value if hasattr(manager.profil, "value") else manager.profil
    ) != "MANAGER":
        raise ValueError("L'utilisateur n'est pas un manager")

    intervention.manager_id = manager_id
    intervention.date_verification = date_verification

    intervention.statut = StatutIntervention.EN_ATTENTE_VALIDATION
    intervention.lock_statut = True

    print("AFTER:", intervention.statut)

    db.commit()
    db.refresh(intervention)

    return intervention


# =========================================================
# UPDATE INTERVENTION (LOGIQUE MÉTIER CENTRALE)
# =========================================================
def parse_date(value):
    if value is None or value == "":
        return None
    if isinstance(value, datetime):
        return value.date()
    if isinstance(value, str):
        return datetime.strptime(value, "%Y-%m-%d").date()
    return value


# =========================================================
# UPDATE INTERVENTION (LOGIQUE MÉTIER CENTRALE)
# =========================================================
def update_intervention(db: Session, intervention: Intervention, data: dict):

    # =========================================
    # VALIDATION DATES
    # =========================================
    date_debut = parse_date(data.get("date_debut", intervention.date_debut))
    date_fin = parse_date(data.get("date_fin", intervention.date_fin))

    if date_debut and date_fin:
        validate_dates(date_debut, date_fin)

    # =========================================
    # UPDATE DE TOUS LES CHAMPS
    # =========================================
    for key, value in data.items():

        if key == "statut":
            if value is not None:
                value = value  # déjà string propre
            else:
                continue

        if key in ["date_debut", "echeance", "date_fin", "date_verification"]:
            value = parse_date(value)

            if hasattr(intervention, key):
                setattr(intervention, key, value)

        if key == "statut" and value:
            if isinstance(value, str):
                try:
                    value = StatutIntervention(value)
                except Exception:
                    pass

            setattr(intervention, "statut", value)
            continue
    # =========================================
    # STATUT AUTOMATIQUE
    # =========================================
    current_statut = (
        intervention.statut.value
        if hasattr(intervention.statut, "value")
        else intervention.statut
    )

    # IMPORTANT :
    # si le frontend envoie explicitement un statut
    # on ne recalcule PAS automatiquement
    if "statut" not in data:

        if current_statut not in MANUAL_STATUTS:
            intervention.statut = compute_statut(intervention)

    # =========================================
    # COMMIT UNIQUE
    # =========================================
    db.commit()
    db.refresh(intervention)

    return intervention


# =========================================================
# CREATE INTERVENTION (LOGIQUE MÉTIER)
# =========================================================


def create_intervention(db: Session, data: dict):

    print("DATA REÇU =", data)  # DEBUG IMPORTANT

    validate_dates(data["date_debut"], data["date_fin"])

    # 🔥 COPIE SAFE (IMPORTANT)
    clean_data = dict(data)

    # 🔥 AJOUTER LA DATE DE LA DEMANDE PAR DÉFAUT
    if "Date_de_la_demande" not in clean_data or not clean_data["Date_de_la_demande"]:
        clean_data["Date_de_la_demande"] = date.today()

    materiels_data = clean_data.pop("materiels", None)
    materiels_ids = clean_data.pop("materiels_ids", None)

    new_intervention = Intervention(**clean_data)

    new_intervention.statut = StatutIntervention.SIGNALE

    db.add(new_intervention)
    db.flush()

    if materiels_data:
        for m in materiels_data:
            materiel_id = m.get("id") or m.get("materiel", {}).get("id")

            quantite = m.get("quantite") or m.get("quantiteDemande") or 1

            db.execute(
                intervention_materiel.insert().values(
                    intervention_id=new_intervention.id,
                    materiel_id=materiel_id,
                    quantite=int(quantite),
                )
            )

    elif materiels_ids:
        for mid in materiels_ids:
            db.execute(
                intervention_materiel.insert().values(
                    intervention_id=new_intervention.id, materiel_id=mid, quantite=1
                )
            )

    db.commit()
    db.refresh(new_intervention)

    return new_intervention


# def create_intervention(db: Session, data: dict):

#     validate_dates(data["date_debut"], data["date_fin"])

#     materiels_ids = data.pop("materiels_ids", [])

#     new_intervention = Intervention(**data)

#     new_intervention.statut = StatutIntervention.SIGNALE

#     if materiels_ids:

#         materiels = (
#             db.query(Materiel)
#             .filter(Materiel.id.in_(materiels_ids))
#             .all()
#         )

#         new_intervention.materiels = materiels


#     db.commit()
#     db.refresh(new_intervention)

#     return new_intervention
