import { useState } from "react";
import { SERVICES_LIST, getSitesForServices } from "../data/servicesCommune";

export default function ServicesCommuneSelector({ value = [], onChange }) {
  const [open, setOpen] = useState(false);

  const sites = getSitesForServices(value);

  const toggleService = (service) => {
    const next = value.includes(service)
      ? value.filter((s) => s !== service)
      : [...value, service];

    onChange(next, getSitesForServices(next));
  };

  return (
    <div className="services-commune-selector">
      <button
        type="button"
        className="mat-select-toggle"
        onClick={() => setOpen((v) => !v)}
      >
        {open ? "▲" : "▼"} Services de la commune disponibles
        {value.length > 0 ? ` (${value.length})` : ""}
      </button>

      {value.length > 0 && (
        <div className="materiels-selectionnes">
          {value.map((service) => (
            <div key={service} className="service-chip">
              <div>{service}</div>
              <button
                type="button"
                className="btn-desel"
                onClick={() => toggleService(service)}
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

      {open && (
        <div className="materiels-search-results">
          {SERVICES_LIST.map((service) => (
            <div
              key={service}
              className="service-result"
              onClick={() => toggleService(service)}
            >
              {value.includes(service) ? "☑ " : "☐ "}
              {service}
            </div>
          ))}
        </div>
      )}

      {value.length > 0 && (
        <p className="sites-concernes-info">
          Site(s) concerné(s) par le(s) service(s) demander : {sites.join(", ")}
        </p>
      )}
    </div>
  );
}
