import { useEffect, useState } from "react";
import api from "../api/api";
import "../assets/CSS_JS/Tableau.css";
import "../assets/CSS_JS/global.css";

export default function Tableau() {
  const [data, setData] = useState([]);
  const [statut, setStatut] = useState("");
  const [profil, setProfil] = useState("");
  const [stats, setStats] = useState({
    "Signalé": 0,
    "En cours": 0,
    "Abouti": 0
  });

  const [form, setForm] = useState({
    User: "", // devient USER ID
    Statut: "Signalé",
    Descriptif: "",
    Date_de_debut: "",
    Echeance: "",
    Date_de_fin: "",
    Latitude: "",
    Longitude: ""
  });

  const fetchStats = async () => {
    try {
      const res = await api.get("/integration/stats");
      setStats(res.data);
    } catch (err) {
      console.error("Erreur stats:", err);
    }
  };

  const [editId, setEditId] = useState(null);

  useEffect(() => {
    const p = localStorage.getItem("role");

    if (!p) {
      window.location.href = "/";
      return;
    }

    setProfil(p);
    fetchData();

    if (p === "Admin") {
      fetchUsers();
    }

  }, []);

  const fetchData = async () => {
    try {
      const res = await api.get("/integration/");
      setData(res.data);
    } catch (err) {
      console.error("GET ERROR :", err);
    }
  };

  const filtered = data.filter((i) =>
    statut === "" || i.Statut === statut
  );

  const addIntervention = () => {

  const cleanForm = {
    ...form,
    User: parseInt(form.User || form.UserId),
    Latitude: parseFloat(form.Latitude),
    Longitude: parseFloat(form.Longitude)
  };

  api.put(`/integration/${editId}`, cleanForm)
      .then(() => {
        fetchData();
        resetForm();
      })
      .catch(err => console.error("Erreur POST :", err));
  };

  const deleteIntervention = async (id) => {
    try {
      await api.delete(`/integration/${id}`);
      await fetchData();

      if (typeof fetchStats === "function") {
        await fetchStats();
      }

    } catch (err) {
      console.error("DELETE ERROR :", err);
    }
  };

  const startEdit = (item) => {
    setEditId(item.ID);
    setForm(item);
  };

  const updateIntervention = () => {
    api.put(`/integration/${editId}`, form)
      .then(() => {
        fetchData();
        setEditId(null);
        resetForm();
      });
  };

  const resetForm = () => {
    setForm({
      User: "",
      Statut: "Signalé",
      Descriptif: "",
      Date_de_debut: "",
      Echeance: "",
      Date_de_fin: "",
      Latitude: "",
      Longitude: ""
    });
  };

  const getStatutClass = (statut) => {
    if (statut === "Signalé") return "signalé";
    if (statut === "En cours") return "encours";
    if (statut === "Abouti") return "abouti";
    return "";
  };

  const [users, setUsers] = useState([]);

    const fetchUsers = () => {
      const role = localStorage.getItem("role");

      if (role !== "Admin") return;

      api.get("/users")
        .then(res => setUsers(res.data))
        .catch(err => console.error(err));
    };

  return (
    <div className="tableau-container">

      <h1 className="titre-principal">Tableau des interventions</h1>

      <div className="filters">
        <select
          className={`select-statut ${getStatutClass(statut)}`}
          onChange={(e) => setStatut(e.target.value)}
        >
          <option value="">Tous</option>
          <option>Signalé</option>
          <option>En cours</option>
          <option>Abouti</option>
        </select>
      </div>

      {profil === "Admin" && (
        <div className="admin-panel">
          <h2 className="admin-title">Gestion Admin</h2>

          <div className="admin-grid">

            <select
              value={form.User}
              onChange={(e) => setForm({ ...form, User: e.target.value })}
            >
              <option value="">-- Choisir un utilisateur --</option>

              {users.map(u => (
                <option key={u.id} value={u.id}>
                  {u.username}
                </option>
              ))}
            </select>

            <input
              placeholder="Description"
              value={form.Descriptif}
              onChange={(e) => setForm({...form, Descriptif: e.target.value})}
            />

            <select
              value={form.Statut}
              onChange={(e) => setForm({...form, Statut: e.target.value})}
            >
              <option>Signalé</option>
              <option>En cours</option>
              <option>Abouti</option>
            </select>

            <div className="form-field">
              <label>Date de début</label>
              <input
                type="date"
                value={form.Date_de_debut}
                onChange={(e) => setForm({...form, Date_de_debut: e.target.value})}
              />
            </div>

            <div className="form-field">
              <label>Date d'échéance</label>
              <input
                type="date"
                value={form.Echeance}
                onChange={(e) => setForm({...form, Echeance: e.target.value})}
              />
            </div>

            <div className="form-field">
              <label>Date de fin</label>
              <input
                type="date"
                value={form.Date_de_fin}
                onChange={(e) => setForm({...form, Date_de_fin: e.target.value})}
              />
            </div>

            <input
              type="number"
              step="any"
              placeholder="Latitude"
              value={form.Latitude}
              onChange={(e) => setForm({...form, Latitude: e.target.value})}
            />

            <input
              type="number"
              step="any"
              placeholder="Longitude"
              value={form.Longitude}
              onChange={(e) => setForm({...form, Longitude: e.target.value})}
            />

          </div>

          {editId ? (
            <button className="admin-btn" onClick={updateIntervention}>
              Modifier
            </button>
          ) : (
            <button className="admin-btn" onClick={addIntervention}>
              Ajouter
            </button>
          )}
        </div>
      )}

      <div className="table-wrapper">
        <table className="table-interventions">
          <thead>
            <tr>
              <th>User</th>
              <th>Statut</th>
              <th>Description</th>
              <th>Date début</th>
              <th>Échéance</th>
              <th>Date fin</th>
              <th>Géolocalisation</th>
              {profil === "Admin" && <th>Actions</th>}
            </tr>
          </thead>

          <tbody>
            {filtered.map((i) => (
              <tr key={i.ID} className={`ligne ${getStatutClass(i.Statut)}`}>
                <td>{i.UserId}</td>
                <td className={`statut ${getStatutClass(i.Statut)}`}>{i.Statut}</td>
                <td>{i.Descriptif}</td>
                <td>{new Date(i.Date_de_debut).toLocaleDateString()}</td>
                <td>{new Date(i.Echeance).toLocaleDateString()}</td>
                <td>{new Date(i.Date_de_fin).toLocaleDateString()}</td>
                <td>{i.Latitude}, {i.Longitude}</td>

                {profil === "Admin" && (
                  <td>
                    <button onClick={() => startEdit(i)}>✏</button>
                    <button onClick={() => deleteIntervention(i.ID)}>🗑</button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}