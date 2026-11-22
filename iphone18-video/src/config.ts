/**
 * ============================================================================
 *  CONFIGURATION CENTRALE DU FILM
 * ============================================================================
 *  Toutes les dimensions (1 unité = 1 mm), couleurs, durées et réglages de
 *  rendu sont ici. Aucun autre fichier ne contient de « nombre magique » qui
 *  décrit le produit : on modifie le film depuis ce seul fichier.
 *
 *  - Changer de coloris :      ACTIVE_COLORWAY
 *  - Changer de durée :        SCENES[i].seconds (le total se recalcule seul)
 *  - Qualité / performances :  RENDER
 * ============================================================================
 */

// ---------------------------------------------------------------------------
// Coloris
// ---------------------------------------------------------------------------

export type ColorwayId = 'noir' | 'argent' | 'glacier' | 'bordeaux';

export interface Colorway {
  /** Libellé affiché (FR). */
  label: string;
  /** Teinte de l'aluminium anodisé (châssis, plateau photo, boutons). */
  aluminium: string;
  /** Teinte du verre arrière satiné (légèrement plus claire que le métal). */
  backGlass: string;
}

export const COLORWAYS: Record<ColorwayId, Colorway> = {
  noir: { label: 'Noir', aluminium: '#2B2B2E', backGlass: '#353539' },
  argent: { label: 'Argent', aluminium: '#D9D9DC', backGlass: '#E6E6E8' },
  glacier: { label: 'Glacier', aluminium: '#BFD7E6', backGlass: '#CFE1EC' },
  bordeaux: { label: 'Bordeaux', aluminium: '#5C1F2B', backGlass: '#6B2835' },
};

/** Ordre canonique des coloris (utilisé par la scène 7). */
export const COLORWAY_ORDER: ColorwayId[] = ['noir', 'argent', 'glacier', 'bordeaux'];

/** ⬅️ LE paramètre unique pour changer le coloris principal du film. */
export const ACTIVE_COLORWAY: ColorwayId = 'argent';

// ---------------------------------------------------------------------------
// Dimensions du téléphone (mm)
// ---------------------------------------------------------------------------

const H = 163.4;
const W = 78.0;
const T = 8.75;

/** Écran : dimensions physiques déduites de la définition et de la densité. */
const DISPLAY_PX_W = 1320;
const DISPLAY_PX_H = 2868;
const DISPLAY_PPI = 460;
const MM_PER_INCH = 25.4;

export const PHONE = {
  height: H,
  width: W,
  thickness: T,
  weightGrams: 249,

  /** Contour « squircle » (coin à courbure continue). */
  outline: {
    /** Rayon visuel recherché. */
    cornerRadius: 12,
    /** Étendue réelle du raccord : un squircle démarre plus tôt qu'un arc. */
    cornerExtentFactor: 1.38,
    /** Exposant de la super-ellipse (2 = arc, >2 = plus carré, ~4-5 = Apple-like). */
    exponent: 4.4,
    /** Points par coin (qualité du contour). */
    segmentsPerCorner: 22,
  },

  /** Châssis aluminium unibody. */
  frame: {
    /** Chanfrein poli sur les arêtes. */
    chamfer: 0.3,
    /** Épaisseur de paroi du cadre (vue de face). */
    wall: 2.2,
  },

  /** Verre avant Ceramic Shield 2. */
  frontGlass: {
    /** Retrait par rapport au contour : laisse voir une fine lèvre métallique. */
    inset: 0.85,
    thickness: 0.7,
    /** Le verre dépasse légèrement du cadre. */
    proud: 0.05,
    edgeRound: 0.28,
  },

  /** Verre arrière Ceramic Shield. */
  backGlass: {
    inset: 0.85,
    thickness: 0.6,
    proud: 0.05,
  },

  /** Écran OLED 6,9". */
  display: {
    diagonalInch: 6.9,
    pxW: DISPLAY_PX_W,
    pxH: DISPLAY_PX_H,
    ppi: DISPLAY_PPI,
    refreshHz: 120,
    peakNits: 3000,
    /** Taille physique de la zone active (mm). */
    activeWidth: (DISPLAY_PX_W / DISPLAY_PPI) * MM_PER_INCH, // ≈ 72,9
    activeHeight: (DISPLAY_PX_H / DISPLAY_PPI) * MM_PER_INCH, // ≈ 158,4
    /** Bordure noire uniforme sous le verre. */
    bezel: 1.5,
  },

  /** Dynamic Island (pilule noire) et caméra frontale 18 MP. */
  island: {
    /** Distance du centre de la pilule au bord supérieur du téléphone. */
    centerFromTop: 13.2,
    width: 20.4,
    height: 6.1,
    /** Taille déployée pendant l'animation de la scène 5. */
    expandedWidth: 38,
    expandedHeight: 10.5,
    frontCamera: { offsetX: 6.2, radius: 1.45, megapixels: 18 },
  },

  /** Grille d'écouteur dans le liseré supérieur. */
  earpiece: { length: 11, height: 0.32, fromTop: 0.62, bars: 44 },

  /** Plateau photo arrière (bande pleine largeur). */
  plateau: {
    height: 54,
    raise: 2.5,
    inset: 0.7,
    bottomCornerRadius: 7,
    edgeRound: 0.9,
  },

  /** Modules photo. u = distance depuis le bord gauche VU DE DOS, v = depuis le haut. */
  lenses: {
    ringOuter: 8.6,
    ringInner: 6.9,
    ringRaise: 1.3,
    /** Saphir légèrement en retrait du sommet de l'anneau. */
    sapphireRecess: 0.28,
    sapphireThickness: 0.3,
    /** Lentilles internes concentriques (rayon, profondeur sous le saphir). */
    internal: [
      { radius: 6.1, depth: 0.75 },
      { radius: 5.2, depth: 1.45 },
      { radius: 4.3, depth: 2.1 },
      { radius: 3.4, depth: 2.7 },
    ],
    diaphragm: { radius: 2.0, depth: 3.15 },
    list: [
      { id: 'main', label: 'Grand-angle', mp: 48, u: 17.0, v: 16.5, diaphragmSides: 7 },
      { id: 'tele', label: 'Téléobjectif', mp: 48, u: 17.0, v: 37.5, diaphragmSides: 4 },
      { id: 'ultra', label: 'Ultra grand-angle', mp: 48, u: 35.5, v: 27.0, diaphragmSides: 7 },
    ] as const,
  },

  flash: { u: 52.5, v: 14.5, radius: 3.0, ringRadius: 3.7 },
  lidar: { u: 52.5, v: 40.0, radius: 3.1 },
  mic: { u: 58.0, v: 27.0, radius: 0.4 },

  /** Boutons (positions = centre, mesuré depuis le haut du téléphone). */
  buttons: {
    relief: 0.4,
    width: 3.0,
    radius: 0.35,
    left: [
      { id: 'action', fromTop: 33, length: 7.5 },
      { id: 'volUp', fromTop: 47, length: 11.5 },
      { id: 'volDown', fromTop: 61, length: 11.5 },
    ],
    right: [{ id: 'side', fromTop: 52, length: 19 }],
  },

  /** Bouton Commande de l'appareil photo (saphir affleurant + cadre métal). */
  cameraControl: { fromTop: 112, length: 17, width: 3.0, frameMargin: 0.55 },

  /** Bandes d'antenne (matière plus mate). */
  antenna: { width: 0.8, sideFromTop: [24, H - 24], topX: [-16, 16] },

  /** Tranche inférieure. */
  bottom: {
    usbc: { length: 8.4, height: 2.6, depth: 6.5, contactsPerSide: 12 },
    /** Perçages haut-parleur / micro : 2 rangées de chaque côté du port. */
    holes: { radius: 0.42, rows: [-0.85, 0.85], xStart: 9.6, xStep: 1.75, perRow: 6, depth: 1.6 },
    screws: { x: 6.7, radius: 0.78 },
  },

  /** Composants internes (vue éclatée). */
  internals: {
    board: { width: 62, height: 52, thickness: 0.8, centerY: 47, z: 1.6, chipLabel: 'A20 Pro' },
    battery: { width: 66, height: 92, thickness: 4.0, centerY: -26, z: -1.6 },
  },
} as const;

/** Taille de la zone active de l'écran (diagonale réelle en pouces, contrôle). */
export const DISPLAY_DIAGONAL_CHECK =
  Math.hypot(PHONE.display.activeWidth, PHONE.display.activeHeight) / MM_PER_INCH;

// ---------------------------------------------------------------------------
// Vidéo & découpage
// ---------------------------------------------------------------------------

export const VIDEO = {
  fps: 60,
  formats: {
    main: { id: 'Main4K', width: 3840, height: 2160 },
    vertical: { id: 'Vertical', width: 1080, height: 1920 },
    /** Composition légère pour prévisualiser rapidement dans le Studio. */
    preview: { id: 'Preview1080p', width: 1920, height: 1080 },
  },
  /**
   * En vertical, l'angle horizontal du cadre vaut l'angle vertical du 16:9
   * multiplié par ce facteur (1 = même cadrage du « carré central »).
   */
  verticalFovFactor: 1.05,
} as const;

export type SceneId =
  | 'reveal'
  | 'orbit'
  | 'macro'
  | 'exploded'
  | 'display'
  | 'edges'
  | 'colors'
  | 'finale';

/** ⬅️ Durées des scènes en secondes. Total attendu : 60 s. */
export const SCENES: { id: SceneId; seconds: number }[] = [
  { id: 'reveal', seconds: 6 },
  { id: 'orbit', seconds: 8 },
  { id: 'macro', seconds: 10 },
  { id: 'exploded', seconds: 8 },
  { id: 'display', seconds: 8 },
  { id: 'edges', seconds: 8 },
  { id: 'colors', seconds: 7 },
  { id: 'finale', seconds: 5 },
];

/** Durée (en images) des fondus enchaînés entre deux scènes. */
export const TRANSITION_FRAMES = 36;

// ---------------------------------------------------------------------------
// Animation
// ---------------------------------------------------------------------------

export const ANIMATION = {
  /** Courbe des mouvements de caméra (Easing.bezier). */
  cameraBezier: [0.65, 0, 0.35, 1] as const,
  levitation: { amplitudeMm: 1.5, rotationDeg: 1, periodSeconds: 4.2 },
  /** Ressort des recompositions (vue éclatée). */
  spring: { damping: 11, stiffness: 90, mass: 1 },
};

// ---------------------------------------------------------------------------
// Matériaux
// ---------------------------------------------------------------------------

export const MATERIALS = {
  aluminium: { metalness: 1, roughness: 0.28, anisotropy: 0.35, clearcoat: 0.3, clearcoatRoughness: 0.15 },
  antenna: { metalness: 0.25, roughness: 0.7 },
  frontGlass: { transmission: 0.05, clearcoat: 1, ior: 1.5, roughness: 0.02 },
  backGlass: { roughness: 0.45, clearcoat: 0.6, clearcoatRoughness: 0.25 },
  sapphire: { iridescence: 1, iridescenceIOR: 1.3, tint: '#C9C4FF', ior: 1.77 },
  lensCoating: { color: '#07080F', iridescence: 0.45, iridescenceIOR: 1.3 },
  gold: '#E2AC4B',
};

// ---------------------------------------------------------------------------
// Rendu, lumière, post-production
// ---------------------------------------------------------------------------

export const RENDER = {
  /** 'procedural' = studio 100 % généré (Lightformers). 'studio' = preset HDRI de drei (téléchargé). */
  environment: 'procedural' as 'procedural' | 'studio',
  environmentResolution: 512,
  multisampling: 4,
  /** Ratio de pixels du canvas (1 = taille de la composition). */
  dpr: 1,
  camera: { near: 0.2, far: 4000 },
  background: { center: '#0b0c10', edge: '#000000' },
  lights: {
    key: { color: '#ffffff', intensity: 1.3, width: 260, height: 180, position: [260, 180, 320] as const },
    rim: { color: '#9cc3ff', intensity: 1.1, position: [-240, 120, -300] as const },
    fill: { color: '#ffffff', intensity: 0.12 },
    sweep: { color: '#ffffff', intensity: 5, width: 14, height: 600 },
  },
  post: {
    bloom: { intensity: 0.32, threshold: 1.1, smoothing: 0.35 },
    chromaticAberration: 0.00055,
    vignette: { offset: 0.28, darkness: 0.62 },
    grain: 0.035,
  },
  shadows: { opacity: 0.55, blur: 2.6, far: 60 },
};

/** Limite de budget géométrique (vérifiée en mode debug). */
export const TRIANGLE_BUDGET = 300_000;
