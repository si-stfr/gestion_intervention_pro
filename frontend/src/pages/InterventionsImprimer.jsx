import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import api from "../api/api";
import "../assets/CSS_JS/InterventionsImprimer.css";

export default function InterventionsImprimer() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    
    const [interventions, setInterventions] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedImage, setSelectedImage] = useState(null);

    const titre = searchParams.get("titre");
    const typeIntervention = searchParams.get("typeIntervention");

    // ============================
    // FETCH INTERVENTIONS
    // ============================
    const fetchInterventions = async () => {
        try {
            setLoading(true);
            const res = await api.get("/intervention/");

            // Normaliser les données
            const normalized = (res.data ?? []).map(i => ({
                ...i,
                statut: typeof i.statut === "object" ? i.statut.value : i.statut
            }));

            // Filtrer par statut IMPOSSIBLE et par titre et type_intervention
            const filtered = normalized.filter(
                item => 
                    item.statut === "IMPOSSIBLE" &&
                    item.titre === titre &&
                    item.type_intervention === typeIntervention
            );

            // Trier par Date_de_la_demande
            filtered.sort((a, b) => new Date(a.Date_de_la_demande) - new Date(b.Date_de_la_demande));

            setInterventions(filtered);
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
        if (!titre || !typeIntervention) {
            navigate("/interventions/abouti");
            return;
        }
        fetchInterventions();
        fetchUsers();
    }, [titre, typeIntervention]);

    if (loading) {
        return <div className="loading">Chargement...</div>;
    }

    if (interventions.length === 0) {
        return (
            <div className="no-data">
                <p>Aucune intervention trouvée</p>
                <button onClick={() => navigate("/interventions/abouti")}>
                    Retour
                </button>
            </div>
        );
    }

    // ============================
    // CALCUL DES ANNÉES
    // ============================
    const getYears = () => {
        const dates = interventions.map(i => new Date(i.Date_de_la_demande));
        const years = dates.map(d => d.getFullYear());
        return {
            start: Math.min(...years),
            end: Math.max(...years)
        };
    };

    const years = getYears();

    // ============================
    // RÉCUPÉRER LES DEMANDEURS UNIQUES
    // ============================
    const getUniqueDemandeurs = () => {
        const demandeurIds = [...new Set(interventions.map(i => i.demandeur_id))];
        return demandeurIds
            .map(id => users.find(u => Number(u.id) === Number(id))?.username || "-")
            .filter(name => name !== "-");
    };

    const uniqueDemandeurs = getUniqueDemandeurs();

    // ============================
    // RÉCUPÉRER LES MANAGERS UNIQUES
    // ============================
    const getUniqueManagers = () => {
        const managerIds = [...new Set(interventions.map(i => i.manager_id).filter(id => id))];
        return managerIds
            .map(id => users.find(u => Number(u.id) === Number(id)))
            .filter(u => u);
    };

    const uniqueManagers = getUniqueManagers();

    // ============================
    // GÉNÉRER ACRONYME
    // ============================
    const generateAcronym = (titreStr, typeStr) => {
        // Prendre première lettre de chaque mot du titre
        const titreAcronym = titreStr
            .split(" ")
            .map(word => word.charAt(0).toUpperCase())
            .join("");
        
        // Prendre première lettre du type d'intervention
        const typeAcronym = typeStr.charAt(0).toUpperCase();
        
        return titreAcronym + typeAcronym;
    };

    const acronym = generateAcronym(titre, typeIntervention);
    const getAttachment = (item) => {
        const value = item?.piece_jointe ?? item?.pieceJointe ?? item?.image ?? null;

        if (typeof value === "string") {
            const cleaned = value.trim();
            return cleaned ? cleaned : null;
        }

        return value ?? null;
    };

    // ============================
    // RENDU
    // ============================
    return (
        <div className="imprimer-page">
            
            {/* HEADER PRINCIPAL */}
            <div className="header-principal">
                <div className="titre-1">
                    DIRECTION DES SERVICES TECHNIQUES
                </div>
                <div className="titre-2">
                    FICHE D'INTERVENTIONS DST N° {years.start}-{years.end} / {acronym}
                </div>
            </div>

            {/* INFO INTERVENTION */}
            <div className="info-intervention">
                <div className="info-titre">
                    <div className="mission-title">{titre} / {typeIntervention}</div>
                    <div className="demandeurs-list">
                        {uniqueDemandeurs.join(" - ")}
                    </div>
                </div>
            </div>

            {/* TABLEAU INTERVENTIONS */}
            <div className="tableau-wrapper">
                <table className="tableau-interventions">
                    <thead>
                        <tr>
                            <th>Dates de la demande</th>
                            <th>Demandes</th>
                            <th>Lieux</th>
                            <th>Date limite de réalisation</th>
                            <th>Date de réalisation</th>
                            <th>Tâches réalisées</th>
                            <th>Observations</th>
                            <th>Pièce jointe</th>
                        </tr>
                    </thead>
                    <tbody>
                        {interventions.map((item) => (
                            <tr key={item.id}>
                                <td>{item.Date_de_la_demande ? new Date(item.Date_de_la_demande).toLocaleDateString("fr-FR") : "-"}</td>
                                <td>{item.description_de_la_panne || "-"}</td>
                                <td>{item.lieu || "-"}</td>
                                <td>{item.date_fin ? new Date(item.date_fin).toLocaleDateString("fr-FR") : "-"}</td>
                                <td>{item.date_verification ? new Date(item.date_verification).toLocaleDateString("fr-FR") : "-"}</td>
                                <td>{item.actions_realisees || "-"}</td>
                                <td>{item.commentaire || "-"}</td>
                                <td>
                                    {(() => {
                                        const attachment = getAttachment(item);
                                        return attachment ? (
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
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* SECTION SIGNATURES */}
            <div className="signatures-section">
                <div className="signature-line">
                    <div className="signature-box">
                        <p className="signature-label">Remis le :</p>
                        <p className="signature-value">................................</p>
                    </div>
                    <div className="signature-box">
                        <p className="signature-label">NOM :</p>
                        <p className="signature-value">................................</p>
                    </div>
                    <div className="signature-box">
                        <p className="signature-label">Signature :</p>
                        <p className="signature-value">................................</p>
                    </div>
                </div>

                <div className="managers-section">
                    <div className="manager-signatures">
                        {uniqueManagers.map((manager, index) => (
                            <div key={manager.id} className="manager-box">
                                <p className="manager-name">{manager.username}</p>
                                <p className="manager-role">Manager - DST</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* BOUTON IMPRESSION */}
            <div className="print-actions">
                <button 
                    className="btn-print"
                    onClick={() => window.print()}
                >
                    Imprimer
                </button>
                <button 
                    className="btn-retour"
                    onClick={() => navigate("/interventions/abouti")}
                >
                    Retour
                </button>
            </div>

            {selectedImage && (
                <div className="attachment-modal-backdrop" onClick={() => setSelectedImage(null)}>
                    <div className="attachment-modal" onClick={(e) => e.stopPropagation()}>
                        <button
                            type="button"
                            className="attachment-modal-close"
                            onClick={() => setSelectedImage(null)}
                        >
                            ×
                        </button>
                        <img src={selectedImage} alt="Pièce jointe d'intervention" />
                    </div>
                </div>
            )}
        </div>
    );
}
