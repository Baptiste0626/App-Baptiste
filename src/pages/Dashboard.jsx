/**
 * Dashboard : 6 indicateurs clés + relances à faire + factures en retard.
 */
import StatCard from '../components/StatCard';
import EmptyState from '../components/EmptyState';
import Icon from '../components/Icon';
import { ProspectStatusBadge } from '../components/Badge';
import { getDueFollowUps, getLatePayments, getPaymentTotals, getProspectStats } from '../utils/business';
import { formatDate } from '../utils/dates';
import { formatMoney } from '../utils/format';

const PREVIEW = 5; // nombre d'éléments affichés dans chaque liste

export default function Dashboard({ prospects, payments, settings, onNavigate, onMarkFollowedUp, onOpenProspect, onOpenPayment }) {
  const { currency, followUpDays } = settings;
  const stats = getProspectStats(prospects, followUpDays);
  const totals = getPaymentTotals(payments);
  const followUps = getDueFollowUps(prospects, followUpDays);
  const late = getLatePayments(payments);

  return (
    <div className="page">
      <section className="stats-grid">
        <StatCard icon="users" tone="info" label="Prospects en cours" value={stats.active}
          hint="À contacter, contactés, relancés, RDV" onClick={() => onNavigate('pipeline')} />
        <StatCard icon="percent" tone="success" label="Taux de conversion" value={`${stats.conversionRate} %`}
          hint={`${stats.converted} converti${stats.converted > 1 ? 's' : ''} sur ${stats.total}`} />
        <StatCard icon="clock" tone={stats.overdue ? 'warning' : 'neutral'} label="Relances en retard" value={stats.overdue}
          hint={`Seuil : ${followUpDays} jours sans contact`} onClick={() => onNavigate('taches')} />
        <StatCard icon="tasks" tone="violet" label="Total prospects" value={stats.total}
          hint="Tous statuts confondus" onClick={() => onNavigate('prospects')} />
        <StatCard icon="wallet" tone="success" label="Chiffre d'affaires encaissé" value={formatMoney(totals.paid, currency)}
          hint={`Sur ${formatMoney(totals.billed, currency)} facturés`} onClick={() => onNavigate('paiements')} />
        <StatCard icon="hourglass" tone={totals.late ? 'danger' : 'warning'} label="Montant en attente"
          value={formatMoney(totals.pending + totals.late, currency)}
          hint={totals.late ? `dont ${formatMoney(totals.late, currency)} en retard` : 'Aucun retard de paiement'}
          onClick={() => onNavigate('paiements')} />
      </section>

      <div className="dashboard-columns">
        {/* --- Relances à faire --- */}
        <section className="panel">
          <header className="panel__header">
            <h2 className="panel__title"><Icon name="clock" size={18} /> Relances à faire</h2>
            {followUps.length > 0 && (
              <button className="link-btn" onClick={() => onNavigate('taches')}>
                Tout voir <Icon name="arrowRight" size={14} />
              </button>
            )}
          </header>
          {followUps.length === 0 ? (
            <EmptyState compact icon="check" title="Aucune relance en attente" description="Vous êtes à jour dans votre prospection." />
          ) : (
            <ul className="item-list">
              {followUps.slice(0, PREVIEW).map((p) => (
                <li key={p.id} className="item-row">
                  <button className="item-row__main" onClick={() => onOpenProspect(p)}>
                    <span className="item-row__title">{p.nom}</span>
                    <span className="item-row__meta">{p.entreprise} · contacté le {formatDate(p.dateContact)}</span>
                  </button>
                  <div className="item-row__side">
                    <span className="pill pill--warning">{p.sinceContact} j</span>
                    <button className="btn btn--sm btn--soft" onClick={() => onMarkFollowedUp(p.id)}>
                      <Icon name="check" size={14} /> <span className="hide-xs">Relancé</span>
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* --- Factures en retard --- */}
        <section className="panel">
          <header className="panel__header">
            <h2 className="panel__title"><Icon name="alert" size={18} /> Factures en retard</h2>
            {late.length > 0 && (
              <button className="link-btn" onClick={() => onNavigate('paiements')}>
                Tout voir <Icon name="arrowRight" size={14} />
              </button>
            )}
          </header>
          {late.length === 0 ? (
            <EmptyState compact icon="check" title="Aucun retard de paiement" description="Toutes vos factures sont dans les temps." />
          ) : (
            <ul className="item-list">
              {late.slice(0, PREVIEW).map((f) => (
                <li key={f.id} className="item-row">
                  <button className="item-row__main" onClick={() => onOpenPayment(f)}>
                    <span className="item-row__title">{f.client}</span>
                    <span className="item-row__meta">
                      {f.reference || 'Sans référence'} · échue le {formatDate(f.dateEcheance)}
                    </span>
                  </button>
                  <div className="item-row__side">
                    <strong className="amount amount--danger">{formatMoney(f.montant, currency)}</strong>
                    <span className="pill pill--danger">+{f.lateBy} j</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      {/* --- Activité récente du pipeline --- */}
      <section className="panel">
        <header className="panel__header">
          <h2 className="panel__title"><Icon name="trend" size={18} /> Derniers contacts</h2>
          <button className="link-btn" onClick={() => onNavigate('prospects')}>
            Prospects <Icon name="arrowRight" size={14} />
          </button>
        </header>
        {prospects.length === 0 ? (
          <EmptyState compact title="Aucun prospect" description="Ajoutez votre premier prospect pour commencer." />
        ) : (
          <ul className="item-list">
            {[...prospects]
              .sort((a, b) => (b.dateContact || '').localeCompare(a.dateContact || ''))
              .slice(0, 4)
              .map((p) => (
                <li key={p.id} className="item-row">
                  <button className="item-row__main" onClick={() => onOpenProspect(p)}>
                    <span className="item-row__title">{p.nom}</span>
                    <span className="item-row__meta">{p.entreprise} · {p.secteur || '—'} · {formatDate(p.dateContact)}</span>
                  </button>
                  <div className="item-row__side"><ProspectStatusBadge statut={p.statut} /></div>
                </li>
              ))}
          </ul>
        )}
      </section>
    </div>
  );
}
