import os

from dotenv import load_dotenv

from sqlalchemy import create_engine, text
from sqlalchemy.orm import declarative_base
from sqlalchemy.orm import sessionmaker

# =========================================================
# LOAD ENV
# =========================================================

load_dotenv()


# =========================================================
# DATABASE URL
# =========================================================

DATABASE_URL = os.getenv("DATABASE_URL")

if DATABASE_URL and DATABASE_URL.startswith("mysql://"):
    DATABASE_URL = DATABASE_URL.replace("mysql://", "mysql+pymysql://", 1)


# =========================================================
# MYSQL SSL (OPTIONNEL CLOUD)
# =========================================================

MYSQL_SSL_CA = os.getenv("MYSQL_SSL_CA")


# =========================================================
# ENGINE CONFIG
# =========================================================

connect_args = {}

# SSL uniquement si certificat fourni
if MYSQL_SSL_CA:
    connect_args = {"ssl": {"ca": MYSQL_SSL_CA}}


engine = create_engine(
    DATABASE_URL, pool_pre_ping=True, pool_recycle=300, connect_args=connect_args
)


def ensure_piece_jointe_column():
    if not DATABASE_URL:
        return

    with engine.begin() as conn:
        try:
            data_type = conn.execute(
                text(
                    "SELECT DATA_TYPE FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'interventions' AND column_name = 'piece_jointe'"
                )
            ).scalar()
            if data_type is None:
                conn.execute(
                    text("ALTER TABLE interventions ADD COLUMN piece_jointe LONGTEXT NULL")
                )
            elif data_type.lower() != "longtext":
                # La colonne existait en TEXT (limite ~64 Ko), trop petite pour une image
                # encodée en base64 -> on l'agrandit en LONGTEXT (jusqu'à 4 Go).
                conn.execute(
                    text("ALTER TABLE interventions MODIFY COLUMN piece_jointe LONGTEXT NULL")
                )
        except Exception:
            pass


def ensure_intervention_columns():
    """Ajoute les colonnes récentes du modèle Intervention si elles manquent encore."""
    if not DATABASE_URL:
        return

    columns_to_add = {
        "cree_par_id": "INT NULL",
        "demandeur_nom": "VARCHAR(255) NULL",
        "latitude": "FLOAT NULL",
        "longitude": "FLOAT NULL",
    }

    with engine.begin() as conn:
        for column_name, ddl_type in columns_to_add.items():
            try:
                exists = conn.execute(
                    text(
                        "SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'interventions' AND column_name = :col"
                    ),
                    {"col": column_name},
                ).scalar()
                if not exists:
                    conn.execute(
                        text(f"ALTER TABLE interventions ADD COLUMN {column_name} {ddl_type}")
                    )
            except Exception:
                pass


def ensure_demandeur_id_nullable():
    """demandeur_id n'est plus renseigné à la création (remplacé par demandeur_nom texte libre)."""
    if not DATABASE_URL:
        return

    with engine.begin() as conn:
        try:
            is_nullable = conn.execute(
                text(
                    "SELECT IS_NULLABLE FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'interventions' AND column_name = 'demandeur_id'"
                )
            ).scalar()
            if is_nullable == "NO":
                conn.execute(
                    text("ALTER TABLE interventions MODIFY COLUMN demandeur_id INT NULL")
                )
        except Exception:
            pass


def ensure_impact_nullable():
    """impact n'est plus renseigné par les formulaires (retiré de l'UI) mais reste en base."""
    if not DATABASE_URL:
        return

    with engine.begin() as conn:
        try:
            is_nullable = conn.execute(
                text(
                    "SELECT IS_NULLABLE, COLUMN_TYPE FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'interventions' AND column_name = 'impact'"
                )
            ).first()
            if is_nullable and is_nullable[0] == "NO":
                column_type = is_nullable[1]
                conn.execute(
                    text(f"ALTER TABLE interventions MODIFY COLUMN impact {column_type} NULL")
                )
        except Exception:
            pass


def ensure_actions_autre_dropped():
    """Supprime la colonne actions_autre, devenue inutile (remplacée par actions_realisees)."""
    if not DATABASE_URL:
        return

    with engine.begin() as conn:
        try:
            exists = conn.execute(
                text(
                    "SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'interventions' AND column_name = 'actions_autre'"
                )
            ).scalar()
            if exists:
                conn.execute(text("ALTER TABLE interventions DROP COLUMN actions_autre"))
        except Exception:
            pass


# =========================================================
# SESSION
# =========================================================

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


# =========================================================
# BASE MODEL
# =========================================================

Base = declarative_base()


# =========================================================
# GET DB DEPENDENCY
# =========================================================


def get_db():

    db = SessionLocal()

    try:
        yield db

    finally:
        db.close()
