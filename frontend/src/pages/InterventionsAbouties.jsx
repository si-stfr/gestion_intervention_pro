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
        case "RESOLU":
            return "resolu";
        default:
            return "";
    }
};

export default function InterventionsAbouties() {

    const navigate = useNavigate();
    const [interventions, setInterventions] = useState([]);
    const [users, setUsers] = useState([]);
    const [commentaires, setCommentaires] = useState({});

    const [loading, setLoading] = useState(true);

    const user = JSON.parse(localStorage.getItem("user"));

    // ============================
    // FETCH INTERVENTIONS
    // ============================
    const fetchInterventions = async () => {
        try {
            setLoading(true);

            const res = await api.get("/intervention/");

            // normalisation (IMPORTANT comme TechnicienDashboard)
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

    // ============================
    // FILTRE STRICT ABOUTI
    // ============================
    const filteredInterventions = interventions.filter(
        (item) => item.statut === "ABOUTI"
    );

    return (
        <div className="layout interventions-page">

            <Sidebar />

            <div className="page-content">

                <h1 className="titre-principal">
                    Interventions Terminées
                </h1>

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
                                            Terminée
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
                                            <button
                                                className="btn-imprimer"
                                                onClick={() => imprimerIntervention(item.titre, item.type_intervention)}
                                            >
                                                Imprimer
                                            </button>
                                            {user?.profil === "ADMIN" && (
                                                <button
                                                    className="btn-supprimer"
                                                    onClick={() => deleteIntervention(item.id)}
                                                >
                                                    Supprimer
                                                </button>
                                            )}
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