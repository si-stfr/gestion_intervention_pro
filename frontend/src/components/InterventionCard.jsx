import "../assets/CSS_JS/InterventionCard.css";
import "../assets/CSS_JS/global.css";

export default function InterventionCard({
  intervention,
  role,
  onEdit,
  onDelete,
  onComplete
}) {

  const getStatusClass = (status) => {
    switch (status) {
      case "Signalé":
        return "card-signale";
      case "En cours":
        return "card-encours";
      case "Abouti":
        return "card-abouti";
      case "En retard":
        return "card-retard";
      case "Impossible pour l'instant":
        return "card-impossible";
      default:
        return "";
    }
  };

  const formatDate = (date) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString("fr-FR");
  };

  return (
    <div className={`intervention-card ${getStatusClass(intervention.Statut)}`}>

      <div className="card-header">

        <div>
          <h2>{intervention.titre}</h2>

          <span className="status-badge">
            {intervention.statut}
          </span>
        </div>

        <div className="priority-block">
          <span className="priority-label">Priorité</span>
          <span className="priority-value">
            {intervention.priorite}
          </span>
        </div>

      </div>

      <div className="card-body">

        <div className="card-section">
          <h3>Description de la panne</h3>
          <p>{intervention.description_de_la_panne}</p>
        </div>

        <div className="card-grid">

          <div className="card-item">
            <span className="label">Demandeur</span>
            <span className="value">{intervention.demandeur?.username || "-"}</span>
          </div>

          <div className="card-item">
            <span className="label">Technicien</span>
            <span className="value">{intervention.technicien?.username || "-"}</span>
          </div>

          <div className="card-item">
            <span className="label">Date début</span>
            <span className="value">{formatDate(intervention.date_debut)}</span>
          </div>

          <div className="card-item">
            <span className="label">Date fin</span>
            <span className="value">{formatDate(intervention.date_fin)}</span>
          </div>

        </div>

      </div>

      <div className="card-footer">

        {(role === "ADMIN" || role === "TECHNICIEN") && (
          <button className="edit-btn" onClick={() => onEdit(intervention)}>
            Modifier
          </button>
        )}

        {role === "ADMIN" && (
          <button className="delete-btn" onClick={() => onDelete(intervention.ID)}>
            Supprimer
          </button>
        )}

        {role === "TECHNICIEN" && intervention.Statut === "En cours" && (
          <button className="complete-btn" onClick={() => onComplete(intervention)}>
            Finaliser
          </button>
        )}

      </div>

    </div>
  );
}