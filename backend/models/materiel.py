from sqlalchemy import Column
from sqlalchemy import Integer
from sqlalchemy import String
from sqlalchemy import ForeignKey
from models.intervention_matériel import intervention_materiel
from sqlalchemy.orm import relationship

from database import Base

class Materiel(Base):
    __tablename__ = "materiels"

    id = Column(Integer, primary_key=True)

    intervention_id = Column(
        Integer,
        ForeignKey("interventions.id"),
        nullable=True
    )

    type_de_materiel = Column(String(255))

    marque_ou_modele = Column(String(255))

    numero_de_serie = Column(String(255))

    utilisateur_concerne_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=True
    )

    lieu_stockage = Column(String(255), nullable=True)
    
    statut = Column(String(255))

    quantite = Column(Integer, default=1)

    interventions = relationship(
    "Intervention",
    secondary=intervention_materiel,
    back_populates="materiels"
)
  