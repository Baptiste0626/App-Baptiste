/**
 * Données de démonstration. Les dates sont calculées relativement au
 * jour du premier lancement pour que le tableau de bord reste parlant
 * (relances dues, factures en retard, etc.).
 */
import { addDays, todayISO } from './dates';
import { DEFAULT_SETTINGS } from './constants';

export function createDemoData() {
  const t = todayISO();
  const d = (offset) => addDays(t, offset);

  const prospects = [
    {
      id: 'p_demo1',
      nom: 'Claire Martin',
      entreprise: 'Bâtir Ouest SARL',
      secteur: 'BTP',
      canal: 'LinkedIn',
      statut: 'converti',
      dateContact: d(-34),
      notes: 'Contrat signé pour la refonte du site vitrine + module devis.',
    },
    {
      id: 'p_demo2',
      nom: 'Julien Moreau',
      entreprise: 'Hôtel Les Embruns',
      secteur: 'Hôtellerie',
      canal: 'Email',
      statut: 'relancé',
      dateContact: d(-9),
      notes: 'Intéressé par un système de réservation directe. Relancé une fois.',
    },
    {
      id: 'p_demo3',
      nom: 'Dr Sophie Lefèvre',
      entreprise: 'Cabinet Médical Saint-Roch',
      secteur: 'Santé',
      canal: 'Téléphone',
      statut: 'rdv_pris',
      dateContact: d(-2),
      notes: 'RDV au cabinet jeudi prochain à 14h — prise de RDV en ligne.',
    },
    {
      id: 'p_demo4',
      nom: 'Karim Benali',
      entreprise: 'Garage Benali Automobiles',
      secteur: 'Automobile',
      canal: 'Autre',
      statut: 'converti',
      dateContact: d(-58),
      notes: 'Rencontré au salon auto. Maintenance mensuelle + campagne Google Ads.',
    },
    {
      id: 'p_demo5',
      nom: 'Isabelle Roux',
      entreprise: 'Roux Immobilier',
      secteur: 'Immobilier',
      canal: 'LinkedIn',
      statut: 'contacté',
      dateContact: d(-7),
      notes: 'Premier message envoyé, a consulté le portfolio.',
    },
    {
      id: 'p_demo6',
      nom: 'Thomas Girard',
      entreprise: 'Résidence Les Pins',
      secteur: 'Immobilier',
      canal: 'Email',
      statut: 'à_contacter',
      dateContact: d(-1),
      notes: 'Recommandé par Claire Martin.',
    },
    {
      id: 'p_demo7',
      nom: 'Nadia Chevalier',
      entreprise: 'Clinique Vétérinaire du Parc',
      secteur: 'Santé',
      canal: 'Téléphone',
      statut: 'perdu',
      dateContact: d(-41),
      notes: 'Budget reporté à l’année prochaine. À recontacter en janvier.',
    },
    {
      id: 'p_demo8',
      nom: 'Marc Dubois',
      entreprise: 'Dubois Construction',
      secteur: 'BTP',
      canal: 'Email',
      statut: 'converti',
      dateContact: d(-21),
      notes: 'Application de suivi de chantier.',
    },
  ];

  const payments = [
    {
      id: 'f_demo1',
      prospectId: 'p_demo1',
      client: 'Bâtir Ouest SARL',
      montant: 2400,
      statut: 'payé',
      dateFacture: d(-30),
      dateEcheance: d(0),
      datePaiement: d(-12),
      moyenPaiement: 'Virement',
      reference: 'FAC-2026-001',
      notes: 'Acompte 50 % refonte du site.',
    },
    {
      id: 'f_demo2',
      prospectId: 'p_demo1',
      client: 'Bâtir Ouest SARL',
      montant: 2400,
      statut: 'en_attente',
      dateFacture: d(-3),
      dateEcheance: d(27),
      datePaiement: null,
      moyenPaiement: 'Virement',
      reference: 'FAC-2026-004',
      notes: 'Solde à la mise en ligne.',
    },
    {
      id: 'f_demo3',
      prospectId: 'p_demo4',
      client: 'Garage Benali Automobiles',
      montant: 890,
      statut: 'en_retard',
      dateFacture: d(-45),
      dateEcheance: d(-15),
      datePaiement: null,
      moyenPaiement: 'Chèque',
      reference: 'FAC-2026-002',
      notes: 'Relance envoyée par email.',
    },
    {
      id: 'f_demo4',
      prospectId: 'p_demo4',
      client: 'Garage Benali Automobiles',
      montant: 350,
      statut: 'payé',
      dateFacture: d(-55),
      dateEcheance: d(-25),
      datePaiement: d(-27),
      moyenPaiement: 'CB',
      reference: 'FAC-2026-000',
      notes: 'Audit SEO initial.',
    },
    {
      id: 'f_demo5',
      prospectId: 'p_demo8',
      client: 'Dubois Construction',
      montant: 3600,
      statut: 'en_attente',
      dateFacture: d(-18),
      dateEcheance: d(-4),
      datePaiement: null,
      moyenPaiement: 'Virement',
      reference: 'FAC-2026-003',
      notes: 'Échéance dépassée : passe automatiquement « en retard ».',
    },
  ];

  return { prospects, payments, settings: { ...DEFAULT_SETTINGS } };
}
