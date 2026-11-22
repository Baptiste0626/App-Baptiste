/** Liste ordonnée des scènes (l'ordre doit correspondre à SCENES dans config.ts). */
import { scene01 } from './Scene01Reveal';
import { scene02 } from './Scene02Orbit';
import { scene03 } from './Scene03Macro';
import { scene04 } from './Scene04Exploded';
import { scene05 } from './Scene05Display';
import { scene06 } from './Scene06Edges';
import { scene07 } from './Scene07Colors';
import { scene08 } from './Scene08Finale';
import type { SceneDef } from './types';

export const SCENE_DEFS: SceneDef[] = [scene01, scene02, scene03, scene04, scene05, scene06, scene07, scene08];
