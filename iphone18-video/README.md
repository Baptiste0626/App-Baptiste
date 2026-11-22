# Film produit 3D — smartphone « 18 Pro Max » (60 s, 4K 60 fps)

Vidéo produit cinématographique entièrement **générée par le code** : modèle 3D
procédural (aucun `.glb`), matériaux physiques, textures et shaders procéduraux,
lumière de studio procédurale, annotations projetées 3D → 2D.

Stack : **Remotion 4** · **@remotion/three** · **React Three Fiber 9** · **drei 10** ·
**postprocessing** · **TypeScript strict**.

> Aucun logo Apple, aucune icône ni capture d'iOS. Le dos est vierge. Le fond
> d'écran est un shader abstrait. Le nom affiché en fin de film est un simple texte
> en Inter, modifiable dans `src/i18n/fr.ts`.

---

## Installation

```bash
cd iphone18-video
npm install
```

Node 18+ requis (testé avec Node 22). Aucun accès réseau n'est nécessaire pendant le
rendu : la police Inter est embarquée (`@fontsource/inter`, licence OFL).

## Commandes

| Commande | Rôle |
| --- | --- |
| `npm run studio` | Prévisualisation interactive (`npx remotion studio`). Choisir **Preview1080p** pour un aperçu fluide. |
| `npm run render` | Export **4K** 3840×2160, 60 fps, H.264, CRF 18 → `out/film-4k.mp4` |
| `npm run render:vertical` | Export **vertical** 1080×1920 (réseaux sociaux) → `out/film-vertical.mp4` |
| `npm run render:all` | Les deux exports à la suite |
| `npm run verify` | Vérifie les durées de chaque scène et l'absence de saut / clignotement image par image |
| `npm run typecheck` | Vérification TypeScript stricte |
| `node scripts/stills.mjs Preview1080p 0 600 1200` | Planche d'images fixes de contrôle (`out/stills/`) |

Les réglages d'export (codec H.264, CRF 18, yuv420p, JPEG 95, concurrence 2) sont dans
`remotion.config.ts`. Équivalent manuel :

```bash
npx remotion render Main4K out/film-4k.mp4 --codec=h264 --crf=18
npx remotion render Vertical out/film-vertical.mp4 --codec=h264 --crf=18
```

### Moteur WebGL

Le rendu utilise le GPU via ANGLE (`--gl=angle`, défini dans `remotion.config.ts`).

- **macOS / Windows** : rien à changer.
- **Linux avec GPU** : essayer `--gl=angle-egl` (ou `--gl=vulkan`).
- **Linux sans GPU / CI** : `--gl=swangle` (rendu logiciel : fonctionne, mais compter
  plusieurs secondes par image en 4K).

Le rendu 4K de 3 600 images est lourd. Si la mémoire GPU sature, baisser
`Config.setConcurrency()` ou `RENDER.multisampling` dans `config.ts`.

---

## Changer le coloris

Un seul paramètre dans `src/config.ts` :

```ts
export const ACTIVE_COLORWAY: ColorwayId = 'argent'; // 'noir' | 'argent' | 'glacier' | 'bordeaux'
```

| Coloris | Aluminium |
| --- | --- |
| Noir | `#2B2B2E` |
| Argent | `#D9D9DC` |
| Glacier (bleu glacier clair) | `#BFD7E6` |
| Bordeaux | `#5C1F2B` |

La scène 7 fait toujours défiler les quatre finitions (Noir → Argent → Glacier →
Bordeaux) ; la scène 8 revient au coloris actif.

## Changer la durée

Les durées sont en secondes dans `SCENES` (`src/config.ts`). Le total, les numéros
d'image, les fondus et les marqueurs audio se recalculent automatiquement. Les
animations de chaque scène sont écrites en temps local : au-delà de ±30 % de
variation, relire la scène concernée. Lancer ensuite `npm run verify`.

`TRANSITION_FRAMES` règle la durée des fondus enchaînés entre deux scènes (36 images
= 0,6 s).

---

## Storyboard (60 s × 60 fps = 3 600 images)

| # | Fichier | Images | Contenu |
| --- | --- | --- | --- |
| 1 | `Scene01Reveal.tsx` | 0 – 359 | Noir total, ligne de lumière qui révèle la silhouette de profil. Titre « Pro. Poussé à l'extrême. » |
| 2 | `Scene02Orbit.tsx` | 360 – 839 | Rotation 360° en lévitation, caméra en contre-plongée, deux light sweeps |
| 3 | `Scene03Macro.tsx` | 840 – 1439 | Plongée macro : plateau, téléobjectif, lentilles internes une à une (DOF), annotations 48 MP / 4x / 8x |
| 4 | `Scene04Exploded.tsx` | 1440 – 1919 | Vue éclatée sur Z (verre, écran, châssis, carte mère « A20 Pro », batterie, dos), recomposition avec rebond |
| 5 | `Scene05Display.tsx` | 1920 – 2399 | Allumage de l'écran (shader), Dynamic Island animée, annotations 6,9" / 2868 × 1320 / 120 Hz / 3000 nits |
| 6 | `Scene06Edges.tsx` | 2400 – 2879 | Travelling tranches : boutons, onde lumineuse sur la Commande de l'appareil photo, macro USB‑C |
| 7 | `Scene07Colors.tsx` | 2880 – 3299 | Un tour et demi, changement de coloris à chaque demi-tour |
| 8 | `Scene08Finale.tsx` | 3300 – 3599 | Trois-quarts final, logo textuel, fondu au noir |

`npm run verify` affiche ce tableau et contrôle la continuité.

---

## Architecture

```
iphone18-video/
├── remotion.config.ts        Réglages d'export (H.264, CRF 18, ANGLE…)
├── scripts/
│   ├── verify-timeline.ts    Durées + continuité image par image (npm run verify)
│   └── stills.mjs            Planches d'images fixes
└── src/
    ├── config.ts             ★ Dimensions, couleurs, durées, rendu (tout est ici)
    ├── index.ts / Root.tsx   Compositions Main4K, Vertical, Preview1080p
    ├── Film.tsx              Composition : canvas 3D + textes + fondu + audio
    ├── timeline.ts           Découpage et fondus enchaînés entre scènes
    ├── lib/
    │   ├── shot.ts           Type « Shot » (état d'une image), easing, interpolations
    │   └── pose.ts           Pose du téléphone (lévitation), caméra, projection 3D→2D
    ├── phone/                Modèle procédural (1 composant = 1 élément)
    │   ├── geometry.ts       Contour squircle, extrusion à normales crantées, stade, pentalobe
    │   ├── Phone.tsx         Assemblage + vue éclatée
    │   ├── Chassis.tsx       Cadre aluminium, chanfrein 0,3 mm
    │   ├── AntennaBands.tsx  Bandes d'antenne 0,8 mm
    │   ├── CameraPlateau.tsx Plateau photo, flash, LiDAR, micro
    │   ├── CameraLens.tsx    Anneau, saphir, 4 lentilles internes, diaphragme
    │   ├── FrontGlass.tsx    Verre avant
    │   ├── Display.tsx       OLED, Dynamic Island, caméra frontale 18 MP
    │   ├── Earpiece.tsx      Grille d'écouteur (instanciée)
    │   ├── Buttons.tsx       Action, volume +/−, latéral
    │   ├── CameraControl.tsx Commande de l'appareil photo + onde lumineuse
    │   ├── BottomEdge.tsx    USB‑C, perçages (instanciés), vis pentalobes
    │   ├── BackGlass.tsx     Dos satiné vierge
    │   └── Internals.tsx     Carte mère « A20 Pro », batterie
    ├── materials/
    │   ├── phoneMaterials.ts MeshPhysicalMaterial (aluminium, verres, saphir…)
    │   ├── holes.ts          Perçages réels du cadre (discard dans le shader)
    │   ├── screenShader.ts   Fond d'écran abstrait + Dynamic Island (SDF)
    │   ├── postShaders.ts    Fond radial, grain film déterministe
    │   └── textures.ts       Brossage anisotrope, PCB, étiquette de puce (procéduraux)
    ├── stage/
    │   ├── Stage.tsx         Scène 3D persistante, caméra, ombres, garde de démarrage
    │   ├── Lights.tsx        Key (RectAreaLight), rim froide, fill, light sweep, ligne de révélation
    │   ├── StudioEnvironment.tsx  Studio procédural (Lightformers) ou preset HDRI
    │   └── PostFX.tsx        DOF, bloom, aberration chromatique, ACES, vignette, grain
    ├── scenes/               Une scène par fichier (fonction pure temps → Shot + calque texte)
    ├── ui/                   Texte mot par mot (flou → net), annotations avec ligne dessinée
    ├── i18n/fr.ts            Tous les textes
    └── audio/AudioTrack.tsx  Piste audio optionnelle + marqueurs de synchro
```

### Principes

- **Déterminisme** : chaque scène est une fonction pure *temps local → Shot*
  (caméra, pose, lumière, DOF, couleurs…). Tout dépend de `useCurrentFrame()` via
  `interpolate`/`spring`/`Easing.bezier(0.65, 0, 0.35, 1)` ; le grain utilise le numéro
  d'image comme graine. Rien ne dépend du temps réel.
- **Pas de coupure** : une seule scène 3D persiste tout le film. Entre deux scènes,
  les shots sont mélangés sur 0,6 s ; le passage macro → vue éclatée se fait sous un
  noir complet (fondu). `npm run verify` mesure les variations image par image.
- **Annotations** : le point 3D est projeté avec exactement la même caméra et la même
  pose que le rendu (`lib/pose.ts`), la ligne de 1 px se dessine par
  `stroke-dashoffset` et les libellés restent dans le cadre.
- **Performances** : géométries et matériaux créés une fois et partagés,
  `InstancedMesh` pour les perçages, la grille d'écouteur, les contacts USB‑C et les
  composants de la carte. Budget mesuré : **≈ 44 000 triangles** (limite 300 000),
  journalisé au démarrage (`[budget]` dans la console du navigateur).

### Environnement de reflets

`RENDER.environment = 'procedural'` (défaut) construit un studio avec des
Lightformers drei : rien n'est téléchargé, conformément à la règle « tout est généré
par le code ». `'studio'` ajoute le preset HDRI « studio » de drei (téléchargé
depuis le CDN de pmndrs au moment du rendu).

## Audio

Déposer les fichiers dans `public/audio/` puis renseigner `AUDIO_FILES` dans
`src/audio/AudioTrack.tsx` (`music`, `whoosh`, `impact`). Les marqueurs de synchro
(`SYNC_MARKERS`) placent automatiquement un whoosh sur les rotations / light sweeps /
changements de coloris et un impact grave à l'ouverture de la vue éclatée.

## Cotes principales (1 unité = 1 mm)

| Élément | Valeur |
| --- | --- |
| Boîtier | 163,4 × 78,0 × 8,75 mm, 249 g |
| Coins | squircle (super-ellipse n = 4,4), rayon visuel ≈ 12 mm |
| Chanfrein | 0,3 mm |
| Écran | 6,9", 2868 × 1320 px à 460 ppi → zone active 72,9 × 158,4 mm, bordure 1,5 mm |
| Plateau photo | pleine largeur, 54 mm de haut, relief 2,5 mm |
| Objectifs | anneau Ø 17,2 mm, saphir Ø 13,8 mm, 4 lentilles internes |
| Boutons | relief 0,4 mm, largeur 3 mm |
| USB‑C | stade 8,4 × 2,6 mm, 2 × 12 contacts au pas de 0,5 mm |
