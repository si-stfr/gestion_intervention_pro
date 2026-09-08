import { useEffect, useState } from "react";
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

export default function ManagerDashboard() {

    const [interventions, setInterventions] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [commentaires, setCommentaires] = useState({});

    const user = JSON.parse(localStorage.getItem("user"));

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
    // FILTER MANAGER
    // ============================
    const filteredInterventions = interventions.filter((item) =>
        Number(item.manager_id) === Number(user.id) &&
        item.statut === "EN_ATTENTE_VALIDATION"
    );

    // ============================
    // VALIDATION
    // ============================
    const validateIntervention = async (id, statut) => {
        const confirmSubmit = window.confirm(
            `Mettre l'intervention en ${statut}?`
        );

        if (!confirmSubmit) return;
        try {
            await api.put(`/intervention/${id}/validate`, {
                statut,
                commentaire: commentaires[id] || ""
            });

            fetchInterventions();

        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="layout interventions-page">

            <Sidebar />

            <div className="page-content">

                <h1 className="titre-principal">
                    Validation des interventions
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
                                    <th>Date de début</th>
                                    <th>Date d'échéance</th>
                                    <th>Date de fin</th>
                                    <th>Lieu</th>
                                    <th>Technicien</th>
                                    <th>Actions réalisées</th>
                                    <th>Résultat d'intervention</th>
                                    <th>Commentaire</th>
                                    <th>Manager</th>
                                    <th>Date de vérification</th>
                                    <th>Créé le</th>
                                    <th>Statut Final</th>
                                </tr>
                            </thead>

                            <tbody>
                                {filteredInterventions.map((item) => (
                                    <tr
                                        key={item.id}
                                        className={`ligne ${normalizeStatut(item.statut)}`}
                                    >

                                        {/* 1 STATUT */}
                                        <td className={`statut ${normalizeStatut(item.statut)}`}>
                                            {item.statut}
                                        </td>

                                        {/* 2 DEMANDEUR */}
                                        <td>
                                            {users.find(u => Number(u.id) === Number(item.demandeur_id))?.username || "-"}
                                        </td>

                                        {/* 3 TITRE */}
                                        <td>{item.titre}</td>

                                        {/* 9 TYPE INTERVENTION */}
                                        <td>{item.type_intervention}</td>

                                        {/* 10 AUTRE TYPE */}
                                        <td>{item.type_intervention_autre}</td>

                                        {/* 4 DESCRIPTION */}
                                        <td>{item.description_de_la_panne}</td>

                                        {/*MATERIEL*/}
                                        <td>
                                        {item.materiels?.map((m) => (
                                            <div key={m.id}>
                                            -{m.marque_ou_modele}
                                            </div>
                                        ))}
                                        </td>

                                        {/* 5 SOURCE */}
                                        <td>{item.source_demande || "-"}</td>

                                        {/* 6 URGENCE */}
                                        <td>{item.urgence}</td>

                                        {/* 7 IMPACT */}
                                        <td>{item.impact}</td>

                                        {/* 8 PRIORITÉ */}
                                        <td>{item.priorite}</td>

                                        {/* 11 DATE DÉBUT */}
                                        <td>{item.date_debut}</td>

                                        {/* 12 ÉCHÉANCE */}
                                        <td>{item.echeance}</td>

                                        {/* 13 DATE FIN */}
                                        <td>{item.date_fin}</td>

                                        {/* 14 GEO */}
                                        <td>
                                            {item.lieu}
                                        </td>

                                        {/* 15 TECHNICIEN */}
                                        <td>
                                            {users.find(u => Number(u.id) === Number(item.technicien_id))?.username || "-"}
                                        </td>

                                        {/* 16 DIAGNOSTIC */}
                                        <td>{item.diagnostique_effectue || "-"}</td> 

                                        {/* 17 ACTIONS */}
                                        <td>{item.actions_realisees || "-"}</td>

                                        {/* 18 AUTRES ACTIONS */}
                                        <td>{item.actions_autre || "-"}</td>

                                        {/* 19 RÉSULTAT */}
                                        <td>{item.resultat_intervention || "-"}</td>

                                        {/* 20 COMMENTAIRE */}
                                        <td>
                                            <textarea
                                                className="commentaire-manager"
                                                value={commentaires[item.id] || ""}
                                                onChange={(e) =>
                                                    setCommentaires(prev => ({
                                                        ...prev,
                                                        [item.id]: e.target.value
                                                    }))
                                                }
                                            />
                                        </td>

                                        {/* 21 MANAGER */}
                                        <td>
                                            {users.find(u => Number(u.id) === Number(item.manager_id))?.username || "-"}
                                        </td>

                                        {/* 22 DATE VÉRIFICATION */}
                                        <td>{item.date_verification || "-"}</td>

                                        {/* 23 CRÉÉ LE */}
                                        <td>
                                            {item.created_at
                                                ? new Date(item.created_at).toLocaleString("fr-FR")
                                                : "-"}
                                        </td>

                                        {/* 24 ACTIONS */}
                                        <td>
                                            <div className="actions-buttons">

                                                <button
                                                    className="btn-abouti"
                                                    onClick={() => validateIntervention(item.id, "ABOUTI")}
                                                >
                                                    Abouti
                                                </button>

                                                <button
                                                    className="btn-impossible"
                                                    onClick={() => validateIntervention(item.id, "IMPOSSIBLE")}
                                                >
                                                    Impossible
                                                </button>

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