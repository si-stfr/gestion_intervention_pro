# 📊 Gestion des Interventions

Application web fullstack permettant de gérer des interventions avec authentification et gestion de rôles.

---

## 🚀 Technologies utilisées

### Backend
- FastAPI
- SQLAlchemy
- MySQL (MariaDB)
- JWT (python-jose)

### Frontend
- React (Vite)
- Axios
- React Router DOM
- React Toastify

---

## ⚙️ Installation

### 1. Backend

```bash
cd backend
pip install fastapi uvicorn sqlalchemy pymysql python-jose passlib
Lancer le serveur : python -m uvicorn main:app --reload

2. Frontend
cd frontend
npm install

Lancer : npm run dev

🗄️ Base de données

Créer une base MySQL :

gestion_integration

Importer le fichier SQL fourni.

🔐 Comptes utilisateurs
Role	Accès
Admin	complet
Chef	lecture globale
Intervenant	ses interventions
📌 Fonctionnalités
Authentification JWT
Gestion utilisateurs
CRUD interventions
Dashboard par rôle
Statuts : Signalé / En cours / Abouti
Géolocalisation
Refresh token automatique
⚠️ Sécurité
Routes protégées backend
Middleware JWT
Vérification des rôles