import { useEffect, useState } from "react";
import api from "../../api/api";
import "../../assets/CSS_JS/dashboard.css";
import "../../assets/CSS_JS/Sidebar.css";
import "../../assets/CSS_JS/global.css";

export default function ChefDashboard() {

  const [data, setData] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = () => {
    api.get("/integration/")
      .then(res => setData(res.data));
  };

  const getClass = (statut) => {
    if (statut === "Signalé") return "signalé";
    if (statut === "En cours") return "encours";
    if (statut === "Abouti") return "abouti";
    return "";
  };

  return (
    <div>

      <h2>Dashboard Chef</h2>

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

          </div>

        ))}

      </div>

    </div>
  );
}