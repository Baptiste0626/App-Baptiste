/**
 * Shaders « plein écran » :
 *  - fond noir profond avec dégradé radial très subtil (dessiné dans la scène) ;
 *  - grain film déterministe (effet de post-production, graine = numéro d'image).
 */
import { BlendFunction, Effect } from 'postprocessing';
import * as THREE from 'three';
import { RENDER } from '../config';

/** Quad plein écran collé au plan lointain : fond radial. */
export const createBackgroundMaterial = () =>
  new THREE.ShaderMaterial({
    name: 'background',
    depthWrite: false,
    depthTest: false,
    uniforms: {
      uCenter: { value: new THREE.Color(RENDER.background.center) },
      uEdge: { value: new THREE.Color(RENDER.background.edge) },
      uAspect: { value: 16 / 9 },
      uGlow: { value: 1 },
    },
    vertexShader: /* glsl */ `
      varying vec2 vUv;
      void main() { vUv = uv; gl_Position = vec4(position.xy, 1.0, 1.0); }
    `,
    fragmentShader: /* glsl */ `
      varying vec2 vUv;
      uniform vec3 uCenter; uniform vec3 uEdge; uniform float uAspect; uniform float uGlow;
      void main() {
        vec2 p = (vUv - vec2(0.5, 0.55)) * vec2(max(uAspect, 1.0), max(1.0 / uAspect, 1.0));
        float r = length(p);
        vec3 c = mix(uCenter * uGlow, uEdge, smoothstep(0.0, 0.85, r));
        gl_FragColor = vec4(c, 1.0);
      }
    `,
  });

const grainFragment = /* glsl */ `
uniform float uSeed;
uniform float uAmount;
float h(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * 0.1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}
void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {
  vec2 px = uv * resolution;
  float n = h(px + uSeed * 37.17) - 0.5;
  // Grain plus visible dans les tons moyens, discret dans les noirs
  float l = dot(inputColor.rgb, vec3(0.2126, 0.7152, 0.0722));
  float w = smoothstep(0.0, 0.25, l) * (1.0 - 0.5 * smoothstep(0.6, 1.0, l));
  outputColor = vec4(inputColor.rgb + n * uAmount * (0.35 + w), inputColor.a);
}
`;

/** Grain film : bruit par pixel, graine fixée par l'image → identique à chaque rendu. */
export class FilmGrainEffect extends Effect {
  constructor(amount = RENDER.post.grain) {
    super('FilmGrainEffect', grainFragment, {
      blendFunction: BlendFunction.NORMAL,
      uniforms: new Map<string, THREE.Uniform>([
        ['uSeed', new THREE.Uniform(0)],
        ['uAmount', new THREE.Uniform(amount)],
      ]),
    });
  }
  set seed(v: number) {
    (this.uniforms.get('uSeed') as THREE.Uniform).value = v;
  }
}
