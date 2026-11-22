/**
 * Perçages réels dans le châssis.
 * Plutôt qu'une coûteuse opération CSG, on retire (discard) les fragments du
 * cadre situés dans les ouvertures de la tranche inférieure : port USB-C (stade)
 * et trous de haut-parleur / micro (cercles). La géométrie disparaît vraiment :
 * on voit à travers, jusqu'aux tubes internes instanciés.
 */
import * as THREE from 'three';
import { PHONE } from '../config';

/** Liste des centres de trous (x, z) sur la tranche inférieure. */
export const bottomHoleCenters = (): [number, number][] => {
  const { rows, xStart, xStep, perRow } = PHONE.bottom.holes;
  const out: [number, number][] = [];
  for (const side of [-1, 1]) {
    rows.forEach((z, r) => {
      for (let i = 0; i < perRow; i++) {
        // Rangées décalées (quinconce)
        const x = side * (xStart + i * xStep + (r % 2) * xStep * 0.5);
        out.push([x, z]);
      }
    });
  }
  return out;
};

export const applyBottomHoles = (material: THREE.MeshPhysicalMaterial) => {
  const centers = bottomHoleCenters();
  const holes = centers.map(([x, z]) => new THREE.Vector3(x, z, PHONE.bottom.holes.radius));
  const { length, height } = PHONE.bottom.usbc;
  material.onBeforeCompile = (shader) => {
    shader.uniforms.uHoles = { value: holes };
    shader.uniforms.uBottomY = { value: -PHONE.height / 2 };
    shader.uniforms.uPort = { value: new THREE.Vector2(length / 2 - height / 2, height / 2) };
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', '#include <common>\nvarying vec3 vLocalPos;')
      .replace('#include <begin_vertex>', '#include <begin_vertex>\nvLocalPos = position;');
    shader.fragmentShader = shader.fragmentShader
      .replace(
        '#include <common>',
        `#include <common>
varying vec3 vLocalPos;
uniform vec3 uHoles[${holes.length}];
uniform float uBottomY;
uniform vec2 uPort;`,
      )
      .replace(
        '#include <clipping_planes_fragment>',
        `#include <clipping_planes_fragment>
if (vLocalPos.y < uBottomY + 0.6 && abs(vLocalPos.x) < 30.0) {
  vec2 p = vLocalPos.xz;
  // Port USB-C : distance signée à un stade
  vec2 q = vec2(max(abs(p.x) - uPort.x, 0.0), p.y);
  if (length(q) < uPort.y) discard;
  for (int i = 0; i < ${holes.length}; i++) {
    if (distance(p, uHoles[i].xy) < uHoles[i].z) discard;
  }
}`,
      );
  };
  material.customProgramCacheKey = () => 'phone-frame-holes';
  return material;
};
