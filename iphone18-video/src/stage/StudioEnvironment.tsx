/**
 * Environnement de reflets.
 * Par défaut : studio 100 % procédural (Lightformers drei rendus dans une cubemap),
 * conforme à la règle « tout est généré par le code ». Option : preset HDRI "studio"
 * de drei (RENDER.environment = 'studio'), auquel s'ajoutent les mêmes Lightformers.
 *
 * La cubemap est recalculée à chaque image pour que la bande de « light sweep »
 * se reflète en mouvement sur le châssis.
 */
import { Environment, Lightformer } from '@react-three/drei';
import { RENDER } from '../config';
import type { Shot } from '../lib/shot';
import { cameraBasis } from './Lights';

export const StudioEnvironment: React.FC<{ shot: Shot }> = ({ shot }) => {
  const b = cameraBasis(shot);
  // Position du sweep dans l'espace de l'environnement (rayon ~8 unités)
  const sweepPos = b.dir
    .clone()
    .multiplyScalar(-8)
    .addScaledVector(b.right, shot.sweep * 9)
    .addScaledVector(b.up, 1.5);
  // Intensité du studio (permet de partir du noir total en scène 1 sans éteindre la ligne de révélation)
  const k = shot.envIntensity;
  const revealPos = b.dir.clone().multiplyScalar(7).addScaledVector(b.up, shot.revealLine * 5);

  return (
    <Environment
      resolution={RENDER.environmentResolution}
      frames={Infinity}
      environmentIntensity={1}
      preset={RENDER.environment === 'studio' ? 'studio' : undefined}
    >
      {/* Grande boîte à lumière zénithale */}
      <Lightformer form="rect" intensity={0.3 * k} position={[0, 9, -2]} scale={[8, 3, 1]} target={[0, 0, 0]} />
      {/* Bandes verticales latérales (reflets longs sur les tranches) */}
      <Lightformer form="rect" intensity={1.5 * k} position={[-7, 1, 3]} scale={[1.4, 12, 1]} target={[0, 0, 0]} />
      <Lightformer form="rect" intensity={1.1 * k} position={[7, 1, 2]} scale={[0.9, 12, 1]} target={[0, 0, 0]} />
      {/* Contre-jour froid */}
      <Lightformer form="rect" intensity={0.8 * k} color="#a9c8ff" position={[2, 3, -8]} scale={[10, 1.2, 1]} target={[0, 0, 0]} />
      {/* Anneau doux face caméra */}
      <Lightformer form="ring" intensity={0.25 * k} position={[0, 2, 9]} scale={3} target={[0, 0, 0]} />
      {/* Rebond de sol très faible */}
      <Lightformer form="rect" intensity={0.15 * k} position={[0, -8, 0]} scale={[16, 16, 1]} target={[0, 0, 0]} />
      {/* Light sweep animé */}
      <Lightformer
        form="rect"
        intensity={3 * shot.sweepIntensity}
        position={sweepPos.toArray()}
        scale={[0.5, 22, 1]}
        target={[0, 0, 0]}
      />
      {/* Boîte à lumière derrière la caméra */}
      <Lightformer
        form="rect"
        intensity={1.6 * shot.frontLight * k}
        position={b.dir.clone().multiplyScalar(-9).addScaledVector(b.up, 2).toArray()}
        scale={[7, 5, 1]}
        target={[0, 0, 0]}
      />
      {/* Ring light de macro, dans l'axe de la caméra */}
      <Lightformer
        form="ring"
        intensity={2.2 * shot.ringLight}
        position={b.dir.clone().multiplyScalar(-9).toArray()}
        scale={1.6}
        target={[0, 0, 0]}
      />
      {/* Ligne de révélation (scène 1) */}
      <Lightformer
        form="rect"
        intensity={6 * shot.revealIntensity}
        position={revealPos.toArray()}
        scale={[22, 0.25, 1]}
        target={[0, 0, 0]}
      />
    </Environment>
  );
};
