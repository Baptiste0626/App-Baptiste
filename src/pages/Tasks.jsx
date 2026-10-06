/**
 * Tâches : liste complète des relances dues + relances à venir.
 * « Marquer relancé » passe le prospect au statut « relancé » et met la
 * date de dernier contact à aujourd'hui.
 */
import EmptyState from '../components/EmptyState';
import Icon from '../components/Icon';
import { ProspectStatusBadge } from '../components/Badge';
import { FOLLOW_UP_STATUSES } from '../utils/constants';
import { getDueFollowUps } from '../utils/business';
import { addDays, daysBetween, formatDate, todayISO } from '../utils/dates';

const UPCOMING_WINDOW = 3; // jours d'anticipation pour « À venir »

export default function Tasks({ prospects, settings, onMarkFollowedUp, onOpenProspect }) {
  const { followUpDays } = settings;
  const due = getDueFollowUps(prospects, followUpDays);
  const today = todayISO();

  // Relances qui arriveront à échéance dans les prochains jours
  const upcoming = prospects
    .filter((p) => FOLLOW_UP_STATUSES.includes(p.statut) && p.dateContact)
    .map((p) => ({ ...p, dueDate: addDays(p.dateContact, followUpDays) }))
    .filter((p) => {
      const inDays = daysBetween(today, p.dueDate);
      return inDays > 0 && inDays <= UPCOMING_WINDOW;
    })
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate));

  const toContact = prospects.filter((p) => p.statut === 'à_contacter');

  return (
    <div className="page">
      <section className="panel">
        <header className="panel__header">
          <h2 className="panel__title">
            <Icon name="clock" size={18} /> Relances dues <span className="count-chip">{due.length}</span>
          </h2>
          <span className="muted small">Sans nouvelles depuis {followUpDays} jours ou plus</span>
        </header>

        {due.length === 0 ? (
          <EmptyState icon="check" title="Aucune relance due" description="Tous vos prospects ont été recontactés récemment." />
        ) : (
          <ul className="task-list">
            {due.map((p) => (
              <li key={p.id} className="task-card">
                <button className="task-card__main" onClick={() => onOpenProspect(p)}>
                  <div className="task-card__head">
                    <span className="task-card__name">{p.nom}</span>
                    <ProspectStatusBadge statut={p.statut} />
                  </div>
                  <span className="task-card__company">{p.entreprise}{p.secteur ? ` · ${p.secteur}` : ''}</span>
                  <span className="task-card__meta">
                    {p.canal} · dernier contact le {formatDate(p.dateContact)}
                    <span className={`pill ${p.overdueBy > 0 ? 'pill--danger' : 'pill--warning'}`}>
                      {p.overdueBy > 0 ? `${p.overdueBy} j de retard` : "À faire aujourd'hui"}
                    </span>
                  </span>
                  {p.notes && <span className="task-card__notes">{p.notes}</span>}
                </button>
                <button className="btn btn--primary task-card__action" onClick={() => onMarkFollowedUp(p.id)}>
                  <Icon name="check" size={16} /> Marquer relancé
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <div className="dashboard-columns">
        <section className="panel">
          <header className="panel__header">
            <h2 className="panel__title"><Icon name="hourglass" size={18} /> À venir ({UPCOMING_WINDOW} prochains jours)</h2>
          </header>
          {upcoming.length === 0 ? (
            <EmptyState compact title="Rien de prévu" description="Aucune relance n'arrive à échéance prochainement." />
          ) : (
            <ul className="item-list">
              {upcoming.map((p) => (
                <li key={p.id} className="item-row">
                  <button className="item-row__main" onClick={() => onOpenProspect(p)}>
                    <span className="item-row__title">{p.nom}</span>
                    <span className="item-row__meta">{p.entreprise} · relance le {formatDate(p.dueDate)}</span>
                  </button>
                  <div className="item-row__side"><span className="pill pill--info">dans {daysBetween(today, p.dueDate)} j</span></div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="panel">
          <header className="panel__header">
            <h2 className="panel__title"><Icon name="users" size={18} /> Premiers contacts à établir</h2>
          </header>
          {toContact.length === 0 ? (
            <EmptyState compact title="Aucun prospect à contacter" />
          ) : (
            <ul className="item-list">
              {toContact.map((p) => (
                <li key={p.id} className="item-row">
                  <button className="item-row__main" onClick={() => onOpenProspect(p)}>
                    <span className="item-row__title">{p.nom}</span>
                    <span className="item-row__meta">{p.entreprise} · via {p.canal}</span>
                  </button>
                  <div className="item-row__side"><ProspectStatusBadge statut={p.statut} /></div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
