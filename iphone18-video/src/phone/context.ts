/** Contexte partagé du modèle : matériaux + état animé de l'image courante. */
import { createContext, useContext } from 'react';
import type { PhoneMaterials } from '../materials/phoneMaterials';
import { PHONE } from '../config';

export interface PhoneAnimState {
  /** Temps en secondes (dérivé du numéro d'image, jamais du temps réel). */
  time: number;
  screen: number;
  island: number;
  ccPress: number;
}

export const PhoneMaterialsContext = createContext<PhoneMaterials | null>(null);

export const useMats = () => {
  const m = useContext(PhoneMaterialsContext);
  if (!m) throw new Error('PhoneMaterialsContext manquant');
  return m;
};

/** Raccourcis de cotes fréquemment utilisées. */
export const T2 = PHONE.thickness / 2;
export const H2 = PHONE.height / 2;
export const W2 = PHONE.width / 2;
/** Conversion (u, v) « vu de dos depuis le coin supérieur gauche » → (x, y) du téléphone. */
export const backUV = (u: number, v: number): [number, number] => [W2 - u, H2 - v];
/** Hauteur (z) de la surface du verre arrière et du dessus du plateau. */
export const BACK_SURFACE_Z = -T2 - PHONE.backGlass.proud;
export const PLATEAU_TOP_Z = BACK_SURFACE_Z - PHONE.plateau.raise;
