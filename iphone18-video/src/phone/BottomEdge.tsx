/**
 * Tranche inférieure :
 *  - port USB-C : ouverture en stade 8,4 × 2,6 mm, coque métallique intérieure,
 *    languette centrale et 2 × 12 contacts dorés (pas de 0,5 mm) ;
 *  - 2 rangées de perçages haut-parleur / micro de chaque côté (Ø 0,84 mm),
 *    chaque trou étant un vrai tube sombre (InstancedMesh) ;
 *  - deux vis pentalobes (Ø 1,56 mm) de part et d'autre du port.
 * Le cadre est réellement ouvert à ces endroits (voir materials/holes.ts).
 */
import { useLayoutEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { PHONE } from '../config';
import { bottomHoleCenters } from '../materials/holes';
import { H2, useMats } from './context';
import { pentalobePoints, shapeFrom, stadiumPoints } from './geometry';

const U = PHONE.bottom.usbc;
const HO = PHONE.bottom.holes;
const S = PHONE.bottom.screws;

export const BottomEdge: React.FC = () => {
  const m = useMats();
  const tubes = useRef<THREE.InstancedMesh>(null);
  const caps = useRef<THREE.InstancedMesh>(null);
  const contacts = useRef<THREE.InstancedMesh>(null);
  const centers = useMemo(bottomHoleCenters, []);

  const geo = useMemo(() => {
    // Cavité du port : extrusion du stade sur 6,5 mm vers l'intérieur (+Y)
    const cavity = new THREE.ExtrudeGeometry(shapeFrom(stadiumPoints(U.length, U.height, 20)), {
      depth: U.depth,
      bevelEnabled: false,
    });
    cavity.rotateX(-Math.PI / 2);
    // Chanfrein poli autour de l'ouverture
    const lipShape = shapeFrom(stadiumPoints(U.length + 0.5, U.height + 0.5, 20));
    lipShape.holes.push(new THREE.Path(stadiumPoints(U.length, U.height, 20).reverse()));
    const lip = new THREE.ShapeGeometry(lipShape);
    const tongue = new THREE.BoxGeometry(6.6, 4.2, 0.7);
    const contact = new THREE.BoxGeometry(0.25, 2.2, 0.03);
    const tube = new THREE.CylinderGeometry(HO.radius, HO.radius, HO.depth, 14, 1, true);
    const cap = new THREE.CircleGeometry(HO.radius, 14);
    const screwHead = new THREE.CircleGeometry(S.radius, 32);
    const screwStar = new THREE.ShapeGeometry(shapeFrom(pentalobePoints(S.radius * 0.62)));
    const endWall = new THREE.PlaneGeometry(U.length, U.height);
    return { cavity, lip, tongue, contact, tube, cap, screwHead, screwStar, endWall };
  }, []);

  useLayoutEffect(() => {
    const mat = new THREE.Matrix4();
    const rot = new THREE.Matrix4().makeRotationX(Math.PI / 2); // disque orienté vers -Y
    centers.forEach(([x, z], i) => {
      mat.makeTranslation(x, -H2 + HO.depth / 2, z);
      tubes.current?.setMatrixAt(i, mat);
      mat.makeTranslation(x, -H2 + HO.depth - 0.01, z).multiply(rot);
      caps.current?.setMatrixAt(i, mat);
    });
    // Contacts : 12 sur chaque face de la languette
    const n = U.contactsPerSide;
    for (let side = 0; side < 2; side++) {
      for (let i = 0; i < n; i++) {
        const x = (i - (n - 1) / 2) * 0.5;
        mat.makeTranslation(x, 0, (side ? 1 : -1) * 0.36);
        contacts.current?.setMatrixAt(side * n + i, mat);
      }
    }
    [tubes, caps, contacts].forEach((r) => {
      if (r.current) r.current.instanceMatrix.needsUpdate = true;
    });
  }, [centers]);

  return (
    <group>
      {/* Port USB-C */}
      <mesh geometry={geo.cavity} material={m.portShell} position={[0, -H2, 0]} />
      <mesh geometry={geo.lip} material={m.aluminiumPolished} position={[0, -H2 - 0.003, 0]} rotation={[Math.PI / 2, 0, 0]} />
      <group position={[0, -H2 + U.depth - 2.1, 0]}>
        <mesh geometry={geo.tongue} material={m.plasticBlack} />
        <instancedMesh ref={contacts} args={[geo.contact, m.gold, U.contactsPerSide * 2]} position={[0, -0.95, 0]} />
      </group>
      <mesh
        geometry={geo.endWall}
        material={m.matteBlack}
        position={[0, -H2 + U.depth - 0.02, 0]}
        rotation={[Math.PI / 2, 0, 0]}
      />

      {/* Perçages haut-parleur et micro */}
      <instancedMesh ref={tubes} args={[geo.tube, m.barrel, centers.length]} />
      <instancedMesh ref={caps} args={[geo.cap, m.matteBlack, centers.length]} />

      {/* Vis pentalobes */}
      {[-1, 1].map((s) => (
        <group key={s} position={[s * S.x, -H2 - 0.004, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <mesh geometry={geo.screwHead} material={m.steel} />
          <mesh geometry={geo.screwStar} material={m.matteBlack} position={[0, 0, 0.003]} />
        </group>
      ))}
    </group>
  );
};
