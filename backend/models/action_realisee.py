from sqlalchemy import Column
from sqlalchemy import Integer
from sqlalchemy import String
from sqlalchemy import Enum
from sqlalchemy import ForeignKey

from sqlalchemy.orm import relationship

from database import Base


class ActionRealisee(Base):

    __tablename__ = "actions_realisees"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    intervention_id = Column(
        Integer,
        ForeignKey(
            "interventions.id",
            ondelete="CASCADE"
        ),
        nullable=False
    )

    action_nom = Column(
        Enum(
            "Nettoyage_systeme",
            "Suppression_virus_ou_malware",
            "Installation_logiciel",
            "Reinstallation_systeme",
            "Remplacement_materiel",
            "Configuration_reseau",
            "Sauvegarde_ou_Restauration",
            "Mise_a_jour_systeme",
            "Autre",
            name="action_realisee_enum"
        ),
        nullable=False
    )

    action_autre = Column(
        String(255),
        nullable=True
    )

    intervention = relationship(
        "Intervention",
        back_populates="actions_relations"
    )