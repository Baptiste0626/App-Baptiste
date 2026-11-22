/**
 * Piste audio (optionnelle).
 * Déposer les fichiers dans /public/audio puis renseigner leurs noms ci-dessous.
 * Tant qu'un champ vaut null, rien n'est joué (le rendu reste muet, sans erreur).
 *
 * Les marqueurs de synchro sont calculés depuis la timeline : ils restent
 * justes si l'on change la durée d'une scène dans config.ts.
 */
import { Audio, Sequence, staticFile } from 'remotion';
import { COLOR_SWITCH_TIMES } from '../scenes/Scene07Colors';
import { EXPLODE_START } from '../scenes/Scene04Exploded';
import { globalFrameOf } from '../scenes/types';

export const AUDIO_FILES = {
  /** Musique de fond, ex. 'audio/soundtrack.mp3' (placeholder). */
  music: null as string | null,
  /** Souffle court pour les rotations. */
  whoosh: null as string | null,
  /** Impact grave (ouverture de la vue éclatée). */
  impact: null as string | null,
};

export interface SyncMarker {
  frame: number;
  kind: 'whoosh' | 'impact';
  label: string;
}

/** Marqueurs de synchro (image globale). */
export const SYNC_MARKERS: SyncMarker[] = [
  { frame: globalFrameOf('orbit', 0.8), kind: 'whoosh', label: 'Rotation 360° – 1er light sweep' },
  { frame: globalFrameOf('orbit', 4.4), kind: 'whoosh', label: '2e light sweep' },
  { frame: globalFrameOf('macro', 3.0), kind: 'whoosh', label: 'Plongée vers le téléobjectif' },
  { frame: globalFrameOf('exploded', EXPLODE_START), kind: 'impact', label: 'Ouverture de la vue éclatée' },
  { frame: globalFrameOf('exploded', 4.9), kind: 'whoosh', label: 'Recomposition' },
  { frame: globalFrameOf('edges', 2.3), kind: 'whoosh', label: 'Demi-tour tranche droite' },
  { frame: globalFrameOf('edges', 5.5), kind: 'whoosh', label: 'Bascule vers USB-C' },
  ...COLOR_SWITCH_TIMES.map((t, i) => ({
    frame: globalFrameOf('colors', t),
    kind: 'whoosh' as const,
    label: `Changement de coloris ${i + 1}`,
  })),
];

export const AudioTrack: React.FC = () => (
  <>
    {AUDIO_FILES.music ? <Audio src={staticFile(AUDIO_FILES.music)} volume={0.8} /> : null}
    {SYNC_MARKERS.map((m, i) => {
      const src = m.kind === 'impact' ? AUDIO_FILES.impact : AUDIO_FILES.whoosh;
      if (!src) return null;
      return (
        <Sequence key={i} from={Math.max(0, m.frame - 6)} durationInFrames={180} name={`SFX ${m.label}`}>
          <Audio src={staticFile(src)} volume={m.kind === 'impact' ? 1 : 0.6} />
        </Sequence>
      );
    })}
  </>
);
