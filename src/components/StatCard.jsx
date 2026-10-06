/**
 * Carte statistique : icône colorée, libellé, valeur et sous-texte.
 * tone : info | success | warning | violet | danger | neutral
 */
import Icon from './Icon';

export default function StatCard({ label, value, hint, icon, tone = 'info', onClick }) {
  const Tag = onClick ? 'button' : 'div';
  return (
    <Tag className={`stat-card ${onClick ? 'stat-card--clickable' : ''}`} onClick={onClick} type={onClick ? 'button' : undefined}>
      <div className={`stat-card__icon tone-${tone}`}>
        <Icon name={icon} size={20} />
      </div>
      <div className="stat-card__body">
        <span className="stat-card__label">{label}</span>
        <strong className="stat-card__value">{value}</strong>
        {hint && <span className="stat-card__hint">{hint}</span>}
      </div>
    </Tag>
  );
}
