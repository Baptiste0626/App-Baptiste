/**
 * Modale d'ajout / d'édition d'un prospect.
 * - Validation minimale : nom et entreprise obligatoires.
 * - Si le statut est « converti », propose « Créer une facture » :
 *   le prospect est enregistré puis une facture pré-remplie s'ouvre.
 */
import { useState } from 'react';
import Modal from './Modal';
import Icon from './Icon';
import { CHANNELS, PROSPECT_STATUSES, PROSPECT_STATUS_LABELS } from '../utils/constants';
import { todayISO } from '../utils/dates';
import { uid } from '../utils/format';

const EMPTY = {
  nom: '',
  entreprise: '',
  secteur: '',
  canal: 'LinkedIn',
  statut: 'à_contacter',
  dateContact: '',
  notes: '',
};

export default function ProspectModal({ prospect, onSave, onClose, onCreateInvoice }) {
  const isEdit = Boolean(prospect?.id);
  const [form, setForm] = useState(() => ({ ...EMPTY, dateContact: todayISO(), ...prospect }));
  const [errors, setErrors] = useState({});

  const set = (field) => (e) => {
    setForm((f) => ({ ...f, [field]: e.target.value }));
    if (errors[field]) setErrors((err) => ({ ...err, [field]: undefined }));
  };

  /** Valide le formulaire et retourne le prospect nettoyé (ou null). */
  const validate = () => {
    const next = {};
    if (!form.nom.trim()) next.nom = 'Le nom est obligatoire.';
    if (!form.entreprise.trim()) next.entreprise = "L'entreprise est obligatoire.";
    setErrors(next);
    if (Object.keys(next).length) return null;
    return {
      ...form,
      id: form.id || uid('p'),
      nom: form.nom.trim(),
      entreprise: form.entreprise.trim(),
      secteur: form.secteur.trim(),
      notes: form.notes.trim(),
    };
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const clean = validate();
    if (clean) onSave(clean);
  };

  const handleCreateInvoice = () => {
    const clean = validate();
    if (clean) onCreateInvoice(clean);
  };

  return (
    <Modal
      title={isEdit ? 'Modifier le prospect' : 'Nouveau prospect'}
      subtitle={isEdit ? form.entreprise : 'Ajoutez un contact à votre prospection'}
      onClose={onClose}
      footer={
        <>
          {form.statut === 'converti' && (
            <button type="button" className="btn btn--success-soft footer-left" onClick={handleCreateInvoice}>
              <Icon name="invoice" size={16} /> Créer une facture
            </button>
          )}
          <button type="button" className="btn btn--ghost" onClick={onClose}>Annuler</button>
          <button type="submit" form="prospect-form" className="btn btn--primary">Enregistrer</button>
        </>
      }
    >
      <form id="prospect-form" className="form-grid" onSubmit={handleSubmit} noValidate>
        <Field label="Nom *" error={errors.nom}>
          <input value={form.nom} onChange={set('nom')} placeholder="Ex. Claire Martin" />
        </Field>
        <Field label="Entreprise *" error={errors.entreprise}>
          <input value={form.entreprise} onChange={set('entreprise')} placeholder="Ex. Bâtir Ouest SARL" />
        </Field>
        <Field label="Secteur">
          <input value={form.secteur} onChange={set('secteur')} placeholder="BTP, Santé, Immobilier…" list="secteurs" />
          <datalist id="secteurs">
            {['BTP', 'Hôtellerie', 'Santé', 'Automobile', 'Immobilier', 'Commerce', 'Restauration'].map((s) => (
              <option key={s} value={s} />
            ))}
          </datalist>
        </Field>
        <Field label="Canal">
          <select value={form.canal} onChange={set('canal')}>
            {CHANNELS.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </Field>
        <Field label="Statut">
          <select value={form.statut} onChange={set('statut')}>
            {PROSPECT_STATUSES.map((s) => <option key={s} value={s}>{PROSPECT_STATUS_LABELS[s]}</option>)}
          </select>
        </Field>
        <Field label="Date du dernier contact">
          <input type="date" value={form.dateContact} onChange={set('dateContact')} />
        </Field>
        <Field label="Notes" full>
          <textarea rows={4} value={form.notes} onChange={set('notes')} placeholder="Contexte, besoins, prochaines étapes…" />
        </Field>
      </form>
    </Modal>
  );
}

/** Champ de formulaire : label + contrôle + message d'erreur. */
export function Field({ label, error, full = false, hint, children }) {
  return (
    <label className={`field ${full ? 'field--full' : ''} ${error ? 'has-error' : ''}`}>
      <span className="field__label">{label}</span>
      {children}
      {error ? <span className="field__error">{error}</span> : hint && <span className="field__hint">{hint}</span>}
    </label>
  );
}
