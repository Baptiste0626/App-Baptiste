/**
 * Logo de l'application : monogramme « B » géométrique sur un carré
 * arrondi noir. La boucle haute (blanche) évoque la prospection, la
 * boucle basse (dégradé bleu) les paiements — les deux moitiés du métier.
 * SVG inline : net à toutes les tailles, sans fichier image.
 */
import { useId } from 'react';

export default function Logo({ size = 38, className = '' }) {
  // Identifiants uniques pour les dégradés (plusieurs logos sur la page)
  const uid = useId().replace(/:/g, '');
  const bg = `logo-bg-${uid}`;
  const accent = `logo-accent-${uid}`;

  return (
    <svg
      className={`logo ${className}`}
      width={size}
      height={size}
      viewBox="0 0 32 32"
      role="img"
      aria-label="Baptiste"
    >
      <defs>
        <linearGradient id={bg} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#1c1f2b" />
          <stop offset="1" stopColor="#05060a" />
        </linearGradient>
        <linearGradient id={accent} x1="0" y1="1" x2="1" y2="0">
          <stop offset="0" stopColor="#2f6fed" />
          <stop offset="1" stopColor="#7cb0ff" />
        </linearGradient>
      </defs>
      <rect width="32" height="32" rx="9" fill={`url(#${bg})`} />
      {/* Boucle basse (paiements) dessinée d'abord, sous le fût blanc */}
      <path
        d="M11 15.5h6a4.25 4.25 0 0 1 0 8.5h-6"
        fill="none"
        stroke={`url(#${accent})`}
        strokeWidth="3.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Fût + boucle haute (prospection) */}
      <path
        d="M11 24V8h5a3.75 3.75 0 0 1 0 7.5h-5"
        fill="none"
        stroke="#ffffff"
        strokeWidth="3.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
