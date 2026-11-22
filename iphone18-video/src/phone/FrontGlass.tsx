/**
 * Verre avant Ceramic Shield 2 : dalle de 0,7 mm aux arêtes arrondies (r 0,28 mm),
 * rentrée de 0,85 mm par rapport au contour (laisse voir la lèvre de métal),
 * dépassant de 0,05 mm au-dessus du cadre.
 */
import { useMemo } from 'react';
import { PHONE } from '../config';
import { T2, useMats } from './context';
import { extrudeCentered, phoneContour, shapeFrom } from './geometry';

const G = PHONE.frontGlass;

export const FrontGlass: React.FC = () => {
  const m = useMats();
  const geometry = useMemo(
    () =>
      extrudeCentered(shapeFrom(phoneContour(G.inset + G.edgeRound, 28)), {
        depth: G.thickness,
        bevel: G.edgeRound,
        bevelSegments: 4,
        creaseDeg: 50,
      }),
    [],
  );
  return (
    <mesh
      geometry={geometry}
      material={m.frontGlass}
      position={[0, 0, T2 + G.proud - G.thickness / 2]}
      renderOrder={10}
    />
  );
};
