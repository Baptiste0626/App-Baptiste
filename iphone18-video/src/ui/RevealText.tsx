/**
 * Texte révélé mot par mot : chaque mot passe de flou (8 px) et transparent
 * à net, opacité 90 %. Piloté uniquement par le temps local `t` (secondes).
 */
import type { CSSProperties } from 'react';
import { clamp01, easeSine, seg } from '../lib/shot';
import { INTER, TEXT_COLOR } from './fonts';

export interface RevealTextProps {
  text: string;
  t: number;
  /** Début de l'apparition (s). */
  start: number;
  /** Début de la disparition (s), optionnel. */
  end?: number;
  /** Décalage entre deux mots (s). */
  stagger?: number;
  /** Durée d'apparition d'un mot (s). */
  wordDuration?: number;
  /** Échelle (1 = conçu pour 1080 px de petit côté). */
  s: number;
  fontSize: number;
  weight?: 200 | 300 | 500;
  letterSpacing?: number;
  style?: CSSProperties;
}

export const RevealText: React.FC<RevealTextProps> = ({
  text,
  t,
  start,
  end,
  stagger = 0.12,
  wordDuration = 0.55,
  s,
  fontSize,
  weight = 200,
  letterSpacing = -0.01,
  style,
}) => {
  const words = text.split(' ');
  const out = end === undefined ? 1 : 1 - seg(t, end, end + 0.5, easeSine);
  return (
    <div
      style={{
        fontFamily: INTER,
        fontWeight: weight,
        fontSize: fontSize * s,
        letterSpacing: `${letterSpacing}em`,
        color: TEXT_COLOR,
        whiteSpace: 'nowrap',
        lineHeight: 1.1,
        ...style,
      }}
    >
      {words.map((w, i) => {
        const p = clamp01((t - start - i * stagger) / wordDuration);
        const e = easeSine(p);
        const blurOut = (1 - out) * 6;
        return (
          <span
            key={i}
            style={{
              display: 'inline-block',
              opacity: e * out,
              filter: `blur(${((1 - e) * 8 + blurOut) * s}px)`,
              transform: `translateY(${(1 - e) * 6 * s}px)`,
              marginRight: i < words.length - 1 ? '0.28em' : 0,
            }}
          >
            {w}
          </span>
        );
      })}
    </div>
  );
};
