import { useState } from "react";

export default function MaterialForm({ onChange }) {
  const [materiel, setMateriel] = useState({
    Type_de_materiel: "",
    Marque_ou_Modele: "",
    Numero_de_serie: "",
    Nom_utilisateur: ""
  });

  const handleChange = (field, value) => {
    const updated = {
      ...materiel,
      [field]: value
    };

    setMateriel(updated);

    if (onChange) {
      onChange(updated);
    }
  };

  return (
    <div className="material-form">
      <h3>Matériel ou équipement concerné</h3>

      <div className="form-group">
        <label>Type de matériel</label>

        <input
          type="text"
          placeholder="Ex : Ordinateur portable"
          value={materiel.Type_de_materiel}
          onChange={(e) =>
            handleChange("Type_de_materiel", e.target.value)
          }
        />
      </div>

      <div className="form-group">
        <label>Marque ou modèle</label>

        <input
          type="text"
          placeholder="Ex : Dell Latitude 5520"
          value={materiel.Marque_ou_Modele}
          onChange={(e) =>
            handleChange("Marque_ou_Modele", e.target.value)
          }
        />
      </div>

      <div className="form-group">
        <label>Numéro de série</label>

        <input
          type="text"
          placeholder="Ex : SN-4587-AB"
          value={materiel.Numero_de_serie}
          onChange={(e) =>
            handleChange("Numero_de_serie", e.target.value)
          }
        />
      </div>

      <div className="form-group">
        <label>Nom utilisateur</label>

        <input
          type="text"
          placeholder="Nom de l'utilisateur concerné"
          value={materiel.Nom_utilisateur}
          onChange={(e) =>
            handleChange("Nom_utilisateur", e.target.value)
          }
        />
      </div>
    </div>
  );
}