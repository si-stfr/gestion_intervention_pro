from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
from models.user import User, UserRole
from schemas.user import UserResponse, UserUpdate

from middleware.auth_middleware import get_current_user, require_admin
from models.intervention import Intervention

from auth.security import hash_password

router = APIRouter(prefix="/users", tags=["Users"])


# =========================================================
# PROFIL UTILISATEUR CONNECTÉ
# =========================================================
@router.get("/me", response_model=UserResponse)
def get_my_profile(user=Depends(get_current_user)):
    return user


# =========================================================
# LISTE USERS (ADMIN)
# =========================================================
@router.get("/", response_model=list[UserResponse])
def get_users(
    db: Session = Depends(get_db),
    admin=Depends(require_admin)
):
    return db.query(User).all()


# =========================================================
# GET USER BY ID (ADMIN)
# =========================================================
@router.get("/{user_id}", response_model=UserResponse)
def get_user(
    user_id: int,
    db: Session = Depends(get_db),
    admin=Depends(require_admin)
):

    user = db.query(User).filter(User.id == user_id).first()

    if not user:
        raise HTTPException(status_code=404, detail="Utilisateur introuvable")

    return user


# =========================================================
# UPDATE USER (ADMIN ONLY)
# =========================================================
@router.put("/{user_id}")
def update_user(
    user_id: int,
    data: UserUpdate,
    db: Session = Depends(get_db),
    admin=Depends(require_admin)
):

    user = db.query(User).filter(User.id == user_id).first()

    if not user:
        raise HTTPException(status_code=404, detail="Utilisateur introuvable")

    # update champs autorisés
    if data.username:
        user.username = data.username

    if data.email:
        user.email = data.email

    if data.telephone:
        user.telephone = data.telephone

    if data.password:
        user.hashed_password = hash_password(data.password)
        print("Nouveau mot de passe reçu :", data.password)
        
    # changement rôle (STRICT ADMIN)
    if data.profil:
        user.profil = data.profil
 
    print("Hash enregistré :", user.hashed_password)
    db.commit()

    return {"message": "Utilisateur mis à jour"}


# =========================================================
# DELETE USER (ADMIN ONLY)
# =========================================================
@router.delete("/{user_id}")
def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    admin=Depends(require_admin),
    current_user =Depends(get_current_user)
):

    user = db.query(User).filter(User.id == user_id).first()
    
    if not user:
        raise HTTPException(status_code=404, detail="Utilisateur introuvable")
    
    if user_id == current_user.id:
        raise HTTPException(
            status_code=400,
            detail="Vous ne pouvez pas supprimer votre propre compte")
    
    if user.profil == "ADMIN":
        nb_admins = db.query(User).filter(User.profil == "ADMIN").count()
        if nb_admins <=1:
            raise HTTPException(
                status_code=400,
                detail="Impossible de supprimer le dernier administrateur")


    interventions = db.query(Intervention).filter(
    (Intervention.demandeur_id == user_id) |
    (Intervention.technicien_id == user_id) |
    (Intervention.manager_id == user_id)
    ).count()

    if interventions > 0:
        raise HTTPException(
        status_code=400,
        detail="Impossible de supprimer cet utilisateur car des interventions lui sont associées.")
    
    db.delete(user)
    db.commit()

    return {"message": "Utilisateur supprimé"}