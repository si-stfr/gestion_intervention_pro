export const TECHNICIEN_BUFFER_DAYS = 4;

function toDate(value) {
  if (!value) return null;
  const d = new Date(value);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function isTechnicienAvailable(technicienId, dateDebut, dateFin, interventions, excludeId = null) {
  const debut = toDate(dateDebut);
  const fin = toDate(dateFin);

  if (!debut || !fin) return true;

  const today = toDate(new Date());
  const bufferLimit = new Date(today);
  bufferLimit.setDate(bufferLimit.getDate() + TECHNICIEN_BUFFER_DAYS);

  const actives = (interventions ?? []).filter(
    (i) =>
      Number(i.technicien_id) === Number(technicienId) &&
      i.statut !== "ABOUTI" &&
      i.statut !== "IMPOSSIBLE" &&
      (excludeId == null || Number(i.id) !== Number(excludeId))
  );

  for (const i of actives) {
    const iDebut = toDate(i.date_debut);
    const iFin = toDate(i.date_fin);

    // chevauchement de planning
    if (iDebut && iFin && !(fin < iDebut || debut > iFin)) return false;

    // intervention déjà prévue pour démarrer très bientôt
    if (iDebut && today <= iDebut && iDebut < bufferLimit) return false;
  }

  return true;
}

export function getAvailableTechniciens(techniciens, dateDebut, dateFin, interventions, excludeId = null) {
  return (techniciens ?? []).filter((t) =>
    isTechnicienAvailable(t.id, dateDebut, dateFin, interventions, excludeId)
  );
}
