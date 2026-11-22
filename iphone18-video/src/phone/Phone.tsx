/**
 * Assemblage du téléphone (repère : 1 unité = 1 mm, centre du boîtier à l'origine,
 * Y = hauteur, X = largeur, +Z = face avant, -Z = dos).
 *
 * Les six couches de la vue éclatée se séparent sur l'axe Z :
 *   verre avant · écran · châssis · carte mère · batterie · dos (+ plateau photo)
 */
import { useLayoutEffect, useMemo } from 'react';
import { createPhoneMaterials, updateColorway } from '../materials/phoneMaterials';
import type { Vec3 } from '../lib/shot';
import { AntennaBands } from './AntennaBands';
import { BackGlass } from './BackGlass';
import { BottomEdge } from './BottomEdge';
import { Buttons } from './Buttons';
import { CameraControl } from './CameraControl';
import { CameraPlateau } from './CameraPlateau';
import { Chassis } from './Chassis';
import { PhoneMaterialsContext } from './context';
import { Display } from './Display';
import { Earpiece } from './Earpiece';
import { FrontGlass } from './FrontGlass';
import { Battery, LogicBoard } from './Internals';

/** Décalage de chaque couche (mm) pour explode = 1. */
export const EXPLODE_OFFSETS = {
  frontGlass: 84,
  display: 54,
  frame: 0,
  board: -30,
  battery: -60,
  back: -92,
} as const;

export interface PhoneProps {
  explode: number;
  aluminium: Vec3;
  backGlass: Vec3;
  time: number;
  screen: number;
  island: number;
  ccPress: number;
}

export const Phone: React.FC<PhoneProps> = ({ explode, aluminium, backGlass, time, screen, island, ccPress }) => {
  const materials = useMemo(createPhoneMaterials, []);

  useLayoutEffect(() => {
    updateColorway(materials, aluminium, backGlass);
  }, [materials, aluminium, backGlass]);

  const z = (k: keyof typeof EXPLODE_OFFSETS) => EXPLODE_OFFSETS[k] * explode;
  // Les internes ne sont rendus que s'ils peuvent être vus (économie GPU).
  const showInternals = explode > 0.001;

  return (
    <PhoneMaterialsContext.Provider value={materials}>
      <group name="front-glass" position={[0, 0, z('frontGlass')]}>
        <FrontGlass />
      </group>
      <group name="display" position={[0, 0, z('display')]}>
        <Display time={time} screen={screen} island={island} />
      </group>
      <group name="frame" position={[0, 0, z('frame')]}>
        <Chassis />
        <AntennaBands />
        <Buttons />
        <CameraControl press={ccPress} />
        <BottomEdge />
        <Earpiece />
      </group>
      <group name="board" position={[0, 0, z('board')]} visible={showInternals}>
        <LogicBoard />
      </group>
      <group name="battery" position={[0, 0, z('battery')]} visible={showInternals}>
        <Battery />
      </group>
      <group name="back" position={[0, 0, z('back')]}>
        <BackGlass />
        <CameraPlateau />
      </group>
    </PhoneMaterialsContext.Provider>
  );
};
