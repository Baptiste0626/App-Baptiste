/**
 * Textures 100 % procédurales (aucune image externe).
 * Toutes utilisent un générateur pseudo-aléatoire à graine fixe → rendu déterministe.
 */
import * as THREE from 'three';

/** Générateur pseudo-aléatoire déterministe (mulberry32). */
export const rng = (seed: number) => {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

/**
 * Carte d'anisotropie « aluminium brossé » :
 *  R,G = direction du brossage (encodée [-1,1] → [0,1]) ; B = intensité striée.
 * Les stries sont des bruits 1D étirés le long de l'axe U.
 */
export const createBrushedAnisotropyMap = (size = 256) => {
  const data = new Uint8Array(size * size * 4);
  const rand = rng(1337);
  const rows = new Float32Array(size);
  for (let y = 0; y < size; y++) rows[y] = rand();
  for (let y = 0; y < size; y++) {
    // Lissage léger entre rangées voisines pour des stries naturelles
    const v = 0.55 * rows[y] + 0.25 * rows[(y + 1) % size] + 0.2 * rows[(y + size - 1) % size];
    for (let x = 0; x < size; x++) {
      const i = (y * size + x) * 4;
      const fine = rand() * 0.08;
      data[i] = 255; // direction X = +1
      data[i + 1] = 128; // direction Y = 0
      data[i + 2] = Math.round(255 * Math.min(1, 0.6 + 0.4 * v + fine));
      data[i + 3] = 255;
    }
  }
  const tex = new THREE.DataTexture(data, size, size, THREE.RGBAFormat);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(1 / 30, 1 / 30); // UV en mm → une tuile tous les 30 mm
  tex.magFilter = THREE.LinearFilter;
  tex.minFilter = THREE.LinearMipmapLinearFilter;
  tex.generateMipmaps = true;
  tex.needsUpdate = true;
  return tex;
};

/** Variation de rugosité très subtile (verre satiné / métal). */
export const createRoughnessNoise = (size = 128, base = 0.5, amp = 0.08, seed = 7) => {
  const data = new Uint8Array(size * size * 4);
  const rand = rng(seed);
  for (let i = 0; i < size * size; i++) {
    const v = Math.round(255 * Math.min(1, Math.max(0, base + (rand() - 0.5) * amp)));
    data[i * 4] = v;
    data[i * 4 + 1] = v; // three.js lit la rugosité dans le canal G
    data[i * 4 + 2] = v;
    data[i * 4 + 3] = 255;
  }
  const tex = new THREE.DataTexture(data, size, size, THREE.RGBAFormat);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(1 / 8, 1 / 8);
  tex.generateMipmaps = true;
  tex.minFilter = THREE.LinearMipmapLinearFilter;
  tex.needsUpdate = true;
  return tex;
};

/**
 * Texture de carte mère stylisée : substrat sombre, pistes dorées, pastilles.
 * Dessinée dans un canvas 2D (déterministe).
 */
export const createPcbTexture = (w = 1024, h = 860) => {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  const g = c.getContext('2d')!;
  const rand = rng(2026);
  g.fillStyle = '#123528';
  g.fillRect(0, 0, w, h);
  // Pistes orthogonales
  g.lineCap = 'round';
  for (let i = 0; i < 260; i++) {
    g.strokeStyle = `rgba(226,180,96,${0.35 + rand() * 0.45})`;
    g.lineWidth = 1 + rand() * 2.5;
    let x = rand() * w;
    let y = rand() * h;
    g.beginPath();
    g.moveTo(x, y);
    for (let k = 0; k < 4; k++) {
      if (rand() > 0.5) x += (rand() - 0.5) * 260;
      else y += (rand() - 0.5) * 260;
      g.lineTo(x, y);
    }
    g.stroke();
  }
  // Pastilles / vias
  for (let i = 0; i < 700; i++) {
    g.fillStyle = `rgba(230,190,110,${0.3 + rand() * 0.5})`;
    g.beginPath();
    g.arc(rand() * w, rand() * h, 1 + rand() * 2.4, 0, Math.PI * 2);
    g.fill();
  }
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  return tex;
};

/** Étiquette gravée de la puce (texte fin sur métal sombre). */
export const createChipLabelTexture = (label: string, fontFamily: string) => {
  const s = 512;
  const c = document.createElement('canvas');
  c.width = s;
  c.height = s;
  const g = c.getContext('2d')!;
  const grad = g.createLinearGradient(0, 0, s, s);
  grad.addColorStop(0, '#2a2b2f');
  grad.addColorStop(1, '#16171a');
  g.fillStyle = grad;
  g.fillRect(0, 0, s, s);
  g.fillStyle = 'rgba(235,235,240,0.92)';
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.font = `500 92px ${fontFamily}`;
  g.fillText(label, s / 2, s / 2 - 10);
  g.font = `300 30px ${fontFamily}`;
  g.fillStyle = 'rgba(200,200,210,0.55)';
  g.fillText('3 nm · 2026', s / 2, s / 2 + 70);
  g.strokeStyle = 'rgba(255,255,255,0.12)';
  g.lineWidth = 4;
  g.strokeRect(18, 18, s - 36, s - 36);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  return tex;
};
