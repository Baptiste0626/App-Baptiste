/**
 * Rend une série d'images fixes de contrôle (un seul bundle) :
 *   node scripts/stills.mjs Preview1080p 100 700 1200 ...
 * Options d'environnement : GL=swangle|angle|egl, BROWSER=/chemin/chrome, OUT=dossier
 */
import { bundle } from '@remotion/bundler';
import { renderStill, selectComposition } from '@remotion/renderer';
import path from 'node:path';

const [compId = 'Preview1080p', ...frames] = process.argv.slice(2);
const outDir = process.env.OUT ?? 'out/stills';
const serveUrl = await bundle({ entryPoint: path.resolve('src/index.ts') });
const chromiumOptions = { gl: process.env.GL ?? 'angle' };
const browserExecutable = process.env.BROWSER ?? null;
const composition = await selectComposition({ serveUrl, id: compId, chromiumOptions, browserExecutable });
for (const f of frames.length ? frames.map(Number) : [0, 600, 1200, 1800, 2400, 3000, 3500]) {
  const output = `${outDir}/${compId}-${String(f).padStart(4, '0')}.jpg`;
  await renderStill({ serveUrl, composition, frame: f, output, imageFormat: 'jpeg', jpegQuality: 88, chromiumOptions, browserExecutable, timeoutInMilliseconds: 120000,
    onBrowserLog: (l) => { if (/budget|error/i.test(l.text)) console.log('  [navigateur]', l.text); } });
  console.log('✓', output);
}
