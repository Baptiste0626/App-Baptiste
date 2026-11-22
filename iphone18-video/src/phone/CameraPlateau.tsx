/**
 * Plateau photo arrière : bande surélevée de 2,5 mm sur toute la largeur du haut
 * du dos (hauteur 54 mm), bords arrondis, même aluminium que le châssis.
 * Percé au droit des trois objectifs. Porte les modules photo, le flash True Tone,
 * le LiDAR et le micro.
 */
import { useMemo } from 'react';
import * as THREE from 'three';
import { PHONE } from '../config';
import { CameraLens } from './CameraLens';
import { BACK_SURFACE_Z, H2, PLATEAU_TOP_Z, W2, backUV, useMats } from './context';
import { circlePath, extrudeCentered, roundedContour, shapeFrom } from './geometry';

const P = PHONE.plateau;

export const CameraPlateau: React.FC = () => {
  const m = useMats();

  const plateauGeo = useMemo(() => {
    const b = P.edgeRound;
    const inset = P.inset + b;
    const { cornerRadius, cornerExtentFactor, exponent } = PHONE.outline;
    const pts = roundedContour(
      W2 - inset,
      H2 - inset,
      H2 - P.height + b,
      { kind: 'squircle', extent: cornerRadius * cornerExtentFactor - inset, exponent },
      { kind: 'arc', radius: P.bottomCornerRadius - b },
    );
    const shape = shapeFrom(pts);
    PHONE.lenses.list.forEach((l) => {
      const [x, y] = backUV(l.u, l.v);
      // Perçage : la paroi (au milieu du biseau) tombe à ringInner + 0,1 mm
      shape.holes.push(circlePath(x, y, PHONE.lenses.ringInner + 0.1 + b));
    });
    return extrudeCentered(shape, {
      depth: P.raise,
      bevel: b,
      bevelSegments: 5,
      creaseDeg: 40,
      curveSegments: 40,
    });
  }, []);

  const small = useMemo(() => {
    const f = PHONE.flash;
    const flashRing = new THREE.LatheGeometry(
      [
        new THREE.Vector2(f.radius, 0.15),
        new THREE.Vector2(f.radius, 0.42),
        new THREE.Vector2(f.ringRadius - 0.2, 0.45),
        new THREE.Vector2(f.ringRadius, 0.3),
        new THREE.Vector2(f.ringRadius + 0.1, 0.0),
      ],
      48,
    );
    const flashLens = new THREE.CylinderGeometry(f.radius, f.radius, 0.3, 48);
    // Lentille de Fresnel : anneaux concentriques à peine visibles
    const fresnel = [0.8, 1.4, 2.0, 2.5].map((r) => new THREE.TorusGeometry(r, 0.035, 6, 48));
    const led = new THREE.BoxGeometry(1.6, 0.1, 1.6);
    const lidar = new THREE.CylinderGeometry(PHONE.lidar.radius, PHONE.lidar.radius, 0.35, 48);
    const lidarRing = new THREE.TorusGeometry(PHONE.lidar.radius + 0.05, 0.12, 8, 48);
    const mic = new THREE.CircleGeometry(PHONE.mic.radius, 24);
    const micRing = new THREE.RingGeometry(PHONE.mic.radius, PHONE.mic.radius + 0.15, 24);
    return { flashRing, flashLens, fresnel, led, lidar, lidarRing, mic, micRing };
  }, []);

  const [fx, fy] = backUV(PHONE.flash.u, PHONE.flash.v);
  const [lx, ly] = backUV(PHONE.lidar.u, PHONE.lidar.v);
  const [mx, my] = backUV(PHONE.mic.u, PHONE.mic.v);

  return (
    <group>
      {/* Bande surélevée */}
      <mesh
        geometry={plateauGeo}
        material={m.aluminium}
        position={[0, 0, BACK_SURFACE_Z - P.raise / 2]}
      />

      {/* Trois objectifs en triangle */}
      {PHONE.lenses.list.map((l) => {
        const [x, y] = backUV(l.u, l.v);
        return (
          <CameraLens
            key={l.id}
            position={[x, y, PLATEAU_TOP_Z]}
            diaphragmSides={l.diaphragmSides}
          />
        );
      })}

      {/* Flash True Tone, LiDAR et micro, orientés vers l'arrière (-Z) */}
      <group position={[fx, fy, PLATEAU_TOP_Z]} rotation={[-Math.PI / 2, 0, 0]}>
        <mesh geometry={small.flashRing} material={m.aluminiumPolished} />
        <mesh geometry={small.led} material={m.flashLed} position={[0, 0.06, 0]} />
        <mesh geometry={small.flashLens} material={m.flashLens} position={[0, 0.27, 0]} />
        {small.fresnel.map((g, i) => (
          <mesh key={i} geometry={g} material={m.flashLens} position={[0, 0.42, 0]} rotation={[Math.PI / 2, 0, 0]} />
        ))}
      </group>
      <group position={[lx, ly, PLATEAU_TOP_Z]} rotation={[-Math.PI / 2, 0, 0]}>
        <mesh geometry={small.lidar} material={m.lidar} position={[0, 0.17, 0]} />
        <mesh geometry={small.lidarRing} material={m.aluminiumPolished} position={[0, 0.12, 0]} rotation={[Math.PI / 2, 0, 0]} />
      </group>
      {/* Micro : trou de 0,8 mm */}
      <group position={[mx, my, PLATEAU_TOP_Z - 0.01]} rotation={[0, Math.PI, 0]}>
        <mesh geometry={small.mic} material={m.matteBlack} />
        <mesh geometry={small.micRing} material={m.steel} />
      </group>
    </group>
  );
};
