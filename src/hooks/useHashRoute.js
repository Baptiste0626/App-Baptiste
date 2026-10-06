/**
 * Routage minimaliste basé sur le hash de l'URL (#/prospects…).
 * Évite une dépendance à react-router et conserve la page au rechargement.
 */
import { useCallback, useEffect, useState } from 'react';
import { PAGES } from '../utils/constants';

const VALID = new Set(PAGES.map((p) => p.key));

function readHash() {
  const key = window.location.hash.replace(/^#\/?/, '');
  return VALID.has(key) ? key : 'dashboard';
}

export function useHashRoute() {
  const [page, setPage] = useState(readHash);

  useEffect(() => {
    const onChange = () => setPage(readHash());
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, []);

  const navigate = useCallback((key) => {
    window.location.hash = `/${key}`;
    window.scrollTo({ top: 0 });
  }, []);

  return [page, navigate];
}
