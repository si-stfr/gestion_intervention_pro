import { useEffect, useState } from "react";
import api from "../../api/api";
import "../../assets/CSS_JS/users.css";

export default function Users() {

  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({
    username: "",
    profil: "Intervenant"
  });

  const fetchUsers = () => {
    api.get("/users").then(res => setUsers(res.data));
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const createUser = () => {
    api.post("/users", form).then(() => {
      fetchUsers();
    });
  };

  const deleteUser = (id) => {
    api.delete(`/users/${id}`).then(fetchUsers);
  };

  return (
    <div className="users-container">

      <h2 className="users-title">Gestion utilisateurs</h2>

      {/* USERNAME */}
      <input
        className="input-user"
        placeholder="Username"
        value={form.username}
        onChange={(e) => setForm({...form, username: e.target.value})}
      />

      {/* PROFIL */}
      <select
        className="select-profil"
        value={form.profil}
        onChange={(e) => setForm({...form, profil: e.target.value})}
      >
        <option value="Admin">Admin</option>
        <option value="Chef">Chef</option>
        <option value="Intervenant">Intervenant</option>
      </select>

      <button className="btn-create" onClick={createUser}>
        Créer
      </button>

      <ul className="user-list">
        {users.map(u => (
          <li key={u.id} className="user-item">
            {u.username} ({u.profil})
            <button className="btn-delete" onClick={() => deleteUser(u.id)}>
              ❌
            </button>
          </li>
        ))}
      </ul>

    </div>
  );
}