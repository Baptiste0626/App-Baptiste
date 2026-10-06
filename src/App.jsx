/**
 * Composant racine :
 * - détient l'état global (useAppStore) et la page courante (hash),
 * - affiche la sidebar, la topbar et la page active,
 * - centralise les modales (prospect, paiement, confirmation) afin
 *   qu'elles puissent être ouvertes depuis n'importe quelle page.
 */
import { useCallback, useMemo, useState } from 'react';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import Icon from './components/Icon';
import ProspectModal from './components/ProspectModal';
import PaymentModal from './components/PaymentModal';
import ConfirmDialog from './components/ConfirmDialog';
import Dashboard from './pages/Dashboard';
import Tasks from './pages/Tasks';
import Prospects from './pages/Prospects';
import Pipeline from './pages/Pipeline';
import Payments from './pages/Payments';
import Settings from './pages/Settings';
import { useAppStore } from './hooks/useAppStore';
import { useHashRoute } from './hooks/useHashRoute';
import { getDueFollowUps, getLatePayments } from './utils/business';
import { PAGES } from './utils/constants';

const SUBTITLES = {
  dashboard: "Vue d'ensemble de votre activité",
  taches: 'Relances à effectuer',
  prospects: 'Tous vos contacts commerciaux',
  pipeline: 'Suivez l’avancement de chaque opportunité',
  paiements: 'Factures et encaissements',
  parametres: "Personnalisez l'application",
};

export default function App() {
  const [state, dispatch] = useAppStore();
  const { prospects, payments, settings } = state;
  const [page, navigate] = useHashRoute();
  const [drawerOpen, setDrawerOpen] = useState(false);
  // Modale active : { kind: 'prospect' | 'payment' | 'confirm', data }
  const [modal, setModal] = useState(null);

  const closeModal = useCallback(() => setModal(null), []);

  /* ---------- Actions ---------- */
  const openProspect = (prospect) => setModal({ kind: 'prospect', data: prospect });
  const openPayment = (payment) => setModal({ kind: 'payment', data: payment });

  /** Ouvre une facture pré-remplie à partir d'un prospect converti. */
  const createInvoiceFor = (prospect) => {
    navigate('paiements');
    setModal({ kind: 'payment', data: { prospectId: prospect.id, client: prospect.entreprise } });
  };

  const askDeleteProspect = (p) =>
    setModal({
      kind: 'confirm',
      data: {
        title: 'Supprimer ce prospect ?',
        message: `« ${p.nom} » (${p.entreprise}) sera définitivement supprimé. Ses factures éventuelles seront conservées.`,
        onConfirm: () => dispatch({ type: 'prospect/delete', id: p.id }),
      },
    });

  const askDeletePayment = (f) =>
    setModal({
      kind: 'confirm',
      data: {
        title: 'Supprimer cette facture ?',
        message: `La facture ${f.reference || ''} de « ${f.client} » sera définitivement supprimée.`,
        onConfirm: () => dispatch({ type: 'payment/delete', id: f.id }),
      },
    });

  const askResetDemo = () =>
    setModal({
      kind: 'confirm',
      data: {
        title: 'Recharger les données de démo ?',
        message: 'Toutes vos données actuelles seront remplacées par le jeu de démonstration.',
        confirmLabel: 'Recharger',
        danger: false,
        onConfirm: () => dispatch({ type: 'data/resetDemo' }),
      },
    });

  const askClearData = () =>
    setModal({
      kind: 'confirm',
      data: {
        title: 'Tout effacer ?',
        message: 'Tous les prospects et paiements seront supprimés. Vos paramètres sont conservés.',
        confirmLabel: 'Tout effacer',
        onConfirm: () => dispatch({ type: 'data/clear' }),
      },
    });

  const markFollowedUp = (id) => dispatch({ type: 'prospect/markFollowedUp', id });
  const changeStatus = (id, statut) => dispatch({ type: 'prospect/status', id, statut });

  const handleNavigate = (key) => {
    navigate(key);
    setDrawerOpen(false);
  };

  /* ---------- Compteurs de la sidebar ---------- */
  const counters = useMemo(
    () => ({
      taches: getDueFollowUps(prospects, settings.followUpDays).length,
      paiements: getLatePayments(payments).length,
    }),
    [prospects, payments, settings.followUpDays],
  );

  /* ---------- Action principale de la topbar ---------- */
  const newProspectBtn = (
    <button className="btn btn--primary" onClick={() => openProspect(null)}>
      <Icon name="plus" size={16} /> <span className="hide-xs">Nouveau prospect</span>
    </button>
  );
  const topbarAction = {
    dashboard: newProspectBtn,
    prospects: newProspectBtn,
    pipeline: newProspectBtn,
    paiements: (
      <button className="btn btn--primary" onClick={() => openPayment(null)}>
        <Icon name="plus" size={16} /> <span className="hide-xs">Nouvelle facture</span>
      </button>
    ),
  }[page];

  /* ---------- Page active ---------- */
  const shared = { prospects, payments, settings };
  let content;
  switch (page) {
    case 'taches':
      content = <Tasks {...shared} onMarkFollowedUp={markFollowedUp} onOpenProspect={openProspect} />;
      break;
    case 'prospects':
      content = (
        <Prospects {...shared} onOpenProspect={openProspect} onDeleteProspect={askDeleteProspect} onCreateInvoice={createInvoiceFor} />
      );
      break;
    case 'pipeline':
      content = <Pipeline {...shared} onChangeStatus={changeStatus} onOpenProspect={openProspect} />;
      break;
    case 'paiements':
      content = <Payments {...shared} onOpenPayment={openPayment} onDeletePayment={askDeletePayment} />;
      break;
    case 'parametres':
      content = (
        <Settings
          settings={settings}
          onSave={(payload) => dispatch({ type: 'settings/update', payload })}
          onResetDemo={askResetDemo}
          onClearData={askClearData}
        />
      );
      break;
    default:
      content = (
        <Dashboard {...shared} onNavigate={handleNavigate} onMarkFollowedUp={markFollowedUp}
          onOpenProspect={openProspect} onOpenPayment={openPayment} />
      );
  }

  const pageLabel = PAGES.find((p) => p.key === page)?.label;

  return (
    <div className="app">
      <Sidebar
        page={page}
        onNavigate={handleNavigate}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        userName={settings.userName}
        counters={counters}
      />

      <div className="main">
        <Topbar title={pageLabel} subtitle={SUBTITLES[page]} onMenu={() => setDrawerOpen(true)} action={topbarAction} />
        <main className="content">{content}</main>
      </div>

      {/* ---------- Modales ---------- */}
      {modal?.kind === 'prospect' && (
        <ProspectModal
          // la key force un formulaire neuf à chaque ouverture
          key={modal.data?.id || 'new'}
          prospect={modal.data}
          onClose={closeModal}
          onSave={(p) => {
            dispatch({ type: 'prospect/save', payload: p });
            closeModal();
          }}
          onCreateInvoice={(p) => {
            dispatch({ type: 'prospect/save', payload: p });
            createInvoiceFor(p);
          }}
        />
      )}

      {modal?.kind === 'payment' && (
        <PaymentModal
          key={modal.data?.id || `new-${modal.data?.prospectId || ''}`}
          payment={modal.data}
          prospects={prospects}
          currency={settings.currency}
          onClose={closeModal}
          onSave={(f) => {
            dispatch({ type: 'payment/save', payload: f });
            closeModal();
          }}
        />
      )}

      {modal?.kind === 'confirm' && (
        <ConfirmDialog
          {...modal.data}
          onCancel={closeModal}
          onConfirm={() => {
            modal.data.onConfirm();
            closeModal();
          }}
        />
      )}
    </div>
  );
}
