/**
 * Barre supérieure : bouton hamburger (mobile), titre de page et
 * action principale contextuelle (ex. « Nouveau prospect »).
 */
import Icon from './Icon';

export default function Topbar({ title, subtitle, onMenu, action }) {
  return (
    <header className="topbar">
      <button className="icon-btn topbar__menu" onClick={onMenu} aria-label="Ouvrir le menu">
        <Icon name="menu" size={20} />
      </button>
      <div className="topbar__titles">
        <h1 className="topbar__title">{title}</h1>
        {subtitle && <p className="topbar__subtitle">{subtitle}</p>}
      </div>
      {action && <div className="topbar__action">{action}</div>}
    </header>
  );
}
