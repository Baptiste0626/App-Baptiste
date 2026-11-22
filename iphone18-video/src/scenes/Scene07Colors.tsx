/**
 * SCÈNE 7 — 48 → 55 s — « Coloris »
 * Le téléphone se redresse puis tourne d'un tour et demi ; il change de teinte
 * à chaque demi-tour (au moment où il est vu par la tranche) :
 * Noir → Argent → Glacier → Bordeaux. Le matériau est interpolé en continu.
 * Synchro audio : un whoosh à chaque changement (COLOR_SWITCH_TIMES).
 */
import { AbsoluteFill } from 'remotion';
import { COLORWAY_ORDER, COLORWAYS } from '../config';
import { t as i18n } from '../i18n';
import { colorwayLinear, easeSine, lerp, lerpV, qe, seg, shot, slerpQ, type Vec3 } from '../lib/shot';
import { INTER, TEXT_COLOR } from '../ui/fonts';
import { RevealText } from '../ui/RevealText';
import { scene06 } from './Scene06Edges';
import { sceneSeconds, type OverlayProps, type SceneDef } from './types';

const SPIN_START = 0.6;
const SPIN_END = 6.4;
const SPIN_DEG = 540;
const palette = COLORWAY_ORDER.map(colorwayLinear);

/** Angle de rotation (°) au temps t. */
const spinAngle = (t: number) => SPIN_DEG * seg(t, SPIN_START, SPIN_END, (x) => 0.5 - 0.5 * Math.cos(Math.PI * x));

/** Indice de couleur continu (0 → 3) : bascule centrée sur 90°, 270°, 450°. */
export const colorIndex = (t: number) => {
  const a = spinAngle(t);
  let c = 0;
  for (let k = 1; k <= 3; k++) {
    const center = 180 * k - 90;
    c += seg(a, center - 55, center + 55, easeSine);
  }
  return c;
};

/** Instants (s, local) où le coloris bascule : pour les marqueurs audio. */
export const COLOR_SWITCH_TIMES = [1, 2, 3].map((k) => {
  // Recherche numérique de l'instant où l'angle atteint 180k - 90
  let lo = SPIN_START;
  let hi = SPIN_END;
  for (let i = 0; i < 40; i++) {
    const mid = (lo + hi) / 2;
    if (spinAngle(mid) < 180 * k - 90) lo = mid;
    else hi = mid;
  }
  return lo;
});

const colorAt = (c: number): { aluminium: Vec3; backGlass: Vec3 } => {
  const i = Math.min(Math.floor(c), palette.length - 2);
  const f = c - i;
  return {
    aluminium: lerpV(palette[i].aluminium, palette[i + 1].aluminium, f),
    backGlass: lerpV(palette[i].backGlass, palette[i + 1].backGlass, f),
  };
};

export const scene07: SceneDef = {
  id: 'colors',
  shot: (t) => {
    const d6 = sceneSeconds('edges');
    const prev = scene06.shot(d6, d6);
    const entry = seg(t, -0.6, 1.4);

    const spinQ = qe(-6, spinAngle(t));
    const phoneQuat = slerpQ(prev.phoneQuat, spinQ, entry);

    // Couleur : depuis le coloris actif vers Noir pendant l'entrée, puis cycle
    const cyc = colorAt(colorIndex(t));
    const toFirst = seg(t, -0.2, 0.9, easeSine);
    return shot({
      camPos: lerpV(prev.camPos, [0, 10, 370], entry),
      camTarget: lerpV(prev.camTarget, [0, 0, 0], entry),
      fov: 30,
      phoneQuat,
      levitation: lerp(0.15, 1, entry),
      aluminium: lerpV(prev.aluminium, cyc.aluminium, toFirst),
      backGlass: lerpV(prev.backGlass, cyc.backGlass, toFirst),
      dofFocus: prev.dofFocus,
      dofRange: lerp(prev.dofRange, 400, entry),
      bokeh: lerp(prev.bokeh, 0, entry),
      sweep: lerp(-1.2, 1.2, seg(t, 2.2, 5.6, easeSine)),
      sweepIntensity: Math.min(seg(t, 2.2, 2.9, easeSine), 1 - seg(t, 4.9, 5.6, easeSine)) * 0.8,
      shadow: seg(t, 0.6, 1.8, easeSine),
      bloom: 1,
      envIntensity: lerp(1.25, 1.6, entry),
      frontLight: lerp(0.9, 0.55, entry),
      keyIntensity: 1.4,
    });
  },
  Overlay: ({ t, d, s, vertical }: OverlayProps) => {
    const c = colorIndex(t);
    return (
      <AbsoluteFill style={{ justifyContent: 'flex-end', alignItems: 'center', paddingBottom: (vertical ? 260 : 110) * s }}>
        <RevealText text={i18n.colors.caption} t={t} start={0.9} end={d - 0.9} s={s} fontSize={40} weight={200} />
        <div style={{ position: 'relative', height: 40 * s, width: 600 * s, marginTop: 14 * s }}>
          {COLORWAY_ORDER.map((id, i) => {
            const o = Math.max(0, 1 - Math.abs(c - i) * 1.6) * seg(t, 1.0, 1.6) * (1 - seg(t, d - 0.9, d - 0.4));
            return (
              <div
                key={id}
                style={{
                  position: 'absolute',
                  inset: 0,
                  textAlign: 'center',
                  fontFamily: INTER,
                  fontWeight: 500,
                  fontSize: 26 * s,
                  letterSpacing: '0.18em',
                  textTransform: 'uppercase',
                  color: TEXT_COLOR,
                  opacity: o,
                  filter: `blur(${(1 - o) * 6 * s}px)`,
                }}
              >
                {COLORWAYS[id].label}
              </div>
            );
          })}
        </div>
      </AbsoluteFill>
    );
  },
};
