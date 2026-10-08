from sqlalchemy import Table, Column, Integer, String, ForeignKey
from database import Base

intervention_materiel = Table(
    "intervention_materiel",
    Base.metadata,

    Column(
        "intervention_id",
        Integer,
        ForeignKey("interventions.id", ondelete="CASCADE"),
        primary_key=True
    ),

    Column(
        "materiel_id",
        Integer,
        ForeignKey("materiels.id"),
        primary_key=True
    ),

    # quantité demandée / attendue
    Column(
        "quantite",
        Integer,
        nullable=False,
        default=1
    ),

    # Livraison en magasin : quantité réellement reçue et état à la réception
    Column("quantite_recue", Integer, nullable=True),
    Column("etat_reception", String(30), nullable=True),
)