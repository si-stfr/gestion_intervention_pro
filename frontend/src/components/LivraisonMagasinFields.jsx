import { useState } from "react";
import api from "../api/api";

export const TYPE_LIVRAISON_MAGASIN = "Livraison en magasin";

// Types d'articles proposés (mêmes valeurs que la page Matériels)
const TYPES_ARTICLE = [
  "Matériel informatique",
  "Mobilier",
  "Matériel de travaux",
  "Matériel routier",
  "Matériel évenementiel",
  "Equipement public",
  "Autres",
];

const LIEU_MAGASIN = "Magasin (CTM)";

/*
=========================================================
CHAMPS SPÉCIFIQUES À UNE « LIVRAISON EN MAGASIN »
- fournisseur + n° de bon de livraison
- création rapide d'un article qui n'existe pas encore dans le stock
  (stock initial 0 : il sera augmenté à la validation du manager)
Affiché uniquement quand le type d'intervention est « Livraison en magasin ».
=========================================================
*/
export default function LivraisonMagasinFields({
  form,
  setForm,
  setMateriels,
  setMaterielsSelectionnes,
}) {
  const [ouvert, setOuvert] = useState(false);
  const [erreur, setErreur] = useState("");
  const [enCours, setEnCours] = useState(false);
  const [nouvel, setNouvel] = useState({
    type_de_materiel: "Mobilier",
    marque_ou_modele: "",
    autre_type: "",
    quantite: 1,
  });

  if (form.type_intervention !== TYPE_LIVRAISON_MAGASIN) return null;

  const ajouterArticle = async () => {
    setErreur("");

    if (!nouvel.marque_ou_modele.trim()) {
      setErreur("Indiquez le nom / la marque de l'article.");
      return;
    }
    if (nouvel.type_de_materiel === "Autres" && !nouvel.autre_type.trim()) {
      setErreur("Précisez le type de l'article.");
      return;
    }

    const quantite = Math.max(1, Number(nouvel.quantite) || 1);
    const user = JSON.parse(localStorage.getItem("user"));

    try {
      setEnCours(true);

      const res = await api.post("/materiels/", {
        type_de_materiel: nouvel.type_de_materiel,
        autre_type: nouvel.autre_type,
        marque_ou_modele: nouvel.marque_ou_modele.trim(),
        numero_de_serie: "",
        utilisateur_concerne_id: user?.id,
        lieu_stockage: LIEU_MAGASIN,
        statut: "En état",
        quantite: 0, // le stock augmentera à la validation de la livraison
      });

      const cree = res.data.data;
      const article = {
        id: cree.id,
        type_de_materiel: cree.type_de_materiel,
        marque_ou_modele: cree.marque_ou_modele,
        numero_de_serie: "",
        statut: "En état",
        lieu_stockage: LIEU_MAGASIN,
        quantite: 0,
      };

      setMateriels((prev) => [...prev, article]);
      setMaterielsSelectionnes((prev) => [
        ...prev,
        { ...article, quantiteDemande: quantite },
      ]);

      setNouvel({ type_de_materiel: "Mobilier", marque_ou_modele: "", autre_type: "", quantite: 1 });
      setOuvert(false);
    } catch (err) {
      console.error(err);
      setErreur(err?.response?.data?.detail || "Impossible de créer l'article.");
    } finally {
      setEnCours(false);
    }
  };

  return (
    <div className="livraison-box">
      <p className="livraison-info">
        <strong>Livraison en magasin</strong> : à la validation du manager, les
        quantités reçues en bon état sont ajoutées au stock du Magasin (CTM).
      </p>

      <label>Fournisseur *</label>
      <input
        type="text"
        placeholder="Nom du fournisseur"
        value={form.fournisseur ?? ""}
        onChange={(e) => setForm({ ...form, fournisseur: e.target.value })}
      />

      <label>N° de bon de livraison / de commande</label>
      <input
        type="text"
        placeholder="Ex. BL-2026-001"
        value={form.numero_bon_livraison ?? ""}
        onChange={(e) => setForm({ ...form, numero_bon_livraison: e.target.value })}
      />

      {/* création rapide d'un article absent du stock (création ou modification) */}
      <>
          <button
            type="button"
            className="mat-select-toggle"
            onClick={() => setOuvert((v) => !v)}
          >
            {ouvert ? "▲" : "▼"} Nouvel article (absent du stock)
          </button>

          {ouvert && (
            <div className="livraison-nouvel-article">
              <select
                value={nouvel.type_de_materiel}
                onChange={(e) => setNouvel({ ...nouvel, type_de_materiel: e.target.value })}
              >
                {TYPES_ARTICLE.map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>

              {nouvel.type_de_materiel === "Autres" && (
                <input
                  type="text"
                  placeholder="Précisez le type"
                  value={nouvel.autre_type}
                  onChange={(e) => setNouvel({ ...nouvel, autre_type: e.target.value })}
                />
              )}

              <input
                type="text"
                placeholder="Nom / marque / modèle de l'article"
                value={nouvel.marque_ou_modele}
                onChange={(e) => setNouvel({ ...nouvel, marque_ou_modele: e.target.value })}
              />

              <label>Quantité attendue</label>
              <input
                type="number"
                min="1"
                value={nouvel.quantite}
                onChange={(e) => setNouvel({ ...nouvel, quantite: e.target.value })}
              />

              {erreur && <p className="livraison-erreur">{erreur}</p>}

              <button
                type="button"
                className="btn-ajouter-article"
                disabled={enCours}
                onClick={ajouterArticle}
              >
                {enCours ? "Création..." : "Créer et ajouter à la livraison"}
              </button>
            </div>
          )}
      </>
    </div>
  );
}
