/**
 * Configuration du CLI Remotion (studio + render).
 * Les réglages d'export demandés : H.264, CRF 18, yuv420p, rendu WebGL via ANGLE.
 * Sur Linux sans GPU, remplacer 'angle' par 'swangle' (rendu logiciel, beaucoup plus lent).
 */
import { Config } from '@remotion/cli/config';

Config.setVideoImageFormat('jpeg');
Config.setJpegQuality(95);
Config.setCodec('h264');
Config.setCrf(18);
Config.setPixelFormat('yuv420p');
Config.setChromiumOpenGlRenderer('angle');
Config.setOverwriteOutput(true);
// Les scènes WebGL 4K sont lourdes : on limite le parallélisme pour éviter de saturer le GPU.
Config.setConcurrency(2);
// Laisse le temps au premier frame (compilation des shaders, polices) d'être prêt.
Config.setDelayRenderTimeoutInMilliseconds(120000);
