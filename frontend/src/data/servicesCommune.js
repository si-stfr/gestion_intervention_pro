// Référence : "LES DIFFÉRENTS SERVICES DE LA MAIRIE.xlsx"
// Chaque site regroupe plusieurs services qui lui sont propres.
export const SITES_SERVICES = [
  { site: "Mairie", service: "Mairie" },
  { site: "Mairie", service: "Cabinet du Maire" },
  { site: "Direction générale des Services", service: "Service de la Direction Générale" },
  { site: "Direction générale des Services", service: "Coorpération CTG" },
  { site: "Mairie", service: "Prévention Sécurité et Accessibilité" },
  { site: "Mairie", service: "Direction Budget Achat et Domaine" },
  { site: "Direction Générale des Services", service: "Direction du Développement du territoire – Urbanisme" },
  { site: "Aérodrome", service: "Aérodrome" },
  { site: "La Rotonde des Arts", service: "Gestion du Domaine" },
  { site: "Piscine Municipale", service: "Pôle Sport" },
  { site: "La Rotonde des Arts", service: "Pôle Gestion des biens communaux" },
  { site: "POLICE MUNICIPALE", service: "Police Municipale" },
  { site: "POLICE MUNICIPALE", service: "Conseil Local de Sécurité et de la prévention de la délinquance" },
  { site: "POLICE MUNICIPALE", service: "CLSPD" },
  { site: "Caisse des Ecoles", service: "Caisse des Ecoles" },
  { site: "Club HOUSE", service: "Cuisine Centrale" },
  { site: "Caisse des Ecoles", service: "Régie" },
  { site: "Bâtiment Animation", service: "Centre Communal d'Actions Sociales" },
  { site: "Direction Générale des Services", service: "Communication Interne" },
  { site: "CTM", service: "Direction des Ressources Humaines" },
  { site: "CTM", service: "SST" },
  { site: "Bâtiment affaires scolaires", service: "Direction générale des relations Citoyennes" },
  { site: "Mairie", service: "Service à la polulation" },
  { site: "Mairie", service: "Standard  Accueil Protocole" },
  { site: "Mairie", service: "Etat Civil" },
  { site: "Cimetière", service: "Cimetière" },
  { site: "EX Local CAF", service: "MAISON FRANCE SERVICES" },
  { site: "Bâtiment affaires scolaires", service: "Direction Education" },
  { site: "Affaires Scolaires", service: "Direction Education" },
  { site: "Affaires Scolaires", service: "Inscription Scolaires" },
  { site: "Direction Éducation", service: "Mission Locale" },
  { site: "GOLF", service: "Golf International" },
  { site: "Bâtiment Animation", service: "Direction Générale  Adjointe Projets et Animation du Territoire" },
  { site: "Animation", service: "Jeunesse" },
  { site: "Médiathèque", service: "Centre de Ressources de l'Information et de la communication" },
  { site: "Bibliothèque", service: "Centre de Ressources Ilot Rêves" },
  { site: "Espace Multimédia", service: "Espace Multimédia Communication et Infographie" },
  { site: "Centre Nautique", service: "Base  Nautique" },
  { site: "Marina", service: "Capitainerie" },
  { site: "Gare Maritime", service: "Port Multi-Modal" },
  { site: "CTM", service: "Direction des Services Techniques" },
  { site: "Direction des Services Techniques", service: "Direction de l'ingénierie du développement et de l'environnement" },
  { site: "CTM", service: "Conservation de la Pointe des Châteaux" },
  { site: "CTM", service: "DIDE" },
  { site: "CTM", service: "Propreté des bâtiments" },
  { site: "CTM", service: "Parcs cet jardins Infrastructures sportives" },
  { site: "CTM", service: "VOiries et Réseaux Divers" },
  { site: "CTM", service: "Service  électricité Construction" },
  { site: "CTM", service: "VRDESH" },
  { site: "CTM", service: "Logistique" },
  { site: "CTM", service: "Régie Evénementielle" },
  { site: "CTM", service: "Magasin" },
  { site: "Base Nautique", service: "Atelier Municipal" },
  { site: "CTM", service: "Propreté Urbaine" },
  { site: "CTM", service: "Mission Eau Intervention Bâtimentaires" },
  { site: "CTM", service: "Service Informatique" },
];

export const SERVICES_LIST = Array.from(
  new Set(SITES_SERVICES.map((s) => s.service))
).sort((a, b) => a.localeCompare(b, "fr"));

export function getSitesForServices(selectedServices) {
  if (!selectedServices || selectedServices.length === 0) return [];
  const sites = new Set();
  SITES_SERVICES.forEach(({ site, service }) => {
    if (selectedServices.includes(service)) sites.add(site);
  });
  return Array.from(sites).sort((a, b) => a.localeCompare(b, "fr"));
}
