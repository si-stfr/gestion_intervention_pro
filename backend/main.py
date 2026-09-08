from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from database import Base
from database import engine
from dotenv import load_dotenv

import os

# =========================================================
# IMPORT MODELS
# IMPORTANT :
# Les imports sont nécessaires pour que SQLAlchemy
# crée correctement toutes les tables.
# =========================================================

from models.user import User
from models.intervention import Intervention
from models.refresh_token import RefreshToken
from models.materiel import Materiel
from models.action_realisee import ActionRealisee


# =========================================================
# IMPORT ROUTERS
# =========================================================

from routers.auth import router as auth_router
from routers.users import router as users_router
from routers.intervention import router as intervention_router
from routers.refresh import router as refresh_router
from routers.techniciens import router as techniciens_router
from routers.materiels import router as materiels_router


# =========================================================
# CREATE TABLES
# =========================================================

Base.metadata.create_all(bind=engine)


# =========================================================
# FASTAPI APP
# =========================================================

app = FastAPI(
    title="Gestion Intervention API",
    version="2.0.0"
)


# =========================================================
# CORS
# =========================================================

# origins = [
#     "http://localhost:5173",
#     "http://127.0.0.1:5173",
#     "http://192.168.10.220:5173"
# ]
load_dotenv()

configured_origins = os.getenv(
    "ALLOWED_ORIGINS",
    "https://gestion-intervention-pro-ruddy.vercel.app,http://localhost:5173",
)
origins = []
for origin in configured_origins.split(","):
    origin = origin.strip().rstrip("/")
    if origin and not origin.startswith(("http://", "https://")):
        origin = f"https://{origin}"
    if origin:
        origins.append(origin)

production_frontend_origin = "https://gestion-intervention-pro-ruddy.vercel.app"
if production_frontend_origin not in origins:
    origins.append(production_frontend_origin)


app.add_middleware(
    CORSMiddleware,

    allow_origins=origins,

    allow_credentials=True,

    allow_methods=["*"],

    allow_headers=["*"],
)


# =========================================================
# INCLUDE ROUTERS
# =========================================================

app.include_router(auth_router)

app.include_router(users_router)

app.include_router(intervention_router)

app.include_router(refresh_router)

app.include_router(techniciens_router)

app.include_router(materiels_router)


# =========================================================
# ROOT
# =========================================================

@app.get("/")
def root():

    return {
        "message": "API Gestion Intervention opérationnelle"
    }


# =========================================================
# HEALTH CHECK
# =========================================================

@app.get("/health")
def health():

    return {
        "status": "online"
    }