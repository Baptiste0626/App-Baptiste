/**
 * Bandes d'antenne : lignes de 0,8 mm de matière plus mate qui coupent le cadre
 * (deux par tranche latérale, deux sur la tranche supérieure).
 * Elles couvrent uniquement la partie plate de la tranche (hors chanfreins).
 */
import { useMemo } from 'react';
import * as THREE from 'three';
import { PHONE } from '../config';
import { H2, W2, useMats } from './context';

export const AntennaBands: React.FC = () => {
  const m = useMats();
  const flat = PHONE.thickness - 2 * PHONE.frame.chamfer;
  const { width, sideFromTop, topX } = PHONE.antenna;
  const sideGeo = useMemo(() => new THREE.BoxGeometry(0.04, width, flat), [width, flat]);
  const topGeo = useMemo(() => new THREE.BoxGeometry(width, 0.04, flat), [width, flat]);
  return (
    <group>
      {sideFromTop.flatMap((fromTop) =>
        [-1, 1].map((side) => (
          <mesh
            key={`s${fromTop}${side}`}
            geometry={sideGeo}
            material={m.antenna}
            position={[side * (W2 + 0.005), H2 - fromTop, 0]}
          />
        )),
      )}
      {topX.map((x) => (
        <mesh key={`t${x}`} geometry={topGeo} material={m.antenna} position={[x, H2 + 0.005, 0]} />
      ))}
    </group>
  );
};
