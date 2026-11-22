/**
 * Pose finale du téléphone (shot + lévitation) et caméra équivalente.
 * Ces fonctions sont partagées par la scène 3D ET par les annotations 2D,
 * ce qui garantit que les lignes d'annotation suivent exactement l'objet.
 */
import * as THREE from 'three';
import { ANIMATION, RENDER, VIDEO } from '../config';
import type { Shot, Vec3 } from './shot';

const DEG = Math.PI / 180;

/** Pose du téléphone avec flottement permanent (±1,5 mm, ±1°). */
export const phonePose = (s: Shot, frame: number) => {
  const { amplitudeMm, rotationDeg, periodSeconds } = ANIMATION.levitation;
  const w = (2 * Math.PI * frame) / (VIDEO.fps * periodSeconds);
  const lev = s.levitation;
  const position = new THREE.Vector3(
    s.phonePos[0],
    s.phonePos[1] + Math.sin(w) * amplitudeMm * lev,
    s.phonePos[2],
  );
  const wobble = new THREE.Quaternion().setFromEuler(
    new THREE.Euler(
      Math.sin(w * 0.77 + 1.3) * rotationDeg * DEG * lev,
      0,
      Math.sin(w * 0.61 + 0.4) * rotationDeg * DEG * lev,
    ),
  );
  const quaternion = new THREE.Quaternion(...s.phoneQuat).multiply(wobble);
  return { position, quaternion };
};

export const phoneMatrix = (s: Shot, frame: number) => {
  const { position, quaternion } = phonePose(s, frame);
  return new THREE.Matrix4().compose(position, quaternion, new THREE.Vector3(1, 1, 1));
};

/**
 * Angle de champ vertical effectif selon le format.
 * Les plans sont composés pour le 16:9 ; en vertical, on conserve le cadrage
 * du « carré central » : l'angle HORIZONTAL vertical = angle vertical 16:9.
 */
export const effectiveFov = (fov: number, aspect: number) => {
  if (aspect >= 1) return fov;
  const h = fov * VIDEO.verticalFovFactor * DEG;
  return (2 * Math.atan(Math.tan(h / 2) / aspect)) / DEG;
};

/** Applique un shot à une caméra three.js (position, cible, roulis, focale). */
export const applyCamera = (cam: THREE.PerspectiveCamera, s: Shot, aspect: number) => {
  cam.position.set(...s.camPos);
  cam.up.set(0, 1, 0);
  cam.lookAt(new THREE.Vector3(...s.camTarget));
  if (s.roll) cam.rotateZ(s.roll * DEG);
  cam.fov = effectiveFov(s.fov, aspect);
  cam.aspect = aspect;
  // Plan proche adaptatif : précision de profondeur maximale à toutes les échelles
  // (évite le z-fighting des couches de l'écran en plan large, autorise la macro à 2 mm).
  const dist = cam.position.distanceTo(new THREE.Vector3(...s.camTarget));
  cam.near = Math.min(Math.max(dist * 0.04, RENDER.camera.near), 20);
  cam.far = RENDER.camera.far;
  cam.updateProjectionMatrix();
  cam.updateMatrixWorld(true);
};

/** Projette un point exprimé dans le repère du téléphone vers des pixels écran. */
export const projectPhonePoint = (
  s: Shot,
  frame: number,
  local: Vec3,
  width: number,
  height: number,
) => {
  const cam = new THREE.PerspectiveCamera();
  applyCamera(cam, s, width / height);
  const p = new THREE.Vector3(...local).applyMatrix4(phoneMatrix(s, frame));
  const viewZ = p.clone().applyMatrix4(cam.matrixWorldInverse).z;
  p.project(cam);
  return {
    x: (p.x * 0.5 + 0.5) * width,
    y: (-p.y * 0.5 + 0.5) * height,
    visible: viewZ < 0,
  };
};
