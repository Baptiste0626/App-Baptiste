/**
 * Composition principale : une seule scène 3D persistante + calques 2D.
 *   1. <ThreeCanvas> : téléphone, lumière, post-production
 *   2. Textes / annotations de la scène courante
 *   3. Voile noir global (fondus au noir)
 *   4. Audio (optionnel)
 */
import { ThreeCanvas } from '@remotion/three';
import { useMemo } from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';
import { RENDER, VIDEO } from './config';
import { AudioTrack } from './audio/AudioTrack';
import { SCENE_DEFS } from './scenes';
import { Stage } from './stage/Stage';
import { SCENE_RANGES, getShot, sceneIndexAt } from './timeline';

export const Film: React.FC = () => {
  const { width, height, fps } = useVideoConfig();
  // Toute l'animation est écrite à 60 fps : une composition à 30 fps échantillonne une image sur deux.
  const frame = Math.round((useCurrentFrame() * VIDEO.fps) / fps);
  const shot = useMemo(() => getShot(frame), [frame]);
  const s = Math.min(width, height) / 1080;
  const vertical = height > width;

  const i = sceneIndexAt(frame);
  const range = SCENE_RANGES[i];
  const Overlay = SCENE_DEFS[i].Overlay;

  return (
    <AbsoluteFill style={{ backgroundColor: '#000' }}>
      <ThreeCanvas
        width={width}
        height={height}
        dpr={RENDER.dpr}
        flat
        gl={{ antialias: false, alpha: false, powerPreference: 'high-performance', stencil: false }}
        camera={{ fov: 30, near: RENDER.camera.near, far: RENDER.camera.far, position: [0, 0, 380] }}
      >
        <Stage shot={shot} frame={frame} />
      </ThreeCanvas>

      {Overlay ? (
        <AbsoluteFill>
          <Overlay
            t={(frame - range.from) / VIDEO.fps}
            d={range.durationInFrames / VIDEO.fps}
            frame={frame}
            shot={shot}
            width={width}
            height={height}
            s={s}
            vertical={vertical}
          />
        </AbsoluteFill>
      ) : null}

      <AbsoluteFill style={{ backgroundColor: '#000', opacity: shot.blackout, pointerEvents: 'none' }} />
      <AudioTrack />
    </AbsoluteFill>
  );
};
