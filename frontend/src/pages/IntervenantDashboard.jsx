import { useEffect, useState } from "react";

import api from "../api/api";

import Sidebar from "../components/Sidebar";
import LieuMapPicker from "../components/LieuMapPicker";
import InterventionsStatusPieChart from "../components/InterventionsStatusPieChart";
import LieuPopupButton from "../components/LieuPopupButton";
import { sortInterventions } from "../utils/sortInterventions";

import "../assets/CSS_JS/global.css";
import "../assets/CSS_JS/Interventions.css";

const statutLabels = {
  SIGNALE: "Demande",
  EN_COURS: "En cours",
  EN_RETARD: "En retard",
  EN_ATTENTE_VALIDATION: "En attente validation",
  ABOUTI: "Abouti",
  IMPOSSIBLE: "Impossible"
};

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

export default function IntervenantDashboard() {

  const [interventions, setInterventions] = useState([]);
  const [users, setUsers] = useState([]);

  const [materiels, setMateriels] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedStatus, setSelectedStatus] = useState("");
  const [materielsSelectionnes, setMaterielsSelectionnes] = useState([]);
  const [rechercheMateriel, setRechercheMateriel] = useState("");

  const [editId, setEditId] = useState(null);
  const [showMaterielDropdown, setShowMaterielDropdown] = useState(false);

  const techniciens = users.filter(
    (u) => u.profil === "TECHNICIEN"
  );

  const user = JSON.parse(localStorage.getItem("user"));

  const [form, setForm] = useState({
    demandeur_nom: user?.username || "",

    titre: "",

    description_de_la_panne: "",

    statut: "SIGNALE",

    source_demande: "Direct",

    priorite: "Majeure",

    type_intervention: "Livraison",

    type_intervention_autre: "",

    date_debut: "",

    echeance: "",

    date_fin: "",

    lieu: "",
    latitude: null,
    longitude: null,

    urgence: "Moyenne",

    technicien_id: ""
  });

  useEffect(() => {

    fetchInterventions();

    fetchUsers();
    fetchMateriels();

  }, []);



  const fetchMateriels = async () => {
            try {
              const res = await api.get("/materiels/");
              setMateriels(res.data.materiels);
            } catch (error) {
              console.error("Erreur chargement matériels :", error);
            } finally {
              setLoading(false);
            }
          };
  // =========================================
  // GET INTERVENTIONS
  // =========================================
  const fetchInterventions = async () => {

    try {

      setLoading(true);

      const res = await api.get("/intervention/");

      console.log("INTERVENTIONS API RESPONSE:", res.data);

      setInterventions(res.data ?? []);

    } catch (err) {

      console.error("FETCH INTERVENTIONS ERROR:", err);

    } finally {

      setLoading(false);
    }
  };



   const materielsFiltres = materiels.filter(
    m =>
      m.marque_ou_modele
        ?.toLowerCase()
        .includes(rechercheMateriel.toLowerCase())
  );

  // =========================================
  // GET USERS
  // =========================================
  const fetchUsers = async () => {

    try {

      const res = await api.get("/intervention/users/public");

      setUsers(res.data);

    } catch (err) {

      console.error(err);
    }
  };

  // =========================================
  // FILTER
  // =========================================
  const filteredInterventions = sortInterventions(
    (interventions ?? []).filter(
      (item) =>
        Number(item.cree_par_id) === Number(user.id) &&
        [
          "SIGNALE",
          "EN_COURS",
          "EN_RETARD",
          "EN_ATTENTE_VALIDATION"
        ].includes(item.statut) &&
        (
          selectedStatus === "" ||
          item.statut === selectedStatus
        )
    )
  );

  const mesInterventions = (interventions ?? []).filter(
    (item) => Number(item.cree_par_id) === Number(user.id)
  );

  const statusClassMap = {
    "": "",
    SIGNALE: "signale",
    EN_COURS: "encours",
    EN_RETARD: "enretard",
    EN_ATTENTE_VALIDATION: "enattentevalidation"
  };

  // =========================================
  // RESET FORM
  // =========================================
  const resetForm = () => {

    setForm({

      demandeur_nom: user?.username || "",

      titre: "",

      description_de_la_panne: "",

      statut: "SIGNALE",

      source_demande: "Direct",

      priorite: "Majeure",

      type_intervention: "Livraison",

      type_intervention_autre: "",

      date_debut: "",

      echeance: "",

      date_fin: "",

      lieu: "",
      latitude: null,
      longitude: null,

      urgence: "Moyenne",

      technicien_id: "",
    });
    setMaterielsSelectionnes([]);
    setRechercheMateriel("");
    setShowMaterielDropdown(false);
    setEditId(null);
  };

  // =========================================
  // ADD
  // =========================================
  const addIntervention = async () => {

    if (!form.demandeur_nom) {
        alert("Veuillez saisir un demandeur");
        return;
        }

    if (!form.titre) {
        alert("Veuillez saisir un titre");
        return;
        }

    if (!form.description_de_la_panne) {
        alert("Veuillez saisir une description");
        return;
        }

    if (!form.date_debut) {
        alert("Veuillez saisir une date de début");
        return;
        }

    if (!form.date_fin) {
        alert("Veuillez saisir une date de fin");
        return;
        }

    if (!form.echeance) {
        alert("Veuillez saisir une date d'échéance");
        return;
        }

    if (!form.lieu) {
        alert("Veuillez saisir un lieu d'intervention");
        return;
        }

    if (!form.technicien_id) {
        alert("Veuillez choisir un technicien");
        return;
        }

    try {

      await api.post("/intervention/", {

        ...form,

        technicien_id:
          form.technicien_id === ""
            ? null
            : parseInt(form.technicien_id),

        date_fin:
          form.date_fin === ""
            ? null
            : form.date_fin,

         source_demande:
            form.source_demande === "" ? null : form.source_demande,

          priorite:
            form.priorite === "" ? null : form.priorite,

          type_intervention:
            form.type_intervention === "" ? null : form.type_intervention,
          
          materiels: materielsSelectionnes.map(m => ({
                id :m.id,
                quantite : m.quantiteDemande
      }))
    });

      alert("Intervetion créé avec succès");

      fetchInterventions();

      resetForm();

    } catch (err) {

      console.error(err);
    }
  };

  // =========================================
  // DELETE
  // =========================================
  const deleteIntervention = async (id) => {
    const confirmDelete = window.confirm(
            "Supprimer cette intervention ?"
        );

    if (!confirmDelete) return;
    try {

      await api.delete(`/intervention/${id}`);

      fetchInterventions();

    } catch (err) {

      console.error(err);
    }
  };

  // =========================================
  // START EDIT
  // =========================================
  const startEdit = (item) => {

    setEditId(item.id);

    setShowMaterielDropdown(false);

    setForm({

      demandeur_nom: item.demandeur_name || user?.username || "",

      titre: item.titre || "",

      description_de_la_panne:
        item.description_de_la_panne || "",

      statut: item.statut || "SIGNALE",

      source_demande: item.source_demande || "Direct",

      priorite: item.priorite || "Majeure",

      type_intervention:
        item.type_intervention || "Maintenance",

      type_intervention_autre:
        item.type_intervention_autre || "",

      date_debut:
        item.date_debut
          ? item.date_debut.split("T")[0]
          : "",

      echeance:
        item.echeance
          ? item.echeance.split("T")[0]
          : "",

      date_fin:
        item.date_fin
          ? item.date_fin.split("T")[0]
          : "",

      lieu: item.lieu || "",
      latitude: item.latitude ?? null,
      longitude: item.longitude ?? null,

      urgence: item.urgence || "Moyenne",

      technicien_id:
        item.technicien_id || ""
    });
  };

  // =========================================
  // UPDATE
  // =========================================
  const updateIntervention = async () => {

    try {

      await api.put(`/intervention/${editId}`, {

        ...form,

        technicien_id:
          form.technicien_id === ""
            ? null
            : parseInt(form.technicien_id),

        date_fin:
          form.date_fin === ""
            ? null
            : form.date_fin
      });

      fetchInterventions();

      resetForm();

    } catch (err) {

      console.error(err);
    }
  };

  return (

    <div className="layout interventions-page">

      <Sidebar />

      <div className="page-content">

        <h1 className="titre-principal">
          Gestion des interventions
        </h1>

        {/* FILTERS */}
        <div className="filters-container">

          <select
            className={`status-filter ${
              statusClassMap[selectedStatus] || ""
            }`}
            value={selectedStatus}
            onChange={(e) =>
              setSelectedStatus(e.target.value)
            }
          >
            <option value="">
              Tous
            </option>

            <option value="SIGNALE">
              Demande
            </option>

            <option value="EN_COURS">
              En cours
            </option>

            <option value="EN_RETARD">
              En retard
            </option>

            <option value="EN_ATTENTE_VALIDATION">
              En attente validation
            </option>

          </select>

        </div>

        {/* FORM */}
        <div className="admin-panel">

          <h2 className="admin-title">
            Gestion Intervenant
          </h2>

          <div className="admin-grid">

            {/* STATUT */}
            <label>Statut</label>

            <select
              value={form.statut}
              onChange={(e) =>{
                setForm({
                  ...form,
                  statut: e.target.value
                })
              }}
            >
              <option value="SIGNALE">
                Demande
              </option>

              <option value="EN_COURS">
                En cours
              </option>

              <option value="EN_RETARD">
                En retard
              </option>

            </select>

            {/* DEMANDEUR */}
            <label>Demandeur</label>
            <input
              placeholder="Nom du demandeur"
              value={form.demandeur_nom}
              onChange={(e) =>
                setForm({
                  ...form,
                  demandeur_nom: e.target.value
                })
              }
            />

            {/* TITRE */}
            <input
              placeholder="Titre"
              value={form.titre}
              onChange={(e) =>
                setForm({
                  ...form,
                  titre: e.target.value
                })
              }
            />

            {/* DESCRIPTION */}
            <textarea
              placeholder="Description"
              value={form.description_de_la_panne}
              onChange={(e) =>
                setForm({
                  ...form,
                  description_de_la_panne:
                    e.target.value
                })
              }
            />

            {/* SOURCE DEMANDE */}
            <label>Source de la demande</label>

            <select
              value={form.source_demande}
              onChange={(e) =>
                setForm({
                  ...form,
                  source_demande:
                    e.target.value
                })
              }
            >
              <option value="Direct">
                Direct
              </option>

              <option value="E-mail">
                E-mail
              </option>

              <option value="Formcreator">
                Formcreator
              </option>

              <option value="Helpdesk">
                Helpdesk
              </option>

              <option value="Phone">
                Phone
              </option>

              <option value="Written">
                Written
              </option>

              <option value="Other">
                Other
              </option>
            </select>

            {/* URGENCE */}
            <label>Urgence</label>

            <select
              value={form.urgence}
              onChange={(e) =>
                setForm({
                  ...form,
                  urgence: e.target.value
                })
              }
            >
              <option>Très haute</option>
              <option>Haute</option>
              <option>Moyenne</option>
              <option>Basse</option>
              <option>Très basse</option>
            </select>

            {/* PRIORITE */}
            <label>Priorité</label>

            <select
              value={form.priorite}
              onChange={(e) =>
                setForm({
                  ...form,
                  priorite: e.target.value
                })
              }
            >
              <option>Majeure</option>
              <option>Très haute</option>
              <option>Moyenne</option>
              <option>Basse</option>
              <option>Très basse</option>
            </select>

            {/* TYPE INTERVENTION */}
            <label>Type intervention</label>

            <select
              value={form.type_intervention}
              onChange={(e) =>
                setForm({
                  ...form,
                  type_intervention:
                    e.target.value
                })
              }
            >
              <option>Livraison</option>
              <option>Installation</option>
              <option>Livraison + Installation</option>
              <option>Stockage</option>
              <option>Prêt de Matériel</option>
              <option>Autre</option>
            </select>

            {/* TYPE AUTRE */}
            {form.type_intervention === "Autre" && (

              <input
                placeholder="Type autre"
                value={form.type_intervention_autre}
                onChange={(e) =>
                  setForm({
                    ...form,
                    type_intervention_autre:
                      e.target.value
                  })
                }
              />

            )}

             {/*SELECTION MATERIEL*/}

                <button
                  type="button"
                  className="mat-select-toggle"
                  onClick={() => setShowMaterielDropdown(v => !v)}
                >
                  {showMaterielDropdown ? "▲" : "▼"} Sélectionnez le(s) matériel(s) concerné(s) (Facultatif)
                </button>

              {/* MATERIELS SELECTIONNES (toujours visibles si non vide) */}

                {materielsSelectionnes.length > 0 && (
                  <div className="materiels-selectionnes">

                  {materielsSelectionnes.map((m) => (

                    <div
                      key={m.id}
                      className="materiel-chip"
                    >
                      <input
                          className="quantite"
                          type="number"
                          min="1"
                          value={m.quantiteDemande ?? 1}
                          onChange={(e) => {
                            const valeur = Math.max(1, Number(e.target.value) || 1);

                            setMaterielsSelectionnes(prev =>
                              prev.map(mat =>
                                mat.id === m.id
                                  ? { ...mat, quantiteDemande: valeur }
                                  : mat
                              )
                            );
                          }}
                        />

                      <div>{m.marque_ou_modele}</div>
                      <div>{m.numero_de_serie}</div>
                      <div>{m.statut}</div>
                      <div>{m.lieu_stockage}</div>
                      <div>
                      <button
                        type="button"
                        className="btn-desel"
                        onClick={() =>

                          setMaterielsSelectionnes(
                            materielsSelectionnes.filter(
                              item => item.id !== m.id
                            )
                          )

                        }
                      >
                        ✕
                      </button>
                        </div>
                    </div>
                  ))}
                </div>
                )}

              {showMaterielDropdown && (
                <>
                  <input
                    type="text"
                    value={rechercheMateriel}
                    onChange={(e) =>
                      setRechercheMateriel(e.target.value)
                    }
                    placeholder="Rechercher un matériel..."
                  />

                  {/* LISTE DES RESULTATS */}

                  <div className="materiels-search-results">

                  <div className="materiels-categ">
                    <div>Nom/Marque/Modèle</div>
                    <div>N° identification</div>
                    <div>Statut</div>
                    <div>Emplacement</div>
                  </div>

                    {materielsFiltres.map((m) => (

                      <div
                        key={m.id}
                        className="materiel-result"
                        onClick={() => {

                          const dejaPresent =
                            materielsSelectionnes.some(
                              item => item.id === m.id
                            );

                          if (!dejaPresent) {
                            setMaterielsSelectionnes([
                              ...materielsSelectionnes,
                              {
                              ...m,
                              quantiteDemande:1
                              }
                            ]);
                          }
                        }}
                      >
                        <div>{m.marque_ou_modele}</div>
                        <div>{m.numero_de_serie}</div>
                        <div>{m.statut}</div>
                        <div>{m.lieu_stockage}</div>

                      </div>
                    ))}
                  </div>
                </>
              )}

            {/* DATE DEBUT */}
            <label>Date de début</label>

            <input
              type="date"
              value={form.date_debut}
              onChange={(e) =>
                setForm({
                  ...form,
                  date_debut: e.target.value
                })
              }
            />

            {/* ECHEANCE */}
            <label>Échéance</label>

            <input
              type="date"
              value={form.echeance}
              onChange={(e) =>
                setForm({
                  ...form,
                  echeance: e.target.value
                })
              }
            />

            {/* DATE FIN */}
            <label>Date de fin</label>

            <input
              type="date"
              value={form.date_fin}
              onChange={(e) =>
                setForm({
                  ...form,
                  date_fin: e.target.value
                })
              }
            />

            {/* LIEU */}
            <label>Lieu</label>
            <LieuMapPicker
              value={{ lieu: form.lieu, latitude: form.latitude, longitude: form.longitude }}
              onChange={(next) =>
                setForm({
                  ...form,
                  lieu: next.lieu,
                  latitude: next.latitude,
                  longitude: next.longitude,
                })
              }
            />

  
            {/* TECHNICIEN */}
            <label>Technicien</label>

            <select
              value={form.technicien_id || ""}
              onChange={(e) =>
                setForm({
                  ...form,
                  technicien_id:
                    e.target.value
                })
              }
            >
              <option value="">
                -- Choisir un technicien --
              </option>

              {techniciens.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.username}
                </option>
              ))}
            </select>

          </div>

          {editId ? (

            <button
              className="admin-btn"
              onClick={updateIntervention}
            >
              Modifier
            </button>

          ) : (

            <button
              className="admin-btn"
              onClick={addIntervention}
            >
              Ajouter
            </button>

          )}

        </div>

        {/* TABLE */}
        {loading ? (

          <div>Chargement...</div>

        ) : (

          <div className="table-wrapper">

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
                  <th>Priorité</th>
                  <th>Date de début</th>
                  <th>Échéance</th>
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
                          -{m.marque_ou_modele} (x{m.quantite})
                        </div>
                      ))}
                    </td>

                    {/* SOURCE */}
                    <td>
                      {item.source_demande || "-"}
                    </td>

                    {/* URGENCE */}
                    <td>{item.urgence}</td>

                    {/* PRIORITE */}
                    <td>{item.priorite}</td>

                    {/* DATE DEBUT */}
                    <td>{item.date_debut}</td>

                    {/* ECHEANCE */}
                    <td>{item.echeance}</td>

                    {/* DATE FIN */}
                    <td>{item.date_fin}</td>

                    {/* GEOLOCALISATION */}
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

                    {/* CREE LE */}
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

                      <div className="actions-buttons">

                        <button
                          className="btn-modifier"
                          onClick={() =>
                            startEdit(item)
                          }
                        >
                          Modifier
                        </button>

                        <button
                          className="btn-supprimer"
                          onClick={() =>
                            deleteIntervention(item.id)
                          }
                        >
                          Supprimer
                        </button>

                      </div>

                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>

        )}

        <InterventionsStatusPieChart interventions={mesInterventions} />

      </div>

    </div>
  );
}