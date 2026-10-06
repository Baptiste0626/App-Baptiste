/**
 * Badge coloré réutilisable.
 * tone : neutral | info | success | warning | violet | danger
 */
import {
  PAYMENT_STATUS_LABELS,
  PAYMENT_STATUS_TONES,
  PROSPECT_STATUS_LABELS,
  PROSPECT_STATUS_TONES,
} from '../utils/constants';

export default function Badge({ tone = 'neutral', children, dot = true }) {
  return (
    <span className={`badge badge--${tone}`}>
      {dot && <span className="badge__dot" />}
      {children}
    </span>
  );
}

/** Badge prêt à l'emploi pour un statut de prospect. */
export function ProspectStatusBadge({ statut }) {
  return <Badge tone={PROSPECT_STATUS_TONES[statut]}>{PROSPECT_STATUS_LABELS[statut] ?? statut}</Badge>;
}

/** Badge prêt à l'emploi pour un statut de paiement (statut effectif). */
export function PaymentStatusBadge({ statut }) {
  return <Badge tone={PAYMENT_STATUS_TONES[statut]}>{PAYMENT_STATUS_LABELS[statut] ?? statut}</Badge>;
}
