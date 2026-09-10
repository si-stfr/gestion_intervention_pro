import os

from dotenv import load_dotenv

from sqlalchemy import create_engine
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
