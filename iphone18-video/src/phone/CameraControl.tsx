/**
 * Bouton Commande de l'appareil photo (tranche droite, 112 mm sous le haut) :
 * zone affleurante en saphir (17 × 3 mm) entourée d'un cadre métallique poli.
 * `press` (0→1) l'enfonce de 0,15 mm et déclenche une onde lumineuse qui se
 * propage le long de la tranche.
 */
import { useLayoutEffect, useMemo } from 'react';
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { PHONE } from '../config';
import { H2, W2, useMats } from './context';

const C = PHONE.cameraControl;
const EMBED = 0.4;

const waveMaterial = () =>
  new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: { uPress: { value: 0 }, uLen: { value: C.length } },
    vertexShader: /* glsl */ `
      varying vec2 vP;
      void main() { vP = position.xy; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }
    `,
    fragmentShader: /* glsl */ `
      varying vec2 vP; uniform float uPress; uniform float uLen;
      float sdPill(vec2 p, vec2 h) { vec2 q = vec2(max(abs(p.x) - (h.x - h.y), 0.0), p.y); return length(q) - h.y; }
      void main() {
        float d = sdPill(vP, vec2(uLen * 0.5, 1.5));
        float r = uPress * 22.0;
        float ring = exp(-pow((d - r) / 1.1, 2.0)) * (1.0 - uPress) * smoothstep(0.0, 0.08, uPress);
        float core = exp(-max(d, 0.0) * 1.8) * sin(3.14159 * clamp(uPress * 1.6, 0.0, 1.0));
        vec3 c = vec3(0.55, 0.78, 1.0) * ring * 1.6 + vec3(0.8, 0.9, 1.0) * core * 0.9;
        gl_FragColor = vec4(c, 1.0);
      }
    `,
  });

export const CameraControl: React.FC<{ press: number }> = ({ press }) => {
  const m = useMats();
  const y = H2 - C.fromTop;
  const geo = useMemo(
    () => ({
      frame: new RoundedBoxGeometry(0.05 + EMBED, C.length + 2 * C.frameMargin, C.width + 2 * C.frameMargin, 3, 0.4),
      sapphire: new RoundedBoxGeometry(0.06 + EMBED, C.length, C.width, 3, 0.35),
      wave: new THREE.PlaneGeometry(70, PHONE.thickness - 0.7),
    }),
    [],
  );
  const wave = useMemo(waveMaterial, []);
  useLayoutEffect(() => {
    wave.uniforms.uPress.value = press;
  }, [wave, press]);
  const depress = Math.sin(Math.PI * Math.min(1, press * 2.2)) * 0.15;
  return (
    <group position={[W2, y, 0]}>
      <mesh geometry={geo.frame} material={m.aluminiumPolished} position={[0.05 - (0.05 + EMBED) / 2, 0, 0]} />
      <mesh geometry={geo.sapphire} material={m.ccSapphire} position={[0.06 - (0.06 + EMBED) / 2 - depress, 0, 0]} />
      {/* Onde lumineuse : plan tangent à la tranche (repère : x de l'onde = axe Y du téléphone) */}
      {press > 0 && press < 1 ? (
        <mesh geometry={geo.wave} material={wave} position={[0.12, 0, 0]} rotation={[0, Math.PI / 2, Math.PI / 2]} renderOrder={20} />
      ) : null}
    </group>
  );
};
