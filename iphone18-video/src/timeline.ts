/**
 * Chronologie du film : découpe en scènes (images), et calcul du Shot de
 * n'importe quelle image avec fondu enchaîné entre scènes voisines.
 *
 * Fondu : pendant les TRANSITION_FRAMES images qui précèdent une frontière,
 * le shot de la scène sortante est mélangé à celui de la scène entrante
 * (évaluée en temps local négatif). Aucune coupure sèche n'est possible.
 */
import { SCENES, TRANSITION_FRAMES, VIDEO, type SceneId } from './config';
import { blendShots, easeSine, type Shot } from './lib/shot';
import { SCENE_DEFS } from './scenes';

export interface SceneRange {
  id: SceneId;
  index: number;
  from: number;
  durationInFrames: number;
}

export const SCENE_RANGES: SceneRange[] = (() => {
  let from = 0;
  return SCENES.map((s, index) => {
    const durationInFrames = Math.round(s.seconds * VIDEO.fps);
    const r = { id: s.id, index, from, durationInFrames };
    from += durationInFrames;
    return r;
  });
})();

export const TOTAL_FRAMES = SCENE_RANGES.reduce((a, r) => a + r.durationInFrames, 0);

if (SCENE_DEFS.map((d) => d.id).join() !== SCENES.map((s) => s.id).join()) {
  throw new Error('SCENE_DEFS et SCENES (config.ts) ne sont pas dans le même ordre.');
}

export const sceneIndexAt = (frame: number) => {
  for (let i = SCENE_RANGES.length - 1; i >= 0; i--) {
    if (frame >= SCENE_RANGES[i].from) return i;
  }
  return 0;
};

const localShot = (i: number, frame: number) => {
  const r = SCENE_RANGES[i];
  const t = (frame - r.from) / VIDEO.fps;
  return SCENE_DEFS[i].shot(t, r.durationInFrames / VIDEO.fps);
};

/** Shot (état complet) de l'image `frame`. Fonction pure. */
export const getShot = (frame: number): Shot => {
  const f = Math.max(0, Math.min(TOTAL_FRAMES - 1, frame));
  const i = sceneIndexAt(f);
  const current = localShot(i, f);
  const next = SCENE_RANGES[i + 1];
  if (next) {
    const k = (f - (next.from - TRANSITION_FRAMES)) / TRANSITION_FRAMES;
    if (k > 0) return blendShots(current, localShot(i + 1, f), easeSine(k));
  }
  return current;
};
