import base64
import json
import re
from datetime import date, datetime, timedelta
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
TECHNICIEN_BUFFER_DAYS = 4


def is_technicien_available(
    db: Session,
    Technicien_id: int,
    date_debut: datetime,
    date_fin: datetime,
    exclude_id=None,
):
    """
    Vérifie qu'un technicien :
    - n'a pas déjà une intervention active dont les dates chevauchent la période demandée,
    - n'a pas d'intervention active prévue pour commencer dans moins de TECHNICIEN_BUFFER_DAYS jours.
    """

    date_debut = to_date(date_debut)
    date_fin = to_date(date_fin)

    query = db.query(Intervention).filter(
        Intervention.technicien_id == Technicien_id,
        Intervention.statut.notin_(
            [StatutIntervention.ABOUTI.value, StatutIntervention.IMPOSSIBLE.value]
        ),
    )

    if exclude_id:
        query = query.filter(Intervention.id != exclude_id)

    interventions = query.all()

    today = date.today()
    buffer_limit = today + timedelta(days=TECHNICIEN_BUFFER_DAYS)

    for i in interventions:
        i_debut = to_date(i.date_debut)
        i_fin = to_date(i.date_fin)

        # chevauchement de planning
        if i_debut and i_fin and not (date_fin < i_debut or date_debut > i_fin):
            return False

        # intervention déjà prévue pour démarrer très bientôt
        if i_debut and today <= i_debut < buffer_limit:
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

    today = datetime.now().date()

    date_fin = to_date(intervention.date_fin)
    date_debut = to_date(intervention.date_debut)

    if date_fin and today > date_fin:
        return "EN_RETARD"

    # Tant que la date de début et la date de fin sont identiques (valeurs par
    # défaut jamais ajustées), le passage automatique en "En cours" est désactivé.
    if (
        statut == "SIGNALE"
        and date_debut
        and date_fin
        and date_debut != date_fin
        and today >= date_debut
    ):
        return "EN_COURS"

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
# NORMALISATION PIECE JOINTE
# =========================================================
def _is_valid_base64_data_url(value: str) -> bool:
    match = re.fullmatch(r"data:image/(png|jpeg|jpg);base64,([A-Za-z0-9+/=\r\n]+)", value)
    if not match:
        return False

    payload = match.group(2)
    if not payload:
        return False

    try:
        base64.b64decode(payload, validate=True)
        return True
    except Exception:
        return False


def normalize_piece_jointe(piece_jointe: str | None):
    if piece_jointe is None:
        return None

    normalized = str(piece_jointe).strip()

    if normalized == "":
        return None

    if normalized.startswith("data:image/"):
        if not _is_valid_base64_data_url(normalized):
            raise ValueError(
                "La pièce jointe doit être une image PNG, JPG ou JPEG valide encodée en base64."
            )
        return normalized

    if normalized.startswith("http://") or normalized.startswith("https://"):
        return normalized

    raise ValueError("La pièce jointe doit être une image PNG, JPG ou JPEG.")


# =========================================================
# NOTIFICATION EMAIL AU DEMANDEUR (INTERVENTION TERMINÉE / NON RÉSOLUE)
# =========================================================
STATUT_FINAL_LABELS = {
    StatutIntervention.ABOUTI.value: "Terminée",
    StatutIntervention.IMPOSSIBLE.value: "Non résolue",
}


def send_completion_notification_email(intervention: Intervention):
    from services.email_service import send_email

    if not intervention.demandeur_email:
        return

    statut_value = (
        intervention.statut.value
        if hasattr(intervention.statut, "value")
        else intervention.statut
    )
    statut_label = STATUT_FINAL_LABELS.get(statut_value, statut_value)

    image_html = ""
    image_attachment = None
    piece_jointe = intervention.piece_jointe

    if piece_jointe and piece_jointe.startswith("data:image/"):
        image_html = f'<p><img src="{piece_jointe}" alt="Photo de l\'intervention" style="max-width:400px;border-radius:8px;"></p>'
        try:
            header, b64_payload = piece_jointe.split(",", 1)
            subtype = header.split("/")[1].split(";")[0]
            image_attachment = {
                "filename": f"intervention_{intervention.id}.{subtype}",
                "content_base64": b64_payload,
                "subtype": subtype,
            }
        except Exception:
            image_attachment = None
    elif piece_jointe and piece_jointe.startswith("http"):
        image_html = f'<p><img src="{piece_jointe}" alt="Photo de l\'intervention" style="max-width:400px;border-radius:8px;"></p>'

    html_body = f"""
    <div style="font-family:Segoe UI,Tahoma,Geneva,Verdana,sans-serif;">
        <h2 style="color:#0074c7;">Intervention {statut_label}</h2>
        <p>Bonjour {intervention.demandeur_nom or ''},</p>
        <p>Votre demande d'intervention a été traitée avec le statut : <strong>{statut_label}</strong>.</p>
        <table style="border-collapse:collapse;">
            <tr><td style="padding:4px 8px;"><strong>Titre</strong></td><td style="padding:4px 8px;">{intervention.titre}</td></tr>
            <tr><td style="padding:4px 8px;"><strong>Type d'intervention</strong></td><td style="padding:4px 8px;">{intervention.type_intervention.value if intervention.type_intervention else '-'}</td></tr>
            <tr><td style="padding:4px 8px;"><strong>Description</strong></td><td style="padding:4px 8px;">{intervention.description_de_la_panne or '-'}</td></tr>
            <tr><td style="padding:4px 8px;"><strong>Lieu</strong></td><td style="padding:4px 8px;">{intervention.lieu or '-'}</td></tr>
            <tr><td style="padding:4px 8px;"><strong>Date de début</strong></td><td style="padding:4px 8px;">{intervention.date_debut or '-'}</td></tr>
            <tr><td style="padding:4px 8px;"><strong>Date de fin</strong></td><td style="padding:4px 8px;">{intervention.date_fin or '-'}</td></tr>
            <tr><td style="padding:4px 8px;"><strong>Actions réalisées</strong></td><td style="padding:4px 8px;">{intervention.actions_realisees or '-'}</td></tr>
            <tr><td style="padding:4px 8px;"><strong>Commentaire</strong></td><td style="padding:4px 8px;">{intervention.commentaire or '-'}</td></tr>
        </table>
        {image_html}
        <p>Ce message est envoyé automatiquement, merci de ne pas y répondre.</p>
    </div>
    """

    text_body = (
        f"Intervention {statut_label}\n\n"
        f"Titre : {intervention.titre}\n"
        f"Description : {intervention.description_de_la_panne or '-'}\n"
        f"Lieu : {intervention.lieu or '-'}\n"
        f"Date de début : {intervention.date_debut or '-'}\n"
        f"Date de fin : {intervention.date_fin or '-'}\n"
        f"Actions réalisées : {intervention.actions_realisees or '-'}\n"
        f"Commentaire : {intervention.commentaire or '-'}\n"
    )

    try:
        send_email(
            to_email=intervention.demandeur_email,
            subject=f"Intervention \"{intervention.titre}\" — {statut_label}",
            html_body=html_body,
            text_body=text_body,
            image_attachment=image_attachment,
        )
    except Exception:
        # La notification ne doit jamais faire échouer la validation de l'intervention.
        pass


# =========================================================
# VALIDATION INTERVENTION PAR MANAGER
# =========================================================
def validate_intervention(
    db: Session,
    intervention: Intervention,
    statut: str,
    commentaire: str | None = None,
    piece_jointe: str | None = None,
):

    if statut not in [
        StatutIntervention.ABOUTI.value,
        StatutIntervention.IMPOSSIBLE.value,
    ]:
        raise ValueError("Statut invalide")

    if piece_jointe is not None:
        normalized_piece = normalize_piece_jointe(piece_jointe)
        intervention.piece_jointe = normalized_piece

    intervention.statut = StatutIntervention(statut)

    # Date de complétion : toujours la date du jour, non modifiable par le Manager.
    intervention.date_verification = date.today()

    if commentaire:
        intervention.commentaire = commentaire

    db.commit()
    db.refresh(intervention)

    send_completion_notification_email(intervention)

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

        if key == "piece_jointe":
            normalized_attachment = normalize_piece_jointe(value)
            if normalized_attachment is not None:
                setattr(intervention, "piece_jointe", normalized_attachment)
            else:
                setattr(intervention, "piece_jointe", None)
            continue

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
# SUPPRESSION AUTOMATIQUE DES INTERVENTIONS TERMINÉES (> 1 AN)
# =========================================================
_last_cleanup_run = None
CLEANUP_THROTTLE = timedelta(hours=1)


def cleanup_old_completed_interventions(db: Session):
    global _last_cleanup_run

    now = datetime.utcnow()
    if _last_cleanup_run and now - _last_cleanup_run < CLEANUP_THROTTLE:
        return
    _last_cleanup_run = now

    cutoff = date.today() - timedelta(days=365)

    old_interventions = (
        db.query(Intervention)
        .filter(Intervention.statut == StatutIntervention.ABOUTI)
        .all()
    )

    for intervention in old_interventions:
        reference_date = intervention.date_verification or (
            intervention.created_at.date() if intervention.created_at else None
        )

        if reference_date and reference_date < cutoff:
            db.delete(intervention)

    db.commit()


# =========================================================
# CREATE INTERVENTION (LOGIQUE MÉTIER)
# =========================================================


def create_intervention(db: Session, data: dict):

    print("DATA REÇU =", data)  # DEBUG IMPORTANT

    validate_dates(data["date_debut"], data["date_fin"])

    technicien_id = data.get("technicien_id")
    if technicien_id and not is_technicien_available(
        db, technicien_id, data["date_debut"], data["date_fin"]
    ):
        raise ValueError(
            "Ce technicien n'est pas disponible : il a déjà une intervention sur "
            "cette période ou une intervention prévue dans moins de "
            f"{TECHNICIEN_BUFFER_DAYS} jours."
        )

    # 🔥 COPIE SAFE (IMPORTANT)
    clean_data = dict(data)

    # 🔥 AJOUTER LA DATE DE LA DEMANDE PAR DÉFAUT
    if "Date_de_la_demande" not in clean_data or not clean_data["Date_de_la_demande"]:
        clean_data["Date_de_la_demande"] = date.today()

    materiels_data = clean_data.pop("materiels", None)
    materiels_ids = clean_data.pop("materiels_ids", None)

    for field in ["services_de_la_commune", "sites_de_la_commune"]:
        if isinstance(clean_data.get(field), list):
            clean_data[field] = json.dumps(clean_data[field], ensure_ascii=False)

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
