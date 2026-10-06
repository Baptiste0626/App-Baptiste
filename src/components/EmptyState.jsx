/**
 * État vide réutilisable (liste sans résultat, aucune donnée…).
 */
import Icon from './Icon';

export default function EmptyState({ icon = 'inbox', title, description, action, compact = false }) {
  return (
    <div className={`empty-state ${compact ? 'empty-state--compact' : ''}`}>
      <div className="empty-state__icon">
        <Icon name={icon} size={compact ? 20 : 26} />
      </div>
      <p className="empty-state__title">{title}</p>
      {description && <p className="empty-state__desc">{description}</p>}
      {action}
    </div>
  );
}
