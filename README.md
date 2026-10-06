# Baptiste — Prospection & Paiements

Application web de suivi de prospection commerciale et des paiements clients.
React 18 + Vite, CSS pur, état local (`useReducer`) persisté dans `localStorage`.

## Lancer le projet

```bash
npm install && npm run dev
```

Puis ouvrir http://localhost:5173.

| Commande          | Rôle                                   |
| ----------------- | -------------------------------------- |
| `npm run dev`     | Serveur de développement (hot reload)  |
| `npm run build`   | Build de production dans `dist/`       |
| `npm run preview` | Prévisualise le build de production    |

## Fonctionnalités

- **Dashboard** : 6 indicateurs (prospects en cours, taux de conversion, relances en retard, total prospects, CA encaissé, montant en attente), relances à faire, factures en retard, derniers contacts.
- **Tâches** : relances dues (seuil configurable) avec « Marquer relancé » (statut → relancé, date de contact → aujourd'hui), relances à venir, premiers contacts.
- **Prospects** : tableau avec recherche nom/entreprise, filtre par statut, édition en modale, suppression avec confirmation, « Créer une facture » pour les prospects convertis.
- **Pipeline** : kanban par statut, glisser-déposer natif HTML5 (+ sélecteur de statut sur chaque carte pour les écrans tactiles).
- **Paiements** : récapitulatif (facturé / encaissé / en attente / en retard), tableau filtrable ; statut « en retard » calculé automatiquement si l'échéance est dépassée sans paiement.
- **Paramètres** : nom affiché dans la sidebar, seuil de relance, devise ; tout effacer.

## Structure

```
src/
├── App.jsx                 # Racine : état global, routage, modales
├── main.jsx                # Point d'entrée + import des styles
├── components/             # Composants réutilisables
│   ├── Badge.jsx           # Badge + badges de statut prospect/paiement
│   ├── ConfirmDialog.jsx
│   ├── EmptyState.jsx
│   ├── Icon.jsx            # Icônes SVG inline
│   ├── Logo.jsx            # Logo « B » (SVG inline)
│   ├── Modal.jsx
│   ├── PaymentModal.jsx
│   ├── ProspectModal.jsx   # (+ composant Field partagé)
│   ├── Sidebar.jsx
│   ├── StatCard.jsx
│   └── Topbar.jsx
├── hooks/
│   ├── useAppStore.js      # useReducer + persistance localStorage
│   └── useHashRoute.js     # Routage par hash (#/prospects…)
├── pages/                  # Dashboard, Tasks, Prospects, Pipeline, Payments, Settings
├── styles/                 # base (variables), layout, components, pages
└── utils/
    ├── business.js         # Règles métier pures (relances, statuts, totaux)
    ├── constants.js        # Statuts, libellés, options
    ├── dates.js            # Helpers de dates ISO (heure locale)
    └── format.js           # Montants, identifiants, recherche
```

## Notes

- Les données sont stockées sous la clé `baptiste:data:v1` du `localStorage`. L'application démarre vide ; *Paramètres → Tout effacer* permet de repartir de zéro.
- Écran d'accueil iPhone/iPad : icône `public/icons/apple-touch-icon.png` (180×180) + `manifest.webmanifest`. Après un changement d'icône, supprimer l'ancien raccourci puis refaire *Partager → Sur l'écran d'accueil* (iOS met l'icône en cache).
- Responsive : sidebar fixe à partir de 860px, tiroir avec overlay en dessous ; les tableaux deviennent des cartes et les modales des « bottom sheets » sur mobile.
