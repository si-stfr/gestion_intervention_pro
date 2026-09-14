import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import api from "../api/api";
import "../assets/CSS_JS/Login.css";
import "../assets/CSS_JS/global.css";
import logo from "../assets/logo_msf.jpg";

export default function ResetPassword() {

  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token") || "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!token) {
      setError("Lien de réinitialisation invalide.");
      return;
    }

    if (password.length < 8) {
      setError("Le mot de passe doit contenir au moins 8 caractères.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }

    setLoading(true);

    try {
      await api.post("/auth/reset-password", {
        token,
        new_password: password,
      });

      setSuccess(true);

      setTimeout(() => navigate("/"), 2500);
    } catch (err) {
      setError(
        err?.response?.data?.detail ||
        "Lien de réinitialisation invalide ou expiré."
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

        <h2 className="login-title">Nouveau mot de passe</h2>

        {error && <p className="login-error">{error}</p>}

        {success ? (
          <p className="login-success">
            Mot de passe réinitialisé avec succès. Redirection vers la connexion...
          </p>
        ) : (
          <>
            <label className="label-password">Nouveau mot de passe</label>
            <input
              type="password"
              className="input-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <label className="label-password">Confirmer le mot de passe</label>
            <input
              type="password"
              className="input-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />

            <button type="submit" className="btn-login" disabled={loading}>
              {loading ? "Réinitialisation..." : "Réinitialiser le mot de passe"}
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
