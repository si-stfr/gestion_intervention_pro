import re
from datetime import date

from fastapi import HTTPException


# =========================================================
# VALIDATION EMAIL
# =========================================================
def validate_email(email: str):

    pattern = r"^[\w\.-]+@[\w\.-]+\.\w+$"

    if not re.match(pattern, email):
        raise HTTPException(
            status_code=400,
            detail="Adresse email invalide"
        )

    return True


# =========================================================
# VALIDATION TELEPHONE
# =========================================================
def validate_phone(phone: str):

    pattern = r"^[0-9+\-\s]{8,20}$"

    if not re.match(pattern, phone):
        raise HTTPException(
            status_code=400,
            detail="Numéro de téléphone invalide"
        )

    return True


# =========================================================
# VALIDATION PASSWORD
# =========================================================
def validate_password(password: str):

    if len(password) < 6:
        raise HTTPException(
            status_code=400,
            detail="Le mot de passe doit contenir au moins 6 caractères"
        )

    return True


# =========================================================
# VALIDATION DATES
# =========================================================
def validate_dates(date_debut, date_fin):

    if date_fin < date_debut:
        raise HTTPException(
            status_code=400,
            detail="La date de fin ne peut pas être avant la date de début"
        )

    return True


# =========================================================
# VALIDATION ECHEANCE
# =========================================================
def validate_echeance(date_debut, echeance, date_fin):

    if echeance < date_debut:
        raise HTTPException(
            status_code=400,
            detail="L'échéance ne peut pas être avant la date de début"
        )

    if echeance > date_fin:
        raise HTTPException(
            status_code=400,
            detail="L'échéance ne peut pas dépasser la date de fin"
        )

    return True


# =========================================================
# VALIDATION ROLE
# =========================================================
def validate_role(role: str):

    allowed_roles = [
        "Admin",
        "Technicien",
        "Intervenant"
    ]

    if role not in allowed_roles:
        raise HTTPException(
            status_code=400,
            detail="Rôle invalide"
        )

    return True


# =========================================================
# VALIDATION STATUT
# =========================================================
def validate_status(status: str):

    allowed = [
        "Signalé",
        "En cours",
        "En retard",
        "Abouti",
        "Impossible pour l'instant"
    ]

    if status not in allowed:
        raise HTTPException(
            status_code=400,
            detail="Statut invalide"
        )

    return True


# =========================================================
# VALIDATION PRIORITE
# =========================================================
def validate_priorite(priorite: str):

    allowed = [
        "Majeure",
        "Très haute",
        "Moyenne",
        "Basse",
        "Très basse"
    ]

    if priorite not in allowed:
        raise HTTPException(
            status_code=400,
            detail="Priorité invalide"
        )

    return True


# =========================================================
# VALIDATION URGENCE
# =========================================================
def validate_urgence(urgence: str):

    allowed = [
        "Très haute",
        "Haute",
        "Basse",
        "Très basse"
    ]

    if urgence not in allowed:
        raise HTTPException(
            status_code=400,
            detail="Urgence invalide"
        )

    return True


# =========================================================
# VALIDATION IMPACT
# =========================================================
def validate_impact(impact: str):

    allowed = [
        "Très haut",
        "Haut",
        "Moyen",
        "Bas",
        "Très bas"
    ]

    if impact not in allowed:
        raise HTTPException(
            status_code=400,
            detail="Impact invalide"
        )

    return True


# =========================================================
# VALIDATION TYPE INTERVENTION
# =========================================================
def validate_type_intervention(type_intervention: str):

    allowed = [
        "Maintenance",
        "Depannage",
        "Installation",
        "Mise_a_jour",
        "Reseau",
        "Sauvegarde",
        "Autre"
    ]

    if type_intervention not in allowed:
        raise HTTPException(
            status_code=400,
            detail="Type d'intervention invalide"
        )

    return True


# =========================================================
# VALIDATION RESULTAT INTERVENTION
# =========================================================
def validate_resultat(resultat: str):

    allowed = [
        "Probleme_resolu",
        "Resolu_partiellement",
        "Nouvelle_intervention_necessaire"
    ]

    if resultat not in allowed:
        raise HTTPException(
            status_code=400,
            detail="Résultat d'intervention invalide"
        )

    return True


# =========================================================
# VALIDATION ACTIONS
# =========================================================
def validate_actions(actions: list):

    allowed = [
        "Nettoyage_systeme",
        "Suppression_virus_ou_malware",
        "Installation_logiciel",
        "Reinstallation_systeme",
        "Remplacement_materiel",
        "Configuration_reseau",
        "Sauvegarde_ou_Restauration",
        "Mise_a_jour_systeme",
        "Autre"
    ]

    for action in actions:

        if action not in allowed:
            raise HTTPException(
                status_code=400,
                detail=f"Action invalide : {action}"
            )

    return True


# =========================================================
# VALIDATION CHAMPS OBLIGATOIRES
# =========================================================
def validate_required_fields(data: dict, fields: list):

    missing = []

    for field in fields:

        if field not in data or data[field] in [None, "", []]:
            missing.append(field)

    if missing:
        raise HTTPException(
            status_code=400,
            detail=f"Champs obligatoires manquants : {', '.join(missing)}"
        )

    return True