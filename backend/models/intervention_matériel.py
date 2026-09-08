from sqlalchemy import Table, Column, Integer, ForeignKey
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

    Column(
        "quantite",
        Integer,
        nullable=False,
        default=1
    )
)