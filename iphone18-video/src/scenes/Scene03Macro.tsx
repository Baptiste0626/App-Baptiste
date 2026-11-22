/**
 * SCÈNE 3 — 14 → 24 s — « Macro photo »
 *  0–3 s  : le téléphone présente son dos, la caméra plonge vers le plateau photo.
 *  3–6,5 s: approche du téléobjectif à périscope dans l'axe optique.
 *  6,5–10 s: la caméra traverse presque l'objectif ; la mise au point (DOF fort)
 *           passe d'une lentille interne à l'autre jusqu'au diaphragme → noir.
 * Annotations : « 48 MP Fusion », « Zoom optique 4x – 100 mm », « Qualité optique 8x – 200 mm ».
 */
import { AbsoluteFill } from 'remotion';
import * as THREE from 'three';
import { PHONE } from '../config';
import { t as i18n } from '../i18n';
import { easeSine, lerp, lerpV, qe, seg, shot, slerpQ, type Vec3 } from '../lib/shot';
import { PLATEAU_TOP_Z, backUV } from '../phone/context';
import { Annotation } from '../ui/Annotation';
import { ORBIT_ROT_END, orbitCamera } from './Scene02Orbit';
import { sceneSeconds, type OverlayProps, type SceneDef } from './types';

const L = PHONE.lenses;
const lensById = (id: string) => L.list.find((l) => l.id === id)!;
/** Sommet de l'anneau d'un objectif (repère téléphone). */
const lensTop = (id: string): Vec3 => {
  const l = lensById(id);
  const [x, y] = backUV(l.u, l.v);
  return [x, y, PLATEAU_TOP_Z - L.ringRaise];
};
const PLATEAU_CENTER: Vec3 = [...backUV(30, 27), PLATEAU_TOP_Z] as Vec3;

/** Orientation finale : dos face caméra, légèrement tourné. */
const BACK_QUAT = qe(-4, 180 + 10);

const toWorld = (local: Vec3, q: [number, number, number, number]) =>
  new THREE.Vector3(...local).applyQuaternion(new THREE.Quaternion(...q));

export const scene03: SceneDef = {
  id: 'macro',
  shot: (t, d) => {
    const prevD = sceneSeconds('orbit');
    const start = orbitCamera(prevD, prevD);

    // Pose du téléphone : fin de rotation de la scène 2 → dos face caméra
    const qStart = qe(-4, ORBIT_ROT_END);
    const phoneQuat = slerpQ(qStart, BACK_QUAT, seg(t, 0, 2.6));

    // Axe optique (le dos regarde -Z dans le repère téléphone)
    const axis = toWorld([0, 0, -1], BACK_QUAT);
    const plateau = toWorld(PLATEAU_CENTER, BACK_QUAT);
    const tele = toWorld(lensTop('tele'), BACK_QUAT);

    // Distance caméra → cible le long de l'axe optique
    const dA = 165;
    const dist =
      t < 3
        ? dA
        : t < 6.5
          ? lerp(dA, 12, seg(t, 3, 6.5))
          : lerp(12, 1.6, seg(t, 6.5, d - 0.65, (x) => 1 - Math.pow(1 - x, 1.6)));
    // Cible : centre du plateau → centre du téléobjectif
    const aim = plateau.clone().lerp(tele, seg(t, 2.6, 5.2));
    // Léger décalage latéral qui s'annule en approche (révèle la profondeur de l'anneau)
    const lateral = new THREE.Vector3(14, 10, 0).multiplyScalar(1 - seg(t, 3, 7));
    const overview = aim.clone().addScaledVector(axis, dist).add(lateral);
    const intro = seg(t, 0, 3);
    const camPos = lerpV(start.pos, overview.toArray() as Vec3, intro);
    const camTarget = lerpV(start.target, aim.clone().addScaledVector(axis, -2).toArray() as Vec3, intro);

    // Mise au point : plateau, puis lentilles internes une à une, puis diaphragme
    const sapphireDepth = L.sapphireRecess + L.sapphireThickness;
    const stops = [0, ...L.internal.map((l) => l.depth), L.diaphragm.depth].map((x) => x + sapphireDepth);
    const k = seg(t, 6.6, d - 1.2, (x) => x) * (stops.length - 1);
    const i = Math.min(Math.floor(k), stops.length - 2);
    const inner = lerp(stops[i], stops[i + 1], easeSine(k - i));
    const focus = t < 6.6 ? dist + 2 : dist + inner;

    return shot({
      camPos,
      camTarget,
      fov: lerp(30, 34, seg(t, 6, d)),
      phoneQuat,
      levitation: 1 - seg(t, 2, 4.5, easeSine),
      dofFocus: focus,
      dofRange: lerp(60, 0.6, seg(t, 1, 7)),
      bokeh: lerp(0, 3.2, seg(t, 1.5, 7.5, easeSine)),
      shadow: 1 - seg(t, 0, 1.5, easeSine),
      sweep: lerp(-1.2, 1.2, seg(t, 3.2, 6.0, easeSine)),
      sweepIntensity: Math.min(seg(t, 3.2, 3.8, easeSine), 1 - seg(t, 5.4, 6.0, easeSine)),
      bloom: 1.2,
      frontLight: 0.1,
      ringLight: seg(t, 1.5, 4, easeSine),
      // Noir complet AVANT le fondu enchaîné (qui démarre à d - 0,6 s) : le changement de plan est invisible
      blackout: seg(t, d - 1.45, d - 0.65, easeSine),
    });
  },
  Overlay: (p: OverlayProps) => {
    const common = { t: p.t, frame: p.frame, shot: p.shot, width: p.width, height: p.height, s: p.s, vertical: p.vertical };
    const r = L.ringOuter;
    const main = lensTop('main');
    const tele = lensTop('tele');
    return (
      <AbsoluteFill>
        <Annotation
          {...common}
          anchor={[main[0] + r * 0.7, main[1] + r * 0.7, main[2]]}
          title={i18n.macro.fusion.title}
          sub={i18n.macro.fusion.sub}
          offset={[-150, -120]}
          offsetVertical={[-60, -300]}
          appear={1.9}
          disappear={4.3}
        />
        <Annotation
          {...common}
          anchor={[tele[0] + r * 0.95, tele[1], tele[2]]}
          title={i18n.macro.zoom4.title}
          sub={i18n.macro.zoom4.sub}
          offset={[-190, -170]}
          offsetVertical={[-40, -330]}
          appear={4.6}
          disappear={6.8}
        />
        <Annotation
          {...common}
          anchor={[tele[0] - r * 0.7, tele[1] - r * 0.7, tele[2]]}
          title={i18n.macro.zoom8.title}
          sub={i18n.macro.zoom8.sub}
          offset={[190, 170]}
          offsetVertical={[40, 330]}
          appear={5.2}
          disappear={6.8}
        />
      </AbsoluteFill>
    );
  },
};
