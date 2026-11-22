/**
 * Outils géométriques procéduraux :
 *  - contour « squircle » (coins à courbure continue, super-ellipse) ;
 *  - extrusion avec normales lissées sauf sur les arêtes vives (chanfreins) ;
 *  - formes en stade (port USB-C), pentalobe…
 * Toutes les dimensions sont en millimètres.
 */
import * as THREE from 'three';
import { toCreasedNormals } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { PHONE } from '../config';

export type CornerSpec =
  | { kind: 'squircle'; extent: number; exponent: number }
  | { kind: 'arc'; radius: number };

/** Quart de coin, centré sur (cx, cy), du point (cx+ex, cy) au point (cx, cy+ey) selon les signes. */
const cornerPoints = (
  cx: number,
  cy: number,
  sx: number,
  sy: number,
  spec: CornerSpec,
  segments: number,
  reverse: boolean,
) => {
  const pts: THREE.Vector2[] = [];
  for (let i = 0; i <= segments; i++) {
    const a = ((reverse ? segments - i : i) / segments) * (Math.PI / 2);
    let x: number;
    let y: number;
    if (spec.kind === 'arc') {
      x = Math.cos(a) * spec.radius;
      y = Math.sin(a) * spec.radius;
    } else {
      // Super-ellipse |x|^n + |y|^n = r^n
      const c = Math.cos(a);
      const s = Math.sin(a);
      const n = spec.exponent;
      x = Math.sign(c) * Math.pow(Math.abs(c), 2 / n) * spec.extent;
      y = Math.sign(s) * Math.pow(Math.abs(s), 2 / n) * spec.extent;
    }
    pts.push(new THREE.Vector2(cx + sx * x, cy + sy * y));
  }
  return pts;
};

const cornerSize = (spec: CornerSpec) => (spec.kind === 'arc' ? spec.radius : spec.extent);

/**
 * Contour fermé d'un rectangle à coins arrondis (sens trigonométrique).
 * halfW : demi-largeur ; yTop / yBottom : bords ; coins haut et bas indépendants.
 */
export const roundedContour = (
  halfW: number,
  yTop: number,
  yBottom: number,
  top: CornerSpec,
  bottom: CornerSpec,
  segments: number = PHONE.outline.segmentsPerCorner,
): THREE.Vector2[] => {
  const rt = cornerSize(top);
  const rb = cornerSize(bottom);
  const pts: THREE.Vector2[] = [];
  // Coin haut droit (de l'axe +x vers +y)
  pts.push(...cornerPoints(halfW - rt, yTop - rt, 1, 1, top, segments, false));
  // Coin haut gauche
  pts.push(...cornerPoints(-halfW + rt, yTop - rt, -1, 1, top, segments, true));
  // Coin bas gauche
  pts.push(...cornerPoints(-halfW + rb, yBottom + rb, -1, -1, bottom, segments, false));
  // Coin bas droit
  pts.push(...cornerPoints(halfW - rb, yBottom + rb, 1, -1, bottom, segments, true));
  return pts;
};

/** Contour du téléphone, éventuellement rentré de `inset` mm (approximation d'un offset). */
export const phoneContour = (inset = 0, segments?: number) => {
  const { cornerRadius, cornerExtentFactor, exponent } = PHONE.outline;
  const extent = Math.max(cornerRadius * cornerExtentFactor - inset, 0.6);
  const spec: CornerSpec = { kind: 'squircle', extent, exponent };
  return roundedContour(
    PHONE.width / 2 - inset,
    PHONE.height / 2 - inset,
    -PHONE.height / 2 + inset,
    spec,
    spec,
    segments,
  );
};

export const shapeFrom = (pts: THREE.Vector2[]) => new THREE.Shape(pts);
export const pathFrom = (pts: THREE.Vector2[]) => new THREE.Path(pts);

/** Cercle (pour les trous). `clockwise` pour les trous d'une Shape. */
export const circlePath = (cx: number, cy: number, r: number, segments = 48) => {
  const p = new THREE.Path();
  p.absarc(cx, cy, r, 0, Math.PI * 2, true);
  p.getPoints(segments);
  return p;
};

/** Stade (pilule) centré, longueur totale `length`, hauteur `height`. */
export const stadiumPoints = (length: number, height: number, segments = 16) => {
  const r = height / 2;
  const hx = length / 2 - r;
  const pts: THREE.Vector2[] = [];
  for (let i = 0; i <= segments; i++) {
    const a = -Math.PI / 2 + (i / segments) * Math.PI;
    pts.push(new THREE.Vector2(hx + Math.cos(a) * r, Math.sin(a) * r));
  }
  for (let i = 0; i <= segments; i++) {
    const a = Math.PI / 2 + (i / segments) * Math.PI;
    pts.push(new THREE.Vector2(-hx + Math.cos(a) * r, Math.sin(a) * r));
  }
  return pts;
};

/** Étoile à 5 lobes (empreinte de vis pentalobe). */
export const pentalobePoints = (r: number, lobeDepth = 0.45, segments = 60) => {
  const pts: THREE.Vector2[] = [];
  for (let i = 0; i < segments; i++) {
    const a = (i / segments) * Math.PI * 2;
    const rr = r * (1 - lobeDepth * (0.5 - 0.5 * Math.cos(a * 5)));
    pts.push(new THREE.Vector2(Math.cos(a) * rr, Math.sin(a) * rr));
  }
  return pts;
};

export interface ExtrudeOpts {
  depth: number;
  bevel?: number;
  bevelSize?: number;
  bevelSegments?: number;
  creaseDeg?: number;
  curveSegments?: number;
}

/**
 * Extrusion le long de +Z, centrée en Z (de -épaisseur/2 à +épaisseur/2),
 * avec normales « crantées » : lisses sur les courbes, vives sur les chanfreins.
 * `depth` = épaisseur TOTALE (biseaux compris).
 */
export const extrudeCentered = (shape: THREE.Shape | THREE.Shape[], o: ExtrudeOpts) => {
  const bevel = o.bevel ?? 0;
  const inner = Math.max(o.depth - 2 * bevel, 0.001);
  const geo = new THREE.ExtrudeGeometry(shape, {
    depth: inner,
    bevelEnabled: bevel > 0,
    bevelThickness: bevel,
    bevelSize: o.bevelSize ?? bevel,
    bevelSegments: o.bevelSegments ?? 1,
    curveSegments: o.curveSegments ?? 24,
    steps: 1,
  });
  geo.translate(0, 0, -inner / 2);
  const creased = toCreasedNormals(geo, ((o.creaseDeg ?? 30) * Math.PI) / 180);
  geo.dispose();
  creased.computeBoundingSphere();
  return creased;
};
