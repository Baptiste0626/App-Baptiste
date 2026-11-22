/**
 * Contenu de la scène 3D (à l'intérieur de <ThreeCanvas>) :
 * caméra, fond, lumières, environnement, téléphone, ombres de contact, post-prod.
 * Une seule scène persistante pour tout le film → aucune coupure / aucun
 * rechargement entre les plans (rien ne peut clignoter).
 */
import { ContactShadows } from '@react-three/drei';
import { useThree } from '@react-three/fiber';
import type { EffectComposer as EffectComposerImpl } from 'postprocessing';
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useDelayRender } from 'remotion';
import * as THREE from 'three';
import { PHONE, RENDER, TRIANGLE_BUDGET, VIDEO } from '../config';
import { applyCamera, phonePose } from '../lib/pose';
import type { Shot } from '../lib/shot';
import { createBackgroundMaterial } from '../materials/postShaders';
import { Phone } from '../phone/Phone';
import { Lights } from './Lights';
import { PostFX } from './PostFX';
import { StudioEnvironment } from './StudioEnvironment';

/** Applique le shot à la caméra par défaut de R3F. */
const CameraRig: React.FC<{ shot: Shot }> = ({ shot }) => {
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera;
  const size = useThree((s) => s.size);
  useLayoutEffect(() => {
    applyCamera(camera, shot, size.width / size.height);
  }, [camera, shot, size]);
  return null;
};

/** Fond noir profond, dégradé radial très subtil (quad plein écran). */
const Background: React.FC = () => {
  const size = useThree((s) => s.size);
  const mat = useMemo(createBackgroundMaterial, []);
  const geo = useMemo(() => new THREE.PlaneGeometry(2, 2), []);
  useLayoutEffect(() => {
    mat.uniforms.uAspect.value = size.width / size.height;
  }, [mat, size]);
  return <mesh geometry={geo} material={mat} frustumCulled={false} renderOrder={-1000} />;
};

/** Compte les triangles du modèle (instances comprises) et vérifie le budget. */
const reportTriangles = (scene: THREE.Scene) => {
  let total = 0;
  scene.traverse((o) => {
    const m = o as THREE.Mesh;
    if (!m.isMesh || !m.geometry || m.frustumCulled === false) return;
    const g = m.geometry;
    const tris = (g.index ? g.index.count : g.attributes.position.count) / 3;
    total += tris * ((o as THREE.InstancedMesh).isInstancedMesh ? (o as THREE.InstancedMesh).count : 1);
  });
  const msg = `[budget] ${Math.round(total).toLocaleString('fr-FR')} triangles (limite ${TRIANGLE_BUDGET.toLocaleString('fr-FR')})`;
  // console.warn : visible dans les logs de `remotion render --log=verbose`
  console.warn(total > TRIANGLE_BUDGET ? `${msg} — BUDGET DÉPASSÉ` : msg);
};

/**
 * Bloque le rendu Remotion tant que le composer de post-production n'est pas
 * prêt, puis force un rendu : le tout premier frame de chaque onglet est donc
 * identique aux suivants (pas d'image « nue » sans post-production).
 */
const ReadyGate: React.FC<{ composer: React.RefObject<EffectComposerImpl | null> }> = ({ composer }) => {
  const advance = useThree((s) => s.advance);
  const scene = useThree((s) => s.scene);
  const { delayRender, continueRender } = useDelayRender();
  const [handle] = useState(() => delayRender('Initialisation de la scène 3D'));
  useEffect(() => {
    let raf = 0;
    let tries = 0;
    const check = () => {
      const c = composer.current;
      if ((c && c.passes.length > 1) || tries > 600) {
        advance(performance.now());
        reportTriangles(scene);
        continueRender(handle);
        return;
      }
      tries++;
      raf = requestAnimationFrame(check);
    };
    check();
    return () => cancelAnimationFrame(raf);
  }, [advance, composer, continueRender, handle, scene]);
  return null;
};

export const Stage: React.FC<{ shot: Shot; frame: number }> = ({ shot, frame }) => {
  const composer = useRef<EffectComposerImpl>(null);
  const { position, quaternion } = phonePose(shot, frame);
  const time = frame / VIDEO.fps;

  return (
    <>
      <CameraRig shot={shot} />
      <Background />
      <Lights shot={shot} />
      <StudioEnvironment shot={shot} />

      <group position={position} quaternion={quaternion}>
        <Phone
          explode={shot.explode}
          aluminium={shot.aluminium}
          backGlass={shot.backGlass}
          time={time}
          screen={shot.screen}
          island={shot.island}
          ccPress={shot.ccPress}
        />
      </group>

      {shot.shadow > 0.001 ? (
        <ContactShadows
          position={[0, -PHONE.height / 2 - 38, 0]}
          scale={320}
          resolution={512}
          blur={RENDER.shadows.blur}
          far={RENDER.shadows.far}
          opacity={RENDER.shadows.opacity * shot.shadow}
          color="#000000"
        />
      ) : null}

      <PostFX ref={composer} shot={shot} frame={frame} />
      <ReadyGate composer={composer} />
    </>
  );
};
