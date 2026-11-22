/**
 * Éclairage studio trois points + effets lumineux animés :
 *  - key light : RectAreaLight douce (260 × 180 mm) en haut à droite ;
 *  - rim light : directionnelle froide derrière, détache les tranches ;
 *  - fill light : ambiante très faible ;
 *  - light sweep : bande lumineuse fine qui glisse devant la caméra et
 *    fait courir un reflet sur le châssis ;
 *  - ligne de révélation (scène 1) : trait lumineux + contre-jour qui
 *    dessinent la silhouette du téléphone.
 */
import { useLayoutEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { RectAreaLightUniformsLib } from 'three/examples/jsm/lights/RectAreaLightUniformsLib.js';
import { RENDER } from '../config';
import type { Shot } from '../lib/shot';

let rectLibReady = false;
const ensureRectLib = () => {
  if (!rectLibReady) {
    RectAreaLightUniformsLib.init();
    rectLibReady = true;
  }
};

/** Repère caméra (direction, droite, haut) calculé depuis le shot. */
export const cameraBasis = (s: Shot) => {
  const pos = new THREE.Vector3(...s.camPos);
  const target = new THREE.Vector3(...s.camTarget);
  const dir = target.clone().sub(pos).normalize();
  const right = new THREE.Vector3().crossVectors(dir, new THREE.Vector3(0, 1, 0)).normalize();
  const up = new THREE.Vector3().crossVectors(right, dir).normalize();
  return { pos, target, dir, right, up };
};

export const Lights: React.FC<{ shot: Shot }> = ({ shot }) => {
  ensureRectLib();
  const L = RENDER.lights;
  const key = useRef<THREE.RectAreaLight>(null);
  const sweep = useRef<THREE.RectAreaLight>(null);
  const reveal = useRef<THREE.RectAreaLight>(null);
  const line = useRef<THREE.Mesh>(null);
  const rim = useRef<THREE.DirectionalLight>(null);

  const lineMat = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: new THREE.Color(1, 1, 1),
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        toneMapped: false,
      }),
    [],
  );
  const lineGeo = useMemo(() => new THREE.PlaneGeometry(1400, 0.9), []);

  useLayoutEffect(() => {
    const b = cameraBasis(shot);
    if (key.current) {
      key.current.position.set(...L.key.position);
      key.current.lookAt(0, 0, 0);
      key.current.intensity = L.key.intensity * shot.keyIntensity;
    }
    if (rim.current) {
      rim.current.intensity = L.rim.intensity * Math.max(shot.keyIntensity, shot.revealIntensity * 0.6);
    }
    // Sweep : se déplace de gauche à droite dans le repère caméra
    if (sweep.current) {
      const p = b.target
        .clone()
        .addScaledVector(b.dir, -220)
        .addScaledVector(b.right, shot.sweep * 240)
        .addScaledVector(b.up, 30);
      sweep.current.position.copy(p);
      sweep.current.lookAt(b.target);
      sweep.current.intensity = L.sweep.intensity * shot.sweepIntensity;
    }
    // Ligne de révélation : derrière la cible, monte du bas vers le haut
    const behind = b.target.clone().addScaledVector(b.dir, 160).addScaledVector(b.up, shot.revealLine * 120);
    if (reveal.current) {
      reveal.current.position.copy(behind);
      reveal.current.lookAt(b.target.clone().addScaledVector(b.up, shot.revealLine * 60));
      reveal.current.intensity = 14 * shot.revealIntensity;
    }
    if (line.current) {
      line.current.position.copy(behind);
      line.current.quaternion.setFromRotationMatrix(
        new THREE.Matrix4().makeBasis(b.right, b.up, b.dir.clone().negate()),
      );
      lineMat.color.setScalar(3.2 * shot.revealIntensity);
      line.current.visible = shot.revealIntensity > 0.001;
    }
  }, [shot, L, lineMat]);

  return (
    <>
      <rectAreaLight ref={key} args={[L.key.color, L.key.intensity, L.key.width, L.key.height]} />
      <directionalLight ref={rim} color={L.rim.color} position={[...L.rim.position]} />
      <ambientLight color={L.fill.color} intensity={L.fill.intensity} />
      <rectAreaLight ref={sweep} args={[L.sweep.color, 0, L.sweep.width, L.sweep.height]} />
      <rectAreaLight ref={reveal} args={['#ffffff', 0, 900, 3]} />
      <mesh ref={line} geometry={lineGeo} material={lineMat} renderOrder={-10} />
    </>
  );
};
