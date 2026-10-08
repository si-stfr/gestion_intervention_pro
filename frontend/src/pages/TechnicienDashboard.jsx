import { useEffect, useState } from "react";

import api from "../api/api";

import Sidebar from "../components/Sidebar";
import InterventionCard from "../components/InterventionCard";
import StatusBadge from "../components/StatusBadge";
import InterventionsStatusPieChart from "../components/InterventionsStatusPieChart";
import LieuPopupButton from "../components/LieuPopupButton";
import ImagePreviewButton from "../components/ImagePreviewButton";
import { sortInterventions } from "../utils/sortInterventions";

import "../assets/CSS_JS/global.css";
import "../assets/CSS_JS/Interventions.css";

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

export default function TechnicienDashboard() {

  const [interventions, setInterventions] = useState([]);
  const [users, setUsers] = useState([]);

  const [loading, setLoading] = useState(true);

  const [selectedStatus, setSelectedStatus] = useState("");

  const [editId, setEditId] = useState(null);

  // Livraison en magasin : une ligne par article (quantité reçue + état)
  const [receptions, setReceptions] = useState([]);

  const techniciens = users.filter(u => u.profil === "TECHNICIEN");
  const user = JSON.parse(localStorage.getItem("user"));

  // Le manager d'un technicien est imposé : c'est celui auquel il est rattaché
  const myManagerId = users.find(u => Number(u.id) === Number(user.id))?.manager_id ?? null;
  const myManager = users.find(u => Number(u.id) === Number(myManagerId)) || null;

  const [form, setForm] = useState({

      demandeur_id: "",
      titre: "",
      description_de_la_panne: "",

      source_demande: "",
      type_intervention: "",
      type_intervention_autre: "",

      date_debut: "",
      heure_debut: "",
      date_fin: "",
      heure_fin: "",

      lieu: "",

      technicien_id: "",

      diagnostique_effectue: "",
      actions_realisees: "",
      resultat_intervention: "",
      piece_jointe: "",

      manager_id: ""
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

        console.log("STATUT TECHNICIEN :",res.data);

        setInterventions(res.data ?? []);

    } catch (err) {
        console.error("FETCH INTERVENTIONS ERROR:", err);
    } finally {
        setLoading(false);
    }
  };

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
    interventions.filter(
      (item) =>
          Number(item.technicien_id) === Number(user.id) &&
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
    )
  );

  const mesInterventions = interventions.filter(
    (item) => Number(item.technicien_id) === Number(user.id)
  );

  const statusClassMap = {
    "": "",
    "Signalé": "signale",
    "En cours": "encours",
    "En retard": "enretard",
    "En attente validation": "enattentevalidation",
    "Résolu": "resolu"
  };

  // =========================================
  // RESET FORM
  // =========================================
  const resetForm = () => {

    setForm({

        demandeur_id: "",
        titre: "",
        description_de_la_panne: "",

        source_demande: "",
        type_intervention: "",
        type_intervention_autre: "",

        date_debut: "",
        heure_debut: "",
        date_fin: "",
        heure_fin: "",

        lieu: "",

        technicien_id: "",

        diagnostique_effectue: "",
        actions_realisees: "",
        resultat_intervention: "",
        piece_jointe: "",

        manager_id: ""
    });

    setEditId(null);
    setReceptions([]);
  };

  // =========================================
  // START EDIT
  // =========================================
  const startEdit = (item) => {

    setEditId(item.id);

    setForm({

      demandeur_id: item.demandeur_id,

      titre: item.titre,

      description_de_la_panne:
        item.description_de_la_panne,

      statut: item.statut || "",

      date_debut: item.date_debut ? item.date_debut.split("T")[0]: "",
      heure_debut: item.heure_debut || "",

      date_fin: item.date_fin ? item.date_fin.split("T")[0]: "",
      heure_fin: item.heure_fin || "",

      lieu: item.lieu,

      diagnostique_effectue: item.diagnostique_effectue || "",

      actions_realisees: item.actions_realisees || "",

      resultat_intervention: item.resultat_intervention || "",

      piece_jointe: item.piece_jointe || "",

      manager_id: item.manager_id || "",
    });

    // Livraison en magasin : on prépare la saisie des quantités reçues
    // (par défaut = quantité attendue, à corriger si la livraison est incomplète)
    setReceptions(
      item.type_intervention === "Livraison en magasin"
        ? (item.materiels || []).map((m) => ({
            materiel_id: m.id,
            nom: m.marque_ou_modele || m.type_de_materiel || "Article",
            attendu: m.quantite ?? 1,
            quantite_recue: m.quantite_recue ?? m.quantite ?? 1,
            etat_reception: m.etat_reception || "Conforme",
          }))
        : []
    );

    if (item.type_intervention === "Livraison en magasin" && (item.materiels || []).length === 0) {
      alert(
        "Cette livraison ne contient aucun article. Demandez à l'Admin ou à l'Intervenant qui l'a créée de la modifier pour ajouter les articles attendus."
      );
    }
  };

  // =========================================
  // UPDATE
  // =========================================
  const updateIntervention = async () => {
    if (receptions.some((r) => r.quantite_recue === "" || Number(r.quantite_recue) < 0)) {
      alert("Indiquez une quantité reçue (0 ou plus) pour chaque article");
      return;
    }

    try {
      await api.put(`/intervention/${editId}/technicien`, {

        // Le technicien ne choisit pas le statut.
        // La complétion fait automatiquement passer
        // l'intervention en attente de validation.
        statut: "EN_ATTENTE_VALIDATION",

        date_debut: form.date_debut || null,
        heure_debut: form.heure_debut || null,
        date_fin: form.date_fin || null,
        heure_fin: form.heure_fin || null,

        diagnostique_effectue: form.diagnostique_effectue,

        actions_realisees: form.actions_realisees,

        resultat_intervention: form.resultat_intervention,

        piece_jointe: form.piece_jointe || null,

        // livraison en magasin : quantités reçues et état de chaque article
        materiels_recus:
          receptions.length > 0
            ? receptions.map((r) => ({
                materiel_id: r.materiel_id,
                quantite_recue: Number(r.quantite_recue),
                etat_reception: r.etat_reception,
              }))
            : undefined,
      });

      fetchInterventions();
      resetForm();

      alert("Intervention complétée")
    } catch (err) {

      console.error(err);
      alert(err?.response?.data?.detail || "Erreur lors de la complétion de l'intervention");
    }
  };

  const sendToManager = async (item) => {

    if (item.statut == "SIGNALE") {
      alert("Veuillez compléter l'intervention avant de l'envoyer à un manager");
      return;
    }

    if (!myManager) {
        alert("Vous n'êtes rattaché à aucun manager. Demandez à un manager de vous ajouter à son équipe.");
        return;
    }

    const confirmSend = window.confirm(
            `Envoyer au manager ${myManager.username} ?`
        );

    if (!confirmSend) return;
    try {
        await api.post(`/intervention/${item.id}/send-manager`, {
            date_verification: new Date().toISOString().split("T")[0]
        });

        fetchInterventions();

        alert("Intervention envoyé au Manager !");

    } catch (err) {
        console.error(err);
        alert(err?.response?.data?.detail || "Erreur lors de l'envoi au manager");
    }
 };

  return (

    <div className="layout interventions-page">

      <Sidebar />

      <div className="page-content">

        <h1 className="titre-principal">
          Complétion des interventions
        </h1>

        {/* FILTERS */}
        <div className="filters-container">

          <select
            className={`status-filter ${statusClassMap[selectedStatus] || ""}`}
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            >
            <option value="">Tous</option>
            <option value="Signalé">Demande</option>
            <option value="En cours">En cours</option>
            <option value="En retard">En retard</option>
            <option value="En attente validation">En attente de validation</option>
            </select>

        </div>

        {/*FORM*/}

          <div className="admin-panel">

            <h2 className="admin-title">
              Gestion Technicien
            </h2>

            <div className="admin-grid">  

                {/* 1. DATE DÉBUT */}
                <label>Date de début</label>
                <input
                    type="date"
                    value={form.date_debut}
                    onChange={(e) =>
                    setForm({ ...form, date_debut: e.target.value })
                    }
                />

                <label>Heure de début</label>
                <input
                    type="time"
                    value={form.heure_debut}
                    onChange={(e) =>
                    setForm({ ...form, heure_debut: e.target.value })
                    }
                />

                {/* 3. DATE FIN */}
                <label>Date de fin</label>
                <input
                    type="date"
                    value={form.date_fin}
                    onChange={(e) =>
                    setForm({ ...form, date_fin: e.target.value })
                    }
                />

                <label>Heure de fin</label>
                <input
                    type="time"
                    value={form.heure_fin}
                    onChange={(e) =>
                    setForm({ ...form, heure_fin: e.target.value })
                    }
                />

                {/* 5. DIAGNOSTIQUE EFFECTUÉ */}
                 <label>Diagnostique effectué</label>
                <textarea
                    value={form.diagnostique_effectue}
                    onChange={(e) =>
                        setForm({
                            ...form,
                            diagnostique_effectue: e.target.value
                        })
                    }
                />

                {/* 5. ACTIONS RÉALISÉES */}
                <label>Actions réalisées</label>
                <textarea
                    value={form.actions_realisees}
                    onChange={(e) =>
                        setForm({
                            ...form,
                            actions_realisees: e.target.value
                        })
                    }
                />

                {/* 7. RÉSULTAT INTERVENTION */}
                <label>Résultat de l'intervention</label>
                <select
                    value={form.resultat_intervention}
                    onChange={(e) =>
                        setForm({
                            ...form,
                            resultat_intervention: e.target.value
                        })
                    }
                >
                    <option value="">
                        -- Choisir un résultat --
                    </option>

                    <option value="Problème résolu">
                        Problème résolu
                    </option>

                    <option value="Nouvelle intervention nécessaire">
                        Nouvelle intervention nécessaire
                    </option>
                </select>

                {/* LIVRAISON EN MAGASIN : RÉCEPTION DES ARTICLES */}
                {receptions.length > 0 && (
                  <div className="reception-box">
                    <label>Réception des articles (livraison en magasin)</label>
                    <p className="reception-aide">
                      Indiquez la quantité réellement reçue. Un article « Abîmé » est
                      refusé : il ne sera pas ajouté au stock.
                    </p>

                    {receptions.map((r) => (
                      <div key={r.materiel_id} className="reception-ligne">
                        <div className="reception-nom">
                          {r.nom} <small>(attendu : {r.attendu})</small>
                        </div>

                        <input
                          type="number"
                          min="0"
                          value={r.quantite_recue}
                          onChange={(e) =>
                            setReceptions((prev) =>
                              prev.map((x) =>
                                x.materiel_id === r.materiel_id
                                  ? { ...x, quantite_recue: e.target.value }
                                  : x
                              )
                            )
                          }
                        />

                        <select
                          value={r.etat_reception}
                          onChange={(e) =>
                            setReceptions((prev) =>
                              prev.map((x) =>
                                x.materiel_id === r.materiel_id
                                  ? { ...x, etat_reception: e.target.value }
                                  : x
                              )
                            )
                          }
                        >
                          <option value="Conforme">Conforme</option>
                          <option value="Abîmé">Abîmé</option>
                        </select>
                      </div>
                    ))}
                  </div>
                )}


                {/* 8. PIÈCE JOINTE */}
                <label>Pièce jointe (photo)</label>

                {form.piece_jointe ? (
                  <div style={{ display: "flex", gap: "8px" }}>
                    <ImagePreviewButton src={form.piece_jointe} />
                    <button
                      type="button"
                      className="attachment-delete-btn"
                      onClick={() => setForm({ ...form, piece_jointe: "" })}
                    >
                      Supprimer
                    </button>
                  </div>
                ) : (
                  <label className="attachment-upload">
                    Ajouter
                    <input
                      type="file"
                      accept=".png,.jpg,.jpeg,image/png,image/jpeg"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;

                        if (!["image/png", "image/jpeg", "image/jpg"].includes(file.type)) {
                          alert("Veuillez sélectionner une image PNG, JPG ou JPEG.");
                          return;
                        }

                        const reader = new FileReader();
                        reader.onload = () => {
                          setForm((prev) => ({ ...prev, piece_jointe: reader.result }));
                        };
                        reader.readAsDataURL(file);
                      }}
                    />
                  </label>
                )}

            </div>

            {editId ? (

              <button className="admin-btn btn-completer" onClick={updateIntervention}>Compléter l'intervention</button>
            ):null}

            {editId ? (
              <button className="admin-btn" onClick={resetForm}>Annuler</button>
            ):null}

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
                    <th>Source de la demande</th>
                    <th>Date début</th>
                    <th>Date fin</th>
                    <th>Lieu</th>
                    <th>Technicien</th>
                    <th>Diagnostique effectué</th>
                    <th>Actions réalisées</th>
                    <th>Résultat de l'intervention</th>
                    <th>Manager</th>
                    <th>Date de complétion</th>
                    <th>Créé le</th>

                    <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredInterventions.map((item) => (
                    <tr
                    key={item.id}
                    className={`ligne ${normalizeStatut(item.statut)}`}
                    >

                    {/* 1. Statut */}
                    <td className={`statut ${normalizeStatut(item.statut)}`}>
                        {statutLabels[item.statut] ?? item.statut}
                    </td>

                    {/* 2. Demandeur */}
                    <td>
                        {item.demandeur_name || "-"}
                    </td>

                    {/* Prénom */}
                    <td>{item.demandeur_prenom || "-"}</td>

                    {/* Email */}
                    <td>{item.demandeur_email || "-"}</td>

                    {/* Téléphone */}
                    <td>{item.demandeur_telephone || "-"}</td>

                    {/* 3. Titre */}
                    <td>{item.titre}</td>

                     {/* 9. Type intervention */}
                    <td>{item.type_intervention}</td>

                    {/* 10. Type autre */}
                    <td>{item.type_intervention_autre}</td>

                    {/* Services demandés */}
                    <td>
                        {item.services_de_la_commune?.length
                            ? item.services_de_la_commune.join(", ")
                            : "-"}
                    </td>

                    {/* Sites correspondant */}
                    <td>
                        {item.sites_de_la_commune?.length
                            ? item.sites_de_la_commune.join(", ")
                            : "-"}
                    </td>

                    {/* 4. Description */}
                    <td>
                      {item.description_de_la_panne}
                      {item.fournisseur && (
                        <div><small>Fournisseur : {item.fournisseur}{item.numero_bon_livraison ? ` – BL ${item.numero_bon_livraison}` : ""}</small></div>
                      )}
                    </td>

                     {/*MATERIEL*/}
                    <td>
                      {item.materiels?.map((m) => (
                        <div key={m.id}>
                          -{m.marque_ou_modele} (x{m.quantite}{m.quantite_recue != null ? ` / reçu ${m.quantite_recue}` : ""}){m.etat_reception === "Abîmé" ? " ⚠ abîmé" : ""}
                        </div>
                      ))}
                    </td>

                    {/* 5. Source */}
                    <td>{item.source_demande || "-"}</td>

                    {/* 11. Date début */}
                    <td>{item.date_debut}{item.heure_debut ? ` ${item.heure_debut}` : ""}</td>

                    {/* 13. Date fin */}
                    <td>{item.date_fin}{item.heure_fin ? ` ${item.heure_fin}` : ""}</td>

                    {/* 14. Géolocalisation */}
                    <td>
                        <LieuPopupButton lieu={item.lieu} />
                    </td>

                    {/* 16. Technicien */}
                    <td>
                        {
                            users.find(u => Number(u.id) === Number(item.technicien_id))?.username
                            || "-"
                        }
                    </td>

                    {/* Diagnostique effectué */}
                    <td>{item.diagnostique_effectue || "-"}</td>

                    {/* 18. Actions réalisées */}
                    <td>{item.actions_realisees || "-"}</td>

                    {/* 20. Résultat intervention */}
                    <td>{item.resultat_intervention || "-"}</td>

                    {/* 21. Manager */}
                    <td>
                        {item.manager_name
                            || myManager?.username
                            || "Aucun manager rattaché"}
                    </td>

                    {/* 22. Date de vérification */}
                    <td>{item.date_verification || "-"}</td>

                    {/* 23. Créé le */}
                    <td>
                        {
                            item.created_at
                            ? new Date(item.created_at).toLocaleString("fr-FR")
                            : "-"
                        }
                    </td>

                    {/* 24.Actions */}
                        <td>
                          <div className="actions-buttons">

                            <button className="btn-modifier" onClick={() => startEdit(item)}>Compléter</button>
                            <button className="btn-manager" onClick={() => sendToManager(item)}>Envoyer au Manager</button>
                          
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
