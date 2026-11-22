/**
 * Un module photo complet (construit le long de +Y, puis orienté vers l'arrière) :
 *  - anneau métallique extérieur poli (Ø 17,2 mm, relief 1,3 mm) ;
 *  - verre saphir Ø 13,8 mm avec reflet bleu-violet (iridescence) ;
 *  - 4 lentilles internes concentriques posées sur des gradins de fût ;
 *  - diaphragme sombre au centre (7 lames, ou carré pour le périscope).
 * h = 0 correspond au dessus du plateau photo.
 */
import { useMemo } from 'react';
import * as THREE from 'three';
import { PHONE } from '../config';
import { useMats } from './context';

const L = PHONE.lenses;
const SEG = 72;

/** Profil de l'anneau : paroi intérieure → sommet arrondi → flanc → raccord au plateau. */
const ringProfile = (sapphireBottom: number) => {
  const ri = L.ringInner;
  const ro = L.ringOuter;
  const top = L.ringRaise;
  return [
    new THREE.Vector2(ri, sapphireBottom),
    new THREE.Vector2(ri, top - 0.25),
    new THREE.Vector2(ri + 0.12, top - 0.1),
    new THREE.Vector2(ri + 0.4, top),
    new THREE.Vector2(ro - 0.45, top),
    new THREE.Vector2(ro - 0.12, top - 0.12),
    new THREE.Vector2(ro, top - 0.4),
    new THREE.Vector2(ro + 0.04, 0.12),
    new THREE.Vector2(ro + 0.3, 0.0),
  ];
};

/** Fût intérieur en gradins : chaque lentille repose sur un épaulement. */
const barrelProfile = (sapphireBottom: number) => {
  const pts: THREE.Vector2[] = [new THREE.Vector2(L.ringInner - 0.01, sapphireBottom)];
  let r = L.ringInner - 0.01;
  L.internal.forEach(({ radius, depth }) => {
    const h = sapphireBottom - depth;
    pts.push(new THREE.Vector2(r, h));
    r = radius - 0.3;
    pts.push(new THREE.Vector2(r, h));
  });
  const hd = sapphireBottom - L.diaphragm.depth;
  pts.push(new THREE.Vector2(r, hd));
  pts.push(new THREE.Vector2(0.01, hd));
  return pts;
};

/** Calotte sphérique convexe de rayon de base r et de flèche s. */
const capGeometry = (r: number, s: number) => {
  const R = (r * r + s * s) / (2 * s);
  const theta = Math.asin(r / R);
  const g = new THREE.SphereGeometry(R, 56, 6, 0, Math.PI * 2, 0, theta);
  g.translate(0, s - R, 0);
  return g;
};

export interface CameraLensProps {
  position: [number, number, number];
  diaphragmSides: number;
}

export const CameraLens: React.FC<CameraLensProps> = ({ position, diaphragmSides }) => {
  const m = useMats();
  const sapphireTop = L.ringRaise - L.sapphireRecess;
  const sapphireBottom = sapphireTop - L.sapphireThickness;

  const geo = useMemo(() => {
    const ring = new THREE.LatheGeometry(ringProfile(sapphireBottom), SEG);
    const barrel = new THREE.LatheGeometry(barrelProfile(sapphireBottom), SEG);
    const sapphire = new THREE.CylinderGeometry(
      L.ringInner - 0.02,
      L.ringInner - 0.02,
      L.sapphireThickness,
      SEG,
    );
    const caps = L.internal.map(({ radius }) => capGeometry(radius, radius * 0.085));
    const diaphragm = new THREE.CircleGeometry(L.diaphragm.radius, diaphragmSides);
    return { ring, barrel, sapphire, caps, diaphragm };
  }, [sapphireBottom, diaphragmSides]);

  return (
    // Rotation -90° autour de X : l'axe +Y du module pointe vers -Z (dos du téléphone).
    <group position={position} rotation={[-Math.PI / 2, 0, 0]}>
      <mesh geometry={geo.ring} material={m.aluminiumPolished} />
      <mesh geometry={geo.barrel} material={m.lensRetainer} />
      {L.internal.map(({ depth }, i) => (
        <mesh
          key={i}
          geometry={geo.caps[i]}
          material={m.lensCoat}
          position={[0, sapphireBottom - depth + 0.01, 0]}
        />
      ))}
      <mesh
        geometry={geo.diaphragm}
        material={m.matteBlack}
        position={[0, sapphireBottom - L.diaphragm.depth + 0.02, 0]}
        rotation={[-Math.PI / 2, 0, diaphragmSides === 4 ? Math.PI / 4 : 0]}
      />
      <mesh
        geometry={geo.sapphire}
        material={m.sapphire}
        position={[0, sapphireTop - L.sapphireThickness / 2, 0]}
      />
    </group>
  );
};
