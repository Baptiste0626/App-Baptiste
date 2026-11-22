/** Contrat commun à toutes les scènes. */
import type { SceneId } from '../config';
import { SCENES, VIDEO } from '../config';
import type { Shot, Vec3 } from '../lib/shot';

export interface OverlayProps {
  /** Temps local de la scène (s). */
  t: number;
  /** Durée de la scène (s). */
  d: number;
  /** Image globale. */
  frame: number;
  /** Shot effectivement rendu (après fondu enchaîné). */
  shot: Shot;
  width: number;
  height: number;
  /** Échelle typographique (1 = 1080 px de petit côté). */
  s: number;
  vertical: boolean;
}

export interface SceneDef {
  id: SceneId;
  /** Fonction pure : temps local (s, peut être < 0 pendant un fondu) → Shot. */
  shot: (t: number, d: number) => Shot;
  Overlay?: React.FC<OverlayProps>;
}

/** Durée configurée d'une scène (s). */
export const sceneSeconds = (id: SceneId) => SCENES.find((s) => s.id === id)!.seconds;

/** Numéro d'image global correspondant au temps local t d'une scène. */
export const globalFrameOf = (id: SceneId, t: number) => {
  let start = 0;
  for (const s of SCENES) {
    if (s.id === id) break;
    start += s.seconds;
  }
  return Math.round((start + t) * VIDEO.fps);
};

/** Position orbitale autour d'une cible (azimut / élévation en degrés). */
export const orbit = (target: Vec3, radius: number, azDeg: number, elDeg: number): Vec3 => {
  const az = (azDeg * Math.PI) / 180;
  const el = (elDeg * Math.PI) / 180;
  return [
    target[0] + radius * Math.sin(az) * Math.cos(el),
    target[1] + radius * Math.sin(el),
    target[2] + radius * Math.cos(az) * Math.cos(el),
  ];
};
