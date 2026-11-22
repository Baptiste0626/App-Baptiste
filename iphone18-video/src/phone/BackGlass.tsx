/**
 * Dos en verre Ceramic Shield à finition satinée (0,6 mm), rentré de 0,85 mm.
 * Volontairement VIERGE : aucun logo ni marque.
 */
import { useMemo } from 'react';
import { PHONE } from '../config';
import { T2, useMats } from './context';
import { extrudeCentered, phoneContour, shapeFrom } from './geometry';

const G = PHONE.backGlass;

export const BackGlass: React.FC = () => {
  const m = useMats();
  const geometry = useMemo(
    () =>
      extrudeCentered(shapeFrom(phoneContour(G.inset + 0.2, 28)), {
        depth: G.thickness,
        bevel: 0.2,
        bevelSegments: 3,
        creaseDeg: 50,
      }),
    [],
  );
  return <mesh geometry={geometry} material={m.backGlass} position={[0, 0, -T2 - G.proud + G.thickness / 2]} />;
};
