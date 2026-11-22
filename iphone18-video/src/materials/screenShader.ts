/**
 * Shader de l'écran OLED.
 *  - Fond d'écran abstrait coloré (bruit fractal à domaine déformé), AUCUNE interface.
 *  - Allumage progressif depuis le centre.
 *  - Dynamic Island dessinée en SDF (pilule) : elle se déploie et affiche une
 *    activité abstraite (pastille lumineuse + barres d'onde).
 * Toutes les coordonnées sont en mm, origine au centre de l'écran.
 */
import * as THREE from 'three';
import { PHONE } from '../config';

const vertex = /* glsl */ `
varying vec2 vPos;
void main() {
  vPos = position.xy;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const fragment = /* glsl */ `
precision highp float;
varying vec2 vPos;
uniform float uTime;
uniform float uOn;
uniform float uIsland;
uniform vec2 uSize;
uniform vec2 uIslandCenter;
uniform vec2 uIslandHalf;
uniform vec2 uIslandHalfExpanded;

float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float noise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1, 0)), u.x), mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), u.x), u.y);
}
float fbm(vec2 p) {
  float v = 0.0, a = 0.5;
  for (int i = 0; i < 5; i++) { v += a * noise(p); p = p * 2.03 + 17.1; a *= 0.5; }
  return v;
}
float sdPill(vec2 p, vec2 h) {
  float r = h.y;
  vec2 q = vec2(max(abs(p.x) - (h.x - r), 0.0), p.y);
  return length(q) - r;
}

vec3 wallpaper(vec2 uv, float t) {
  // Domaine déformé : formes organiques qui se déplacent lentement
  vec2 p = uv * 2.2;
  vec2 q = vec2(fbm(p + vec2(0.0, t * 0.05)), fbm(p + vec2(5.2, 1.3) - t * 0.04));
  vec2 r = vec2(fbm(p + 3.0 * q + vec2(1.7, 9.2) + t * 0.03), fbm(p + 3.0 * q + vec2(8.3, 2.8)));
  float f = fbm(p + 3.5 * r);
  vec3 deep = vec3(0.012, 0.010, 0.060);
  vec3 indigo = vec3(0.10, 0.05, 0.55);
  vec3 magenta = vec3(0.85, 0.10, 0.45);
  vec3 amber = vec3(1.00, 0.45, 0.08);
  vec3 cyan = vec3(0.05, 0.55, 0.75);
  vec3 col = mix(deep, indigo, smoothstep(0.15, 0.6, f));
  col = mix(col, magenta, smoothstep(0.45, 0.85, length(q) * f * 1.6));
  col = mix(col, amber, smoothstep(0.62, 0.95, r.x * f * 1.8));
  col = mix(col, cyan, smoothstep(0.55, 0.9, q.y * (1.0 - f) * 1.9) * 0.6);
  // Vignettage doux du fond d'écran
  col *= 0.65 + 0.35 * smoothstep(1.25, 0.2, length(uv * vec2(1.0, 0.75)));
  return col * 1.15;
}

void main() {
  vec2 uv = vPos / uSize.y; // ~[-0.5, 0.5] en hauteur
  float t = uTime;

  // Allumage depuis le centre
  float d = length(vPos / uSize);
  float on = clamp(uOn * 1.8 - d * 0.9, 0.0, 1.0);
  on = on * on * (3.0 - 2.0 * on);
  vec3 col = wallpaper(uv, t) * on;

  // Dynamic Island
  vec2 ip = vPos - uIslandCenter;
  float e = uIsland;
  vec2 hs = mix(uIslandHalf, uIslandHalfExpanded, e);
  // Petit rebond élastique sur la hauteur
  float sd = sdPill(ip, hs);
  float aa = 0.06;
  float inside = 1.0 - smoothstep(-aa, aa, sd);
  vec3 island = vec3(0.0);
  // Activité abstraite (visible quand la pilule est déployée)
  float act = smoothstep(0.55, 0.95, e);
  if (act > 0.0) {
    vec2 dotC = vec2(-hs.x + hs.y, 0.0);
    float dotD = length(ip - dotC);
    vec3 dotCol = mix(vec3(1.0, 0.35, 0.1), vec3(1.0, 0.1, 0.5), 0.5 + 0.5 * sin(t * 1.5));
    island += dotCol * (1.0 - smoothstep(hs.y * 0.45, hs.y * 0.55, dotD)) * act;
    // Barres d'onde
    float bx = ip.x - (hs.x - hs.y * 2.3);
    float idx = floor(bx / 0.9);
    if (bx > -2.7 && bx < 2.7 && mod(bx, 0.9) < 0.5) {
      float hgt = (0.25 + 0.75 * abs(sin(t * 6.0 + idx * 1.7))) * hs.y * 0.55;
      island += vec3(0.25, 1.0, 0.65) * step(abs(ip.y), hgt) * act;
    }
  }
  col = mix(col, island, inside);

  gl_FragColor = vec4(col, 1.0);
}
`;

export const createScreenMaterial = (width: number, height: number) => {
  const centerY = PHONE.height / 2 - PHONE.island.centerFromTop;
  return new THREE.ShaderMaterial({
    name: 'oled-screen',
    vertexShader: vertex,
    fragmentShader: fragment,
    uniforms: {
      uTime: { value: 0 },
      uOn: { value: 0 },
      uIsland: { value: 0 },
      uSize: { value: new THREE.Vector2(width, height) },
      uIslandCenter: { value: new THREE.Vector2(0, centerY) },
      uIslandHalf: { value: new THREE.Vector2(PHONE.island.width / 2, PHONE.island.height / 2) },
      uIslandHalfExpanded: {
        value: new THREE.Vector2(PHONE.island.expandedWidth / 2, PHONE.island.expandedHeight / 2),
      },
    },
  });
};
