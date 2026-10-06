/**
 * Point d'entrée : monte l'application et charge les feuilles de style
 * dans l'ordre (variables/base → layout → composants → pages).
 */
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/base.css';
import './styles/layout.css';
import './styles/components.css';
import './styles/pages.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
