import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";
import "../assets/CSS_JS/AdminDashboard.css";
import "../assets/CSS_JS/global.css";
import Sidebar from "../components/Sidebar";
import LateAlert from "../components/LateAlert";
import {Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis} from "recharts";
import { useMemo } from "react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { sortInterventions } from "../utils/sortInterventions";
import InterventionsStatusPieChart from "../components/InterventionsStatusPieChart";
import LieuPopupButton from "../components/LieuPopupButton";

export default function AdminDashboard() {

  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [data, setData] = useState([]);
  const [materiels, setMateriels] = useState([]);
  const [filterStatut, setFilterStatut] = useState("");
  const[totalMateriels, setTotalMateriels] = useState(0)

  const user = JSON.parse(localStorage.getItem("user"));
  const isAdmin = user?.profil === "ADMIN";
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState("");

  const [stats, setStats] = useState({
    total: 0,
    signale: 0,
    encours: 0,
    retard: 0,
    abouti: 0,
    impossible: 0,
    enattentevalidation:0
  });

  const statutLabels = {
  SIGNALE: "Demande",
  EN_COURS: "En cours",
  EN_RETARD: "En retard",
  EN_ATTENTE_VALIDATION: "En attente validation",
  ABOUTI: "Terminée",
  IMPOSSIBLE: "Non Résolues",
};

  useEffect(() => {
    fetchUsers();
    fetchData();
    fetchMateriels();
  }, []);

  useEffect(() => {
    fetchStats();
  }, [data]);

  const fetchUsers = async () => {
    const res = await api.get("/users/");
    setUsers(res.data);
  };


  const fetchMateriels = async () => {
  try {
    const res = await api.get("/materiels/");
    setMateriels(res.data.materiels);
    setTotalMateriels(res.data.total);
    console.log("Quantite :",res.data.materiels)
  } catch (err) {
    console.error("Erreur chargement matériels :", err);
  }
};


  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await api.get("/intervention/");
      setData(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error(err);
      setData([]);
    } finally {
      setLoading(false)
    }
  };


  const filteredInterventions = sortInterventions(
    (data ?? []).filter(
      (item) => selectedStatus === "" || item.statut === selectedStatus
    )
  );



  const normalizeStatut = (statut) => {
  switch (statut) {
    case "SIGNALE":
      return "signale";
    case "EN_COURS":
      return "encours";
    case "EN_RETARD":
      return "enretard";
    case "EN_ATTENTE_VALIDATION":
      return "enattentevalidation";
    case "ABOUTI":
      return "abouti";
    case "IMPOSSIBLE":
      return "impossible";
    default:
      return "";
    }
  };

  const fetchStats = async () => {
    const list = data;

    setStats({
      total: list.length,
      signale: list.filter(i => i.statut === "SIGNALE").length,
      encours: list.filter(i => i.statut === "EN_COURS").length,
      retard: list.filter(i => i.statut === "EN_RETARD").length,
      abouti: list.filter(i => i.statut === "ABOUTI").length,
      impossible: list.filter(i => i.statut === "IMPOSSIBLE").length,
      enattentevalidation: list.filter(i => i.statut === "EN_ATTENTE_VALIDATION").length
    });
  };

  const getClass = (statut) => {
    if (statut === "SIGNALE") return "signalé";
    if (statut === "EN_COURS") return "encours";
    if (statut === "EN_RETARD") return "retard";
    if (statut === "ABOUTI") return "abouti";
    if (statut === "IMPOSSIBLE") return "impossible";
    if (statut == "EN_ATTENTE_VALIDATION")
    return "";
  };


const normalizeMateriel = (type) => {
  if (!type) return "";

  const t = type
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, ""); // enlève accents

  if (t.includes("informatique")) return "informatique";
  if (t.includes("mobilier")) return "mobilier";
  if (t.includes("travaux")) return "travaux";
  if (t.includes("routier")) return "routier";
  if (t.includes("evenementiel")) return "evenementiel";
  if (t.includes("equipement public")) return "public";
  return "autres";
};


const exportToExcel = () => {
  const worksheet = XLSX.utils.json_to_sheet(
    filteredInterventions.map((item) => ({
      ID: item.id,
      Statut: statutLabels[item.statut],
      Titre: item.titre,
      Demandeur: item.demandeur_name || "-",
      Demandeur_prenom: item.demandeur_prenom || "-",
      Demandeur_email: item.demandeur_email || "-",
      Demandeur_telephone: item.demandeur_telephone || "-",
      Type_Intervention : item.type_intervention,
      Type_intervention_autre : item.type_intervention_autre,
      Services_de_la_commune: item.services_de_la_commune?.join(", ") || "-",
      Sites_de_la_commune: item.sites_de_la_commune?.join(", ") || "-",
      Description : item.description_de_la_panne,
      Materiels: item.materiels
      ?.map(m => `${m.marque_ou_modele} (x${m.quantite})`)
      .join(" | "),
      Technicien: item.technicien_name,
      DateDebut: item.date_debut,
      DateFin: item.date_fin,
      Lieu: item.lieu,
      CreatedAt: item.created_at,
    }))
  );

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Interventions");

  const excelBuffer = XLSX.write(workbook, {
    bookType: "xlsx",
    type: "array",
  });

  const file = new Blob([excelBuffer], {
    type: "application/octet-stream",
  });

  saveAs(file, `interventions_${new Date().toISOString()}.xlsx`);
};



const { interventionsByTechnicien, topTechnicien, chartData } = useMemo(() => {

  const map = {};

  data.forEach((i) => {
    const tech = i.technicien_name || "Non assigné";
    map[tech] = (map[tech] || 0) + 1;
  });

  const sorted = Object.entries(map).sort((a, b) => b[1] - a[1]);

  const chart = Object.entries(map).map(([name, count]) => ({
    technicien: name,
    interventions: count,
  }));

  return {
    interventionsByTechnicien: map,
    topTechnicien: sorted[0] || null,
    chartData: chart
  };
}, [data]);


const maxInterventions = Math.max(
  ...chartData.map(d => d.interventions),
  0
);

const yTicks = Array.from(
  { length: maxInterventions + 2 }, // +2 pour inclure max+1 proprement
  (_, i) => i
);

  return (
 
    <div className="layout">

      <Sidebar />
      
      <>
        <LateAlert/>
      </>

      <div className="admin-dashboard">

        <h2>Dashboard Admin</h2>

        {/* STATS */}
        <div className="card-grid">

          <div 
            className="card signalé"
            onClick={() => setSelectedStatus("SIGNALE")}
          >
            <h3>Demande</h3>
            <p>{stats.signale}</p>
          </div>

          <div 
            className="card encours"
            onClick={() => setSelectedStatus("EN_COURS")}
          >
            <h3>En cours</h3>
            <p>{stats.encours}</p>
          </div>

          <div 
            className="card retard"
            onClick={() => setSelectedStatus("EN_RETARD")}
          >
            <h3>En retard</h3>
            <p>{stats.retard}</p>
          </div>

        <div 
          className="card enattentevalidation"
          onClick={() => setSelectedStatus("EN_ATTENTE_VALIDATION")}
        >
            <h3>En attente de validation</h3>
            <p>{stats.enattentevalidation}</p>
          </div>

          <div 
            className="card impossible"
            onClick={() => setSelectedStatus("IMPOSSIBLE")}
          >
            <h3>Non Résolues</h3>
            <p>{stats.impossible}</p>
          </div>


          <div 
            className="card abouti"
            onClick={() => setSelectedStatus("ABOUTI")}
          >
            <h3>Terminée</h3>
            <p>{stats.abouti}</p>
          </div>
        </div>

        <div 
          className="card all full-width"
          onClick={() => setSelectedStatus("")}
        >
            <h3>Toutes les interventions</h3>
            <p>{stats.total}</p>
        </div> 
   
      {/* TABLE */}
        {loading ? (

          <div>Chargement...</div>

        ) : (

          <div className="table-dashboard">
          
            <div className="table-scroll">

            <table className="table-interventions">

              <thead>
                <tr>
                  <th>Statut</th>
                  <th>Nom du Demandeur</th>
                  <th>Prénom</th>
                  <th>Email</th>
                  <th>Téléphone</th>
                  <th>Titre</th>
                  <th>Description</th>
                  <th>Type intervention</th>
                  <th>Type autre</th>
                  <th>Services demandés</th>
                  <th>Sites correspondant</th>
                  <th>Matériel concerné</th>
                  <th>Source</th>
                  <th>Date de début</th>
                  <th>Date de fin</th>
                  <th>Lieu</th>
                  <th>Technicien</th>
                  <th>Créé le</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>

                {filteredInterventions.map((item) => (

                  <tr
                    key={item.id}
                    className={`ligne ${
                      normalizeStatut(item.statut)
                    }`}
                  >

                    {/* STATUT */}
                    <td
                      className={`statut ${
                        normalizeStatut(item.statut)
                      }`}
                    >
                      {
                        statutLabels[item.statut]
                        ?? item.statut
                      }
                    </td>

                    {/* DEMANDEUR */}
                    <td>
                      {item.demandeur_name || "-"}
                    </td>

                    {/* PRÉNOM */}
                    <td>{item.demandeur_prenom || "-"}</td>

                    {/* EMAIL */}
                    <td>{item.demandeur_email || "-"}</td>

                    {/* TÉLÉPHONE */}
                    <td>{item.demandeur_telephone || "-"}</td>

                    {/* TITRE */}
                    <td>{item.titre}</td>

                    {/* DESCRIPTION */}
                    <td>
                      {item.description_de_la_panne}
                    </td>

                    {/* TYPE INTERVENTION */}
                    <td>
                      {item.type_intervention}
                    </td>

                    {/* TYPE AUTRE */}
                    <td>
                      {
                        item.type_intervention_autre
                        || "-"
                      }
                    </td>

                    {/* SERVICES DEMANDÉS */}
                    <td>
                      {item.services_de_la_commune?.length
                        ? item.services_de_la_commune.join(", ")
                        : "-"}
                    </td>

                    {/* SITES CORRESPONDANT */}
                    <td>
                      {item.sites_de_la_commune?.length
                        ? item.sites_de_la_commune.join(", ")
                        : "-"}
                    </td>

                     {/*MATERIEL*/}
                    <td>
                      {item.materiels?.map((m) => (
                        <div key={m.id}>
                          - {m.marque_ou_modele} (x{m.quantite})
                        </div>
                      ))}
                    </td>
                    
                    {/* SOURCE */}
                    <td>
                      {item.source_demande || "-"}
                    </td>

                    {/* DATE DÉBUT */}
                    <td>{item.date_debut}</td>

                    {/* DATE FIN */}
                    <td>{item.date_fin}</td>

                    {/* GÉOLOCALISATION */}
                    <td>
                      <LieuPopupButton lieu={item.lieu} />
                    </td>

                    {/* TECHNICIEN */}
                    <td>
                      {
                        users.find(
                          (u) =>
                            Number(u.id) ===
                            Number(item.technicien_id)
                        )?.username || "-"
                      }
                    </td>

                    {/* CRÉÉ LE */}
                    <td>
                      {
                        item.created_at
                          ? new Date(
                              item.created_at
                            ).toLocaleString("fr-FR")
                          : "-"
                      }
                    </td>

                    {/* ACTIONS */}
                    <td>
                      {(item.statut === "IMPOSSIBLE" || item.statut === "ABOUTI") && (
                        <div className="actions-buttons">
                          <button
                            className="btn-imprimer"
                            onClick={() =>
                              navigate(
                                `/interventions/imprimer?titre=${encodeURIComponent(
                                  item.titre
                                )}&typeIntervention=${encodeURIComponent(
                                  item.type_intervention || ""
                                )}`
                              )
                            }
                          >
                            Imprimer
                          </button>
                        </div>
                      )}
                    </td>

                  </tr>

                ))}

              </tbody>

            </table>
          </div>
            <button onClick={exportToExcel} className="btn-export">
              Export Excel
            </button>
          </div>  
        )}
        <InterventionsStatusPieChart
          interventions={data}
          onSliceClick={(key) =>
            setSelectedStatus((prev) => (prev === key ? "" : key))
          }
        />

        <h2 className="chart-label">Parc Matériel ({totalMateriels})</h2>

        <div className="table-dashboard">
          <div className="table-scroll">
            <table className="table-interventions">

              <thead>
                <tr>
                  <th>Type de Matériel</th>
                  <th>Nom / Marque / Modèle</th>
                  <th>Numéro d'identification</th>
                  <th>Statut</th>
                  <th>Quantité</th>
                  <th>Lieu de stockage</th>
                </tr>
              </thead>

              <tbody>
                    {materiels.map((m) => (
                      <tr key={m.id}>
                        <td 
                          className={`materiel ${
                            normalizeMateriel(m.type_de_materiel)
                          }`}
                        >
                          {m.type_de_materiel}
                        </td>
                        <td>{m.marque_ou_modele}</td>
                        <td>{m.numero_de_serie}</td>
                        <td>{m.statut}</td>
                        <td>{m.quantite}</td>
                        <td>{m.lieu_stockage}</td>
                      </tr>
                    ))}
                  </tbody>                
            </table>
          </div>
      </div>
      <h2 className="chart-label">Interventions par technicien</h2>
      <div className="kpi-box">
          <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <XAxis dataKey="technicien" />
                <YAxis 
                  ticks={yTicks}
                  domain={[0, maxInterventions + 1]}
                  allowDecimals={false}
                />
                <Tooltip />
                <Bar dataKey="interventions" fill="#0074c7"/>
              </BarChart>
            </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}