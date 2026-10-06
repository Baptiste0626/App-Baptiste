/**
 * Modale d'ajout / d'édition d'une facture / d'un paiement.
 * - Validation minimale : client et montant (> 0) obligatoires.
 * - Statut calculé automatiquement : « en retard » si l'échéance est
 *   dépassée sans paiement, « payé » dès qu'une date de paiement existe.
 */
import { useMemo, useState } from 'react';
import Modal from './Modal';
import { Field } from './ProspectModal';
import { PaymentStatusBadge } from './Badge';
import { PAYMENT_METHODS, PAYMENT_STATUSES, PAYMENT_STATUS_LABELS } from '../utils/constants';
import { computePaymentStatus } from '../utils/business';
import { addDays, todayISO } from '../utils/dates';

const EMPTY = {
  prospectId: '',
  client: '',
  montant: '',
  statut: 'en_attente',
  dateFacture: '',
  dateEcheance: '',
  datePaiement: '',
  moyenPaiement: 'Virement',
  reference: '',
  notes: '',
};

export default function PaymentModal({ payment, prospects, currency, onSave, onClose }) {
  const isEdit = Boolean(payment?.id);
  const [form, setForm] = useState(() => {
    const today = todayISO();
    return {
      ...EMPTY,
      dateFacture: today,
      dateEcheance: addDays(today, 30),
      ...payment,
      prospectId: payment?.prospectId ?? '',
      datePaiement: payment?.datePaiement ?? '',
      montant: payment?.montant ?? '',
    };
  });
  const [errors, setErrors] = useState({});

  // Seuls les prospects convertis peuvent être liés à une facture
  const convertedProspects = useMemo(() => prospects.filter((p) => p.statut === 'converti'), [prospects]);

  // Statut tel qu'il sera enregistré (aperçu en temps réel)
  const effectiveStatus = computePaymentStatus(form);

  const update = (patch) => {
    setForm((f) => ({ ...f, ...patch }));
    setErrors((err) => {
      const next = { ...err };
      Object.keys(patch).forEach((k) => delete next[k]);
      return next;
    });
  };

  const handleChange = (field) => (e) => {
    const value = e.target.value;
    if (field === 'statut') {
      // Passer à « payé » renseigne la date du jour ; quitter « payé » l'efface
      return update({
        statut: value,
        datePaiement: value === 'payé' ? form.datePaiement || todayISO() : '',
      });
    }
    if (field === 'datePaiement') {
      return update({ datePaiement: value, statut: value ? 'payé' : form.statut === 'payé' ? 'en_attente' : form.statut });
    }
    if (field === 'prospectId') {
      // Lier un prospect pré-remplit le client avec son entreprise
      const linked = prospects.find((p) => p.id === value);
      return update({ prospectId: value, ...(linked ? { client: linked.entreprise } : {}) });
    }
    return update({ [field]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const next = {};
    if (!String(form.client).trim()) next.client = 'Le client est obligatoire.';
    const amount = Number(String(form.montant).replace(',', '.'));
    if (!form.montant || Number.isNaN(amount) || amount <= 0) next.montant = 'Indiquez un montant valide.';
    if (form.dateFacture && form.dateEcheance && form.dateEcheance < form.dateFacture) {
      next.dateEcheance = "L'échéance doit suivre la date de facture.";
    }
    setErrors(next);
    if (Object.keys(next).length) return;

    onSave({
      ...form,
      client: form.client.trim(),
      reference: form.reference.trim(),
      notes: form.notes.trim(),
      montant: amount,
      prospectId: form.prospectId || null,
      datePaiement: form.datePaiement || null,
      statut: effectiveStatus,
    });
  };

  const autoNote =
    effectiveStatus !== form.statut
      ? effectiveStatus === 'en_retard'
        ? 'Échéance dépassée sans paiement : la facture sera enregistrée « en retard ».'
        : effectiveStatus === 'en_attente'
          ? 'Échéance non dépassée : la facture sera enregistrée « en attente ».'
          : null
      : null;

  return (
    <Modal
      title={isEdit ? 'Modifier la facture' : 'Nouvelle facture'}
      subtitle={form.client || 'Suivi de facturation et d’encaissement'}
      onClose={onClose}
      size="lg"
      footer={
        <>
          <span className="footer-left footer-status">
            Statut enregistré : <PaymentStatusBadge statut={effectiveStatus} />
          </span>
          <button type="button" className="btn btn--ghost" onClick={onClose}>Annuler</button>
          <button type="submit" form="payment-form" className="btn btn--primary">Enregistrer</button>
        </>
      }
    >
      <form id="payment-form" className="form-grid" onSubmit={handleSubmit} noValidate>
        <Field label="Prospect lié (converti)">
          <select value={form.prospectId} onChange={handleChange('prospectId')}>
            <option value="">— Aucun —</option>
            {convertedProspects.map((p) => (
              <option key={p.id} value={p.id}>{p.entreprise} · {p.nom}</option>
            ))}
          </select>
        </Field>
        <Field label="Client *" error={errors.client}>
          <input value={form.client} onChange={handleChange('client')} placeholder="Raison sociale" />
        </Field>
        <Field label={`Montant (${currency}) *`} error={errors.montant}>
          <input type="number" min="0" step="0.01" inputMode="decimal" value={form.montant} onChange={handleChange('montant')} placeholder="0,00" />
        </Field>
        <Field label="Référence">
          <input value={form.reference} onChange={handleChange('reference')} placeholder="FAC-2026-005" />
        </Field>
        <Field label="Statut" hint={autoNote} >
          <select value={form.statut} onChange={handleChange('statut')}>
            {PAYMENT_STATUSES.map((s) => <option key={s} value={s}>{PAYMENT_STATUS_LABELS[s]}</option>)}
          </select>
        </Field>
        <Field label="Moyen de paiement">
          <select value={form.moyenPaiement} onChange={handleChange('moyenPaiement')}>
            {PAYMENT_METHODS.map((m) => <option key={m} value={m}>{m}</option>)}
          </select>
        </Field>
        <Field label="Date de facture">
          <input type="date" value={form.dateFacture} onChange={handleChange('dateFacture')} />
        </Field>
        <Field label="Date d'échéance" error={errors.dateEcheance}>
          <input type="date" value={form.dateEcheance} onChange={handleChange('dateEcheance')} />
        </Field>
        <Field label="Date de paiement" hint="Renseigner une date marque la facture comme payée.">
          <input type="date" value={form.datePaiement} onChange={handleChange('datePaiement')} />
        </Field>
        <Field label="Notes" full>
          <textarea rows={3} value={form.notes} onChange={handleChange('notes')} placeholder="Conditions, relances, remarques…" />
        </Field>
      </form>
    </Modal>
  );
}
