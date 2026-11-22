/**
 * Vérifications automatiques du film (npm run verify) :
 *  1. chaque scène a la bonne durée en images, total = 60 s × 60 fps ;
 *  2. continuité : aucune discontinuité (« saut » ou clignotement) d'une image
 *     à la suivante, en particulier aux frontières de scènes.
 * Sortie non nulle si un problème est détecté.
 */
import * as THREE from 'three';
import { SCENES, VIDEO } from '../src/config';
import { SCENE_RANGES, TOTAL_FRAMES, getShot } from '../src/timeline';
import type { Shot } from '../src/lib/shot';

let failed = false;
const fail = (msg: string) => {
  failed = true;
  console.error('✗ ' + msg);
};

// --- 1. Durées --------------------------------------------------------------
console.log('\nScène        début   fin     images  secondes');
SCENE_RANGES.forEach((r) => {
  const expected = SCENES[r.index].seconds * VIDEO.fps;
  console.log(
    `${r.id.padEnd(12)} ${String(r.from).padStart(5)}  ${String(r.from + r.durationInFrames - 1).padStart(5)}  ${String(r.durationInFrames).padStart(6)}  ${(r.durationInFrames / VIDEO.fps).toFixed(2).padStart(7)}`,
  );
  if (r.durationInFrames !== expected) fail(`${r.id} : ${r.durationInFrames} images au lieu de ${expected}`);
});
const totalSeconds = SCENES.reduce((a, s) => a + s.seconds, 0);
console.log(`Total : ${TOTAL_FRAMES} images (${(TOTAL_FRAMES / VIDEO.fps).toFixed(2)} s)`);
if (TOTAL_FRAMES !== totalSeconds * VIDEO.fps) fail('Total incohérent');
if (totalSeconds !== 60) console.warn(`⚠ Durée totale ${totalSeconds} s (60 s attendues par le storyboard)`);

// --- 2. Continuité ------------------------------------------------------------
const v = (a: number[]) => new THREE.Vector3(a[0], a[1], a[2]);
const angleDeg = (a: Shot['phoneQuat'], b: Shot['phoneQuat']) =>
  (new THREE.Quaternion(...a).angleTo(new THREE.Quaternion(...b)) * 180) / Math.PI;

interface Delta {
  cam: number; // déplacement caméra relatif à la distance de la cible
  aim: number; // rotation de la direction de visée (°)
  rot: number; // rotation du téléphone (°)
  fov: number;
  black: number;
  color: number;
  explode: number;
  screen: number;
}

const shots: Shot[] = [];
for (let f = 0; f < TOTAL_FRAMES; f++) shots.push(getShot(f));

// Valeurs invalides (NaN / infini) : rendraient une image vide
const bad = shots.findIndex((sh) =>
  Object.values(sh).some((v) => (Array.isArray(v) ? v.some((x) => !Number.isFinite(x)) : !Number.isFinite(v as number))),
);
if (bad >= 0) fail(`Valeur non finie (NaN/∞) dans le shot de l'image ${bad}`);
else console.log('\n✓ Aucune valeur NaN / infinie sur les ' + TOTAL_FRAMES + ' images');

const deltas: Delta[] = [];
for (let f = 0; f < TOTAL_FRAMES - 1; f++) {
  const a = shots[f];
  const b = shots[f + 1];
  // Image entièrement noire des deux côtés : un changement de plan y est invisible
  const hidden = a.blackout > 0.995 && b.blackout > 0.995;
  if (hidden) {
    deltas.push({ cam: 0, aim: 0, rot: 0, fov: 0, black: Math.abs(a.blackout - b.blackout), color: 0, explode: 0, screen: 0 });
    continue;
  }
  const dist = Math.max(1, v(a.camPos).distanceTo(v(a.camTarget)));
  const dirA = v(a.camTarget).sub(v(a.camPos)).normalize();
  const dirB = v(b.camTarget).sub(v(b.camPos)).normalize();
  deltas.push({
    cam: v(a.camPos).distanceTo(v(b.camPos)) / dist,
    aim: (dirA.angleTo(dirB) * 180) / Math.PI,
    rot: angleDeg(a.phoneQuat, b.phoneQuat),
    fov: Math.abs(a.fov - b.fov),
    black: Math.abs(a.blackout - b.blackout),
    color: v(a.aluminium).distanceTo(v(b.aluminium)),
    explode: Math.abs(a.explode - b.explode),
    screen: Math.abs(a.screen - b.screen),
  });
}

/** Seuils par image (60 fps) au-delà desquels on considère un saut visible. */
const LIMITS: Delta = { cam: 0.06, aim: 2.5, rot: 4, fov: 0.5, black: 0.08, color: 0.05, explode: 0.12, screen: 0.08 };

const keys = Object.keys(LIMITS) as (keyof Delta)[];
console.log('\nContinuité (max par image) :');
keys.forEach((k) => {
  let max = 0;
  let at = 0;
  deltas.forEach((d, f) => {
    if (d[k] > max) {
      max = d[k];
      at = f;
    }
  });
  const ok = max <= LIMITS[k];
  console.log(`  ${ok ? '✓' : '✗'} ${k.padEnd(8)} max ${max.toFixed(4)} (image ${at}) — limite ${LIMITS[k]}`);
  if (!ok) fail(`Saut « ${k} » à l'image ${at} → ${at + 1}`);
});

// Pic d'accélération aux frontières : le delta à la frontière ne doit pas être
// très supérieur à la moyenne des images voisines (signe d'une cassure).
console.log('\nFrontières de scènes :');
SCENE_RANGES.slice(1).forEach((r) => {
  const b = r.from - 1;
  const report: string[] = [];
  keys.forEach((k) => {
    const around = [-6, -4, -2, 2, 4, 6].map((o) => deltas[b + o]?.[k] ?? 0);
    const mean = around.reduce((a, x) => a + x, 0) / around.length;
    const here = deltas[b][k];
    if (here > LIMITS[k] * 0.25 && here > mean * 3 + 1e-6) report.push(`${k} ×${(here / (mean || 1e-6)).toFixed(1)}`);
  });
  const label = `${SCENE_RANGES[r.index - 1].id} → ${r.id} (image ${r.from})`;
  if (report.length) fail(`${label} : cassure ${report.join(', ')}`);
  else console.log(`  ✓ ${label}`);
});

console.log(failed ? '\nÉCHEC' : '\nOK — durées exactes, aucune discontinuité détectée.');
process.exit(failed ? 1 : 0);
