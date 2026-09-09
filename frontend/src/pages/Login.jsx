import { useState } from "react";
import { useEffect } from "react";
import api from "../api/api";
import { useNavigate, Link } from "react-router-dom";
import "../assets/CSS_JS/Login.css";
import "../assets/CSS_JS/global.css";
import logo from "../assets/logo_msf.jpg";

export default function Login() {

  const navigate = useNavigate();

  const [form, setForm] = useState({
    username: "",
    password: ""
  });

  const [error, setError] = useState("");

  const handleKeyDown = (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    handleLogin();
  }
};

  const handleLogin = async (e) => {
    try {

      const res = await api.post("/auth/login", {
        username: form.username,
        password: form.password
      });
      
      const data = res.data;

      localStorage.setItem("token", data.access_token);
      localStorage.setItem("refresh_token", data.refresh_token);
      localStorage.setItem("user", JSON.stringify(data.user));
      localStorage.setItem("justLoggedIn", "true");

      const role = data.user.profil;

      if (role === "ADMIN") {
        navigate("/admin");
      } else if (role === "TECHNICIEN") {
        navigate("/generalview");
      } else if (role === "MANAGER") {
        navigate("/generalview");
      } else {
        navigate("/generalview");
      }

    } catch (err) {

      setError(
        err?.response?.data?.detail ||
        "Identifiants incorrects"
      );
    }
  };

  useEffect(() => {

    console.log(" LOGIN COMPONENT");
  });


  return (
    <div className="login-page">
      <div className="logo-container">
          <img
          src={logo}
          alt="Logo"
          className="sidebar-logo"
      /> 
      </div>

      <form
          className="login-form"
          onSubmit={(e) => {
            e.preventDefault();
            handleLogin();
          }}
        >

        <h2 className="login-title">Connexion</h2>

        {error && <p className="login-error">{error}</p>}

        {/* USERNAME */}
        <label className="label-user">Nom utilisateur</label>
        <input
          className="input-user"
          value={form.username}
          onChange={(e) =>
            setForm({ ...form, username: e.target.value })
          }
          // onKeyDown={handleKeyDown}
        />

        {/* PASSWORD */}
        <label className="label-password">Mot de passe</label>
        <input
          type="password"
          className="input-password"
          value={form.password}
          onChange={(e) =>
            setForm({ ...form, password: e.target.value })
          }
          // onKeyDown={handleKeyDown}
        />

        {/* LOGIN BUTTON */}
        <button 
          type = "submit"
          className="btn-login" 
          >
            Se connecter
        </button>

        {/* REGISTER */}
        <p className="register-text">
          Pas de compte ?{" "}
          <Link className="btn-register" to="/register">
            Créer un compte
          </Link>
        </p>

      </form>

    </div>
  );
}