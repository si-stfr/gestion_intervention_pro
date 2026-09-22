from datetime import datetime

from sqlalchemy import (
    Boolean,
    Column,
    DateTime,
    Integer,
    String,
    Text,
    Date,
    Float,
    Enum,
    ForeignKey,
)
from sqlalchemy.dialects.mysql import LONGTEXT
from database import Base
import enum
from sqlalchemy.orm import relationship
from typing import Optional

from models.intervention_matériel import intervention_materiel


# =========================================================
# ENUMS MÉTIER
# =========================================================
class StatutIntervention(str, enum.Enum):
    SIGNALE = "SIGNALE"
    EN_COURS = "EN_COURS"
    EN_RETARD = "EN_RETARD"
    EN_ATTENTE_VALIDATION = "EN_ATTENTE_VALIDATION"
    ABOUTI = "ABOUTI"
    IMPOSSIBLE = "IMPOSSIBLE"
    RESOLU = "RESOLU"


class SourceDemande(str, enum.Enum):
    DIRECT = "Direct"
    EMAIL = "E-mail"
    FORM = "Formcreator"
    HELPDESK = "Helpdesk"
    OTHER = "Other"
    PHONE = "Phone"
    WRITTEN = "Written"


class TypeIntervention(str, enum.Enum):
    LIVRAISON = "Livraison"
    INSTALLATION = "Installation"
    LIVRAISON_INSTALLATION = "Livraison + Installation"
    STOCKAGE = "Stockage"
    PRET_MATERIEL = "Prêt de Matériel"
    MISE_A_JOUR = "Mise à jour"
    AUTRE = "Autre"


class ResultatIntervention(str, enum.Enum):
    PROBLEME_RESOLU = "Problème résolu"
    NOUVELLE_INTERVENTION_NECESSAIRE = "Nouvelle intervention nécessaire"


# =========================================================
# TABLE INTERVENTION TECHNICIEN
# =========================================================
class Intervention(Base):
    __tablename__ = "interventions"

    id = Column(Integer, primary_key=True, index=True)

    Date_de_la_demande = Column(Date, nullable=False)

    demandeur_id = Column(Integer, ForeignKey("users.id"))
    technicien_id = Column(Integer, ForeignKey("users.id"))
    manager_id = Column(Integer, ForeignKey("users.id"), nullable=True)

    # utilisateur connecté ayant créé la fiche (sert aux permissions de suppression)
    cree_par_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    # nom du demandeur en texte libre (n'est pas forcément un compte du système)
    demandeur_nom = Column(String(255), nullable=True)
    demandeur_prenom = Column(String(255), nullable=True)
    demandeur_email = Column(String(255), nullable=True)
    demandeur_telephone = Column(String(50), nullable=True)

    titre = Column(String(255), nullable=False)

    description_de_la_panne = Column(String(500))

    statut = Column(
        Enum(StatutIntervention, values_callable=lambda obj: [e.value for e in obj]),
        default=StatutIntervention.SIGNALE,
    )

    source_demande = Column(
        Enum(SourceDemande, values_callable=lambda obj: [e.value for e in obj])
    )

    type_intervention = Column(
        Enum(TypeIntervention, values_callable=lambda obj: [e.value for e in obj])
    )

    type_intervention_autre = Column(String(255))

    services_de_la_commune = Column(Text, nullable=True)
    sites_de_la_commune = Column(Text, nullable=True)

    date_debut = Column(Date, nullable=False)

    date_fin = Column(Date)

    lieu = Column(String(255))
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)

    diagnostique_effectue = Column(String(500))

    actions_realisees = Column(String(500))

    resultat_intervention = Column(
        Enum(ResultatIntervention, values_callable=lambda obj: [e.value for e in obj]),
        nullable=True,
    )

    commentaire = Column(String(500))

    date_verification = Column(Date)

    lock_statut = Column(Boolean, default=False)

    created_at = Column(DateTime, default=datetime.utcnow)
    piece_jointe = Column(Text().with_variant(LONGTEXT, "mysql"), nullable=True)

    actions_relations = relationship(
        "ActionRealisee", back_populates="intervention", cascade="all, delete"
    )
    demandeur = relationship("User", foreign_keys=[demandeur_id])

    technicien = relationship("User", foreign_keys=[technicien_id])

    manager = relationship("User", foreign_keys=[manager_id])

    cree_par = relationship("User", foreign_keys=[cree_par_id])

    materiels = relationship(
        "Materiel", secondary=intervention_materiel, back_populates="interventions"
    )
    # materiel_id = Column(
    # Integer,
    # ForeignKey("materiels.id")
    # )

    # materiel = relationship("Materiel")
