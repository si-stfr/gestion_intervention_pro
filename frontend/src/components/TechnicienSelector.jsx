import { useEffect, useState } from "react";

import api from "../api/api";

export default function TechnicienSelector({
  value,
  onChange,
  dateDebut,
  dateFin,
  interventionId = null,
  disabled = false
}) {

  const [techniciens, setTechniciens] = useState([]);

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");


  /*
  =========================================================
  LOAD AVAILABLE TECHNICIANS
  =========================================================
  */

  const loadTechniciens = async () => {

    if (!dateDebut || !dateFin) {

      setTechniciens([]);

      return;
    }

    try {

      setLoading(true);

      setError("");

      const res = await api.post(
        "/techniciens/disponibles",
        {
          date_debut: dateDebut,
          date_fin: dateFin,
          intervention_id: interventionId
        }
      );

      setTechniciens(res.data);

    } catch (err) {

      console.error(err);

      setError(
        "Impossible de charger les techniciens disponibles."
      );

    } finally {

      setLoading(false);
    }
  };


  /*
  =========================================================
  AUTO LOAD
  =========================================================
  */

  useEffect(() => {

    loadTechniciens();

  }, [dateDebut, dateFin]);


  return (

    <div className="form-group">

      <label>
        Technicien disponible
      </label>

      {
        !dateDebut || !dateFin ? (
          <div className="info-message">
            Veuillez sélectionner les dates de début
            et de fin avant de choisir un technicien.
          </div>
        ) : (
          <>
            <select
              value={value || ""}
              disabled={disabled || loading}
              onChange={(e) =>
                onChange(e.target.value)
              }
            >

              <option value="">
                -- Sélectionner un technicien --
              </option>

              {
                techniciens.map((tech) => (

                  <option
                    key={tech.id}
                    value={tech.id}
                  >
                    {tech.nom} ({tech.email})
                  </option>

                ))
              }

            </select>

            {
              loading && (
                <div className="loading-message">
                  Chargement des techniciens...
                </div>
              )
            }

            {
              !loading &&
              techniciens.length === 0 && (
                <div className="warning-message">
                  Aucun technicien disponible
                  sur cette période.
                </div>
              )
            }

            {
              error && (
                <div className="error-message">
                  {error}
                </div>
              )
            }
          </>
        )
      }

    </div>
  );
}