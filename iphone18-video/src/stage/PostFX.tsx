/**
 * Post-production (toutes les valeurs dépendent uniquement de l'image courante) :
 * profondeur de champ (plans macro) → bloom léger → aberration chromatique minime
 * → tone mapping ACES Filmic → vignettage doux → grain film déterministe.
 */
import {
  Bloom,
  ChromaticAberration,
  DepthOfField,
  EffectComposer,
  ToneMapping,
  Vignette,
} from '@react-three/postprocessing';
import { BlendFunction, DepthOfFieldEffect, type EffectComposer as EffectComposerImpl, ToneMappingMode } from 'postprocessing';
import { forwardRef, useLayoutEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { RENDER } from '../config';
import type { Shot } from '../lib/shot';
import { FilmGrainEffect } from '../materials/postShaders';

export interface PostFXProps {
  shot: Shot;
  frame: number;
}

export const PostFX = forwardRef<EffectComposerImpl, PostFXProps>(({ shot, frame }, composerRef) => {
  const P = RENDER.post;
  const dof = useRef<DepthOfFieldEffect>(null);
  const bloom = useRef<{ intensity: number }>(null);
  const grain = useMemo(() => new FilmGrainEffect(), []);
  const caOffset = useMemo(() => new THREE.Vector2(P.chromaticAberration, P.chromaticAberration * 0.6), [P]);

  useLayoutEffect(() => {
    const d = dof.current;
    if (d) {
      d.cocMaterial.worldFocusDistance = shot.dofFocus;
      d.cocMaterial.worldFocusRange = shot.dofRange;
      d.bokehScale = shot.bokeh;
    }
    if (bloom.current) bloom.current.intensity = P.bloom.intensity * shot.bloom;
    grain.seed = frame % 997;
  }, [shot, frame, grain, P]);

  return (
    <EffectComposer ref={composerRef} multisampling={RENDER.multisampling} enableNormalPass={false}>
      <DepthOfField ref={dof} worldFocusDistance={380} worldFocusRange={400} bokehScale={0} resolutionScale={1} />
      <Bloom
        ref={bloom as never}
        mipmapBlur
        intensity={P.bloom.intensity}
        luminanceThreshold={P.bloom.threshold}
        luminanceSmoothing={P.bloom.smoothing}
      />
      <ChromaticAberration
        offset={caOffset}
        radialModulation
        modulationOffset={0.35}
        blendFunction={BlendFunction.NORMAL}
      />
      <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
      <Vignette offset={P.vignette.offset} darkness={P.vignette.darkness} />
      <primitive object={grain} />
    </EffectComposer>
  );
});
PostFX.displayName = 'PostFX';
