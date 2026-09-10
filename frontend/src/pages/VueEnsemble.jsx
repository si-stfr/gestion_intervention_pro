import { useEffect, useState } from "react";
import api from "../api/api";
import "../assets/CSS_JS/AdminDashboard.css";
import "../assets/CSS_JS/global.css";
import Sidebar from "../components/Sidebar";
import LateAlert from "../components/LateAlert";
import {PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, XAxis, YAxis} from "recharts";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { useMemo } from "react";

export default function VueEnsemble() {

  const [users, setUsers] = useState([]);
  const [data, setData] = useState([]);
  const [materiels, setMateriels] = useState([]);
  const[totalMateriels, setTotalMateriels] = useState(0)
  const [filterType, setFilterType] = useState("");
  const [filterStatut, setFilterStatut] = useState("");

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
  RESOLU : "Resolu"
};

  const [form, setForm] = useState({
    demandeur_id: "",
    titre: "",
    description_de_la_panne: "",

    source_demande: "Direct",
    urgence: "Moyenne",
    impact: "Moyen",
    priorite: "Moyenne",

    type_intervention: "Maintenance",
    type_intervention_autre: "",

    statut: "Signalé",

    date_debut: "",
    echeance: "",
    date_fin: "",

    lieu: ""
  });

  const [editId, setEditId] = useState(null);

  useEffect(() => {
    fetchUsers();
    fetchData();
    fetchMateriels();
  }, []);

  useEffect(() => {
    fetchStats();
  }, [data]);


  const fetchUsers = async () => {
    try {
      const res = await api.get("/intervention/users/public");
      setUsers(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchMateriels = async () => {
  try {
    const res = await api.get("/materiels/");

    setMateriels(res.data.materiels);
    setTotalMateriels(res.data.total);

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



  const filteredInterventions = (data ?? []).filter(
    (item) =>
      [
        "SIGNALE",
        "EN_COURS",
        "EN_RETARD",
        "EN_ATTENTE_VALIDATION",
        "IMPOSSIBLE",
        "ABOUTI"
      ].includes(item.statut) &&
      (
        selectedStatus === "" ||
        item.statut === selectedStatus
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
    case "RESOLU":
      return "resolu";
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


  const COLORS = [
    "#0074c7",
    "#27ae60",
    "#f1c40f",
    "#cd2c2e",
    "#e77000",
    "#9b59b6",
    "#8b5a2b"
    ];

    const allCategories = [
      "Matériel informatique",
      "Mobilier",
      "Matériel de travaux",
      "Matériel routier",
      "Matériel évenementiel",
      "Equipement public",
      "Autres"
    ];

    const groupedCategories = [];
    for (let i = 0; i < allCategories.length; i += 5) {
      groupedCategories.push(allCategories.slice(i, i + 5));
    }


  const pieData = allCategories
  .map((cat) => ({
    name: cat,
    value:
      cat === "Autres"
        ? materiels.filter(
            (m) =>
              ![
                "Matériel informatique",
                "Mobilier",
                "Matériel de travaux",
                "Matériel routier",
                "Matériel évenementiel",
                "Equipement public",
                "Autres"
              ].includes(m.type_de_materiel)
          ).length
        : materiels.filter(
            (m) => m.type_de_materiel === cat
          ).length,
  }))
  .filter((item) => item.value > 0);



  const filteredMateriels = materiels.filter((m) => {
      if (!filterType) return true;

      if (filterType === "Autres") {
        return ![
          "Matériel informatique",
          "Mobilier",
          "Matériel de travaux",
          "Matériel routier",
          "Matériel évenementiel",
          "Equipement public",
          "Autres"
        ].includes(m.type_de_materiel);
      }

      return m.type_de_materiel === filterType;
    });


    
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


  const renderLegend = () => {
  return (
    <div className="legend-container">
      {groupedCategories.map((group, groupIndex) => (
        <div key={`legend-row-${groupIndex}`} className="legend-row">
          {group.map((cat) => {
            const pieIndex = pieData.findIndex(
              p => p.name === cat
            );

            const exists = pieIndex !== -1;

            return (
              <div
                key={cat}
                className="legend-item"
                style={{
                  opacity: exists ? 1 : 0.4
                }}
              >
                <span
                  className="legend-color"
                  style={{
                    background:
                      exists
                        ? COLORS[pieIndex % COLORS.length]
                        : "#ccc"
                  }}
                />
                <span>{cat}</span>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
};


const exportToExcel = () => {
  const worksheet = XLSX.utils.json_to_sheet(
    filteredInterventions.map((item) => ({
      ID: item.id,
      Statut: statutLabels[item.statut],
      Titre: item.titre,
      Demandeur: users.find((u) => Number(u.id) === Number(item.demandeur_id))?.username || "-",
      Technicien: item.technicien_name,
      Urgence: item.urgence,
      Impact: item.impact,
      Priorite: item.priorite,
      DateDebut: item.date_debut,
      Echeance: item.echeance,
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

        <h2>Vue d'Ensemble</h2>

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
          className="card resolu"
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
                  <th>Demandeur</th>
                  <th>Titre</th>
                  <th>Type intervention</th>
                  <th>Type autre</th>
                  <th>Description</th>
                  <th>Matériel concerné</th>
                  <th>Source</th>
                  <th>Urgence</th>
                  <th>Impact</th>
                  <th>Priorité</th>
                  <th>Date de livraison</th>
                  <th>Échéance</th>
                  <th>Date de récupération</th>
                  <th>Lieu</th>
                  <th>Technicien</th>
                  <th>Créé le</th>
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
                      {
                        users.find(
                          (u) =>
                            Number(u.id) ===
                            Number(item.demandeur_id)
                        )?.username || "-"
                      }
                    </td>

                    {/* TITRE */}
                    <td>{item.titre}</td>

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

                    {/* DESCRIPTION */}
                    <td>
                      {item.description_de_la_panne}
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

                    {/* URGENCE */}
                    <td>{item.urgence}</td>

                    {/* IMPACT */}
                    <td>{item.impact}</td>

                    {/* PRIORITÉ */}
                    <td>{item.priorite}</td>

                    {/* DATE DÉBUT */}
                    <td>{item.date_debut}</td>

                    {/* ÉCHÉANCE */}
                    <td>{item.echeance}</td>

                    {/* DATE FIN */}
                    <td>{item.date_fin}</td>

                    {/* GÉOLOCALISATION */}
                    <td>
                      {item.lieu}
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
        <div className="chart-container">
          <h2>Parc Matériel ({totalMateriels})</h2>

          <ResponsiveContainer width="100%" height={500}>
            <PieChart>
              <Pie
                data={pieData}
                dataKey="value"
                nameKey="name"
                outerRadius={180}
                label = {({ name, value }) =>
                    `${name} (${value})`
                  }
                onClick={(data) => {
                  setFilterType((prev) =>
                    prev === data.name ? "" : data.name
                  );
                }}
              >
                {pieData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>

              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="legend-wrapper">
          {renderLegend()}
        </div>

        <div className="table-dashboard">
          <div className="table-scroll">
            <table className="table-interventions">

              <thead>
                <tr>
                  <th>Type de Matériel</th>
                  <th>Nom / Marque / Modèle</th>
                  <th>Numéro d'identification</th>
                  <th>Statut</th>
                  <th>Lieu de stockage</th>
                </tr>
              </thead>

              <tbody>
                    {filteredMateriels.map((m) => (
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