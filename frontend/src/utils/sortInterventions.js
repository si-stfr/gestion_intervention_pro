const STATUT_ORDER = [
  "SIGNALE",
  "EN_COURS",
  "EN_RETARD",
  "EN_ATTENTE_VALIDATION",
  "IMPOSSIBLE",
  "ABOUTI",
];

export function sortInterventions(list) {
  return [...list].sort((a, b) => {
    const diff = STATUT_ORDER.indexOf(a.statut) - STATUT_ORDER.indexOf(b.statut);

    if (diff !== 0) return diff;

    return new Date(b.created_at) - new Date(a.created_at);
  });
}
