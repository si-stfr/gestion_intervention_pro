from database import SessionLocal
from models import User
from auth import hash_password

db = SessionLocal()

users = [
    User(username="admin", profil="Admin"),
    User(username="chef1", profil="Chef"),
    User(username="user1", profil="Intervenant"),
]

db.add_all(users)
db.commit()

print("Users créés avec succès")