import { useEffect, useState } from "react";

import api from "../api/api";

import Sidebar from "../components/Sidebar";

import "../assets/CSS_JS/users.css";
import "../assets/CSS_JS/global.css";

export default function Users() {

  const [users, setUsers] = useState([]);

  const [editId, setEditId] = useState(null);

  const [form, setForm] = useState({
    username: "",
    email: "",
    telephone: "",
    password: "",
    profil: "INTERVENANT"
  });

    const [newPassword, setNewPassword] = useState("");
  // =========================================
  // FETCH USERS
  // =========================================
  const fetchUsers = async () => {

    try {

      const res = await api.get("/users/");

      setUsers(res.data);

    } catch (err) {

      console.error(err);
    }
  };

  useEffect(() => {

    fetchUsers();

  }, []);

  // =========================================
  // RESET FORM
  // =========================================
  const resetForm = () => {

    setForm({
      username: "",
      email: "",
      telephone: "",
      password: "",
      profil: "INTERVENANT"
    });

    setEditId(null);
  };

  // =========================================
  // CREATE USER
  // =========================================
  const createUser = async () => {

    try {

      await api.post("/auth/register", form);
      alert("Utilisateur créé avec succès")
      
      fetchUsers();

      resetForm();

    } catch (err) {

      console.error(err);
    }
  };

  // =========================================
  // START EDIT
  // =========================================
  const startEdit = (user) => {

    setEditId(user.id);

    setForm({
      username: user.username || "",
      email: user.email || "",
      telephone: user.telephone || "",
      password: "",
      profil: user.profil || "INTERVENANT"
    });
  };

  // =========================================
  // UPDATE USER
  // =========================================
  const updateUser = async () => {

    try {

      const payload = {

        username: form.username,

        email: form.email,

        telephone: form.telephone,

        profil: form.profil
      };
      
      // ajouter le password seulement si rempli
      if (form.password && form.password.trim() !== "") {
        payload.password = form.password;
      }

      await api.put(`/users/${editId}`, payload);
      alert("Utilisateur modifié avec succès")
        fetchUsers();

        resetForm();

      } catch (err) {

        console.error(err);
      }
  };

  // =========================================
  // DELETE USER
  // =========================================
  const deleteUser = async (id) => {
    const confirmDelete = window.confirm(
        "Supprimer cet utilisateur ?"
      );
    if (!confirmDelete) return;
    try {

      await api.delete(`/users/${id}`);
      fetchUsers();
    } catch (err) {
      alert(
        err?.response?.data?.detail ||
        "Erreur lors de la suppresion"
      );
    }
  };

  const adminCount = users.filter(
    (u) => u.profil === "ADMIN"
  ).length;

  const currentUser = JSON.parse(
  localStorage.getItem("user")
  );

  return (

    <div className="layout">

      <Sidebar />

      <div className="page-content">

        <h1 className="users-title">
          Gestion des utilisateurs
        </h1>

        {/* FORM */}
        <div className="users-card">

          {/* USERNAME */}
          <input
            className="users-input input-username"
            type="text"
            placeholder="Nom utilisateur"
            value={form.username}
            onChange={(e) =>
              setForm({
                ...form,
                username: e.target.value
              })
            }
          />

          {/* EMAIL */}
          <input
            className="users-input input-email"
            type="email"
            placeholder="Adresse email"
            value={form.email}
            onChange={(e) =>
              setForm({
                ...form,
                email: e.target.value
              })
            }
          />

          {/* TELEPHONE */}
          <input
            className="users-input input-telephone"
            type="text"
            placeholder="Téléphone"
            value={form.telephone}
            onChange={(e) =>
              setForm({
                ...form,
                telephone: e.target.value
              })
            }
          />

          {/* PASSWORD */}
          <input
            className="users-input input-password"
            type="password"
            placeholder={editId ? "Nouveau mot de passe (optionnel)" : "Mot de passe"}
            value={form.password}
            onChange={(e) =>
              setForm({
                ...form,
                password: e.target.value
              })
            }
          />

          {/* PROFIL */}
          <select
            className="users-select"
            value={form.profil}
            onChange={(e) =>
              setForm({
                ...form,
                profil: e.target.value
              })
            }
          >
            <option value="ADMIN">
              ADMIN
            </option>

            <option value="TECHNICIEN">
              TECHNICIEN
            </option>

            <option value="MANAGER">
              MANAGER
            </option>

            <option value="INTERVENANT">
              INTERVENANT
            </option>

          </select>

          {/* BUTTON */}
          {editId ? (

            <button
              className="users-button"
              onClick={updateUser}
            >
              Modifier utilisateur
            </button>

          ) : (

            <button
              className="users-button"
              onClick={createUser}
            >
              Créer utilisateur
            </button>

          )}

        </div>

        {/* USERS LIST */}
        <div className="users-list">

          {users.map((u) => (

            <div
              key={u.id}
              className="user-item"
            >

              <div className="user-info">

                <p>
                  <strong className="label-name">
                    Nom :
                  </strong>

                  {u.username}
                </p>

                <p>
                  <strong className="label-email">
                    Email :
                  </strong>

                  {u.email}
                </p>

                <p>
                  <strong className="label-phone">
                    Téléphone :
                  </strong>

                  {u.telephone || "-"}
                </p>

                <p>
                  <strong className="label-profil">
                    Profil :
                  </strong>

                  {u.profil}
                </p>

              </div>

              <div className="user-actions">

                <button
                  className="btn-edit"
                  onClick={() => startEdit(u)}
                >
                  Modifier
                </button>

                <button
                  className="btn-delete"
                  onClick={() => deleteUser(u.id)}
                  disabled={
                    (u.profil === "ADMIN" && adminCount === 1) || 
                    u.id === currentUser.id
                  }
                  title={
                    u.id === currentUser.id
                      ? "Impossible de supprimer votre compte acteul"
                      : u.profil === "ADMIN" && adminCount === 1
                      ? "Impossible de supprimer le dernier administrateur"
                      : ""
                  }
                >
                  Supprimer
                </button>

              </div>

            </div>

          ))}

        </div>

      </div>

    </div>
  );
}