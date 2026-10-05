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
# LIAISON MANAGER <-> TECHNICIENS
# (déclarées avant "/{user_id}" pour ne pas être masquées par cette route)
# =========================================================
def _role_value(user):
    return user.profil.value if hasattr(user.profil, "value") else user.profil


def _technicien_dict(t):
    return {
        "id": t.id,
        "username": t.username,
        "email": t.email,
        "telephone": t.telephone,
        "profil": _role_value(t),
        "manager_id": t.manager_id,
    }


@router.get("/techniciens")
def list_techniciens(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """
    Manager : ses techniciens + les techniciens encore libres
    (jamais ceux déjà rattachés à un autre manager).
    Admin : tous les techniciens.
    """
    role = _role_value(current_user)

    if role not in ("MANAGER", "ADMIN"):
        raise HTTPException(status_code=403, detail="Accès refusé")

    query = db.query(User).filter(User.profil == UserRole.TECHNICIEN)

    if role == "MANAGER":
        query = query.filter(
            (User.manager_id == None) | (User.manager_id == current_user.id)  # noqa: E711
        )

    return [_technicien_dict(t) for t in query.order_by(User.username).all()]


@router.put("/techniciens/{technicien_id}/assign")
def assign_technicien_to_me(
    technicien_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    if _role_value(current_user) != "MANAGER":
        raise HTTPException(status_code=403, detail="Réservé aux managers")

    technicien = (
        db.query(User)
        .filter(User.id == technicien_id, User.profil == UserRole.TECHNICIEN)
        .first()
    )

    if not technicien:
        raise HTTPException(status_code=404, detail="Technicien introuvable")

    if technicien.manager_id and technicien.manager_id != current_user.id:
        raise HTTPException(
            status_code=400,
            detail="Ce technicien est déjà rattaché à un autre manager",
        )

    technicien.manager_id = current_user.id
    db.commit()

    return _technicien_dict(technicien)


@router.delete("/techniciens/{technicien_id}/assign")
def unassign_technicien_from_me(
    technicien_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    if _role_value(current_user) != "MANAGER":
        raise HTTPException(status_code=403, detail="Réservé aux managers")

    technicien = (
        db.query(User)
        .filter(User.id == technicien_id, User.profil == UserRole.TECHNICIEN)
        .first()
    )

    if not technicien:
        raise HTTPException(status_code=404, detail="Technicien introuvable")

    if technicien.manager_id != current_user.id:
        raise HTTPException(
            status_code=400,
            detail="Ce technicien n'est pas rattaché à votre équipe",
        )

    technicien.manager_id = None
    db.commit()

    return _technicien_dict(technicien)


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
        previous_role = _role_value(user)
        user.profil = data.profil

        # un utilisateur qui n'est plus manager libère ses techniciens ;
        # un utilisateur qui n'est plus technicien n'a plus de manager
        if previous_role == "MANAGER" and data.profil != "MANAGER":
            db.query(User).filter(User.manager_id == user.id).update(
                {"manager_id": None}
            )
        if previous_role == "TECHNICIEN" and data.profil != "TECHNICIEN":
            user.manager_id = None

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