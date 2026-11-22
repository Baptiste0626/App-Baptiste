/**
 * Écran OLED 6,9" (2868 × 1320 px, 460 ppi → zone active ≈ 72,9 × 158,4 mm).
 *  - Dalle noire (bordures fines et uniformes sous le verre).
 *  - Zone active : shader de fond d'écran abstrait + Dynamic Island (SDF animée).
 *  - Caméra frontale 18 MP visible dans la pilule sous un angle rasant.
 */
import { useLayoutEffect, useMemo } from 'react';
import * as THREE from 'three';
import { PHONE } from '../config';
import { createScreenMaterial } from '../materials/screenShader';
import { H2, T2, useMats } from './context';
import { extrudeCentered, phoneContour, roundedContour, shapeFrom } from './geometry';

const D = PHONE.display;
const I = PHONE.island;

/** Contour de la zone active, centré, coins squircle concentriques au boîtier. */
const activeContour = () => {
  const inset = (PHONE.width - D.activeWidth) / 2;
  const { cornerRadius, cornerExtentFactor, exponent } = PHONE.outline;
  const spec = {
    kind: 'squircle' as const,
    extent: cornerRadius * cornerExtentFactor - inset,
    exponent,
  };
  return roundedContour(D.activeWidth / 2, D.activeHeight / 2, -D.activeHeight / 2, spec, spec, 28);
};

export interface DisplayProps {
  time: number;
  screen: number;
  island: number;
}

export const Display: React.FC<DisplayProps> = ({ time, screen, island }) => {
  const m = useMats();

  const geo = useMemo(() => {
    const panel = extrudeCentered(shapeFrom(phoneContour(PHONE.frontGlass.inset + 0.05, 28)), {
      depth: 0.5,
    });
    const active = new THREE.ShapeGeometry(shapeFrom(activeContour()));
    const camOuter = new THREE.CircleGeometry(I.frontCamera.radius, 40);
    const camLens = new THREE.SphereGeometry(0.85, 32, 8, 0, Math.PI * 2, 0, 0.55);
    const camRing = new THREE.RingGeometry(0.9, 1.1, 40);
    const irSensor = new THREE.CircleGeometry(0.7, 32);
    return { panel, active, camOuter, camLens, camRing, irSensor };
  }, []);

  const screenMat = useMemo(() => createScreenMaterial(D.activeWidth, D.activeHeight), []);

  // Uniformes pilotés par l'image courante (déterministe)
  useLayoutEffect(() => {
    screenMat.uniforms.uTime.value = time;
    screenMat.uniforms.uOn.value = screen;
    screenMat.uniforms.uIsland.value = island;
  }, [screenMat, time, screen, island]);

  const islandY = H2 - I.centerFromTop;
  const zScreen = T2 + 0.02;

  return (
    <group>
      {/* Dalle OLED noire : son dessus forme la bordure sous le verre */}
      <mesh geometry={geo.panel} material={m.inkBlack} position={[0, 0, T2 + 0.01 - 0.25]} />
      {/* Zone active */}
      <mesh geometry={geo.active} material={screenMat} position={[0, 0, zScreen]} />
      {/* Caméra frontale 18 MP, logée dans la Dynamic Island */}
      <group position={[I.frontCamera.offsetX, islandY, zScreen + 0.004]}>
        <mesh geometry={geo.camOuter} material={m.inkBlack} />
        <mesh geometry={geo.camRing} material={m.lensRetainer} position={[0, 0, 0.003]} />
        <mesh
          geometry={geo.camLens}
          material={m.lensCoat}
          position={[0, 0, -0.0705]}
          rotation={[Math.PI / 2, 0, 0]}
          scale={[1, 0.1, 1]}
        />
      </group>
      {/* Capteur infrarouge (à peine perceptible) */}
      <mesh
        geometry={geo.irSensor}
        material={m.lidar}
        position={[-I.frontCamera.offsetX + 0.4, islandY, zScreen + 0.004]}
      />
    </group>
  );
};
