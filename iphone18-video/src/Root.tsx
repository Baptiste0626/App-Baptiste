/**
 * Déclaration des compositions Remotion :
 *  - Main4K       3840 × 2160, 60 fps (livrable principal)
 *  - Vertical     1080 × 1920, 60 fps (réseaux sociaux)
 *  - Preview1080p 1920 × 1080, 60 fps (prévisualisation rapide dans le Studio)
 */
import { Composition } from 'remotion';
import { VIDEO } from './config';
import { Film } from './Film';
import { TOTAL_FRAMES } from './timeline';
import './ui/loadFonts';

export const Root: React.FC = () => (
  <>
    {Object.values(VIDEO.formats).map((f) => (
      <Composition
        key={f.id}
        id={f.id}
        component={Film}
        durationInFrames={TOTAL_FRAMES}
        fps={VIDEO.fps}
        width={f.width}
        height={f.height}
      />
    ))}
  </>
);
