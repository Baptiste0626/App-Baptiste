/**
 * « Shot » = état complet d'une image du film (caméra, pose du téléphone,
 * lumière, post-production…). Chaque scène est une fonction PURE
 * (temps local → Shot), ce qui garantit un rendu 100 % déterministe :
 * la même image produit toujours exactement le même résultat.
 */
import { Easing } from 'remotion';
import * as THREE from 'three';
import { ACTIVE_COLORWAY, ANIMATION, COLORWAYS, type ColorwayId } from '../config';

export type Vec3 = [number, number, number];
export type Quat = [number, number, number, number];

export interface Shot {
  // Caméra
  camPos: Vec3;
  camTarget: Vec3;
  /** Angle de champ vertical (°) pensé pour le 16:9. */
  fov: number;
  /** Roulis caméra (°). */
  roll: number;

  // Téléphone
  phonePos: Vec3;
  phoneQuat: Quat;
  /** Multiplicateur du flottement permanent (0 = immobile). */
  levitation: number;
  /** Vue éclatée : 0 = assemblé, 1 = couches séparées (peut dépasser pour le rebond). */
  explode: number;

  // Écran
  screen: number;
  island: number;

  // Matière (couleurs en RVB linéaire)
  aluminium: Vec3;
  backGlass: Vec3;

  // Lumière
  envIntensity: number;
  keyIntensity: number;
  /** Position du « light sweep » (-1.2 → 1.2) et intensité. */
  sweep: number;
  sweepIntensity: number;
  /** Ligne de lumière de la scène 1 (position verticale -1 → 1, intensité). */
  revealLine: number;
  revealIntensity: number;
  /** Boîte à lumière douce derrière la caméra (éclaire les faces planes vues de face). */
  frontLight: number;
  /** Ring light derrière la caméra : reflets concentriques dans les lentilles (macro). */
  ringLight: number;

  // Post-production
  dofFocus: number;
  dofRange: number;
  bokeh: number;
  shadow: number;
  bloom: number;
  /** Onde lumineuse sur le bouton Commande de l'appareil photo (0 → 1). */
  ccPress: number;
  /** Fondu au noir global (0 = image, 1 = noir). */
  blackout: number;
}

// ---------------------------------------------------------------------------
// Couleurs
// ---------------------------------------------------------------------------

const tmpColor = new THREE.Color();
/** Hex sRGB → RVB linéaire (espace de travail de three.js). */
export const hexToLinear = (hex: string): Vec3 => {
  tmpColor.set(hex); // three.js convertit automatiquement en linéaire (ColorManagement)
  return [tmpColor.r, tmpColor.g, tmpColor.b];
};

export const colorwayLinear = (id: ColorwayId) => ({
  aluminium: hexToLinear(COLORWAYS[id].aluminium),
  backGlass: hexToLinear(COLORWAYS[id].backGlass),
});

// ---------------------------------------------------------------------------
// Interpolations
// ---------------------------------------------------------------------------

export const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const lerpV = (a: Vec3, b: Vec3, t: number): Vec3 => [
  lerp(a[0], b[0], t),
  lerp(a[1], b[1], t),
  lerp(a[2], b[2], t),
];

const cameraEase = Easing.bezier(...ANIMATION.cameraBezier);
/** Courbe cinématographique (0.65, 0, 0.35, 1). */
export const ease = (x: number) => cameraEase(clamp01(x));
/** Ease doux pour les fondus. */
export const easeSine = (x: number) => 0.5 - 0.5 * Math.cos(Math.PI * clamp01(x));

/** Progression 0→1 entre t0 et t1, avec easing caméra par défaut. */
export const seg = (t: number, t0: number, t1: number, fn: (x: number) => number = ease) =>
  fn(clamp01((t - t0) / (t1 - t0)));

/** Progression linéaire 0→1 (bornée). */
export const lin = (t: number, t0: number, t1: number) => clamp01((t - t0) / (t1 - t0));

/** Fenêtre : monte de 0 à 1 sur [a,b], tient, redescend sur [c,d]. */
export const window4 = (t: number, a: number, b: number, c: number, d: number) =>
  Math.min(seg(t, a, b, easeSine), 1 - seg(t, c, d, easeSine));

// ---------------------------------------------------------------------------
// Rotations
// ---------------------------------------------------------------------------

const DEG = Math.PI / 180;
const e = new THREE.Euler();
const q = new THREE.Quaternion();
const q2 = new THREE.Quaternion();

/** Quaternion depuis des angles en degrés (ordre YXZ : tourne-disque puis inclinaison). */
export const qe = (xDeg: number, yDeg: number, zDeg = 0): Quat => {
  e.set(xDeg * DEG, yDeg * DEG, zDeg * DEG, 'YXZ');
  q.setFromEuler(e);
  return [q.x, q.y, q.z, q.w];
};

export const slerpQ = (a: Quat, b: Quat, t: number): Quat => {
  q.set(...a);
  q2.set(...b);
  q.slerp(q2, t);
  return [q.x, q.y, q.z, q.w];
};

// ---------------------------------------------------------------------------
// Shot par défaut et mélange
// ---------------------------------------------------------------------------

const active = colorwayLinear(ACTIVE_COLORWAY);

export const BASE_SHOT: Shot = {
  camPos: [0, 0, 380],
  camTarget: [0, 0, 0],
  fov: 30,
  roll: 0,
  phonePos: [0, 0, 0],
  phoneQuat: [0, 0, 0, 1],
  levitation: 1,
  explode: 0,
  screen: 0,
  island: 0,
  aluminium: active.aluminium,
  backGlass: active.backGlass,
  envIntensity: 1,
  keyIntensity: 1,
  sweep: -2,
  sweepIntensity: 0,
  revealLine: -2,
  revealIntensity: 0,
  frontLight: 0.2,
  ringLight: 0,
  dofFocus: 380,
  dofRange: 400,
  bokeh: 0,
  shadow: 0,
  bloom: 1,
  ccPress: 0,
  blackout: 0,
};

/** Crée un shot à partir du shot de base et de quelques champs. */
export const shot = (patch: Partial<Shot>): Shot => ({ ...BASE_SHOT, ...patch });

/** Mélange deux shots (utilisé pour les fondus enchaînés entre scènes). */
export const blendShots = (a: Shot, b: Shot, t: number): Shot => {
  if (t <= 0) return a;
  if (t >= 1) return b;
  const out = { ...a } as Shot;
  (Object.keys(a) as (keyof Shot)[]).forEach((k) => {
    const va = a[k];
    const vb = b[k];
    if (k === 'phoneQuat') {
      out.phoneQuat = slerpQ(a.phoneQuat, b.phoneQuat, t);
    } else if (Array.isArray(va) && Array.isArray(vb)) {
      (out as unknown as Record<string, Vec3>)[k] = lerpV(va as Vec3, vb as Vec3, t);
    } else if (typeof va === 'number' && typeof vb === 'number') {
      (out as unknown as Record<string, number>)[k] = lerp(va, vb, t);
    }
  });
  return out;
};
