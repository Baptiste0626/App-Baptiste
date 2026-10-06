/**
 * Store global de l'application : useReducer + persistance localStorage.
 *
 * Tout l'état (prospects, paiements, paramètres) vit dans App, au-dessus
 * des pages : changer de vue ne démonte donc jamais les données, et chaque
 * modification est immédiatement sauvegardée.
 */
import { useEffect, useReducer } from 'react';
import { createDemoData } from '../utils/demoData';
import { DEFAULT_SETTINGS } from '../utils/constants';
import { computePaymentStatus } from '../utils/business';
import { todayISO } from '../utils/dates';
import { uid } from '../utils/format';

const STORAGE_KEY = 'baptiste:data:v1';

/** Charge l'état depuis localStorage, ou les données de démo au 1er lancement. */
function loadInitialState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const saved = JSON.parse(raw);
      return {
        prospects: Array.isArray(saved.prospects) ? saved.prospects : [],
        payments: Array.isArray(saved.payments) ? saved.payments : [],
        settings: { ...DEFAULT_SETTINGS, ...(saved.settings || {}) },
      };
    }
  } catch {
    // JSON corrompu ou stockage indisponible : on repart des données de démo
  }
  return createDemoData();
}

/** Nettoie / complète un paiement avant enregistrement. */
function preparePayment(payment) {
  const clean = {
    ...payment,
    montant: Number(payment.montant) || 0,
    datePaiement: payment.datePaiement || null,
  };
  // Statut recalculé automatiquement (payé / en retard selon les dates)
  clean.statut = computePaymentStatus(clean);
  // Une facture marquée payée sans date reçoit la date du jour
  if (clean.statut === 'payé' && !clean.datePaiement) clean.datePaiement = todayISO();
  return clean;
}

function reducer(state, action) {
  switch (action.type) {
    /* ---------- Prospects ---------- */
    case 'prospect/save': {
      const p = action.payload;
      if (p.id && state.prospects.some((x) => x.id === p.id)) {
        return { ...state, prospects: state.prospects.map((x) => (x.id === p.id ? { ...x, ...p } : x)) };
      }
      return { ...state, prospects: [{ ...p, id: p.id || uid('p') }, ...state.prospects] };
    }
    case 'prospect/delete':
      return {
        ...state,
        prospects: state.prospects.filter((p) => p.id !== action.id),
        // Les factures sont conservées mais détachées du prospect supprimé
        payments: state.payments.map((f) => (f.prospectId === action.id ? { ...f, prospectId: null } : f)),
      };
    case 'prospect/status':
      return {
        ...state,
        prospects: state.prospects.map((p) => (p.id === action.id ? { ...p, statut: action.statut } : p)),
      };
    case 'prospect/markFollowedUp':
      return {
        ...state,
        prospects: state.prospects.map((p) =>
          p.id === action.id ? { ...p, statut: 'relancé', dateContact: todayISO() } : p,
        ),
      };

    /* ---------- Paiements ---------- */
    case 'payment/save': {
      const f = preparePayment(action.payload);
      if (f.id && state.payments.some((x) => x.id === f.id)) {
        return { ...state, payments: state.payments.map((x) => (x.id === f.id ? f : x)) };
      }
      return { ...state, payments: [{ ...f, id: f.id || uid('f') }, ...state.payments] };
    }
    case 'payment/delete':
      return { ...state, payments: state.payments.filter((f) => f.id !== action.id) };

    /* ---------- Paramètres & données ---------- */
    case 'settings/update':
      return { ...state, settings: { ...state.settings, ...action.payload } };
    case 'data/resetDemo':
      return createDemoData();
    case 'data/clear':
      return { prospects: [], payments: [], settings: state.settings };

    default:
      return state;
  }
}

export function useAppStore() {
  const [state, dispatch] = useReducer(reducer, undefined, loadInitialState);

  // Sauvegarde automatique à chaque changement d'état
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Quota dépassé ou navigation privée : l'app reste utilisable en mémoire
    }
  }, [state]);

  return [state, dispatch];
}
