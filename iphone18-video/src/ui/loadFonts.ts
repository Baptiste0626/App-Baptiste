/**
 * Chargement de la police Inter, embarquée localement (@fontsource/inter, licence SIL OFL) :
 * aucun accès réseau pendant le rendu → résultat identique sur toutes les machines.
 * Le rendu Remotion attend (delayRender) que les trois graisses soient chargées.
 * Importé uniquement par Root.tsx (le script de vérification Node ne le charge pas).
 */
import inter200 from '@fontsource/inter/files/inter-latin-200-normal.woff2';
import inter300 from '@fontsource/inter/files/inter-latin-300-normal.woff2';
import inter500 from '@fontsource/inter/files/inter-latin-500-normal.woff2';
import { continueRender, delayRender } from 'remotion';
import { INTER } from './fonts';

if (typeof document !== 'undefined' && typeof FontFace !== 'undefined') {
  const handle = delayRender('Chargement de la police Inter');
  const faces = [
    new FontFace(INTER, `url(${inter200}) format('woff2')`, { weight: '200' }),
    new FontFace(INTER, `url(${inter300}) format('woff2')`, { weight: '300' }),
    new FontFace(INTER, `url(${inter500}) format('woff2')`, { weight: '500' }),
  ];
  Promise.all(faces.map((f) => f.load()))
    .then((loaded) => loaded.forEach((f) => document.fonts.add(f)))
    .catch((e) => console.error('Police Inter introuvable', e))
    .finally(() => continueRender(handle));
}
