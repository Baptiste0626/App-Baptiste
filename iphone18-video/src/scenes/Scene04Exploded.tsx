/**
 * SCÈNE 4 — 24 → 32 s — « Vue éclatée »
 * Retour depuis le noir. Les six couches se séparent sur l'axe Z (ressort),
 * la caméra tourne lentement, puis l'ensemble se recompose avec un léger rebond.
 * La fin de la scène ramène la face avant vers la caméra (enchaînement scène 5).
 * Synchro audio : impact grave au début de l'ouverture (EXPLODE_START).
 */
import { AbsoluteFill, spring } from 'remotion';
import { ANIMATION, VIDEO } from '../config';
import { t as i18n } from '../i18n';
import { easeSine, lerp, lerpV, qe, seg, shot, slerpQ } from '../lib/shot';
import { EXPLODE_OFFSETS } from '../phone/Phone';
import { PHONE } from '../config';
import { Annotation } from '../ui/Annotation';
import type { OverlayProps, SceneDef } from './types';

/** Instants clés (s, temps local). */
export const EXPLODE_START = 1.0;
const RECOMPOSE_START = 4.9;
const TURN_TO_FRONT = 6.3;

const springAt = (t: number, from: number) =>
  spring({
    frame: Math.max(0, Math.round((t - from) * VIDEO.fps)),
    fps: VIDEO.fps,
    config: ANIMATION.spring,
  });

export const scene04: SceneDef = {
  id: 'exploded',
  shot: (t, d) => {
    // Ouverture : ressort avec léger dépassement ; recomposition : rebond « clac »
    const open = springAt(t, EXPLODE_START);
    const close = springAt(t, RECOMPOSE_START);
    const explode = t < RECOMPOSE_START ? open : Math.abs(1 - close) * (close > 1 ? 0.35 : 1);

    const turn = seg(t, TURN_TO_FRONT, d);
    const q3q = qe(lerp(-14, -8, seg(t, 0, TURN_TO_FRONT)), lerp(62, 74, seg(t, 0, TURN_TO_FRONT, easeSine)));
    const phoneQuat = slerpQ(q3q, qe(0, 12), turn);

    const camA = lerpV([-14, 58, 360], [16, 40, 335], seg(t, 0, TURN_TO_FRONT, easeSine));
    return shot({
      camPos: lerpV(camA, [0, 0, 380], turn),
      camTarget: lerpV([0, -4, 0], [0, 0, 0], turn),
      fov: 30,
      phoneQuat,
      explode,
      // L'écran s'allume faiblement quand il est séparé : la couche « écran » devient lisible
      screen: 0.55 * Math.min(1, Math.max(0, explode)),
      levitation: lerp(0.4, 1, turn),
      shadow: 0,
      sweep: lerp(-1.2, 1.2, seg(t, 1.6, 4.2, easeSine)),
      sweepIntensity: Math.min(seg(t, 1.6, 2.2, easeSine), 1 - seg(t, 3.6, 4.2, easeSine)),
      blackout: 1 - seg(t, 0, 0.7, easeSine),
      bloom: 1.1,
      frontLight: 0.45,
    });
  },
  Overlay: (p: OverlayProps) => {
    const B = PHONE.internals.board;
    return (
      <AbsoluteFill>
        <Annotation
          t={p.t}
          frame={p.frame}
          shot={p.shot}
          width={p.width}
          height={p.height}
          s={p.s}
          vertical={p.vertical}
          // Puce, sur la carte mère déplacée par l'éclatement
          anchor={[-4 - 7.5, B.centerY + 7.5, B.z + B.thickness / 2 + 1 + EXPLODE_OFFSETS.board * p.shot.explode]}
          title={i18n.exploded.chip}
          sub={i18n.exploded.caption}
          offset={[-260, -180]}
          offsetVertical={[-60, -380]}
          appear={2.3}
          disappear={4.5}
        />
      </AbsoluteFill>
    );
  },
};
