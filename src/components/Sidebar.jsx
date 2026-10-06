/**
 * Barre latérale de navigation.
 * - Desktop (≥ 860px) : fixe à gauche.
 * - Mobile : tiroir coulissant avec overlay, ouvert depuis la topbar.
 */
import Icon from './Icon';
import Logo from './Logo';
import { PAGES } from '../utils/constants';

const PAGE_ICONS = {
  dashboard: 'dashboard',
  taches: 'tasks',
  prospects: 'users',
  pipeline: 'pipeline',
  paiements: 'payments',
  parametres: 'settings',
};

export default function Sidebar({ page, onNavigate, open, onClose, userName, counters }) {
  const name = userName?.trim() || 'Baptiste';

  return (
    <>
      <div className={`sidebar-overlay ${open ? 'is-visible' : ''}`} onClick={onClose} aria-hidden="true" />
      <aside className={`sidebar ${open ? 'is-open' : ''}`} aria-label="Navigation principale">
        <div className="sidebar__brand">
          <Logo size={38} className="brand-logo" />
          <div className="brand-text">
            <span className="brand-name">{name}</span>
            <span className="brand-app">Prospection & paiements</span>
          </div>
          <button className="icon-btn sidebar__close" onClick={onClose} aria-label="Fermer le menu">
            <Icon name="close" />
          </button>
        </div>

        <nav className="sidebar__nav">
          {PAGES.map((p) => {
            const count = counters[p.key];
            return (
              <button
                key={p.key}
                className={`nav-item ${page === p.key ? 'is-active' : ''}`}
                onClick={() => onNavigate(p.key)}
                aria-current={page === p.key ? 'page' : undefined}
              >
                <Icon name={PAGE_ICONS[p.key]} size={19} />
                <span>{p.label}</span>
                {count > 0 && <span className={`nav-count nav-count--${p.key}`}>{count}</span>}
              </button>
            );
          })}
        </nav>

        <div className="sidebar__footer">
          <span>Données enregistrées localement</span>
        </div>
      </aside>
    </>
  );
}
