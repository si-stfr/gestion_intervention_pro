import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";

import Sidebar from "../components/Sidebar";

import "../assets/CSS_JS/global.css";
import "../assets/CSS_JS/Interventions.css";

// ============================
// NORMALISATION STATUT
// ============================
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

export default function InterventionsImpossible() {

    const navigate = useNavigate();
    const [interventions, setInterventions] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editId, setEditId] = useState(null);
    const [commentaires, setCommentaires] = useState({});
    const [selectedImage, setSelectedImage] = useState(null);

    const techniciens = users.filter(u => u.profil === "TECHNICIEN");
    const user = JSON.parse(localStorage.getItem("user"));

    const isAdmin = user?.profil === "ADMIN";
    const isIntervenant = user?.profil === "INTERVENANT";
    const canRenew = isAdmin || isIntervenant;

    // ============================
    // FORM (basé sur Interventions.jsx)
    // ============================
    const [form, setForm] = useState({
        demandeur_id: isIntervenant ? user?.id : "",
        titre: "",
        description_de_la_panne: "",

        statut: "SIGNALE",

        source_demande: "",
        impact: "",
        priorite: "",
        type_intervention: "",
        type_intervention_autre: "",

        date_debut: "",
        echeance: "",
        date_fin: "",

        latitude: "",
        longitude: "",

        urgence: "Moyenne",

        technicien_id: "",

        diagnostique_effectue: "",
        actions_realisees: "",
        actions_autre: "",
        resultat_intervention: "",

        manager_id: null,
        date_verification: null
    });

    // ============================
    // FETCH INTERVENTIONS
    // ============================
    const fetchInterventions = async () => {
        try {
            setLoading(true);

            const res = await api.get("/intervention/");

            const normalized = (res.data ?? []).map(i => ({
                ...i,
                statut: typeof i.statut === "object"
                    ? i.statut.value
                    : i.statut
            }));

            setInterventions(normalized);

        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // ============================
    // FETCH USERS
    // ============================
    const fetchUsers = async () => {
        try {
            const res = await api.get("/intervention/users/public");
            setUsers(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchInterventions();
        fetchUsers();
    }, []);

    // ============================
    // FILTER IMPOSSIBLE
    // ============================
    const filteredInterventions = interventions.filter(
        (item) => item.statut === "IMPOSSIBLE"
    );

    const isImageSourceValid = (value) => {
        if (typeof value !== "string") return false;
        const trimmed = value.trim();
        if (!trimmed) return false;
        return /^data:image\/(png|jpeg|jpg);base64,/.test(trimmed) || /^https?:\/\//i.test(trimmed);
    };

    const getAttachment = (item) => {
        const value = item?.piece_jointe ?? item?.pieceJointe ?? item?.image ?? null;

        if (typeof value === "string") {
            const cleaned = value.trim();
            return cleaned ? cleaned : null;
        }

        return value ?? null;
    };

    // ============================
    // START RENEW
    // ============================
    const startRenew = (item) => {
        setEditId(item.id);

        setForm({
            demandeur_id: isIntervenant ? user?.id : item.demandeur_id,
            titre: item.titre,
            description_de_la_panne: item.description_de_la_panne,

            statut: "SIGNALE",

            source_demande: item.source_demande,
            impact: item.impact,
            priorite: item.priorite,
            type_intervention: item.type_intervention,
            type_intervention_autre: item.type_intervention_autre,

            date_debut: item.date_debut,
            echeance: item.echeance,
            date_fin: "",

            lieu: item.lieu,

            urgence: item.urgence,

            technicien_id: "",
            diagnostique_effectue: "",
            actions_realisees: "",
            actions_autre: "",
            resultat_intervention: "",

            manager_id: null,
            date_verification: null
        });
    };

    // ============================
    // RENEW INTERVENTION
    // ============================
    const renewIntervention = async () => {
        if (!form.technicien_id) {
        alert("Veuillez choisir un technicien.");
        return;
        }

        if (!form.date_fin) {
        alert("Veuillez renseigner la date de fin.");
        return;
        }
        
        try {
            await api.put(`/intervention/${editId}`, {
                ...form,

                statut: "SIGNALE",
                technicien_id: null,
                diagnostique_effectue: "",
                actions_realisees: "",
                actions_autre: "",
                resultat_intervention: "",
                manager_id: null,
                date_verification: null,
                technicien_id: form.technicien_id === ""
                    ? null
                    : parseInt(form.technicien_id),
                    });

            fetchInterventions();
            setEditId(null);
            
            alert("Intervention renouvellée avec succès")
        } catch (err) {
            console.error(err);
        }
    };

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

    // ============================
    // IMPRIMER INTERVENTION
    // ============================
    const imprimerIntervention = (titre, typeIntervention) => {
        navigate(`/interventions/imprimer?titre=${encodeURIComponent(titre)}&typeIntervention=${encodeURIComponent(typeIntervention)}`);
    };

    return (
        <div className="layout interventions-page">

            <Sidebar />

            <div className="page-content">

                <h1 className="titre-principal">
                    Interventions Non Résolues
                </h1>

                {/* ================= FORMULAIRE RENOUVELLEMENT ================= */}
                {canRenew && editId && (
                    <div className="admin-panel">

                        <h2 className="admin-title">
                            Renouveler intervention
                        </h2>

                        <div className="admin-grid">

                            {/* DEMANDEUR */}
                            <label>Demandeur</label>
                            {isIntervenant ? (
                                <input value={user?.username} disabled />
                            ) : (
                                <select
                                    value={form.demandeur_id}
                                    onChange={(e) =>
                                        setForm({ ...form, demandeur_id: e.target.value })
                                    }
                                >
                                    <option value="">-- Choisir --</option>
                                    {users.map(u => (
                                        <option key={u.id} value={u.id}>
                                            {u.username}
                                        </option>
                                    ))}
                                </select>
                            )}

                            {/* TITRE */}
                            <label>Titre</label>
                            <input
                                value={form.titre}
                                onChange={(e) =>
                                    setForm({ ...form, titre: e.target.value })
                                }
                            />

                            {/* DESCRIPTION */}
                            <label>Description</label>
                            <textarea
                                value={form.description_de_la_panne}
                                onChange={(e) =>
                                    setForm({
                                        ...form,
                                        description_de_la_panne: e.target.value
                                    })
                                }
                            />

                            {/* STATUT BLOQUÉ */}
                            <label>Statut</label>
                            <input value="Demande" disabled />

                            {/* SOURCE */}
                            <label>Source demande</label>
                            <select
                                value={form.source_demande}
                                onChange={(e) =>
                                    setForm({ ...form, source_demande: e.target.value })
                                }
                            >
                                <option>Direct</option>
                                <option>E-mail</option>
                                <option>Formcreator</option>
                                <option>Helpdesk</option>
                                <option>Phone</option>
                                <option>Written</option>
                                <option>Other</option>
                            </select>

                            {/* URGENCE */}
                            <label>Urgence</label>
                            <select
                                value={form.urgence}
                                onChange={(e) =>
                                    setForm({ ...form, urgence: e.target.value })
                                }
                            >
                                <option>Très haute</option>
                                <option>Haute</option>
                                <option>Moyenne</option>
                                <option>Basse</option>
                                <option>Très basse</option>
                            </select>

                            {/* IMPACT */}
                            <label>Impact</label>
                            <select
                                value={form.impact}
                                onChange={(e) =>
                                    setForm({ ...form, impact: e.target.value })
                                }
                            >
                                <option>Très haut</option>
                                <option>Haut</option>
                                <option>Moyen</option>
                                <option>Bas</option>
                                <option>Très bas</option>
                            </select>

                            {/* PRIORITE */}
                            <label>Priorité</label>
                            <select
                                value={form.priorite}
                                onChange={(e) =>
                                    setForm({ ...form, priorite: e.target.value })
                                }
                            >
                                <option>Majeure</option>
                                <option>Très Haute</option>
                                <option>Moyenne</option>
                                <option>Basse</option>
                                <option>Très basse</option>
                            </select>

                            {/* TYPE INTERVENTION */}
                            <label>Type intervention</label>
                            <select
                                value={form.type_intervention}
                                onChange={(e) =>
                                    setForm({ ...form, type_intervention: e.target.value })
                                }
                            >
                                <option>Maintenance</option>
                                <option>Depannage</option>
                                <option>Installation</option>
                                <option>Mise à jour</option>
                                <option>Réseau</option>
                                <option>Sauvegarde</option>
                                <option>Autre</option>
                            </select>

                            {form.type_intervention === "Autre" && (
                                <input
                                    placeholder="Autre type"
                                    value={form.type_intervention_autre}
                                    onChange={(e) =>
                                        setForm({
                                            ...form,
                                            type_intervention_autre: e.target.value
                                        })
                                    }
                                />
                            )}

                            {/* DATES */}
                            <label>Date début</label>
                            <input
                                type="date"
                                value={form.date_debut}
                                onChange={(e) =>
                                    setForm({ ...form, date_debut: e.target.value })
                                }
                            />

                            <label>Date échéance</label>
                            <input
                                type="date"
                                value={form.echeance}
                                onChange={(e) =>
                                    setForm({ ...form, echeance: e.target.value })
                                }
                            />

                            {/* 13. DATE FIN */}
                            <label>Date de fin</label>
                            <input
                                type="date"
                                value={form.date_fin}
                                onChange={(e) =>
                                setForm({ ...form, date_fin: e.target.value })
                                }
                            />

                            {/* 14. LIEU */}
                            <label>Lieu</label>
                            <input
                                value={form.lieu}
                                onChange={(e) =>
                                    setForm({ ...form, lieu: e.target.value })
                                }
                            />

                            {/* 16. TECHNICIEN (à ajouter backend si pas encore) */}
                            <label>Technicien</label>
                            <select
                                value={form.technicien_id || ""}
                                onChange={(e) =>
                                    setForm({ ...form, technicien_id: e.target.value })
                                }
                            >
                                <option value="">-- Choisir un technicien --</option>

                                {techniciens.map((u) => (
                                    <option key={u.id} value={u.id}>
                                    {u.username}
                                    </option>
                                ))}
                            </select>

                        </div>

                        <button className="admin-btn" onClick={renewIntervention}>
                            Renouveler
                        </button>
                    </div>
                )}

                {/* ================= TABLE ================= */}
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
                                    <th>Type d'intervention</th>
                                    <th>Autre type d'intervention</th>
                                    <th>Description</th>
                                    <th>Matériel concerné</th>
                                    <th>Source de la demande</th>
                                    <th>Urgence</th>
                                    <th>Impact</th>
                                    <th>Priorité</th>
                                    <th>Date de livraison</th>
                                    <th>Date d'échéance</th>
                                    <th>Date de récupération</th>
                                    <th>Lieu</th>
                                    <th>Technicien</th>
                                    <th>Actions réalisées</th>
                                    <th>Résultat de l'intervention</th>
                                    <th>Commentaire manager</th>
                                    <th>Manager</th>
                                    <th>Date de vérification</th>
                                    <th>Créé le</th>
                                    <th>Pièce jointe</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>

                            <tbody>
                                {filteredInterventions.map((item) => (
                                    <tr
                                        key={item.id}
                                        className={`ligne ${normalizeStatut(item.statut)}`}
                                    >

                                        {/* STATUT */}
                                        <td className={`statut ${normalizeStatut(item.statut)}`}>
                                            Non Résolues
                                        </td>

                                        {/* DEMANDEUR */}
                                        <td>
                                            {users.find(u => Number(u.id) === Number(item.demandeur_id))?.username || "-"}
                                        </td>

                                        <td>{item.titre}</td>

                                        <td>{item.type_intervention || "-"}</td>

                                        <td>{item.type_intervention_autre || "-"}</td>

                                        <td>{item.description_de_la_panne}</td>

                                         {/*MATERIEL*/}
                                        <td>
                                        {item.materiels?.map((m) => (
                                            <div key={m.id}>
                                            -{m.marque_ou_modele} (x{m.quantite})
                                            </div>
                                        ))}
                                        </td>

                                        <td>{item.source_demande || "-"}</td>

                                        <td>{item.urgence || "-"}</td>

                                        <td>{item.impact || "-"}</td>

                                        <td>{item.priorite || "-"}</td>

                                        <td>{item.date_debut || "-"}</td>

                                        <td>{item.echeance || "-"}</td>

                                        <td>{item.date_fin || "-"}</td>

                                        <td>
                                            {item.lieu}
                                        </td>

                                        <td>
                                            {users.find(u => Number(u.id) === Number(item.technicien_id))?.username || "-"}
                                        </td>

                                        <td>{item.actions_realisees || "-"}</td>

                                        <td>{item.resultat_intervention || "-"}</td>

                                        {/* COMMENTAIRE MANAGER (IMPORTANT) */}
                                        <td>
                                            <textarea
                                                className="commentaire-manager"
                                                value={item.commentaire || ""}
                                                disabled
                                                readOnly
                                            />
                                        </td>

                                        <td>
                                            {users.find(u => Number(u.id) === Number(item.manager_id))?.username || "-"}
                                        </td>

                                        <td>{item.date_verification || "-"}</td>

                                        <td>
                                            {item.created_at
                                                ? new Date(item.created_at).toLocaleString("fr-FR")
                                                : "-"}
                                        </td>

                                        <td>
                                            {(() => {
                                                const attachment = getAttachment(item);
                                                return attachment && isImageSourceValid(attachment) ? (
                                                    <button
                                                        type="button"
                                                        className="attachment-open-btn"
                                                        onClick={() => setSelectedImage(attachment)}
                                                    >
                                                        Ouvrir
                                                    </button>
                                                ) : (
                                                    <span className="attachment-empty">-</span>
                                                );
                                            })()}
                                        </td>

                                        <td>
                                            <div className="actions-buttons">
                                                <button
                                                    className="btn-imprimer"
                                                    onClick={() => imprimerIntervention(item.titre, item.type_intervention)}
                                                >
                                                    Imprimer
                                                </button>

                                                {canRenew && (
                                                    <button
                                                        className="btn-renouveler"
                                                        onClick={() => startRenew(item)}
                                                    >
                                                        Renouveler
                                                    </button>
                                                )}

                                                {isAdmin && (
                                                    <button
                                                        className="btn-supprimer"
                                                        onClick={() => deleteIntervention(item.id)}
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

            {selectedImage && isImageSourceValid(selectedImage) && (
                <div className="attachment-modal-backdrop" onClick={() => setSelectedImage(null)}>
                    <div className="attachment-modal" onClick={(e) => e.stopPropagation()}>
                        <button
                            type="button"
                            className="attachment-modal-close"
                            onClick={() => setSelectedImage(null)}
                        >
                            ×
                        </button>
                        <img
                            src={selectedImage}
                            alt="Pièce jointe d'intervention"
                            onError={(e) => {
                                e.currentTarget.style.display = "none";
                                setSelectedImage(null);
                            }}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}
