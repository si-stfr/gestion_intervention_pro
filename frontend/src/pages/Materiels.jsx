import MaterialForm from "../components/MaterialForm";
import Sidebar from "../components/Sidebar";
import api from "../api/api";

import { useEffect, useState } from "react";

import "../assets/CSS_JS/Interventions.css";
import "../assets/CSS_JS/global.css";
import "../assets/CSS_JS/AdminDashboard.css";


export default function MaterielsPage() {

      const [loading, setLoading] = useState(true);
      const [filterType, setFilterType] = useState("");
      const [filterStatut, setFilterStatut] = useState("");
      const [materiels, setMateriels] = useState([]);
      const [users, setUsers] = useState([]);
      const [editingMateriel, setEditingMateriel] = useState(null);
      const user = JSON.parse(localStorage.getItem("user"));
      const isAdmin = user?.profil === "ADMIN";

      const typesMateriel = [
        "Matériel informatique",
        "Mobilier",
        "Matériel de travaux",
        "Matériel routier",
        "Matériel évenementiel",
        "Equipement public",
        "Autres"
      ];

      const statut = [
        "En état",
        "En réparation",
        "Défectueux"
      ];

      const [formMateriel, setFormMateriel] = useState({
        type_de_materiel: "Equipement public",
        marque_ou_modele: "",
        numero_de_serie: "",
        utilisateur_concerne_id: "",
        lieu_stockage: "",
        autre_type: "",
        statut: "En état",
        quantite: 1,
      });

      const resetForm = () => {
        setFormMateriel({
          type_de_materiel: "Equipement public",
          marque_ou_modele: "",
          numero_de_serie: "",
          utilisateur_concerne_id: "",
          lieu_stockage: "",
          autre_type: "",
          statut: "En état",
        });

        setEditingMateriel(null);
      };


      const handleSubmit = async () => {

        if (!formMateriel.marque_ou_modele.trim()) {
          alert("Veuillez renseigner la marque ou le modèle.");
          return;
        }

        try {
          const payload = {
            type_de_materiel:
              formMateriel.type_de_materiel === "Autres"
                ? formMateriel.autre_type
                : formMateriel.type_de_materiel,

            marque_ou_modele: formMateriel.marque_ou_modele,
            numero_de_serie: formMateriel.numero_de_serie,
            utilisateur_concerne_id: formMateriel.utilisateur_concerne_id,
            lieu_stockage: formMateriel.lieu_stockage,
            statut: formMateriel.statut,
            quantite: formMateriel.quantite
          };

            if (editingMateriel) {
              const res = await api.put(
                `/materiels/${editingMateriel.id}`,
                payload
              );

              setMateriels((prev) =>
                prev.map((m) =>
                  m.id === editingMateriel.id
                    ? res.data
                    : m
                )
              );

              alert("Matériel modifié");

            } else {
          

          const res = await api.post("/materiels/", payload);
          setMateriels((prev) => [...prev, res.data.data]);
          console.log("Matériel créé :", res.data);

          alert("Matériel ajouté avec succès");
            }

          resetForm();

        } catch (error) {
          console.error(error);
          alert("Erreur lors de l'ajout du matériel");
        }
      };


      const normalizeMateriel = (type) => {
        if (!type) return "";

        const t = type
          .toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, ""); // enlève accents

        if (t.includes("informatique")) return "informatique";
        if (t.includes("mobilier")) return "mobilier";
        if (t.includes("travaux")) return "travaux";
        if (t.includes("routier")) return "routier";
        if (t.includes("evenementiel")) return "evenementiel";
        if (t.includes("equipement public")) return "public";
        return "autres";
      };


      const handleEdit = (materiel) => {
        setEditingMateriel(materiel);

        setFormMateriel({
          type_de_materiel: materiel.type_de_materiel || "",
          marque_ou_modele: materiel.marque_ou_modele || "",
          numero_de_serie: materiel.numero_de_serie || "",
          utilisateur_concerne_id: materiel.utilisateur_concerne_id || "",
          lieu_stockage: materiel.lieu_stockage || "",
          autre_type: "",
          statut: materiel.statut || ""
        });

        window.scrollTo({
          top: 0,
          behavior: "smooth"
        });
      };
    

    const filteredMateriels = materiels.filter((m) => {
      const matchType = filterType
        ? m.type_de_materiel === filterType
        : true;

      const matchStatut = filterStatut
        ? m.statut === filterStatut
        : true;

      return matchType && matchStatut;
    });

    const handleChange = (field, value) => {
        setFormMateriel((prev) => ({
          ...prev,
          [field]: value
        }));
      };


      const handleDelete = async (id) => {
        const confirmation = window.confirm(
          "Supprimer ce matériel ?"
        );

        if (!confirmation) return;

        try {
          await api.delete(`/materiels/${id}`);

          setMateriels((prev) =>
            prev.filter((materiel) => materiel.id !== id)
          );

          //alert("Matériel supprimé avec succès");//
        } catch (error) {
          console.error("Erreur suppression :", error);
          alert("Erreur lors de la suppression");
        }
      };


      useEffect(() => {
        const fetchData = async () => {
          try {
            const [materielsRes, usersRes] = await Promise.all([
              api.get("/materiels/"),
              api.get("/intervention/users/public")
            ]);

            setMateriels(materielsRes.data.materiels);
            setUsers(usersRes.data);

          } catch (error) {
            console.error("Erreur chargement :", error);
          } finally {
            setLoading(false);
          }
        };

        fetchData();
      }, []);

  return (
    <div className="layout interventions-pages">
    
        <Sidebar />
        <div className="page-content">

          <h1 className="titre-principal">
          Gestion du Matériel
          </h1>

          <div className="filters-container">
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
              >
                <option value="">Tous les types</option>
                {typesMateriel.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>

              <select
                value={filterStatut}
                onChange={(e) => setFilterStatut(e.target.value)}
              >
                <option value="">Tous les statuts</option>
                {statut.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
          </div>

          <div className="admin-panel">

            <h2 className = "admin-title">
                Matériel ou équipement concerné
            </h2>
            
            <div className="admin-grid">
              <label>Type de matériel</label>

              <select
                value={formMateriel.type_de_materiel}
                onChange={(e) => {
                  const value = e.target.value;

                  setFormMateriel((prev) => ({
                    ...prev,
                    type_de_materiel: value,
                    autre_type: value === "Autres" ? prev.autre_type : ""
                  }));
                }}
              >
                <option value="Equipement public">Equipement public</option>
                <option value="Matériel informatique">Matériel informatique</option>
                <option value="Matériel de travaux">Matériel de travaux</option>
                <option value="Matériel routier">Matériel routier</option>
                <option value="Matériel évenementiel">Matériel évenementiel</option>
                <option value="Mobilier">Mobilier</option>
                <option value="Autres">Autres</option>
              </select>

              {formMateriel.type_de_materiel === "Autres" && (
                <div className="admin-grid">
                  <label>Précisez le type de matériel</label>

                  <input
                    type="text"
                    placeholder="Type de Matériel"
                    value={formMateriel.autre_type}
                    onChange={(e) =>
                      handleChange("autre_type", e.target.value)
                    }
                  />
                </div>
              )}


              <label>Nom / Marque / Modèle</label>

              <input
                type="text"
                placeholder="Nom ou marque ou modèle du matériel"
                value={formMateriel.marque_ou_modele}
                required
                onChange={(e) =>
                  handleChange("marque_ou_modele", e.target.value)
                }
              />

              <label>Numéro d'identification (facultatif)</label>

              <input
                type="text"
                placeholder="Ex : SN-4587-AB"
                value={formMateriel.numero_de_serie}
                onChange={(e) =>
                  handleChange("numero_de_serie", e.target.value)
                }
              />

              <label>Utilisateur concerné</label>

              <select
                value={formMateriel.utilisateur_concerne_id}
                onChange={(e) =>
                  handleChange("utilisateur_concerne_id", e.target.value)
                }
              >
                <option value="">Aucun utilisateur</option>

                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.username} ({u.profil})
                  </option>
                ))}
              </select>

              <label>Statut</label>

              <select
                value={formMateriel.statut}
                required
                onChange={(e) => {
                  const value = e.target.value;

                  setFormMateriel((prev) => ({
                    ...prev,
                    statut: value
                  }));
                }}
              > 
                <option value="En état">En état</option>
                <option value="En réparation">En réparation</option>
                <option value="Défectueux">Défectueux</option>
              </select>

                <label>Quantité</label>
                  <input
                    type="number"
                    min="1"
                    value={formMateriel.quantite}
                    onChange={(e) =>
                      setFormMateriel({
                        ...formMateriel,
                        quantite: parseInt(e.target.value) || 1,
                      })
                    }
                  />

              <label>Lieu de stockage (facultatif)</label>

              <input
                type="text"
                placeholder="Précisez le lieu de stockage"
                value={formMateriel.lieu_stockage}
                onChange={(e) =>
                  handleChange("lieu_stockage", e.target.value)
                }
              />

              <button
                className="admin-btn"
                onClick={handleSubmit}
              >
                {editingMateriel ? "Modifier" : "Ajouter"}
              </button>  
              </div>
              </div>
              {/* TABLE */}
              {loading ? (

                <div>Chargement...</div>
              
              ) : (
              
              <div className="table-wrapper">
              
                <table className="table-interventions">

                  <thead>
                    <tr>
                      <th>Type de Matériel</th>
                      <th>Nom / Marque / Modèle</th>
                      <th>Numéro d'identification</th>
                      <th>Statut</th>
                      <th>Quantité</th>
                      <th>Lieu de stockage</th>
                      {isAdmin && <th>Actions</th>}
                    </tr>
                  </thead>

                  <tbody>
                    {filteredMateriels.map((m) => (
                      <tr key={m.id}>
                        <td
                          className={`materiel ${
                            normalizeMateriel(m.type_de_materiel)
                          }`}
                        >
                          {m.type_de_materiel}</td>
                        <td>{m.marque_ou_modele}</td>
                        <td>{m.numero_de_serie}</td>
                        <td>{m.statut}</td>
                        <td>{m.quantite}</td>
                        <td>{m.lieu_stockage}</td>

                        {isAdmin && (
                          <td>
                            <div className="buttons-materiel">

                              <button
                              className="btn-materiel-supp"
                              onClick={() => handleDelete(m.id)}
                            >
                              Supprimer
                            </button>


                            <button
                              className="btn-materiel-modif"
                              onClick={() => handleEdit(m)}
                            >
                              Modifier
                            </button>
                            </div>

                          </td>
                        )}
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
