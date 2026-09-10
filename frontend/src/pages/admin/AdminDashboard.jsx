import { useEffect, useState } from "react";
import api from "../../api/api";
import "../../assets/CSS_JS/dashboard.css";
import "../../assets/CSS_JS/Sidebar.css";
import "../../assets/CSS_JS/global.css";

export default function AdminDashboard() {

  const [users, setUsers] = useState([]); // ✅ ICI EN HAUT

  const [stats, setStats] = useState({
    "Signalé": 0,
    "En cours": 0,
    "Abouti": 0
  });

  const [data, setData] = useState([]);

  const [form, setForm] = useState({
    User: "",
    Statut: "Signalé",
    Descriptif: "",
    Date_de_debut: "",
    Echeance: "",
    Date_de_fin: "",
    Latitude: "",
    Longitude: ""
  });

  const [editId, setEditId] = useState(null);

  const fetchUsers = () => {
  api.get("/users").then(res => setUsers(res.data));
  };

  const fetchStats = async () => {
    try {
      const res = await api.get("/integration/stats");
      setStats(res.data);
    } catch (err) {
      console.error("Erreur stats:", err);
    }
  };

  useEffect(() => {
    fetchStats();
    fetchData();
    fetchUsers();
  }, []);

  const fetchData = () => {

    api.get("/integration/")
      .then(res => {

        setData(res.data);

      });
  };

  const resetForm = () => {
    setForm({
      User: "",
      Profil: "",
      Statut: "Signalé",
      Descriptif: "",
      Date_de_debut: "",
      Echeance: "",
      Date_de_fin: "",
      Latitude: "",
      Longitude: ""
    });
    setEditId(null);
  };

  const addIntervention = () => {

    const cleanForm = {
      ...form,
      User: parseInt(form.User),
      Latitude: form.Latitude === "" ? null : parseFloat(form.Latitude),
      Longitude: form.Longitude === "" ? null : parseFloat(form.Longitude),
    };

    api.post("/integration/", cleanForm)
      .then((res) => {
        console.log("AJOUT OK :", res.data);
        fetchData();
        resetForm();
      })
      .catch(err => {
        console.error("ERREUR POST :", err.response?.data || err);
      });
  };

  const deleteIntervention = (id) => {
    api.delete(`/integration/${id}`).then(() => {
      fetchData();
      fetchStats();
    });
  };

  const startEdit = (item) => {
    setEditId(item.ID);

    setForm({
      User: item.User,
      Profil: item.Profil,
      Statut: item.Statut,
      Descriptif: item.Descriptif,
      Date_de_debut: item.Date_de_debut,
      Echeance: item.Echeance,
      Date_de_fin: item.Date_de_fin,
      Latitude: item.Latitude,
      Longitude: item.Longitude
    });
  };

  const updateIntervention = () => {

    const cleanForm = {
      ...form,
      User: parseInt(form.User),
      Latitude: form.Latitude ? parseFloat(form.Latitude) : null,
      Longitude: form.Longitude ? parseFloat(form.Longitude) : null,
    };

    api.put(`/integration/${editId}`, cleanForm)
      .then(() => {
        fetchData();
        fetchStats();
        resetForm();
      })
      .catch(err => {
        console.error("UPDATE ERROR:", err.response?.data || err);
      });
  };

  const getClass = (statut) => {
    if (statut === "Signalé") return "signalé";
    if (statut === "En cours") return "encours";
    if (statut === "Abouti") return "abouti";
    return "";
  };

  return (
    <div>

      <h2>Dashboard Admin</h2>

      {/* STATS */}
      <div className="card-grid">

        <div className="card signalé">
          <h3>Signalé</h3>
          <p>{stats["Signalé"]}</p>
        </div>

        <div className="card encours">
          <h3>En cours</h3>
          <p>{stats["En cours"]}</p>
        </div>

        <div className="card abouti">
          <h3>Abouti</h3>
          <p>{stats["Abouti"]}</p>
        </div>

      </div>

      {/* FORMULAIRE */}
      <div className="form-admin">

        <label className="form-label">Utilisateur</label>

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

        <label className="form-label">Profil</label>

        <select
          value={form.Profil}
          onChange={(e) => setForm({ ...form, Profil: e.target.value })}
        >
          <option value="">-- Choisir un profil --</option>
          <option>Admin</option>
          <option>Chef</option>
          <option>Intervenant</option>
        </select>

        <input placeholder="Description"
          value={form.Descriptif}
          onChange={(e) => setForm({ ...form, Descriptif: e.target.value })}
        />

        <select
          value={form.Statut}
          onChange={(e) => setForm({ ...form, Statut: e.target.value })}
        >
          <option>Signalé</option>
          <option>En cours</option>
          <option>Abouti</option>
        </select>

        <label className="form-label">Date de début</label>
        <input
          type="date"
          value={form.Date_de_debut}
          onChange={(e) => setForm({ ...form, Date_de_debut: e.target.value })}
        />

        <label className="form-label">Échéance</label>
        <input
          type="date"
          value={form.Echeance}
          onChange={(e) => setForm({ ...form, Echeance: e.target.value })}
        />

        <label className="form-label">Date de fin</label>
        <input
          type="date"
          value={form.Date_de_fin}
          onChange={(e) => setForm({ ...form, Date_de_fin: e.target.value })}
        />

        <input placeholder="Latitude"
          value={form.Latitude}
          onChange={(e) => setForm({ ...form, Latitude: e.target.value })}
        />

        <input placeholder="Longitude"
          value={form.Longitude}
          onChange={(e) => setForm({ ...form, Longitude: e.target.value })}
        />

        {editId ? (
          <button onClick={updateIntervention}>Modifier</button>
        ) : (
          <button onClick={addIntervention}>Ajouter</button>
        )}

      </div>

      {/* LISTE INTERVENTIONS */}
      <div className="intervention-list">

        {data.map((i) => (
          <div key={i.ID} className={`intervention-card ${getClass(i.Statut)}`}>

            <h4>{i.Descriptif}</h4>
            <p><strong>Utilisateur :</strong> {i.UserId}</p>
            <p><strong>Profil :</strong> {i.Profil}</p>
            <p><strong>Statut :</strong> {i.Statut}</p>

            <p>
              <strong>Date début :</strong>
              {" "}
              {i.Date_de_debut}
            </p>

            <p>
              <strong>Échéance :</strong>
              {" "}
              {i.Echeance}
            </p>

            <p>
              <strong>Date fin :</strong>
              {" "}
              {i.Date_de_fin}
            </p>

            <div className="actions">
              <button onClick={() => startEdit(i)}>Modifier</button>
              <button onClick={() => deleteIntervention(i.ID)}>Supprimer</button>
            </div>

          </div>
        ))}

      </div>

    </div>
  );
}