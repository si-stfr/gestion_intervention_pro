import { useEffect, useState } from "react";
import api from "../../api/api";
import "../../assets/CSS_JS/dashboard.css";
import "../../assets/CSS_JS/Sidebar.css";
import "../../assets/CSS_JS/global.css";

export default function IntervenantDashboard() {

  const [data, setData] = useState([]);

  useEffect(() => {
    console.log("INTERVENANT DASHBOARD CHARGE");
    fetchData();
  }, []);

  const fetchData = () => {

    const username = localStorage.getItem("username");

    console.log("USERNAME LOCAL:", username);

    api.get("/integration/")
      .then(res => {

        console.log("DATA:", res.data);

        if (!username) {
          console.log("⚠️ USERNAME NULL");
          return;
        }

        const filtered = res.data.filter(item =>
          String(item.UserId).trim().toLowerCase() ===
          String(username).trim().toLowerCase()
        );

        console.log("FILTERED:", filtered);

        setData(filtered);
      })
      .catch(err => {
        console.error("ERREUR API:", err);
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

      <h2>Dashboard Intervenant</h2>

      <div className="intervention-list">

        {data.map((i) => (

          <div
            key={i.ID}
            className={`intervention-card ${getClass(i.Statut)}`}
          >

            <h3>{i.Descriptif}</h3>

            <p><strong>Utilisateur :</strong> {i.UserId}</p>
            <p><strong>Profil :</strong> {i.Profil}</p>

            <p><strong>Statut :</strong> {i.Statut}</p>
            <p><strong>Date début :</strong> {i.Date_de_debut}</p>
            <p><strong>Échéance :</strong> {i.Echeance}</p>
            <p><strong>Date fin :</strong> {i.Date_de_fin}</p>

          </div>

        ))}

      </div>

    </div>
  );
}