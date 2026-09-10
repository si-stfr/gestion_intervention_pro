from pydantic import BaseModel
from typing import Optional, List
from datetime import date, datetime

from models.intervention import ResultatIntervention


# =========================================================
# ACTIONS REALISÉES (liste contrôlée)
# =========================================================
class InterventionBase(BaseModel):
    titre: str
    description_de_la_panne: str

    Date_de_la_demande: date

    date_debut: date
    echeance: date
    date_fin: date

    lieu: str | None = None

    statut: str = "Signalé"

    # Source de la demande
    source_demande: str

    # Niveau d'importance
    urgence: str
    impact: str
    priorite: str

    # Type intervention
    type_intervention: str

    # Diagnostic + suivi technicien
    diagnostique_effectue: Optional[str] = None
    commentaire: Optional[str] = None

    # Résultat final
    resultat_intervention: Optional[str] = None

    # relations
    demandeur_id: int
    technicien_id: int

    # équipements liés (optionnel au départ)
    materiel_ids: Optional[List[int]] = []

    manager_id: Optional[int] = None
    date_verification: Optional[date] = None


# =========================================================
# CREATE INTERVENTION
# =========================================================
class InterventionCreate(InterventionBase):
    """
    Champs remplis par Admin / Intervenant
    """

    pass


class MaterielResponse(BaseModel):
    id: int
    marque_ou_modele: str | None = None
    numero_de_serie: str | None = None
    quantite: int = 1

    class Config:
        from_attributes = True


# =========================================================
# UPDATE INTERVENTION (TECHNICIEN)
# =========================================================
class InterventionTechnicienUpdate(BaseModel):
    """
    Champs modifiables par le technicien uniquement
    """

    echeance: Optional[date] = None
    date_fin: Optional[date] = None
    date_debut: Optional[date] = None

    actions_realisees: Optional[str] = None
    diagnostique_effectue: Optional[str] = None
    commentaire: Optional[str] = None

    date_verification: Optional[date] = None
    resultat_intervention: Optional[ResultatIntervention] = None


# =========================================================
# RESPONSE (GET API)
# =========================================================
class InterventionResponse(BaseModel):
    id: int

    # ===== INFOS PRINCIPALES =====
    statut: str
    titre: str
    description_de_la_panne: str

    Date_de_la_demande: date

    # ===== DEMANDE =====
    demandeur_id: int
    technicien_id: Optional[int] = None

    # (optionnel mais recommandé pour frontend)
    user_name: Optional[str] = None
    technicien_name: Optional[str] = None

    # ===== CLASSIFICATION =====
    source_demande: str
    urgence: str
    impact: str
    priorite: str

    type_intervention: str
    type_autre: Optional[str] = None

    # ===== DATES =====
    date_debut: date
    echeance: date
    date_fin: Optional[date] = None

    created_at: Optional[datetime] = None

    # ===== GEO ==
    lieu: str | None = None

    # ===== SUIVI =====
    diagnostique_effectue: Optional[str] = None
    commentaire: Optional[str] = None
    resultat_intervention: Optional[str] = None

    # ===== MANAGER =====
    manager_id: Optional[int] = None
    date_verification: Optional[date] = None
    materiels: list[MaterielResponse] = []

    class Config:
        from_attributes = True


class InterventionUpdate(BaseModel):
    demandeur_id: Optional[int] = None
    technicien_id: Optional[int] = None

    titre: Optional[str] = None
    description_de_la_panne: Optional[str] = None

    statut: Optional[str] = None
    source_demande: Optional[str] = None
    urgence: Optional[str] = None
    impact: Optional[str] = None
    priorite: Optional[str] = None

    type_intervention: Optional[str] = None
    type_intervention_autre: Optional[str] = None

    date_debut: Optional[str] = None
    echeance: Optional[str] = None
    date_fin: Optional[str] = None

    lieu: str | None = None

    class Config:
        from_attributes = True
