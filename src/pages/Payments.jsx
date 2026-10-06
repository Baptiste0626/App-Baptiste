/**
 * Paiements : récapitulatif financier + tableau des factures.
 * Le statut affiché est toujours le statut *effectif* : une facture non
 * payée dont l'échéance est dépassée apparaît automatiquement en rouge.
 */
import { useMemo, useState } from 'react';
import EmptyState from '../components/EmptyState';
import Icon from '../components/Icon';
import { PaymentStatusBadge } from '../components/Badge';
import { PAYMENT_STATUSES, PAYMENT_STATUS_LABELS } from '../utils/constants';
import { computePaymentStatus, getPaymentTotals } from '../utils/business';
import { daysBetween, formatDate, todayISO } from '../utils/dates';
import { formatMoney, normalize } from '../utils/format';

export default function Payments({ payments, settings, onOpenPayment, onDeletePayment }) {
  const { currency } = settings;
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('tous');

  // Ajoute le statut effectif à chaque ligne une seule fois
  const rows = useMemo(
    () => payments.map((p) => ({ ...p, effectiveStatus: computePaymentStatus(p) })),
    [payments],
  );
  const totals = useMemo(() => getPaymentTotals(payments), [payments]);

  const filtered = useMemo(() => {
    const q = normalize(query.trim());
    return rows
      .filter((p) => status === 'tous' || p.effectiveStatus === status)
      .filter((p) => !q || normalize(p.client).includes(q) || normalize(p.reference).includes(q))
      .sort((a, b) => (b.dateFacture || '').localeCompare(a.dateFacture || ''));
  }, [rows, query, status]);

  const today = todayISO();
  const stop = (fn) => (e) => { e.stopPropagation(); fn(); };

  return (
    <div className="page">
      {/* --- Carte récapitulative --- */}
      <section className="summary-card">
        <SummaryItem label="Total facturé" value={formatMoney(totals.billed, currency)} tone="info" />
        <SummaryItem label="Total encaissé" value={formatMoney(totals.paid, currency)} tone="success"
          sub={totals.billed ? `${Math.round((totals.paid / totals.billed) * 100)} % du facturé` : null} />
        <SummaryItem label="Total en attente" value={formatMoney(totals.pending, currency)} tone="warning" />
        <SummaryItem label="Total en retard" value={formatMoney(totals.late, currency)} tone="danger"
          sub={totals.lateCount ? `${totals.lateCount} facture${totals.lateCount > 1 ? 's' : ''}` : 'Aucune'} />
      </section>

      <section className="panel panel--flush">
        <div className="toolbar">
          <div className="search">
            <Icon name="search" size={17} />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Rechercher un client ou une référence…"
              aria-label="Rechercher une facture"
            />
          </div>
          <select className="select-compact" value={status} onChange={(e) => setStatus(e.target.value)} aria-label="Filtrer par statut">
            <option value="tous">Tous les statuts</option>
            {PAYMENT_STATUSES.map((s) => <option key={s} value={s}>{PAYMENT_STATUS_LABELS[s]}</option>)}
          </select>
        </div>

        {filtered.length === 0 ? (
          <EmptyState
            icon="invoice"
            title={payments.length ? 'Aucun résultat' : 'Aucune facture pour le moment'}
            description={payments.length ? 'Modifiez la recherche ou le filtre.' : 'Créez une facture, ou convertissez un prospect pour en générer une.'}
            action={!payments.length && (
              <button className="btn btn--primary" onClick={() => onOpenPayment(null)}>
                <Icon name="plus" size={16} /> Nouvelle facture
              </button>
            )}
          />
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Client</th>
                  <th className="num">Montant</th>
                  <th>Statut</th>
                  <th>Date facture</th>
                  <th>Échéance</th>
                  <th>Paiement</th>
                  <th className="col-actions"><span className="sr-only">Actions</span></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => {
                  const late = p.effectiveStatus === 'en_retard';
                  return (
                    <tr key={p.id} className={`is-clickable ${late ? 'is-late' : ''}`} onClick={() => onOpenPayment(p)}>
                      <td data-label="Client" className="cell-strong">
                        {p.client}
                        <span className="cell-sub">{p.reference || 'Sans référence'} · {p.moyenPaiement}</span>
                      </td>
                      <td data-label="Montant" className={`num amount ${late ? 'amount--danger' : ''}`}>{formatMoney(p.montant, currency)}</td>
                      <td data-label="Statut"><PaymentStatusBadge statut={p.effectiveStatus} /></td>
                      <td data-label="Date facture">{formatDate(p.dateFacture)}</td>
                      <td data-label="Échéance" className={late ? 'text-danger' : ''}>
                        {formatDate(p.dateEcheance)}
                        {late && <span className="cell-sub text-danger">+{daysBetween(p.dateEcheance, today)} j</span>}
                      </td>
                      <td data-label="Paiement">{p.datePaiement ? formatDate(p.datePaiement) : '—'}</td>
                      <td className="col-actions">
                        <div className="row-actions">
                          <button className="icon-btn" title="Modifier" aria-label="Modifier" onClick={stop(() => onOpenPayment(p))}>
                            <Icon name="edit" size={17} />
                          </button>
                          <button className="icon-btn icon-btn--danger" title="Supprimer" aria-label="Supprimer" onClick={stop(() => onDeletePayment(p))}>
                            <Icon name="trash" size={17} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

function SummaryItem({ label, value, tone, sub }) {
  return (
    <div className={`summary-item summary-item--${tone}`}>
      <span className="summary-item__label">{label}</span>
      <strong className="summary-item__value">{value}</strong>
      {sub && <span className="summary-item__sub">{sub}</span>}
    </div>
  );
}
