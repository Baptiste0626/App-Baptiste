/**
 * Bibliothèque de matériaux physiques (MeshPhysicalMaterial) du téléphone.
 * Créés une seule fois et partagés par tous les composants (réutilisation GPU).
 * Les teintes dépendant du coloris sont mises à jour à chaque image via
 * `updateColorway` (interpolation fluide en scène 7).
 */
import * as THREE from 'three';
import { MATERIALS } from '../config';
import type { Vec3 } from '../lib/shot';
import { applyBottomHoles } from './holes';
import { createBrushedAnisotropyMap, createRoughnessNoise } from './textures';

export interface PhoneMaterials {
  aluminium: THREE.MeshPhysicalMaterial;
  aluminiumFrame: THREE.MeshPhysicalMaterial;
  aluminiumPolished: THREE.MeshPhysicalMaterial;
  antenna: THREE.MeshPhysicalMaterial;
  backGlass: THREE.MeshPhysicalMaterial;
  frontGlass: THREE.MeshPhysicalMaterial;
  sapphire: THREE.MeshPhysicalMaterial;
  lensCoat: THREE.MeshPhysicalMaterial;
  lensRetainer: THREE.MeshPhysicalMaterial;
  barrel: THREE.MeshPhysicalMaterial;
  matteBlack: THREE.MeshBasicMaterial;
  inkBlack: THREE.MeshPhysicalMaterial;
  flashLens: THREE.MeshPhysicalMaterial;
  flashLed: THREE.MeshStandardMaterial;
  lidar: THREE.MeshPhysicalMaterial;
  portShell: THREE.MeshPhysicalMaterial;
  plasticBlack: THREE.MeshPhysicalMaterial;
  gold: THREE.MeshPhysicalMaterial;
  ccSapphire: THREE.MeshPhysicalMaterial;
  steel: THREE.MeshPhysicalMaterial;
  battery: THREE.MeshPhysicalMaterial;
  chipLid: THREE.MeshPhysicalMaterial;
  smd: THREE.MeshPhysicalMaterial;
}

export const createPhoneMaterials = (): PhoneMaterials => {
  const aniso = createBrushedAnisotropyMap();
  const satin = createRoughnessNoise(128, MATERIALS.backGlass.roughness, 0.1, 11);
  const A = MATERIALS.aluminium;

  /** Aluminium anodisé : métal brossé (anisotropie) + fin vernis (clearcoat). */
  const aluminium = new THREE.MeshPhysicalMaterial({
    name: 'aluminium',
    metalness: A.metalness,
    roughness: A.roughness,
    anisotropy: A.anisotropy,
    anisotropyMap: aniso,
    clearcoat: A.clearcoat,
    clearcoatRoughness: A.clearcoatRoughness,
  });

  /** Même aluminium, avec les perçages de la tranche inférieure. */
  const aluminiumFrame = applyBottomHoles(aluminium.clone());
  aluminiumFrame.name = 'aluminium-frame';

  /** Aluminium poli (anneaux d'objectifs, chanfreins accrocheurs de lumière). */
  const aluminiumPolished = new THREE.MeshPhysicalMaterial({
    name: 'aluminium-polished',
    metalness: 1,
    roughness: 0.14,
    clearcoat: 0.6,
    clearcoatRoughness: 0.05,
  });

  /** Bandes d'antenne : composite plus mat, même teinte. */
  const antenna = new THREE.MeshPhysicalMaterial({
    name: 'antenna',
    metalness: MATERIALS.antenna.metalness,
    roughness: MATERIALS.antenna.roughness,
    polygonOffset: true,
    polygonOffsetFactor: -2,
    polygonOffsetUnits: -2,
  });

  /** Verre arrière satiné (micro-texture de rugosité). */
  const backGlass = new THREE.MeshPhysicalMaterial({
    name: 'back-glass',
    metalness: 0,
    roughness: MATERIALS.backGlass.roughness,
    roughnessMap: satin,
    clearcoat: MATERIALS.backGlass.clearcoat,
    clearcoatRoughness: MATERIALS.backGlass.clearcoatRoughness,
    sheen: 0.25,
    sheenRoughness: 0.6,
  });

  /**
   * Verre avant : couche de reflets nets posée en mélange additif sur l'écran.
   * La base est noire : seule la réflexion spéculaire (Fresnel + clearcoat) s'ajoute,
   * ce qui donne des reflets de verre réalistes sans masquer l'image affichée.
   */
  const frontGlass = new THREE.MeshPhysicalMaterial({
    name: 'front-glass',
    color: '#000000',
    metalness: 0,
    roughness: MATERIALS.frontGlass.roughness,
    ior: MATERIALS.frontGlass.ior,
    transmission: MATERIALS.frontGlass.transmission,
    thickness: 0.7,
    clearcoat: MATERIALS.frontGlass.clearcoat,
    clearcoatRoughness: 0.02,
    specularIntensity: 1,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });

  /** Verre saphir des objectifs : couche antireflet simulée par iridescence. */
  const sapphire = new THREE.MeshPhysicalMaterial({
    name: 'sapphire',
    color: MATERIALS.sapphire.tint,
    metalness: 0,
    roughness: 0.02,
    transmission: 1,
    thickness: 0.3,
    ior: MATERIALS.sapphire.ior,
    iridescence: MATERIALS.sapphire.iridescence,
    iridescenceIOR: MATERIALS.sapphire.iridescenceIOR,
    iridescenceThicknessRange: [180, 420],
    clearcoat: 1,
    clearcoatRoughness: 0.0,
    attenuationColor: new THREE.Color('#8f86ff'),
    attenuationDistance: 10,
  });

  /** Lentilles internes : verre sombre traité (reflets verts/violets). */
  const lensCoat = new THREE.MeshPhysicalMaterial({
    name: 'lens-coat',
    color: MATERIALS.lensCoating.color,
    metalness: 0.45,
    roughness: 0.12,
    clearcoat: 1,
    clearcoatRoughness: 0,
    iridescence: MATERIALS.lensCoating.iridescence,
    iridescenceIOR: MATERIALS.lensCoating.iridescenceIOR,
    iridescenceThicknessRange: [250, 600],
  });

  const lensRetainer = new THREE.MeshPhysicalMaterial({
    name: 'lens-retainer',
    color: '#1a1a1d',
    metalness: 1,
    roughness: 0.38,
  });

  /** Fût intérieur des objectifs : noir mat, vu de l'intérieur (BackSide). */
  const barrel = new THREE.MeshPhysicalMaterial({
    name: 'barrel',
    color: '#050506',
    metalness: 0.2,
    roughness: 0.7,
    side: THREE.DoubleSide,
  });

  const matteBlack = new THREE.MeshBasicMaterial({ name: 'matte-black', color: '#000000' });

  const inkBlack = new THREE.MeshPhysicalMaterial({
    name: 'ink-black',
    color: '#060608',
    metalness: 0,
    roughness: 0.3,
    clearcoat: 0.6,
  });

  /** Flash True Tone : disque translucide légèrement jaune. */
  const flashLens = new THREE.MeshPhysicalMaterial({
    name: 'flash-lens',
    color: '#fff1cc',
    metalness: 0,
    roughness: 0.32,
    transmission: 0.55,
    thickness: 1,
    ior: 1.5,
    clearcoat: 1,
  });
  const flashLed = new THREE.MeshStandardMaterial({
    name: 'flash-led',
    color: '#f6dc9a',
    emissive: '#ffcf6e',
    emissiveIntensity: 0.06,
    roughness: 0.6,
  });

  /** Capteur LiDAR : noir mat profond. */
  const lidar = new THREE.MeshPhysicalMaterial({
    name: 'lidar',
    color: '#030304',
    roughness: 0.55,
    clearcoat: 0.8,
    clearcoatRoughness: 0.1,
  });

  /** Coque métallique intérieure du port USB-C (vue de l'intérieur). */
  const portShell = new THREE.MeshPhysicalMaterial({
    name: 'port-shell',
    color: '#9a9ca2',
    metalness: 1,
    roughness: 0.35,
    side: THREE.BackSide,
  });

  const plasticBlack = new THREE.MeshPhysicalMaterial({
    name: 'plastic-black',
    color: '#0b0b0d',
    roughness: 0.5,
  });

  const gold = new THREE.MeshPhysicalMaterial({
    name: 'gold',
    color: MATERIALS.gold,
    metalness: 1,
    roughness: 0.22,
  });

  /** Saphir du bouton Commande de l'appareil photo (affleurant, sombre). */
  const ccSapphire = new THREE.MeshPhysicalMaterial({
    name: 'cc-sapphire',
    color: '#15171d',
    metalness: 0.2,
    roughness: 0.04,
    clearcoat: 1,
    clearcoatRoughness: 0,
    iridescence: 0.45,
    iridescenceIOR: 1.3,
  });

  const steel = new THREE.MeshPhysicalMaterial({
    name: 'steel',
    color: '#8d8f94',
    metalness: 1,
    roughness: 0.3,
  });

  const battery = new THREE.MeshPhysicalMaterial({
    name: 'battery',
    color: '#4a4c52',
    metalness: 0.5,
    roughness: 0.38,
    clearcoat: 0.4,
  });

  const chipLid = new THREE.MeshPhysicalMaterial({
    name: 'chip-lid',
    color: '#2c2d31',
    metalness: 0.8,
    roughness: 0.3,
  });

  const smd = new THREE.MeshPhysicalMaterial({
    name: 'smd',
    color: '#1d1e22',
    metalness: 0.4,
    roughness: 0.45,
  });

  return {
    aluminium,
    aluminiumFrame,
    aluminiumPolished,
    antenna,
    backGlass,
    frontGlass,
    sapphire,
    lensCoat,
    lensRetainer,
    barrel,
    matteBlack,
    inkBlack,
    flashLens,
    flashLed,
    lidar,
    portShell,
    plasticBlack,
    gold,
    ccSapphire,
    steel,
    battery,
    chipLid,
    smd,
  };
};

/** Applique la teinte du coloris courant (couleurs en RVB linéaire). */
export const updateColorway = (m: PhoneMaterials, aluminium: Vec3, backGlass: Vec3) => {
  m.aluminium.color.setRGB(...aluminium);
  m.aluminiumFrame.color.setRGB(...aluminium);
  // L'aluminium poli est un peu plus clair pour accrocher la lumière
  m.aluminiumPolished.color.setRGB(
    Math.min(1, aluminium[0] * 1.12 + 0.02),
    Math.min(1, aluminium[1] * 1.12 + 0.02),
    Math.min(1, aluminium[2] * 1.12 + 0.02),
  );
  m.antenna.color.setRGB(aluminium[0] * 0.82, aluminium[1] * 0.82, aluminium[2] * 0.82);
  m.backGlass.color.setRGB(...backGlass);
  m.backGlass.sheenColor.setRGB(...backGlass);
};
