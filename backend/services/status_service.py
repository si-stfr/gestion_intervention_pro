from datetime import date, datetime

from models.intervention import Intervention, StatutIntervention
from services.intervention_service import to_date


# =========================================================
# STATUT AUTOMATIQUE PRINCIPAL
# =========================================================
def compute_statut(intervention: Intervention):

    today = datetime.now().date()

    date_fin = to_date(intervention.date_fin)
    date_debut = to_date(intervention.date_debut)

    statut = (
        intervention.statut.value
        if hasattr(intervention.statut, "value")
        else intervention.statut
    )

    if statut in [
        StatutIntervention.ABOUTI.value,
        StatutIntervention.IMPOSSIBLE.value,
        StatutIntervention.EN_ATTENTE_VALIDATION.value,
    ]:
        return statut


# =========================================================
# STATUT FINAL MANUEL (FIN DE MISSION TECHNICIEN)
# =========================================================
def compute_final_statut(user_choice: str):
    """
    Le technicien choisit le statut final :

    - Abouti
    - Impossible pour l'instant
    """

    allowed = ["Abouti", "Impossible pour l'instant"]

    if user_choice not in allowed:
        raise ValueError("Statut final invalide")

    return user_choice


# =========================================================
# VALIDATION TRANSITION STATUT
# =========================================================
def can_change_status(intervention: Intervention, new_status: str):
    """
    Contrôle des transitions autorisées
    """

    current = intervention.Statut

    # =====================================================
    # CAS 1 : verrouillage si intervention terminée
    # =====================================================
    if current in ["Abouti", "Impossible pour l'instant"]:
        return False, "Intervention déjà terminée"

    # =====================================================
    # CAS 2 : impossible de sauter les étapes
    # =====================================================
    if new_status == "En cours" and current == "Signalé":
        return True, "OK"

    if new_status in ["Abouti", "Impossible pour l'instant"] and current == "En cours":
        return True, "OK"

    # =====================================================
    # CAS 3 : retard automatique (toujours autorisé)
    # =====================================================
    if new_status == "En retard":
        return True, "OK"

    return False, "Transition de statut interdite"


# =========================================================
# FORCER MISE À JOUR STATUT (AUTO SYSTEM)
# =========================================================
def auto_update_status(intervention: Intervention):
    """
    Met à jour le statut automatiquement sans validation utilisateur
    """

    intervention.statut = compute_statut(intervention)
    return intervention


# =========================================================
# PRIORITÉ VISUELLE (OPTION FRONTEND)
# =========================================================
def get_status_color(status: str):
    """
    Sert pour le frontend :
    - En retard = orange
    - Impossible = violet
    """

    colors = {
        "Signalé": "red",
        "En cours": "yellow",
        "En retard": "orange",
        "Abouti": "green",
        "Impossible pour l'instant": "purple",
    }

    return colors.get(status, "red")
