import { useEffect, useState } from "react";
import api from "../api/api";
import Sidebar from "../components/Sidebar";
import "../assets/CSS_JS/PlanningTechniciens.css";
import "../assets/CSS_JS/global.css";

export default function PlanningTechniciens() {

  const [planning, setPlanning] = useState([]);

  useEffect(() => {

    loadPlanning();

  }, []);

  const loadPlanning = async () => {

    try {

      const res = await api.get(
        "/techniciens/planning"
      );

      setPlanning(res.data);

    } catch (err) {

      console.error(err);
    }
  };

  return (

    <div className="layout planning-page">
        <Sidebar />

        <div className="page-content">
            <h1 className="planning-title">
            Planning techniciens
            </h1>

            <table className="planning-table">

            <thead>
                <tr>
                <th>Technicien</th>
                <th>Intervention</th>
                <th>Début</th>
                <th>Fin</th>
                </tr>
            </thead>

            <tbody>

                {
                planning.map((item) => (
                    <tr key={item.id}>
                    <td>{item.technicien}</td>
                    <td>{item.titre}</td>
                    <td>{item.date_de_debut}</td>
                    <td>{item.date_de_fin}</td>
                    </tr>
                ))
                }

            </tbody>

            </table>

        </div>

    </div>
  );
}