/**
 * Modale générique accessible :
 * - fermeture via Échap, clic sur l'overlay ou bouton ×
 * - bloque le défilement de la page tant qu'elle est ouverte
 * - focus placé sur le premier champ à l'ouverture
 * Sur mobile elle s'affiche en « bottom sheet » plein largeur.
 */
import { useEffect, useRef } from 'react';
import Icon from './Icon';

export default function Modal({ title, subtitle, onClose, children, footer, size = 'md' }) {
  const panelRef = useRef(null);
  // onClose est souvent une fonction inline : on la garde dans une ref pour
  // que l'effet ne se relance pas (et ne vole pas le focus) à chaque rendu.
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onCloseRef.current();
    document.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    // Focus du premier champ de saisie (ou du panneau à défaut)
    const first = panelRef.current?.querySelector('input, select, textarea');
    (first ?? panelRef.current)?.focus();

    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, []);

  return (
    <div className="modal-overlay" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div
        className={`modal modal--${size}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        ref={panelRef}
        tabIndex={-1}
      >
        <header className="modal__header">
          <div>
            <h2 id="modal-title" className="modal__title">{title}</h2>
            {subtitle && <p className="modal__subtitle">{subtitle}</p>}
          </div>
          <button className="icon-btn" onClick={onClose} aria-label="Fermer">
            <Icon name="close" />
          </button>
        </header>
        <div className="modal__body">{children}</div>
        {footer && <footer className="modal__footer">{footer}</footer>}
      </div>
    </div>
  );
}
