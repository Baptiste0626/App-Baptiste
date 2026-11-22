/**
 * Composants internes stylisés, visibles dans la vue éclatée :
 *  - carte mère 62 × 52 × 0,8 mm (texture de pistes procédurale), blindages,
 *    composants CMS instanciés et puce marquée « A20 Pro » (15 × 15 mm) ;
 *  - batterie 66 × 92 × 4 mm.
 */
import { useLayoutEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { useDelayRender } from 'remotion';
import { PHONE } from '../config';
import { createChipLabelTexture, createPcbTexture, rng } from '../materials/textures';
import { useMats } from './context';

const B = PHONE.internals.board;
const BAT = PHONE.internals.battery;
const FONT = 'Inter, "Helvetica Neue", Arial, sans-serif';

export const LogicBoard: React.FC = () => {
  const m = useMats();
  const smdRef = useRef<THREE.InstancedMesh>(null);
  const { delayRender, continueRender } = useDelayRender();
  const SMD_COUNT = 70;

  const pcbMat = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        map: createPcbTexture(),
        roughness: 0.42,
        metalness: 0.25,
        clearcoat: 0.5,
      }),
    [],
  );

  // L'étiquette de la puce attend que la police Inter soit chargée (rendu identique à chaque image).
  const [label, setLabel] = useState<THREE.Texture | null>(null);
  useLayoutEffect(() => {
    const handle = delayRender('Étiquette de la puce');
    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      setLabel(createChipLabelTexture(B.chipLabel, FONT));
      continueRender(handle);
    };
    Promise.all([document.fonts.load(`500 92px Inter`), document.fonts.load(`300 30px Inter`)])
      .then(finish)
      .catch(finish);
    return () => {
      if (!done) continueRender(handle);
    };
  }, [delayRender, continueRender]);

  const geo = useMemo(
    () => ({
      board: new RoundedBoxGeometry(B.width, B.height, B.thickness, 2, 0.4),
      chip: new RoundedBoxGeometry(15, 15, 1.0, 2, 0.3),
      label: new THREE.PlaneGeometry(14.2, 14.2),
      shield: new RoundedBoxGeometry(18, 12, 0.6, 2, 0.25),
      smd: new THREE.BoxGeometry(1, 1, 1),
    }),
    [],
  );

  useLayoutEffect(() => {
    const mesh = smdRef.current;
    if (!mesh) return;
    const rand = rng(99);
    const mat = new THREE.Matrix4();
    const q = new THREE.Quaternion();
    for (let i = 0; i < SMD_COUNT; i++) {
      let x = 0;
      let y = 0;
      // Évite la zone de la puce centrale
      do {
        x = (rand() - 0.5) * (B.width - 6);
        y = (rand() - 0.5) * (B.height - 6);
      } while (Math.abs(x + 4) < 10 && Math.abs(y) < 10);
      const sx = 0.6 + rand() * 2.4;
      const sy = 0.4 + rand() * 1.6;
      const sz = 0.25 + rand() * 0.6;
      q.setFromAxisAngle(new THREE.Vector3(0, 0, 1), rand() > 0.5 ? Math.PI / 2 : 0);
      mat.compose(new THREE.Vector3(x, y, B.thickness / 2 + sz / 2), q, new THREE.Vector3(sx, sy, sz));
      mesh.setMatrixAt(i, mat);
    }
    mesh.instanceMatrix.needsUpdate = true;
  }, []);

  return (
    <group position={[0, B.centerY, B.z]}>
      <mesh geometry={geo.board} material={pcbMat} />
      <group position={[-4, 0, B.thickness / 2 + 0.5]}>
        <mesh geometry={geo.chip} material={m.chipLid} />
        {label ? (
          <mesh geometry={geo.label} position={[0, 0, 0.51]}>
            <meshPhysicalMaterial map={label} roughness={0.35} metalness={0.5} clearcoat={0.6} />
          </mesh>
        ) : null}
      </group>
      <mesh geometry={geo.shield} material={m.steel} position={[17, 14, B.thickness / 2 + 0.3]} />
      <mesh geometry={geo.shield} material={m.steel} position={[18, -15, B.thickness / 2 + 0.3]} />
      <instancedMesh ref={smdRef} args={[geo.smd, m.smd, SMD_COUNT]} />
    </group>
  );
};

export const Battery: React.FC = () => {
  const m = useMats();
  const geo = useMemo(() => new RoundedBoxGeometry(BAT.width, BAT.height, BAT.thickness, 3, 1.4), []);
  return <mesh geometry={geo} material={m.battery} position={[0, BAT.centerY, BAT.z]} />;
};
