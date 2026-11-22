/**
 * Grille d'écouteur : fente de 11 × 0,32 mm logée dans le liseré métallique
 * supérieur, garnie de 44 barreaux très fins (InstancedMesh, 1 seul draw call).
 */
import { useLayoutEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { PHONE } from '../config';
import { H2, T2, useMats } from './context';

const E = PHONE.earpiece;

export const Earpiece: React.FC = () => {
  const m = useMats();
  const ref = useRef<THREE.InstancedMesh>(null);
  const geo = useMemo(
    () => ({
      slot: new RoundedBoxGeometry(E.length, E.height, 0.12, 2, E.height / 2 - 0.01),
      bar: new THREE.BoxGeometry(0.07, E.height * 0.86, 0.02),
    }),
    [],
  );
  useLayoutEffect(() => {
    const mesh = ref.current;
    if (!mesh) return;
    const mat = new THREE.Matrix4();
    const usable = E.length - E.height;
    for (let i = 0; i < E.bars; i++) {
      const x = -usable / 2 + (usable * i) / (E.bars - 1);
      mat.makeTranslation(x, 0, 0.055);
      mesh.setMatrixAt(i, mat);
    }
    mesh.instanceMatrix.needsUpdate = true;
  }, []);
  return (
    <group position={[0, H2 - E.fromTop, T2]}>
      <mesh geometry={geo.slot} material={m.matteBlack} />
      <instancedMesh ref={ref} args={[geo.bar, m.steel, E.bars]} />
    </group>
  );
};
