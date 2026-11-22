/**
 * Boutons physiques (relief 0,4 mm, bords arrondis r 0,35 mm, largeur 3 mm) :
 *  - tranche gauche : bouton Action (7,5 mm), volume + et volume − (11,5 mm) ;
 *  - tranche droite : bouton latéral (19 mm).
 * Chaque bouton est encastré de 0,6 mm dans la paroi pour éviter tout jour.
 */
import { useMemo } from 'react';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { PHONE } from '../config';
import { H2, W2, useMats } from './context';

const B = PHONE.buttons;
const EMBED = 0.6;

export const Buttons: React.FC = () => {
  const m = useMats();
  const geos = useMemo(() => {
    const cache = new Map<number, RoundedBoxGeometry>();
    const get = (length: number) => {
      if (!cache.has(length)) {
        cache.set(length, new RoundedBoxGeometry(B.relief + EMBED, length, B.width, 3, B.radius));
      }
      return cache.get(length)!;
    };
    return { get };
  }, []);
  const cx = W2 + B.relief - (B.relief + EMBED) / 2;
  return (
    <group>
      {B.left.map((b) => (
        <mesh key={b.id} geometry={geos.get(b.length)} material={m.aluminium} position={[-cx, H2 - b.fromTop, 0]} />
      ))}
      {B.right.map((b) => (
        <mesh key={b.id} geometry={geos.get(b.length)} material={m.aluminium} position={[cx, H2 - b.fromTop, 0]} />
      ))}
    </group>
  );
};
