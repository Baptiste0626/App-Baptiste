/**
 * Châssis aluminium unibody.
 *  - Cadre : 163,4 × 78,0 × 8,75 mm, contour squircle (coin visuel ~12 mm),
 *    tranches plates et chanfrein poli de 0,3 mm sur les deux arêtes.
 *  - Paroi de 2,2 mm (anneau creux → visible tel quel dans la vue éclatée).
 *  - Les perçages de la tranche inférieure sont retirés par le matériau (voir materials/holes.ts).
 */
import { useMemo } from 'react';
import { PHONE } from '../config';
import { extrudeCentered, pathFrom, phoneContour, shapeFrom } from './geometry';
import { useMats } from './context';

export const Chassis: React.FC = () => {
  const m = useMats();
  const geometry = useMemo(() => {
    const { chamfer, wall } = PHONE.frame;
    // Le biseau élargit le contour de `chamfer` : on part d'un contour rentré d'autant.
    const shape = shapeFrom(phoneContour(chamfer, 28));
    const hole = pathFrom(phoneContour(chamfer + wall, 28).reverse());
    shape.holes.push(hole);
    return extrudeCentered(shape, {
      depth: PHONE.thickness,
      bevel: chamfer,
      bevelSegments: 1, // 1 segment = chanfrein plat à 45°
      creaseDeg: 32,
    });
  }, []);
  return <mesh geometry={geometry} material={m.aluminiumFrame} />;
};
