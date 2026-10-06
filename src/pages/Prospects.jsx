/**
 * Prospects : tableau filtrable (recherche nom/entreprise + statut).
 * Un clic sur une ligne ouvre la modale d'édition ; les prospects
 * convertis disposent d'un raccourci « Créer une facture ».
 * Sur mobile, chaque ligne du tableau devient une carte (voir CSS).
 */
import { useMemo, useState } from 'react';
import EmptyState from '../components/EmptyState';
import Icon from '../components/Icon';
import { ProspectStatusBadge } from '../components/Badge';
import { PROSPECT_STATUSES, PROSPECT_STATUS_LABELS } from '../utils/constants';
import { formatDate, relativeDays } from '../utils/dates';
import { normalize } from '../utils/format';

export default function Prospects({ prospects, onOpenProspect, onDeleteProspect, onCreateInvoice }) {
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('tous');

  // Nombre de prospects par statut pour les puces de filtre
  const counts = useMemo(() => {
    const c = { tous: prospects.length };
    PROSPECT_STATUSES.forEach((s) => { c[s] = prospects.filter((p) => p.statut === s).length; });
    return c;
  }, [prospects]);

  const filtered = useMemo(() => {
    const q = normalize(query.trim());
    return prospects
      .filter((p) => status === 'tous' || p.statut === status)
      .filter((p) => !q || normalize(p.nom).includes(q) || normalize(p.entreprise).includes(q))
      .sort((a, b) => (b.dateContact || '').localeCompare(a.dateContact || ''));
  }, [prospects, query, status]);

  const stop = (fn) => (e) => { e.stopPropagation(); fn(); };

  return (
    <div className="page">
      <section className="panel panel--flush">
        <div className="toolbar">
          <div className="search">
            <Icon name="search" size={17} />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Rechercher un nom ou une entreprise…"
              aria-label="Rechercher un prospect"
            />
          </div>
          <select className="select-compact" value={status} onChange={(e) => setStatus(e.target.value)} aria-label="Filtrer par statut">
            <option value="tous">Tous les statuts ({counts.tous})</option>
            {PROSPECT_STATUSES.map((s) => (
              <option key={s} value={s}>{PROSPECT_STATUS_LABELS[s]} ({counts[s]})</option>
            ))}
          </select>
        </div>

        <div className="chips" role="tablist" aria-label="Filtre rapide par statut">
          {['tous', ...PROSPECT_STATUSES].map((s) => (
            <button key={s} className={`chip ${status === s ? 'is-active' : ''}`} onClick={() => setStatus(s)}>
              {s === 'tous' ? 'Tous' : PROSPECT_STATUS_LABELS[s]} <span className="chip__count">{counts[s]}</span>
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <EmptyState
            icon="search"
            title={prospects.length ? 'Aucun résultat' : 'Aucun prospect pour le moment'}
            description={prospects.length ? 'Essayez un autre mot-clé ou un autre statut.' : 'Ajoutez votre premier prospect pour démarrer.'}
            action={!prospects.length && (
              <button className="btn btn--primary" onClick={() => onOpenProspect(null)}>
                <Icon name="plus" size={16} /> Nouveau prospect
              </button>
            )}
          />
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Nom</th>
                  <th>Entreprise</th>
                  <th>Secteur</th>
                  <th>Canal</th>
                  <th>Statut</th>
                  <th>Dernier contact</th>
                  <th className="col-actions"><span className="sr-only">Actions</span></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => (
                  <tr key={p.id} className="is-clickable" onClick={() => onOpenProspect(p)}>
                    <td data-label="Nom" className="cell-strong">{p.nom}</td>
                    <td data-label="Entreprise">{p.entreprise}</td>
                    <td data-label="Secteur">{p.secteur || '—'}</td>
                    <td data-label="Canal">{p.canal}</td>
                    <td data-label="Statut"><ProspectStatusBadge statut={p.statut} /></td>
                    <td data-label="Dernier contact">
                      {formatDate(p.dateContact)}
                      {p.dateContact && <span className="cell-sub">{relativeDays(p.dateContact)}</span>}
                    </td>
                    <td className="col-actions">
                      <div className="row-actions">
                        {p.statut === 'converti' && (
                          <button className="icon-btn icon-btn--success" title="Créer une facture" aria-label="Créer une facture" onClick={stop(() => onCreateInvoice(p))}>
                            <Icon name="invoice" size={17} />
                          </button>
                        )}
                        <button className="icon-btn" title="Modifier" aria-label="Modifier" onClick={stop(() => onOpenProspect(p))}>
                          <Icon name="edit" size={17} />
                        </button>
                        <button className="icon-btn icon-btn--danger" title="Supprimer" aria-label="Supprimer" onClick={stop(() => onDeleteProspect(p))}>
                          <Icon name="trash" size={17} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
