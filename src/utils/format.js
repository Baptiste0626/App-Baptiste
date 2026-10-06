/**
 * Helpers de formatage (montants, identifiants).
 */

/** Formate un montant dans la devise choisie (ex. « 1 250,00 € »). */
export function formatMoney(amount, currency = 'EUR') {
  const value = Number(amount) || 0;
  try {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency,
      maximumFractionDigits: 2,
    }).format(value);
  } catch {
    // Code devise inconnu : repli sur un affichage simple
    return `${value.toFixed(2)} ${currency}`;
  }
}

/** Génère un identifiant unique (crypto.randomUUID si disponible). */
export function uid(prefix = 'id') {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return `${prefix}_${crypto.randomUUID().slice(0, 8)}`;
  }
  return `${prefix}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
}

/** Normalise une chaîne pour la recherche (minuscules, sans accents). */
export function normalize(str) {
  return String(str ?? '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '');
}
