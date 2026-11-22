/**
 * SCÈNE 1 — 0 → 6 s — « Révélation »
 * Noir total. Une fine ligne de lumière monte derrière le téléphone, vu de profil,
 * et dessine sa silhouette (tranche + bosse du plateau photo). Le studio s'allume
 * progressivement. Titre en fondu : « Pro. Poussé à l'extrême. »
 */
import { AbsoluteFill } from 'remotion';
import { t as i18n } from '../i18n';
import { easeSine, lerp, lerpV, lin, qe, seg, shot, window4 } from '../lib/shot';
import { RevealText } from '../ui/RevealText';
import type { OverlayProps, SceneDef } from './types';

export const REVEAL_ROT_END = -118;

export const scene01: SceneDef = {
  id: 'reveal',
  shot: (t, d) => {
    const p = seg(t, 0, d, easeSine);
    return shot({
      camPos: lerpV([0, 8, 410], [0, 4, 360], p),
      camTarget: [0, 2, 0],
      fov: 30,
      phoneQuat: qe(0, lerp(-96, REVEAL_ROT_END, p)),
      levitation: 0.6,
      envIntensity: 0.95 * seg(t, 1.4, d - 0.6, easeSine),
      keyIntensity: seg(t, 2.6, d - 0.4, easeSine),
      revealLine: lerp(-1.15, 1.15, seg(t, 0.35, 3.8, easeSine)),
      revealIntensity: window4(t, 0.25, 0.9, 3.4, 4.6),
      bloom: 1.5,
      // Premières images strictement noires
      blackout: 1 - lin(t, 0.05, 0.35),
    });
  },
  Overlay: ({ t, d, s, vertical }: OverlayProps) => (
    <AbsoluteFill
      style={{
        justifyContent: vertical ? 'flex-end' : 'center',
        alignItems: vertical ? 'center' : 'flex-start',
        paddingLeft: vertical ? 0 : 110 * s,
        paddingBottom: vertical ? 300 * s : 0,
      }}
    >
      <RevealText
        text={i18n.reveal.title}
        t={t}
        start={2.3}
        end={d - 1.1}
        stagger={0.22}
        wordDuration={0.8}
        s={s}
        fontSize={vertical ? 64 : 62}
        weight={200}
        letterSpacing={-0.02}
      />
    </AbsoluteFill>
  ),
};
