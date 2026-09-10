from datetime import datetime, date
from sqlalchemy.orm import Session

from models.intervention import Intervention
from models.user import User


# =========================================================
# VERIFIER DISPONIBILITE TECHNICIEN
# =========================================================
def is_technicien_available(
    db: Session,
    technicien_id: int,
    date_debut: date,
    date_fin: date,
    exclude_intervention_id: int = None,
):
    """
    Vérifie si un technicien est disponible sur une période donnée
    en contrôlant les chevauchements d'interventions.
    """

    interventions = (
        db.query(Intervention).filter(Intervention.technicien_id == technicien_id).all()
    )

    for i in interventions:

        # ignore l'intervention en cours de modification
        if exclude_intervention_id and i.ID == exclude_intervention_id:
            continue

        # logique de chevauchement :
        # overlap si pas (fin < debut_existing OR debut > fin_existing)
        if not (date_fin < i.date_debut or date_debut > i.date_fin):
            return False

    return True


# =========================================================
# LISTE TECHNICIENS DISPONIBLES
# =========================================================
def get_available_techniciens(db: Session, date_debut: date, date_fin: date):
    """
    Retourne tous les techniciens libres sur une période donnée
    """

    techniciens = db.query(User).filter(User.profil == "TECHNICIEN").all()

    available = []

    for t in techniciens:
        if is_technicien_available(db, t.id, date_debut, date_fin):
            available.append(t)

    return available


# =========================================================
# BLOQUER CHANGEMENT DE DATE SI CONFLIT
# =========================================================
def can_update_dates(
    db: Session, intervention: Intervention, new_debut: date, new_fin: date
):
    """
    Empêche de modifier les dates si cela crée un conflit
    avec une autre intervention du même technicien.
    """

    if new_fin < new_debut:
        return False, "La date de fin ne peut pas être avant la date de début"

    if not intervention.technicien_id:
        return True, "OK"

    ok = is_technicien_available(
        db,
        intervention.technicien_id,
        new_debut,
        new_fin,
        exclude_intervention_id=intervention.id,
    )

    if not ok:
        return False, "Conflit de planning avec une autre intervention"

    return True, "OK"


# =========================================================
# AUTO STATUT (LOGIQUE MÉTIER)
# =========================================================
def compute_statut(intervention: Intervention):
    """
    Statuts automatiques :
    - Signalé : par défaut
    - En cours : date début atteinte
    - En retard : date fin dépassée
    """

    today = date.today()

    if intervention.date_fin and today > intervention.date_fin:
        return "En retard"

    if intervention.date_debut and today >= intervention.date_debut:
        return "En cours"

    return "Signalé"


# =========================================================
# SCORE DE CHARGE TECHNICIEN (OPTION AVANCÉE)
# =========================================================
def get_technicien_workload(db: Session, technicien_id: int):
    """
    Retourne le nombre d'interventions en cours pour un technicien
    """

    return (
        db.query(Intervention)
        .filter(
            Intervention.technicien_id == technicien_id,
            Intervention.statut.in_(["En cours", "Signalé"]),
        )
        .count()
    )