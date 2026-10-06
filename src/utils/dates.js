/**
 * Helpers de dates. Toutes les dates métier sont stockées au format
 * ISO court « YYYY-MM-DD » et manipulées en heure locale pour éviter
 * les décalages de fuseau horaire.
 */

const DAY_MS = 24 * 60 * 60 * 1000;

/** Date du jour au format YYYY-MM-DD (heure locale). */
export function todayISO() {
  return toISODate(new Date());
}

/** Convertit un objet Date en « YYYY-MM-DD » (heure locale). */
export function toISODate(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/** Parse « YYYY-MM-DD » en Date locale à minuit (null si invalide). */
export function parseISODate(iso) {
  if (!iso || typeof iso !== 'string') return null;
  const [y, m, d] = iso.slice(0, 10).split('-').map(Number);
  if (!y || !m || !d) return null;
  return new Date(y, m - 1, d);
}

/** Ajoute (ou retire) des jours à une date ISO. */
export function addDays(iso, days) {
  const date = parseISODate(iso) ?? new Date();
  date.setDate(date.getDate() + days);
  return toISODate(date);
}

/** Nombre de jours entiers entre deux dates ISO (b - a). */
export function daysBetween(a, b) {
  const da = parseISODate(a);
  const db = parseISODate(b);
  if (!da || !db) return 0;
  return Math.round((db - da) / DAY_MS);
}

/** Formatage lisible en français : « 12 mars 2026 ». */
export function formatDate(iso) {
  const date = parseISODate(iso);
  if (!date) return '—';
  return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
}

/** Libellé relatif court : « aujourd'hui », « il y a 3 j », « dans 2 j ». */
export function relativeDays(iso) {
  if (!iso) return '';
  const diff = daysBetween(todayISO(), iso);
  if (diff === 0) return "aujourd'hui";
  if (diff < 0) return `il y a ${-diff} j`;
  return `dans ${diff} j`;
}
