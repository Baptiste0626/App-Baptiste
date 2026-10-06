/**
 * Constantes métier partagées : statuts, libellés, couleurs des badges,
 * listes d'options pour les formulaires.
 */

/** Statuts de prospect, dans l'ordre du pipeline. */
export const PROSPECT_STATUSES = [
  'à_contacter',
  'contacté',
  'relancé',
  'rdv_pris',
  'converti',
  'perdu',
];

export const PROSPECT_STATUS_LABELS = {
  à_contacter: 'À contacter',
  contacté: 'Contacté',
  relancé: 'Relancé',
  rdv_pris: 'RDV pris',
  converti: 'Converti',
  perdu: 'Perdu',
};

/** Ton du badge (voir .badge--{tone} dans components.css). */
export const PROSPECT_STATUS_TONES = {
  à_contacter: 'neutral',
  contacté: 'info',
  relancé: 'warning',
  rdv_pris: 'violet',
  converti: 'success',
  perdu: 'danger',
};

/** Statuts considérés comme « en cours » (ni gagnés ni perdus). */
export const ACTIVE_PROSPECT_STATUSES = ['à_contacter', 'contacté', 'relancé', 'rdv_pris'];

/** Statuts pour lesquels une relance peut être due. */
export const FOLLOW_UP_STATUSES = ['contacté', 'relancé'];

export const CHANNELS = ['LinkedIn', 'Email', 'Téléphone', 'Autre'];

export const PAYMENT_STATUSES = ['en_attente', 'payé', 'en_retard', 'annulé'];

export const PAYMENT_STATUS_LABELS = {
  en_attente: 'En attente',
  payé: 'Payé',
  en_retard: 'En retard',
  annulé: 'Annulé',
};

export const PAYMENT_STATUS_TONES = {
  en_attente: 'warning',
  payé: 'success',
  en_retard: 'danger',
  annulé: 'neutral',
};

export const PAYMENT_METHODS = ['Virement', 'CB', 'Chèque', 'Espèces'];

/** Devises proposées dans les paramètres (code ISO → libellé). */
export const CURRENCIES = {
  EUR: 'Euro (€)',
  USD: 'Dollar US ($)',
  GBP: 'Livre sterling (£)',
  CHF: 'Franc suisse (CHF)',
  MAD: 'Dirham marocain (MAD)',
};

export const DEFAULT_SETTINGS = {
  userName: 'Baptiste',
  followUpDays: 5,
  currency: 'EUR',
};

/** Pages de l'application (clé = hash d'URL). */
export const PAGES = [
  { key: 'dashboard', label: 'Dashboard' },
  { key: 'taches', label: 'Tâches' },
  { key: 'prospects', label: 'Prospects' },
  { key: 'pipeline', label: 'Pipeline' },
  { key: 'paiements', label: 'Paiements' },
  { key: 'parametres', label: 'Paramètres' },
];
