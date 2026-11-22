/**
 * SCÈNE 6 — 40 → 48 s — « Tranches »
 *  0–2,6 s : travelling le long de la tranche gauche (bouton Action, volume).
 *  2,3–5,5 s : demi-tour vers la tranche droite ; une onde lumineuse « presse »
 *             le bouton Commande de l'appareil photo.
 *  5,5–8 s : bascule vers la tranche inférieure, macro sur le port USB-C.
 */
import { AbsoluteFill } from 'remotion';
import * as THREE from 'three';
import { PHONE } from '../config';
import { t as i18n } from '../i18n';
import { easeSine, lerp, lerpV, lin, qe, seg, shot, slerpQ, type Quat, type Vec3 } from '../lib/shot';
import { H2, W2 } from '../phone/context';
import { Annotation } from '../ui/Annotation';
import { scene05 } from './Scene05Display';
import { sceneSeconds, type OverlayProps, type SceneDef } from './types';

const LEFT_Q = qe(0, 78);
const RIGHT_Q = qe(0, -78);
export const BOTTOM_Q = qe(-72, 0);
const CC_Y = H2 - PHONE.cameraControl.fromTop;

const rot = (v: Vec3, q: Quat) => new THREE.Vector3(...v).applyQuaternion(new THREE.Quaternion(...q));

/** Cadrage USB-C : point visé et normale de la tranche inférieure (repère monde). */
export const usbcFraming = (dist: number) => {
  const face = rot([0, -H2, 0], BOTTOM_Q);
  const n = rot([0, -1, 0], BOTTOM_Q);
  return {
    pos: face.clone().addScaledVector(n, dist).add(new THREE.Vector3(0, 2, 0)).toArray() as Vec3,
    target: face.toArray() as Vec3,
  };
};

export const scene06: SceneDef = {
  id: 'edges',
  shot: (t, d) => {
    // --- Partie A : tranche gauche
    const yA = lerp(56, 14, seg(t, -0.2, 2.8, easeSine));
    const sideA = rot([-W2, 0, 0], LEFT_Q); // tranche gauche en coordonnées monde (Y ignoré)
    const camA: Vec3 = [sideA.x + 14, yA + 8, sideA.z + 96];
    const tgtA: Vec3 = [sideA.x, yA, sideA.z];

    // --- Partie B : tranche droite (demi-tour)
    const turnB = seg(t, 2.3, 4.4);
    const yB = lerp(10, CC_Y, seg(t, 2.5, 4.5));
    const sideB = rot([W2, 0, 0], RIGHT_Q);
    const camB: Vec3 = [sideB.x - 14, yB + 8, sideB.z + 96];
    const tgtB: Vec3 = [sideB.x, yB, sideB.z];

    // --- Partie C : tranche inférieure
    const turnC = seg(t, 5.5, 6.9);
    const distC = lerp(130, 30, seg(t, 5.6, d - 0.2, (x) => 1 - Math.pow(1 - x, 2.2)));
    const C = usbcFraming(distC);

    // Entrée : depuis la face avant de la scène 5, glissement vers la tranche gauche
    const d5 = sceneSeconds('display');
    const prev = scene05.shot(d5, d5);
    const entry = seg(t, -0.6, 1.3);

    let phoneQuat = slerpQ(prev.phoneQuat, LEFT_Q, entry);
    // Le demi-tour passe par la face avant (axe Y) pour un mouvement lisible
    if (turnB > 0) phoneQuat = qe(0, lerp(78, -78, turnB));
    phoneQuat = slerpQ(phoneQuat, BOTTOM_Q, turnC);

    // Pendant le demi-tour, la caméra recule légèrement
    const back = Math.sin(Math.PI * turnB) * 50;
    let camPos = lerpV(lerpV(prev.camPos, camA, entry), camB, turnB);
    camPos = [camPos[0], camPos[1], camPos[2] + back];
    let camTarget = lerpV(lerpV(prev.camTarget, tgtA, entry), tgtB, turnB);
    camPos = lerpV(camPos, C.pos, turnC);
    camTarget = lerpV(camTarget, C.target, turnC);

    const focusDist = new THREE.Vector3(...camPos).distanceTo(new THREE.Vector3(...camTarget));
    return shot({
      camPos,
      camTarget,
      fov: 30,
      phoneQuat,
      levitation: lerp(lerp(1, 0.5, entry), 0.15, turnC),
      dofFocus: focusDist,
      dofRange: lerp(lerp(400, 30, entry), 6, turnC),
      bokeh: lerp(3.5 * entry, 5, turnC),
      ccPress: lin(t, 4.3, 5.5),
      sweep: lerp(-1.2, 1.2, seg(t, 0.8, 2.6, easeSine)),
      sweepIntensity: Math.min(seg(t, 0.8, 1.3, easeSine), 1 - seg(t, 2.1, 2.6, easeSine)),
      screen: 1 - seg(t, 0, 1.2, easeSine),
      shadow: 0,
      bloom: 1,
      frontLight: 0.9,
      ringLight: 0.25 * turnC,
      envIntensity: 1.25,
    });
  },
  Overlay: (p: OverlayProps) => {
    const common = { t: p.t, frame: p.frame, shot: p.shot, width: p.width, height: p.height, s: p.s, vertical: p.vertical };
    const E = i18n.edges;
    const action = PHONE.buttons.left[0];
    return (
      <AbsoluteFill>
        <Annotation {...common} anchor={[-W2 - 0.4, H2 - action.fromTop, 0]} title={E.action.title}
          offset={[-170, -140]} offsetVertical={[-40, -300]} appear={1.2} disappear={2.4} />
        <Annotation {...common} anchor={[W2 + 0.06, CC_Y, 0]} title={E.control.title} sub={E.control.sub}
          offset={[180, -150]} offsetVertical={[30, -320]} appear={4.1} disappear={5.3} />
        <Annotation {...common} anchor={[0, -H2, PHONE.bottom.usbc.height / 2]} title={E.usbc.title}
          offset={[160, -150]} offsetVertical={[30, -300]} appear={6.7} disappear={p.d - 0.5} />
      </AbsoluteFill>
    );
  },
};
