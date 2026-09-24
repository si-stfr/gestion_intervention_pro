import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import api from "../api/api";

import Sidebar from "../components/Sidebar";
import LieuMapPicker from "../components/LieuMapPicker";
import LieuPopupButton from "../components/LieuPopupButton";
import ServicesCommuneSelector from "../components/ServicesCommuneSelector";
import { sortInterventions } from "../utils/sortInterventions";
import { getAvailableTechniciens } from "../utils/technicienAvailability";

const today = () => new Date().toISOString().split("T")[0];

import "../assets/CSS_JS/global.css";
import "../assets/CSS_JS/Interventions.css";

const STATUTS_AVEC_SUIVI = ["EN_COURS", "EN_RETARD", "EN_ATTENTE_VALIDATION"];

const statutLabels = {
  SIGNALE: "Demande",
  EN_COURS: "En cours",
  EN_RETARD: "En retard",
  EN_ATTENTE_VALIDATION: "En attente validation",
  ABOUTI: "Terminée",
  IMPOSSIBLE: "Non résolue",
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

export default function Interventions() {

  const navigate = useNavigate();

  const [interventions, setInterventions] = useState([]);
  const [materiels, setMateriels] = useState([]);
  const [users, setUsers] = useState([]);
  const[totalMateriels, setTotalMateriels] = useState(0)
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState("");
  const [editId, setEditId] = useState(null);
  const [renewId, setRenewId] = useState(null);
  const [materielsSelectionnes, setMaterielsSelectionnes] = useState([]);
  const [rechercheMateriel, setRechercheMateriel] = useState("");
  const [showMaterielDropdown, setShowMaterielDropdown] = useState(false);
  const techniciens = users.filter(
    (u) => u.profil === "TECHNICIEN"
  );
  const managers = users.filter(
    (u) => u.profil === "MANAGER"
  );

  const user = JSON.parse(localStorage.getItem("user"));

  const isAdmin = user?.profil === "ADMIN";

  const [form, setForm] = useState({
    demandeur_nom: "",
    demandeur_prenom: "",
    demandeur_email: "",
    demandeur_telephone: "",
    titre: "",
    description_de_la_panne: "",
    statut: "SIGNALE",

    source_demande: "Direct",
    type_intervention: "Livraison",
    type_intervention_autre: "",
    services_de_la_commune: [],
    sites_de_la_commune: [],

    date_debut: today(),
    date_fin: today(),

    lieu: "",
    latitude: null,
    longitude: null,

    technicien_id: "",

    // suivi technicien / manager (visible uniquement en édition d'une
    // intervention EN_COURS / EN_RETARD / EN_ATTENTE_VALIDATION)
    diagnostique_effectue: "",
    actions_realisees: "",
    resultat_intervention: "",
    commentaire: "",
    manager_id: "",
  });

  const availableTechniciens = getAvailableTechniciens(
    techniciens,
    form.date_debut,
    form.date_fin,
    interventions,
    editId
  );

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
  // FILTER + TRI
  // =========================================
  const filteredInterventions = sortInterventions(
    (interventions ?? []).filter(
      (item) => selectedStatus === "" || item.statut === selectedStatus
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
  };

  // =========================================
  // RESET FORM
  // =========================================
  const resetForm = () => {

    setForm({
      demandeur_nom: "",
      demandeur_prenom: "",
      demandeur_email: "",
      demandeur_telephone: "",
      titre: "",
      description_de_la_panne: "",

      statut: "SIGNALE",

      source_demande: "Direct",
      type_intervention: "Livraison",
      type_intervention_autre: "",
      services_de_la_commune: [],
      sites_de_la_commune: [],

      date_debut: today(),
      date_fin: today(),

      lieu: "",
      latitude: null,
      longitude: null,

      technicien_id: "",

      diagnostique_effectue: "",
      actions_realisees: "",
      resultat_intervention: "",
      commentaire: "",
      manager_id: "",
    });
    setMaterielsSelectionnes([]);
    setRechercheMateriel("");
    setShowMaterielDropdown(false);
    setEditId(null);
    setRenewId(null);
  };

  // =========================================
  // ADD
  // =========================================
  const addIntervention = async () => {

    if (!form.demandeur_nom) {
        alert("Veuillez saisir un demandeur");
        return;
        }

    if (!form.demandeur_prenom) {
        alert("Veuillez saisir le prénom du demandeur");
        return;
        }

    if (!form.demandeur_telephone) {
        alert("Veuillez saisir le téléphone du demandeur");
        return;
        }

    if (!form.demandeur_email) {
        alert("Veuillez saisir l'email du demandeur");
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

    if (!form.lieu) {
        alert("Veuillez saisir un lieu d'intervention");
        return;
        }

    if (!form.technicien_id) {
        alert("Veuillez choisir un technicien");
        return;
        }

    if (renewId) {
      const confirmRenew = window.confirm(
        "Confirmer le renouvellement ? L'intervention Non résolue d'origine sera définitivement supprimée."
      );
      if (!confirmRenew) return;
    }

    try {

      // les champs de suivi technicien/manager n'ont de sens qu'en édition
      const {
        diagnostique_effectue,
        actions_realisees,
        resultat_intervention,
        commentaire,
        manager_id,
        ...createForm
      } = form;

      await api.post("/intervention/", {

        ...createForm,

        technicien_id:
          form.technicien_id === ""
            ? null
            : parseInt(form.technicien_id),

          source_demande:
            form.source_demande === "" ? null : form.source_demande,

          type_intervention:
            form.type_intervention === "" ? null : form.type_intervention,

          materiels: materielsSelectionnes.map(m => ({
                id :m.id,
                quantite : m.quantiteDemande

      }))

      });

      if (renewId) {
        await api.delete(`/intervention/${renewId}`);
      }

      fetchInterventions();

      const wasRenewal = Boolean(renewId);

      resetForm();

      alert(
        wasRenewal
          ? "Intervention renouvelée avec succès"
          : "Intervention créé avec succès"
      );
    } catch (err) {

      console.error(err);
      alert(err?.response?.data?.detail || "Erreur lors de la création de l'intervention");
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

      demandeur_nom: item.demandeur_name ?? "",
      demandeur_prenom: item.demandeur_prenom ?? "",
      demandeur_email: item.demandeur_email ?? "",
      demandeur_telephone: item.demandeur_telephone ?? "",

      titre: item.titre ?? "",

      description_de_la_panne:
        item.description_de_la_panne ?? "",

      statut: item.statut ?? "SIGNALE",

      source_demande: item.source_demande ?? "",

      type_intervention:
        item.type_intervention ?? "",

      type_intervention_autre:
        item.type_intervention_autre ?? "",

      services_de_la_commune: item.services_de_la_commune ?? [],
      sites_de_la_commune: item.sites_de_la_commune ?? [],

      date_debut:
        item.date_debut
          ? item.date_debut.split("T")[0]
          : "",

      date_fin:
        item.date_fin
          ? item.date_fin.split("T")[0]
          : "",

      lieu: item.lieu ?? "",
      latitude: item.latitude ?? null,
      longitude: item.longitude ?? null,

      technicien_id: item.technicien_id ? Number(item.technicien_id) : "",

      diagnostique_effectue: item.diagnostique_effectue ?? "",
      actions_realisees: item.actions_realisees ?? "",
      resultat_intervention: item.resultat_intervention ?? "",
      commentaire: item.commentaire ?? "",
      manager_id: item.manager_id ? Number(item.manager_id) : "",
    });
  };

  // =========================================
  // RENOUVELER (pré-remplit le formulaire de CRÉATION
  // à partir d'une intervention Non résolue ; le suivi
  // technicien/manager repart de zéro)
  // =========================================
  const renewIntervention = (item) => {

    setEditId(null);
    setRenewId(item.id);
    setShowMaterielDropdown(false);

    setForm({

      demandeur_nom: item.demandeur_name ?? "",
      demandeur_prenom: item.demandeur_prenom ?? "",
      demandeur_email: item.demandeur_email ?? "",
      demandeur_telephone: item.demandeur_telephone ?? "",

      titre: item.titre ?? "",

      description_de_la_panne:
        item.description_de_la_panne ?? "",

      statut: "SIGNALE",

      source_demande: item.source_demande ?? "Direct",

      type_intervention:
        item.type_intervention ?? "",

      type_intervention_autre:
        item.type_intervention_autre ?? "",

      services_de_la_commune: item.services_de_la_commune ?? [],
      sites_de_la_commune: item.sites_de_la_commune ?? [],

      date_debut: today(),
      date_fin: today(),

      lieu: item.lieu ?? "",
      latitude: item.latitude ?? null,
      longitude: item.longitude ?? null,

      technicien_id: item.technicien_id ? Number(item.technicien_id) : "",

      diagnostique_effectue: "",
      actions_realisees: "",
      resultat_intervention: "",
      commentaire: "",
      manager_id: "",
    });

    setMaterielsSelectionnes(
      (item.materiels || []).map((m) => ({
        ...m,
        quantiteDemande: m.quantite ?? 1,
      }))
    );

    window.scrollTo({ top: 0, behavior: "smooth" });
    document.querySelector(".admin-grid")?.scrollTo({ top: 0, behavior: "smooth" });

    alert(
      "Le formulaire a été pré-rempli avec les informations de cette intervention. Choisissez de nouvelles dates puis cliquez sur \"Renouveler\" pour créer la nouvelle intervention (l'ancienne sera supprimée)."
    );
  };

  // =========================================
  // UPDATE
  // =========================================
  const updateIntervention = async () => {

    if (form.statut === "EN_ATTENTE_VALIDATION" && !form.manager_id) {
      alert("Veuillez choisir un manager avant de mettre l'intervention en attente de validation");
      return;
    }

    try {

      await api.put(`/intervention/${editId}`, {

        ...form,

        technicien_id: form.technicien_id ? Number(form.technicien_id): null,

        manager_id: form.manager_id ? Number(form.manager_id) : null,

        source_demande:
          form.source_demande === "" ? null : form.source_demande,

        type_intervention:
          form.type_intervention === "" ? null : form.type_intervention,

      });

      fetchInterventions();

      resetForm();

      alert("Intervention modifié")
    } catch (err) {

      console.error(err);
      alert(err?.response?.data?.detail || "Erreur lors de la modification de l'intervention");
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

            <option value="IMPOSSIBLE">
              Non résolues
            </option>

            <option value="ABOUTI">
              Terminées
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
                  Terminée
                </option>

                <option value="IMPOSSIBLE">
                  Non résolue
                </option>
              </select>

              {/* 2. DEMANDEUR */}
              <label>Nom du Demandeur</label>

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

              <label>Prénom du Demandeur</label>

              <input
                placeholder="Prénom du demandeur"
                value={form.demandeur_prenom}
                onChange={(e) =>
                  setForm({
                    ...form,
                    demandeur_prenom: e.target.value
                  })
                }
              />

              <label>Email du Demandeur</label>

              <input
                type="email"
                placeholder="Email du demandeur"
                value={form.demandeur_email}
                onChange={(e) =>
                  setForm({
                    ...form,
                    demandeur_email: e.target.value
                  })
                }
              />

              <label>Téléphone du Demandeur</label>

              <input
                placeholder="Téléphone du demandeur"
                value={form.demandeur_telephone}
                onChange={(e) =>
                  setForm({
                    ...form,
                    demandeur_telephone: e.target.value
                  })
                }
              />

              {/* 3. TITRE */}
              <label>Titre</label>
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
              <label>Description</label>
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
                <option>Intervention Eau</option>
                <option>Intervention Electricité</option>
                <option>Intervention Bâtimentaire</option>
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

              {/* SERVICES DEMANDÉS */}
              <ServicesCommuneSelector
                value={form.services_de_la_commune}
                onChange={(services, sites) =>
                  setForm({
                    ...form,
                    services_de_la_commune: services,
                    sites_de_la_commune: sites,
                  })
                }
              />

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

              {/* 11. DATE DÉBUT */}
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

              {/* 13. DATE FIN */}
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


              {/*LIEU*/}
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

                {techniciens.map((u) => {
                  const dejaAssigne = Number(form.technicien_id) === Number(u.id);
                  const disponible = dejaAssigne || availableTechniciens.some((a) => a.id === u.id);

                  if (!disponible) return null;

                  return (
                    <option key={u.id} value={u.id}>
                      {u.username}
                    </option>
                  );
                })}
              </select>

              {/* INFOS TECHNICIEN / MANAGER (intervention en cours de traitement) */}
              {editId && STATUTS_AVEC_SUIVI.includes(form.statut) && (
                <>
                  <h3 className="admin-title" style={{ marginTop: "10px" }}>
                    Suivi technicien / manager
                  </h3>

                  <label>Diagnostic effectué</label>
                  <textarea
                    placeholder="Diagnostic effectué"
                    value={form.diagnostique_effectue}
                    onChange={(e) =>
                      setForm({ ...form, diagnostique_effectue: e.target.value })
                    }
                  />

                  <label>Actions réalisées</label>
                  <textarea
                    placeholder="Actions réalisées"
                    value={form.actions_realisees}
                    onChange={(e) =>
                      setForm({ ...form, actions_realisees: e.target.value })
                    }
                  />

                  <label>Résultat de l'intervention</label>
                  <select
                    value={form.resultat_intervention}
                    onChange={(e) =>
                      setForm({ ...form, resultat_intervention: e.target.value })
                    }
                  >
                    <option value="">-- Non renseigné --</option>
                    <option value="Problème résolu">Problème résolu</option>
                    <option value="Nouvelle intervention nécessaire">
                      Nouvelle intervention nécessaire
                    </option>
                  </select>

                  <label>Manager assigné</label>
                  <select
                    value={form.manager_id}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        manager_id: e.target.value ? Number(e.target.value) : "",
                      })
                    }
                  >
                    <option value="">-- Aucun --</option>
                    {managers.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.username}
                      </option>
                    ))}
                  </select>

                  <label>Commentaire</label>
                  <textarea
                    placeholder="Commentaire"
                    value={form.commentaire}
                    onChange={(e) =>
                      setForm({ ...form, commentaire: e.target.value })
                    }
                  />

                  <label>Date de complétion</label>
                  <input
                    type="text"
                    value="Renseignée automatiquement à la validation du Manager"
                    disabled
                  />
                </>
              )}

            </div>

            {editId ? (

              <button
                className="admin-btn btn-submit-edit"
                onClick={updateIntervention}
              >
                Modifier
              </button>

            ) : (

              <button
                className={`admin-btn ${renewId ? "btn-submit-renew" : ""}`}
                onClick={addIntervention}
              >
                {renewId ? "Renouveler" : "Ajouter"}
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
                  <th>Prénom</th>
                  <th>Email</th>
                  <th>Téléphone</th>
                  <th>Titre</th>
                  <th>Type intervention</th>
                  <th>Type autre</th>
                  <th>Services demandés</th>
                  <th>Sites correspondant</th>
                  <th>Description</th>
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
                      <div className="actions-buttons">

                        {isAdmin && (
                          <button
                            className="btn-modifier"
                            onClick={() =>
                              startEdit(item)
                            }
                          >
                            Modifier
                          </button>
                        )}

                        {item.statut === "ABOUTI" && (
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
                        )}

                        {item.statut === "IMPOSSIBLE" && (
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
                        )}

                        {isAdmin && item.statut === "IMPOSSIBLE" && (
                          <button
                            className="btn-renouveler"
                            onClick={() =>
                              renewIntervention(item)
                            }
                          >
                            Renouveler
                          </button>
                        )}

                        {isAdmin && item.statut !== "IMPOSSIBLE" && (
                          <button
                            className="btn-supprimer"
                            onClick={() =>
                              deleteIntervention(item.id)
                            }
                          >
                            Supprimer
                          </button>
                        )}

                      </div>
                    </td>

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