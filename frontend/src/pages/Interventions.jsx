import { useEffect, useState } from "react";

import api from "../api/api";

import Sidebar from "../components/Sidebar";

import "../assets/CSS_JS/global.css";
import "../assets/CSS_JS/Interventions.css";

const statutLabels = {
  SIGNALE: "Demande",
  EN_COURS: "En cours",
  EN_RETARD: "En retard",
  EN_ATTENTE_VALIDATION: "En attente validation",
  ABOUTI: "Terminée",
  IMPOSSIBLE: "Impossible",
  RESOLU : "Resolu"
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
    case "RESOLU":
      return "resolu";
    default:
      return "";
  }
};

export default function Interventions() {

  const [interventions, setInterventions] = useState([]);
  const [materiels, setMateriels] = useState([]);
  const [users, setUsers] = useState([]);
  const[totalMateriels, setTotalMateriels] = useState(0)
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState("");
  const [editId, setEditId] = useState(null);
  const [materielsSelectionnes, setMaterielsSelectionnes] = useState([]);
  const [rechercheMateriel, setRechercheMateriel] = useState("");
  const techniciens = users.filter(
    (u) => u.profil === "TECHNICIEN"
  );

  const user = JSON.parse(localStorage.getItem("user"));

  const isAdmin = user?.profil === "ADMIN";

  const [form, setForm] = useState({
    demandeur_id: "",
    titre: "",
    description_de_la_panne: "",
    statut: "SIGNALE",

    source_demande: "Direct",
    impact: "Très haut",
    priorite: "Majeure",
    type_intervention: "Livraison",
    type_intervention_autre: "",

    date_debut: "",
    echeance: "",
    date_fin: "",

    lieu: "",

    urgence: "Haute",
    technicien_id: ""
  });

  useEffect(() => {

    fetchInterventions();
    fetchUsers();

  }, []);

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

  useEffect(() => {
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

        fetchMateriels();
      }, []);

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
  const filteredInterventions = (interventions ?? []).filter(
    (item) =>
      [
        "SIGNALE",
        "EN_COURS",
        "EN_RETARD",
        "EN_ATTENTE_VALIDATION",
      ].includes(item.statut) &&
      (
        selectedStatus === "" ||
        item.statut === selectedStatus
      )
  );


  const materielsFiltres = materiels.filter(
    m =>
      m.marque_ou_modele
        ?.toLowerCase()
        .includes(rechercheMateriel.toLowerCase())
  );



  const statusClassMap = {
    "": "",
    SIGNALE: "signale",
    EN_COURS: "encours",
    EN_RETARD: "enretard",
    EN_ATTENTE_VALIDATION: "enattentevalidation",
    RESOLU : "resolu"
  };

  // =========================================
  // RESET FORM
  // =========================================
  const resetForm = () => {

    setForm({
      demandeur_id: "",
      titre: "",
      description_de_la_panne: "",

      statut: "SIGNALE",

      source_demande: "Direct",
      impact: "Très haut",
      priorite: "Majeure",
      type_intervention: "Livraison",
      type_intervention_autre: "",

      date_debut: "",
      echeance: "",
      date_fin: "",

      lieu: "",

      urgence: "Moyenne",

      technicien_id: ""
    });
    setMaterielsSelectionnes([]);
    setRechercheMateriel("");
    setEditId(null);
  };

  // =========================================
  // ADD
  // =========================================
  const addIntervention = async () => {

    if (!form.demandeur_id) {
        alert("Veuillez choisir un demandeur");
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
        alert("Veuillez saisir une date de livraison");
        return;
        }

    if (!form.date_fin) {
        alert("Veuillez saisir une date de récupération");
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

        demandeur_id: parseInt(form.demandeur_id),

        technicien_id:
          form.technicien_id === ""
            ? null
            : parseInt(form.technicien_id),

          source_demande:
            form.source_demande === "" ? null : form.source_demande,

          impact:
            form.impact === "" ? null : form.impact,

          priorite:
            form.priorite === "" ? null : form.priorite,

          type_intervention:
            form.type_intervention === "" ? null : form.type_intervention,
          
          materiels: materielsSelectionnes.map(m => ({
                id :m.id,
                quantite : m.quantiteDemande
          
      }))
      
      },console.log("materiels selectionne :", materielsSelectionnes));

      fetchInterventions();

      resetForm();

      alert("Intervention créé avec succès")
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

    setForm({

      demandeur_id: item.demandeur_id ?? "",

      titre: item.titre ?? "",

      description_de_la_panne:
        item.description_de_la_panne ?? "",

      statut: item.statut ?? "SIGNALE",

      source_demande: item.source_demande ?? "",

      impact: item.impact ?? "",

      priorite: item.priorite ?? "",

      type_intervention:
        item.type_intervention ?? "",

      type_intervention_autre:
        item.type_intervention_autre ?? "",

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

      lieu: item.lieu ?? "",

      urgence: item.urgence || "Moyenne",

      technicien_id: item.technicien_id ? Number(item.technicien_id) : ""
    });
  };

  // =========================================
  // UPDATE
  // =========================================
  const updateIntervention = async () => {

    try {

      await api.put(`/intervention/${editId}`, {

        ...form,

        demandeur_id: Number(form.demandeur_id),

        technicien_id: form.technicien_id ? Number(form.technicien_id): null,

        source_demande:
          form.source_demande === "" ? null : form.source_demande,

        impact:
          form.impact === "" ? null : form.impact,

        priorite:
          form.priorite === "" ? null : form.priorite,

        type_intervention:
          form.type_intervention === "" ? null : form.type_intervention,

      });

      console.log("UPDATE PAYLOAD :", {
        ...form,
        technicien_id: form.technicien_id
      });
      fetchInterventions();

      resetForm();

      alert("Intervention modifié")
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
            <option value="">Tous</option>

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

        {/* ADMIN FORM */}
        {isAdmin && (

          <div className="admin-panel">

            <h2 className="admin-title">
              Gestion Admin
            </h2>

            <div className="admin-grid">

              {/* 1. STATUT */}
              <label>Statut</label>

              <select
                value={form.statut}
                onChange={(e) =>
                  setForm({
                    ...form,
                    statut: e.target.value
                  })
                }
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

                <option value="EN_ATTENTE_VALIDATION">
                  En attente validation
                </option>

                <option value="ABOUTI">
                  Abouti
                </option>

                <option value="IMPOSSIBLE">
                  Impossible
                </option>
              </select>

              {/* 2. DEMANDEUR */}
              <label>Demandeur</label>

              <select
                value={form.demandeur_id}
                onChange={(e) =>
                  setForm({
                    ...form,
                    demandeur_id: e.target.value
                  })
                }
              >
                <option value="">
                  -- Choisir un demandeur --
                </option>

                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.username}
                  </option>
                ))}
              </select>

              {/* 3. TITRE */}
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

              {/* 4. DESCRIPTION */}
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

              {/* 5. SOURCE DEMANDE */}
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
                <option value="Direct">Direct</option>
                <option value="E-mail">E-mail</option>
                <option value="Helpdesk">Helpdesk</option>
                <option value="Phone">Téléphone</option>
                <option value="Written">Written</option>
                <option value="Other">Autre</option>
              </select>

              {/* 6. URGENCE */}
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

              {/* 7. IMPACT */}
              <label>Impact</label>

              <select
                value={form.impact}
                onChange={(e) =>
                  setForm({
                    ...form,
                    impact: e.target.value
                  })
                }
              >
                <option>Très haut</option>
                <option>Haut</option>
                <option>Moyen</option>
                <option>Bas</option>
                <option>Très bas</option>
              </select>

              {/* 8. PRIORITÉ */}
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
                <option>Très Haute</option>
                <option>Moyenne</option>
                <option>Basse</option>
                <option>Très basse</option>
              </select>

              {/* 9. TYPE INTERVENTION */}
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

              {/* 10. TYPE AUTRE */}
              {form.type_intervention === "Autre" && (
                <input
                  placeholder="Précisez le type d'intervention"
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

                <label className="mat-select">
                  - -  Sélectionnez le(s) matériel(s) concerné(s)  - -
                </label>

                <input
                  type="text"
                  value={rechercheMateriel}
                  onChange={(e) =>
                    setRechercheMateriel(e.target.value)
                  }
                  placeholder="Rechercher un matériel..."
                />


              {/* MATERIELS SELECTIONNES */}  

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

              
              {/* 11. DATE DÉBUT */}
              <label>Date de livraison</label>

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

              {/* 12. ÉCHÉANCE */}
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

              {/* 13. DATE FIN */}
              <label>Date de récupération</label>

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


              {/*LIEU*/}
              <label>Lieu</label>

              <input
                placeholder="Lieu de l'intervention"
                value={form.lieu}
                onChange={(e) =>
                  setForm({
                    ...form,
                    lieu: e.target.value
                  })
                }
              />


              {/* 16. TECHNICIEN */}
              <label>Technicien</label>

              <select
                value={form.technicien_id}
                onChange={(e) =>
                  setForm({
                    ...form, 
                    technicien_id : e.target.value ? Number(e.target.value) : ""
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
        )}

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
                  <th>Impact</th>
                  <th>Priorité</th>
                  <th>Date de livraison</th>
                  <th>Échéance</th>
                  <th>Date de récupération</th>
                  <th>Lieu</th>
                  <th>Technicien</th>
                  <th>Créé le</th>

                  {isAdmin && <th>Actions</th>}
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
                          {m.marque_ou_modele} (x{m.quantite})
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

                    {/* ACTIONS */}
                    {isAdmin && (

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

                    )}

                  </tr>

                ))}

              </tbody>

            </table>

          </div>
        )}

      </div>

    </div>
  );
}