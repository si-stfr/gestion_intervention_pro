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
            result = conn.execute(
                text(
                    "SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'interventions' AND column_name = 'piece_jointe'"
                )
            ).scalar()
            if result == 0:
                conn.execute(text("ALTER TABLE interventions ADD COLUMN piece_jointe TEXT NULL"))
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
