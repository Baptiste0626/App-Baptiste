/**
 * Règles métier pures (sans React) : relances, statut effectif des
 * paiements, agrégats financiers et statistiques de prospection.
 */
import { ACTIVE_PROSPECT_STATUSES, FOLLOW_UP_STATUSES } from './constants';
import { daysBetween, todayISO } from './dates';

/* ------------------------------------------------------------------ */
/* Prospection                                                         */
/* ------------------------------------------------------------------ */

/**
 * Liste des relances dues : prospects « contacté » ou « relancé » dont
 * le dernier contact date d'au moins `followUpDays` jours.
 * Triées de la plus en retard à la moins en retard.
 */
export function getDueFollowUps(prospects, followUpDays) {
  const today = todayISO();
  return prospects
    .filter((p) => FOLLOW_UP_STATUSES.includes(p.statut) && p.dateContact)
    .map((p) => {
      const sinceContact = daysBetween(p.dateContact, today);
      return { ...p, sinceContact, overdueBy: sinceContact - followUpDays };
    })
    .filter((p) => p.overdueBy >= 0)
    .sort((a, b) => b.overdueBy - a.overdueBy);
}

/** Statistiques de prospection pour le dashboard. */
export function getProspectStats(prospects, followUpDays) {
  const total = prospects.length;
  const converted = prospects.filter((p) => p.statut === 'converti').length;
  const active = prospects.filter((p) => ACTIVE_PROSPECT_STATUSES.includes(p.statut)).length;
  const overdue = getDueFollowUps(prospects, followUpDays).length;
  const conversionRate = total ? Math.round((converted / total) * 100) : 0;
  return { total, converted, active, overdue, conversionRate };
}

/* ------------------------------------------------------------------ */
/* Paiements                                                           */
/* ------------------------------------------------------------------ */

/**
 * Statut calculé automatiquement à partir des dates :
 * - une date de paiement renseignée => « payé » (sauf annulé)
 * - échéance dépassée sans paiement => « en_retard »
 * - sinon le statut saisi (un « en_retard » dont l'échéance a été
 *   repoussée redevient « en_attente »).
 */
export function computePaymentStatus(payment) {
  const { statut, dateEcheance, datePaiement } = payment;
  if (statut === 'annulé') return 'annulé';
  if (statut === 'payé' || datePaiement) return 'payé';
  if (dateEcheance && dateEcheance < todayISO()) return 'en_retard';
  return statut === 'en_retard' ? 'en_attente' : statut || 'en_attente';
}

/** Vrai si l'échéance est dépassée et la facture non réglée. */
export function isPaymentOverdue(payment) {
  return computePaymentStatus(payment) === 'en_retard';
}

/** Agrégats financiers (les factures annulées sont exclues). */
export function getPaymentTotals(payments) {
  const totals = { billed: 0, paid: 0, pending: 0, late: 0, lateCount: 0 };
  for (const p of payments) {
    const status = computePaymentStatus(p);
    const amount = Number(p.montant) || 0;
    if (status === 'annulé') continue;
    totals.billed += amount;
    if (status === 'payé') totals.paid += amount;
    if (status === 'en_attente') totals.pending += amount;
    if (status === 'en_retard') {
      totals.late += amount;
      totals.lateCount += 1;
    }
  }
  return totals;
}

/** Factures en retard, triées par échéance la plus ancienne. */
export function getLatePayments(payments) {
  return payments
    .filter(isPaymentOverdue)
    .map((p) => ({ ...p, lateBy: daysBetween(p.dateEcheance, todayISO()) }))
    .sort((a, b) => b.lateBy - a.lateBy);
}
