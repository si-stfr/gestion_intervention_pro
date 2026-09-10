import { useState } from "react";
import api from "../api/api";
import "../assets/CSS_JS/Home.css";
import "../assets/CSS_JS/global.css";

export default function Home() {

  const [user, setUser] = useState("");
  const [profil, setProfil] = useState("Intervenant");

  const login = async () => {
    try {

      const res = await api.post("/login", {
        user,
        profil
      });

      console.log("LOGIN RESPONSE:", res.data);

      localStorage.setItem("token", res.data.access_token);
      localStorage.setItem("refresh", res.data.refresh_token);
      localStorage.setItem("role", res.data.user.role);
      localStorage.setItem("username", res.data.user.username);
      localStorage.setItem("userId", res.data.user.id);

      console.log("TOKEN STORED:", localStorage.getItem("token"));

      if (res.data.user.role === "Admin") {
        window.location.href = "/admin";
      }
      else if (res.data.user.role === "Chef") {
        window.location.href = "/chef";
      }
      else {
        window.location.href = "/dashboard";
      }

    } catch (err) {

      console.log(err);

      alert("Utilisateur ou profil incorrect");
    }
  };

  return (
    <div className="login-page">

      <div className="login-form">

        <h2 className="login-title">Connexion</h2>

        <label className="form-label label-user">Utilisateur</label>
        <input
          className="form-input input-user"
          value={user}
          onChange={(e) => setUser(e.target.value)}
        />

        <label className="form-label label-profil">Profil</label>
        <select
          className="form-select select-profil"
          value={profil}
          onChange={(e) => setProfil(e.target.value)}
        >
          <option value="Intervenant">Intervenant</option>
          <option value="Chef">Chef</option>
          <option value="Admin">Admin</option>
        </select>

        <button className="form-button" onClick={login}>
          Se connecter
        </button>

      </div>

    </div>
  );
}