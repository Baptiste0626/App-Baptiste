/**
 * Boîte de confirmation (suppression, réinitialisation…) basée sur Modal.
 */
import Modal from './Modal';

export default function ConfirmDialog({ title, message, confirmLabel = 'Supprimer', danger = true, onConfirm, onCancel }) {
  return (
    <Modal
      title={title}
      onClose={onCancel}
      size="sm"
      footer={
        <>
          <button className="btn btn--ghost" onClick={onCancel}>Annuler</button>
          <button className={`btn ${danger ? 'btn--danger' : 'btn--primary'}`} onClick={onConfirm} autoFocus>
            {confirmLabel}
          </button>
        </>
      }
    >
      <p className="confirm-text">{message}</p>
    </Modal>
  );
}
