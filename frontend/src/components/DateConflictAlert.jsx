import "../assets/CSS_JS/DateConflictAlert.css";
import "../assets/CSS_JS/global.css";

export default function DateConflictAlert({ conflicts = [] }) {
  if (!conflicts.length) return null;

  return (
    <div className="conflict-alert">

      <h3>⚠ Conflit de planning détecté</h3>

      <p>
        Le technicien sélectionné possède déjà une ou plusieurs interventions sur cette période.
      </p>

      <div className="conflict-list">

        {conflicts.map((conflict, index) => (
          <div className="conflict-card" key={index}>

            <div className="conflict-title">
              {conflict.titre}
            </div>

            <div className="conflict-content">

              <p><strong>Technicien :</strong> {conflict.technicien_nom}</p>

              <p>
                <strong>Date début :</strong>{" "}
                {new Date(conflict.date_debut).toLocaleDateString()}
              </p>

              <p>
                <strong>Date fin :</strong>{" "}
                {new Date(conflict.date_fin).toLocaleDateString()}
              </p>

              <p><strong>Statut :</strong> {conflict.statut}</p>

            </div>

          </div>
        ))}

      </div>

    </div>
  );
}