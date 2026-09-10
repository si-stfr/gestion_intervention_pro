import { useEffect, useState } from "react";
import api from "../api/api";
import ActionSelector from "./ActionSelector";
import DateConflictAlert from "./DateConflictAlert";

export default function InterventionForm({
  editData = null,
  onSuccess,
  currentUser,
}) {
  const [techniciens, setTechniciens] = useState([]);
  const [conflict, setConflict] = useState(null);

  const [form, setForm] = useState({
    titre: "",
    description_de_la_panne: "",

    source_demande: "Direct",

    urgence: "Moyenne",
    impact: "Moyen",
    priorite: "Moyenne",

    type_intervention: "Maintenance",
    type_intervention_autre: "",

    date_debut: "",
    echeance: "",
    date_fin: "",

    latitude: "",
    longitude: "",

    technicien_id: "",

    diagnostique_effectue: "",
    actions_realisees: [],
    autre_action: "",

    resultat_intervention: "",
    commentaire: "",

    statut: "Signalé",
  });

  useEffect(() => {
    loadTechniciens();
  }, []);

  useEffect(() => {
    if (editData) {
      setForm({
        ...form,
        ...editData,
      });
    }
  }, [editData]);

  const loadTechniciens = async () => {
    try {
      const res = await api.get("/techniciens/disponibles");
      setTechniciens(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const checkConflict = async () => {
    if (
      !form.technicien_id ||
      !form.date_debut ||
      !form.date_fin
    ) {
      return;
    }

    try {
      const res = await api.post("/techniciens/check-planning", {
        technicien_id: form.technicien_id,
        date_debut: form.date_debut,
        date_fin: form.date_fin,
        intervention_id: editData?.id || null,
      });

      setConflict(res.data.conflict);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    checkConflict();
  }, [
    form.technicien_id,
    form.date_debut,
    form.date_fin,
  ]);

  const handleChange = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const canEditTechnicalFields =
    currentUser?.profil === "TECHNICIEN" &&
    form.statut === "En cours";

  const submit = async (e) => {
    e.preventDefault();

    if (conflict) {
      alert("Le technicien est déjà occupé.");
      return;
    }

    try {
      if (editData) {
        await api.put(`/interventions/${editData.id}`, form);
      } else {
        await api.post("/interventions", form);
      }

      if (onSuccess) {
        onSuccess();
      }

      alert("Intervention enregistrée.");
    } catch (err) {
      console.error(err);

      alert(
        err?.response?.data?.detail ||
          "Erreur lors de l'enregistrement"
      );
    }
  };

  return (
    <form className="intervention-form" onSubmit={submit}>
      <h2>
        {editData
          ? "Modifier intervention"
          : "Nouvelle intervention"}
      </h2>

      <div className="grid-form">

        <div className="form-group">
          <label>Titre</label>

          <input
            type="text"
            value={form.titre}
            onChange={(e) =>
              handleChange("titre", e.target.value)
            }
            required
          />
        </div>

        <div className="form-group full">
          <label>Description de la panne</label>

          <textarea
            rows="4"
            value={form.description_de_la_panne}
            onChange={(e) =>
              handleChange(
                "description_de_la_panne",
                e.target.value
              )
            }
            required
          />
        </div>

        <div className="form-group">
          <label>Source de la demande</label>

          <select
            value={form.source_demande}
            onChange={(e) =>
              handleChange(
                "source_demande",
                e.target.value
              )
            }
          >
            <option>Direct</option>
            <option>E-mail</option>
            <option>Formcreator</option>
            <option>Helpdesk</option>
            <option>Other</option>
            <option>Phone</option>
            <option>Written</option>
          </select>
        </div>

        <div className="form-group">
          <label>Urgence</label>

          <select
            value={form.urgence}
            onChange={(e) =>
              handleChange("urgence", e.target.value)
            }
          >
            <option>Très haute</option>
            <option>Haute</option>
            <option>Basse</option>
            <option>Très basse</option>
          </select>
        </div>

        <div className="form-group">
          <label>Impact</label>

          <select
            value={form.impact}
            onChange={(e) =>
              handleChange("impact", e.target.value)
            }
          >
            <option>Très haut</option>
            <option>Haut</option>
            <option>Moyen</option>
            <option>Bas</option>
            <option>Très bas</option>
          </select>
        </div>

        <div className="form-group">
          <label>Priorité</label>

          <select
            value={form.priorite}
            onChange={(e) =>
              handleChange("priorite", e.target.value)
            }
          >
            <option>Majeure</option>
            <option>Très haute</option>
            <option>Moyenne</option>
            <option>Basse</option>
            <option>Très basse</option>
          </select>
        </div>

        <div className="form-group">
          <label>Type intervention</label>

          <select
            value={form.type_intervention}
            onChange={(e) =>
              handleChange(
                "type_intervention",
                e.target.value
              )
            }
          >
            <option>Maintenance</option>
            <option>Dépannage</option>
            <option>Installation</option>
            <option>Mise à jour</option>
            <option>Réseau</option>
            <option>Sauvegarde</option>
            <option>Autre</option>
          </select>
        </div>

        {form.type_intervention === "Autre" && (
          <div className="form-group">
            <label>Préciser le type</label>

            <input
              type="text"
              value={form.autre_type_intervention}
              onChange={(e) =>
                handleChange(
                  "autre_type_intervention",
                  e.target.value
                )
              }
            />
          </div>
        )}

        <div className="form-group">
          <label>Date début</label>

          <input
            type="date"
            value={form.date_debut}
            onChange={(e) =>
              handleChange(
                "date_debut",
                e.target.value
              )
            }
            required
          />
        </div>

        <div className="form-group">
          <label>Date échéance</label>

          <input
            type="date"
            value={form.echeance}
            onChange={(e) =>
              handleChange("echeance", e.target.value)
            }
            required
          />
        </div>

        <div className="form-group">
          <label>Date fin</label>

          <input
            type="date"
            value={form.date_fin}
            onChange={(e) =>
              handleChange(
                "date_fin",
                e.target.value
              )
            }
            required
          />
        </div>

        <div className="form-group">
          <label>Latitude</label>

          <input
            type="number"
            step="any"
            value={form.latitude}
            onChange={(e) =>
              handleChange("latitude", e.target.value)
            }
          />
        </div>

        <div className="form-group">
          <label>Longitude</label>

          <input
            type="number"
            step="any"
            value={form.longitude}
            onChange={(e) =>
              handleChange("longitude", e.target.value)
            }
          />
        </div>

        <div className="form-group">
          <label>Technicien disponible</label>

          <select
            value={form.technicien_id}
            onChange={(e) =>
              handleChange(
                "technicien_id",
                e.target.value
              )
            }
            required
          >
            <option value="">
              -- Choisir un technicien --
            </option>

            {techniciens.map((tech) => (
              <option key={tech.id} value={tech.id}>
                {tech.nom}
              </option>
            ))}
          </select>
        </div>

      </div>

      <DateConflictAlert conflict={conflict} />

      <hr />

      <h3>Partie Technicien</h3>

      <div className="grid-form">

        <div className="form-group full">
          <label>Diagnostique effectué</label>

          <textarea
            rows="3"
            disabled={!canEditTechnicalFields}
            value={form.diagnostique_effectue}
            onChange={(e) =>
              handleChange(
                "diagnostique_effectue",
                e.target.value
              )
            }
          />
        </div>

        <div className="form-group full">
          <label>Actions réalisées</label>

          <ActionSelector
            disabled={!canEditTechnicalFields}
            values={form.actions_realisees}
            setValues={(values) =>
              handleChange(
                "actions_realisees",
                values
              )
            }
          />
        </div>

        {form.actions_realisees.includes("Autre") && (
          <div className="form-group full">
            <label>Autre action</label>

            <textarea
              rows="2"
              disabled={!canEditTechnicalFields}
              value={form.autre_action}
              onChange={(e) =>
                handleChange(
                  "autre_action",
                  e.target.value
                )
              }
            />
          </div>
        )}

        <div className="form-group">
          <label>Résultat intervention</label>

          <select
            disabled={!canEditTechnicalFields}
            value={form.resultat_intervention}
            onChange={(e) =>
              handleChange(
                "resultat_intervention",
                e.target.value
              )
            }
          >
            <option value="">
              -- Choisir --
            </option>

            <option>Probleme_resolu</option>

            <option>Resolu_partiellement</option>

            <option>
              Nouvelle_intervention_necessaire
            </option>
          </select>
        </div>

        <div className="form-group">
          <label>Statut final</label>

          <select
            disabled={!canEditTechnicalFields}
            value={form.statut}
            onChange={(e) =>
              handleChange("statut", e.target.value)
            }
          >
            <option>Signalé</option>
            <option>En cours</option>
            <option>En retard</option>
            <option>Abouti</option>
            <option>Impossible</option>
          </select>
        </div>

        <div className="form-group full">
          <label>Commentaire</label>

          <textarea
            rows="4"
            disabled={!canEditTechnicalFields}
            value={form.commentaire}
            onChange={(e) =>
              handleChange("commentaire", e.target.value)
            }
          />
        </div>

      </div>

      <button type="submit" className="btn-primary">
        {editData ? "Modifier" : "Créer"}
      </button>
    </form>
  );
}