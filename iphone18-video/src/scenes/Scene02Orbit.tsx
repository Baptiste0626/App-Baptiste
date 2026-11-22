/**
 * SCÈNE 2 — 6 → 14 s — « Lévitation »
 * Rotation lente à 360° du téléphone en lévitation ; la caméra orbite en
 * contre-plongée. Deux passages de light sweep balaient le châssis.
 */
import { easeSine, lerp, qe, seg, shot, window4 } from '../lib/shot';
import { REVEAL_ROT_END } from './Scene01Reveal';
import { orbit, type SceneDef } from './types';

export const ORBIT_ROT_END = REVEAL_ROT_END + 360;

/** Paramètres d'orbite caméra (réutilisés par la scène 3 pour la continuité). */
export const orbitCamera = (t: number, d: number) => {
  const p = seg(t, 0, d);
  const target: [number, number, number] = [0, lerp(2, 8, p), 0];
  return {
    target,
    pos: orbit(target, lerp(360, 380, p), lerp(0, -38, p), lerp(1, -15, p)),
  };
};

export const scene02: SceneDef = {
  id: 'orbit',
  shot: (t, d) => {
    const cam = orbitCamera(t, d);
    // Rotation : départ en douceur (continuité avec la scène 1), arrivée amortie
    const spin = seg(t, 0, d, (x) => (x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2));
    const pass1 = seg(t, 0.8, 3.6, easeSine);
    const pass2 = seg(t, 4.4, 7.4, easeSine);
    const inPass2 = t > 4.0;
    return shot({
      camPos: cam.pos,
      camTarget: cam.target,
      fov: 30,
      phoneQuat: qe(lerp(0, -4, seg(t, 0, d)), REVEAL_ROT_END + 360 * spin),
      levitation: 1,
      envIntensity: 0.95 + 0.05 * seg(t, 0, 1),
      keyIntensity: 1,
      sweep: inPass2 ? lerp(-1.2, 1.2, pass2) : lerp(-1.2, 1.2, pass1),
      sweepIntensity: inPass2 ? window4(t, 4.4, 5.0, 6.8, 7.4) : window4(t, 0.8, 1.4, 3.0, 3.6),
      shadow: seg(t, 0, 1.5, easeSine),
      bloom: 1.1,
    });
  },
};
