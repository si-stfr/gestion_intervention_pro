import { useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/api";
import "../assets/CSS_JS/Login.css";
import "../assets/CSS_JS/global.css";
import logo from "../assets/logo_msf.jpg";

export default function ForgotPassword() {

  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    try {
      const res = await api.post("/auth/forgot-password", { email });
      setMessage(
        res.data?.message ||
        "Si un compte existe avec cet email, un lien de réinitialisation a été envoyé."
      );
    } catch (err) {
      setError(
        err?.response?.data?.detail ||
        "Une erreur est survenue, veuillez réessayer."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="logo-container">
        <img src={logo} alt="Logo" className="sidebar-logo" />
      </div>

      <form className="login-form" onSubmit={handleSubmit}>

        <h2 className="login-title">Mot de passe oublié</h2>

        {error && <p className="login-error">{error}</p>}
        {message && <p className="login-success">{message}</p>}

        {!message && (
          <>
            <label className="label-user">Adresse email</label>
            <input
              type="email"
              className="input-user"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <button type="submit" className="btn-login" disabled={loading}>
              {loading ? "Envoi en cours..." : "Envoyer le lien de réinitialisation"}
            </button>
          </>
        )}

        <p className="register-text">
          <Link className="btn-register" to="/">
            Retour à la connexion
          </Link>
        </p>

      </form>
    </div>
  );
}
