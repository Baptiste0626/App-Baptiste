/**
 * Pipeline : kanban avec une colonne par statut.
 * Glisser-déposer natif HTML5 (dataTransfer) pour changer de statut.
 * Les écrans tactiles ne supportant pas le DnD HTML5, chaque carte
 * propose aussi un petit sélecteur de statut en repli.
 */
import { useState } from 'react';
import Icon from '../components/Icon';
import { PROSPECT_STATUSES, PROSPECT_STATUS_LABELS, PROSPECT_STATUS_TONES } from '../utils/constants';
import { relativeDays } from '../utils/dates';

const MIME = 'text/plain';

export default function Pipeline({ prospects, onChangeStatus, onOpenProspect }) {
  const [draggingId, setDraggingId] = useState(null);
  const [overColumn, setOverColumn] = useState(null);

  const handleDragStart = (e, id) => {
    e.dataTransfer.setData(MIME, id);
    e.dataTransfer.effectAllowed = 'move';
    setDraggingId(id);
  };

  const handleDragEnd = () => {
    setDraggingId(null);
    setOverColumn(null);
  };

  const handleDragOver = (e, status) => {
    e.preventDefault(); // nécessaire pour autoriser le drop
    e.dataTransfer.dropEffect = 'move';
    if (overColumn !== status) setOverColumn(status);
  };

  const handleDragLeave = (e, status) => {
    // Ignore les sorties vers un élément enfant de la colonne
    if (e.currentTarget.contains(e.relatedTarget)) return;
    if (overColumn === status) setOverColumn(null);
  };

  const handleDrop = (e, status) => {
    e.preventDefault();
    const id = e.dataTransfer.getData(MIME) || draggingId;
    const prospect = prospects.find((p) => p.id === id);
    if (prospect && prospect.statut !== status) onChangeStatus(id, status);
    handleDragEnd();
  };

  return (
    <div className="page page--wide">
      <p className="muted small pipeline-hint">
        <Icon name="grip" size={15} /> Glissez une carte vers une autre colonne pour changer son statut.
      </p>
      <div className="kanban">
        {PROSPECT_STATUSES.map((status) => {
          const items = prospects.filter((p) => p.statut === status);
          const tone = PROSPECT_STATUS_TONES[status];
          return (
            <section
              key={status}
              className={`kanban__col kanban__col--${tone} ${overColumn === status ? 'is-over' : ''}`}
              onDragOver={(e) => handleDragOver(e, status)}
              onDragLeave={(e) => handleDragLeave(e, status)}
              onDrop={(e) => handleDrop(e, status)}
              aria-label={PROSPECT_STATUS_LABELS[status]}
            >
              <header className="kanban__head">
                <span className={`kanban__dot tone-${tone}`} />
                <h2 className="kanban__title">{PROSPECT_STATUS_LABELS[status]}</h2>
                <span className="kanban__count">{items.length}</span>
              </header>

              <div className="kanban__list">
                {items.length === 0 && <div className="kanban__empty">Déposez une carte ici</div>}
                {items.map((p) => (
                  <article
                    key={p.id}
                    className={`kanban-card ${draggingId === p.id ? 'is-dragging' : ''}`}
                    draggable
                    onDragStart={(e) => handleDragStart(e, p.id)}
                    onDragEnd={handleDragEnd}
                    onClick={() => onOpenProspect(p)}
                  >
                    <div className="kanban-card__top">
                      <span className="kanban-card__name">{p.nom}</span>
                      <Icon name="grip" size={16} className="kanban-card__grip" />
                    </div>
                    <span className="kanban-card__company">{p.entreprise}</span>
                    <div className="kanban-card__meta">
                      {p.secteur && <span className="tag">{p.secteur}</span>}
                      <span className="tag tag--muted">{p.canal}</span>
                    </div>
                    <div className="kanban-card__foot">
                      <span className="muted small">{p.dateContact ? relativeDays(p.dateContact) : '—'}</span>
                      {/* Repli tactile : changement de statut sans glisser */}
                      <select
                        className="kanban-card__move"
                        value={p.statut}
                        onClick={(e) => e.stopPropagation()}
                        onChange={(e) => onChangeStatus(p.id, e.target.value)}
                        aria-label={`Changer le statut de ${p.nom}`}
                      >
                        {PROSPECT_STATUSES.map((s) => (
                          <option key={s} value={s}>{PROSPECT_STATUS_LABELS[s]}</option>
                        ))}
                      </select>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
