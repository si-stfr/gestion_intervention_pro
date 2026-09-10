import "../assets/CSS_JS/StatusBadge.css";
import "../assets/CSS_JS/global.css";

export default function StatusBadge({ status }) {

  /*
  =========================================================
  STATUS CLASS
  =========================================================
  */

  const getStatusClass = () => {

    switch (status) {

      case "Signalé":
        return "badge-signale";

      case "En cours":
        return "badge-encours";

      case "Abouti":
        return "badge-abouti";

      case "En retard":
        return "badge-retard";

      case "Impossible pour l'instant":
        return "badge-impossible";

      default:
        return "badge-default";
    }
  };


  /*
  =========================================================
  STATUS ICON
  =========================================================
  */

  const getStatusIcon = () => {

    switch (status) {

      case "Signalé":
        return "❗";

      case "En cours":
        return "⏳";

      case "Abouti":
        return "✅";

      case "En retard":
        return "⚠️";

      case "Impossible":
        return "❌";

      default:
        return "⚪";
    }
  };


  return (

    <span className={`status-badge ${getStatusClass()}`}>

      <span className="status-icon">
        {getStatusIcon()}
      </span>

      <span className="status-text">
        {status}
      </span>

    </span>
  );
}