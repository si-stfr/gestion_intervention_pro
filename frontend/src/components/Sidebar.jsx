import { Link, useNavigate } from "react-router-dom";
import "../assets/CSS_JS/global.css";
import "../assets/CSS_JS/Sidebar.css";
import logo from "../assets/logo_msf.jpg";
import { useState } from "react";

export default function Sidebar() {

  const navigate = useNavigate();

  const [isOpen, setIsOpen] = useState(true);

  const user = JSON.parse(localStorage.getItem("user"));
  
  const role = user?.profil;

  const logout = () => {
    localStorage.clear();
    navigate("/");
  };

  return (
    <>
      <button
          className="sidebar-toggle"
          onClick={() => setIsOpen(!isOpen)}
          aria-label={isOpen ? "Fermer le menu" : "Ouvrir le menu"}
        >
          {isOpen ? "✕" : "☰"}
        </button>

    <aside className={`sidebar ${isOpen ? "open" : "closed"}`}>

      <div className="sidebar-content">

      <img
        src={logo}
        alt="Logo"
        className="sidebar-logo"
      /> 

      <h2>Gestion Interventions Logistique</h2>

        {/* ================= ADMIN ================= */}
        {role === "ADMIN" && (
          <>
            <Link to="/admin" className="link-admin">Dashboard Admin</Link>
            <Link to="/interventions" className="link-interventions">Interventions</Link>
            <Link to="/users" className="link-users">Gestion utilisateurs</Link>
            <Link to="/materiels" className="link-materiel">Matériels</Link>
          </>
        )}

        {/* ================= TECHNICIEN ================= */}
        {role === "TECHNICIEN" && (
          <>
            <Link to="/generalview" className="link-vue">Vue d'ensemble</Link>
            <Link to="/technicien" className="link-admin">Dashboard Technicien</Link>
            <Link to="/interventions" className="link-interventions">Interventions</Link>
            <Link to="/materiels" className="link-materiel">Matériels</Link>
          </>
        )}

        {/* ================= MANAGER ================= */}
        {role === "MANAGER" && (
          <>
            <Link to="/generalview" className="link-vue">Vue d'ensemble</Link>
            <Link to="/manager" className="link-admin">Dashboard Manager</Link>
            <Link to="/interventions" className="link-interventions">Interventions</Link>
            <Link to="/materiels" className="link-materiel">Matériels</Link>
          </>
        )}

        {/* ================= INTERVENANT ================= */}
        {role === "INTERVENANT" && (
          <>
            <Link to="/generalview" className="link-vue">Vue d'ensemble</Link>
            <Link to="/intervenant" className="link-admin">Dashboard</Link>
            <Link to="/interventions" className="link-interventions">Interventions</Link>
            <Link to="/materiels" className="link-materiel">Matériels</Link>
          </>
        )}

        {/* ================= COMMUN ================= */}
        <Link to="/interventions/abouti" className="link-green">
          Interventions Terminées
        </Link>

        <Link to="/interventions/impossible" className="link-purple">
          Interventions Non Résolues
        </Link>

        <Link to="/profile" className="link-gray">
          Mon profil
        </Link>

        <button className="logout-btn" onClick={logout}>
          Déconnexion
        </button>

      </div>
    </aside>
    </>
  );
}