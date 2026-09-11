import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../assets/CSS_JS/Register.css";
import "../assets/CSS_JS/global.css";

export default function Register() {

  const navigate = useNavigate();

  const { register } = useAuth();

  const [form, setForm] = useState({
    username: "",
    email: "",
    telephone: "",
    password: "",
    profil: "INTERVENANT"
  });

  const [error, setError] = useState("");

  const handleSubmit = async (e) => {

    e.preventDefault();

    const result = await register(form);

    if (!result.success) {

      setError(result.message);

      return;
    }

    navigate("/");
  };

  return (

    <div className="register-page">

      <form
        className="register-box"
        onSubmit={handleSubmit}
      >

        <h1 className="register-title">
          Créer un compte
        </h1>

        {
          error && (
            <div className="error-message">
              {error}
            </div>
          )
        }

        {/* NOM UTILISATEUR */}
        <input
          className="register-input input-username"
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
          className="register-input input-email"
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
          className="register-input input-telephone"
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
          className="register-input input-password"
          type="password"
          placeholder="Mot de passe"
          value={form.password}
          onChange={(e) =>
            setForm({
              ...form,
              password: e.target.value
            })
          }
        />

        {/* BUTTON */}
        <button
          className="register-button"
          type="submit"
        >
          Créer le compte
        </button>

        {/* LOGIN LINK */}
        <p className="login-link-text">
          Déjà un compte ?{" "}

          <Link
            className="login-link"
            to="/"
          >
            Connexion
          </Link>

        </p>

      </form>

    </div>
  );
}