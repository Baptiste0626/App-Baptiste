/**
 * Paramètres : nom affiché, seuil de relance, devise + gestion des données.
 * Les modifications sont enregistrées via le bouton « Enregistrer ».
 */
import { useEffect, useState } from 'react';
import Icon from '../components/Icon';
import { Field } from '../components/ProspectModal';
import { CURRENCIES } from '../utils/constants';
import { formatMoney } from '../utils/format';

export default function Settings({ settings, onSave, onClearData }) {
  const [form, setForm] = useState(settings);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);

  // Resynchronise si les paramètres changent ailleurs (ex. réinitialisation)
  useEffect(() => setForm(settings), [settings]);

  // Masque la confirmation « Enregistré » après quelques secondes
  useEffect(() => {
    if (!saved) return undefined;
    const t = setTimeout(() => setSaved(false), 2500);
    return () => clearTimeout(t);
  }, [saved]);

  const dirty = JSON.stringify(form) !== JSON.stringify(settings);

  const handleSubmit = (e) => {
    e.preventDefault();
    const days = Number(form.followUpDays);
    if (!Number.isInteger(days) || days < 1 || days > 90) {
      setError('Le seuil doit être un nombre entier entre 1 et 90 jours.');
      return;
    }
    setError('');
    onSave({ userName: form.userName.trim() || 'Baptiste', followUpDays: days, currency: form.currency });
    setSaved(true);
  };

  return (
    <div className="page page--narrow">
      <form className="panel" onSubmit={handleSubmit}>
        <header className="panel__header">
          <h2 className="panel__title"><Icon name="settings" size={18} /> Préférences</h2>
        </header>
        <div className="form-grid">
          <Field label="Nom de l'utilisateur affiché" hint="Affiché dans la barre latérale avec son initiale." full>
            <input value={form.userName} onChange={(e) => setForm({ ...form, userName: e.target.value })} placeholder="Baptiste" />
          </Field>
          <Field label="Seuil avant relance (jours)" error={error} hint="Délai sans contact au-delà duquel une relance est due.">
            <input type="number" min="1" max="90" value={form.followUpDays}
              onChange={(e) => setForm({ ...form, followUpDays: e.target.value })} />
          </Field>
          <Field label="Devise" hint={`Aperçu : ${formatMoney(1250, form.currency)}`}>
            <select value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value })}>
              {Object.entries(CURRENCIES).map(([code, label]) => <option key={code} value={code}>{label}</option>)}
            </select>
          </Field>
        </div>
        <div className="form-actions">
          {saved && <span className="saved-note"><Icon name="check" size={16} /> Paramètres enregistrés</span>}
          <button type="button" className="btn btn--ghost" disabled={!dirty} onClick={() => { setForm(settings); setError(''); }}>
            Annuler
          </button>
          <button type="submit" className="btn btn--primary" disabled={!dirty}>Enregistrer</button>
        </div>
      </form>

      <section className="panel">
        <header className="panel__header">
          <h2 className="panel__title"><Icon name="inbox" size={18} /> Données</h2>
        </header>
        <p className="muted small">
          Vos données sont stockées uniquement dans ce navigateur (localStorage). Elles sont conservées
          entre les sessions mais ne sont pas synchronisées entre appareils.
        </p>
        <div className="form-actions form-actions--start">
          <button type="button" className="btn btn--danger-soft" onClick={onClearData}>Tout effacer</button>
        </div>
      </section>
    </div>
  );
}
