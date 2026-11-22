/**
 * SCÈNE 8 — 55 → 60 s — « Signature »
 * Plan final de trois-quarts dos, retour au coloris principal, dernier light
 * sweep, logo textuel en typographie fine, puis fondu au noir.
 */
import { AbsoluteFill } from 'remotion';
import { ACTIVE_COLORWAY } from '../config';
import { t as i18n } from '../i18n';
import { colorwayLinear, easeSine, lerp, lerpV, qe, seg, shot, slerpQ } from '../lib/shot';
import { RevealText } from '../ui/RevealText';
import { scene07 } from './Scene07Colors';
import { sceneSeconds, type OverlayProps, type SceneDef } from './types';

const active = colorwayLinear(ACTIVE_COLORWAY);

export const scene08: SceneDef = {
  id: 'finale',
  shot: (t, d) => {
    const d7 = sceneSeconds('colors');
    const prev = scene07.shot(d7, d7);
    const p = seg(t, 0, d - 0.8);
    const back = seg(t, 0, 1.5, easeSine);
    return shot({
      camPos: lerpV(prev.camPos, [-40, 30, 500], p),
      camTarget: lerpV(prev.camTarget, [0, -12, 0], p),
      fov: 30,
      phoneQuat: slerpQ(prev.phoneQuat, qe(-8, 180 + 36), seg(t, 0, d - 0.6)),
      phonePos: [0, lerp(0, 16, p), 0],
      aluminium: lerpV(prev.aluminium, active.aluminium, back),
      backGlass: lerpV(prev.backGlass, active.backGlass, back),
      sweep: lerp(-1.2, 1.2, seg(t, 1.1, 3.4, easeSine)),
      sweepIntensity: Math.min(seg(t, 1.1, 1.7, easeSine), 1 - seg(t, 2.8, 3.4, easeSine)),
      shadow: 1,
      envIntensity: lerp(1.6, 1.1, back),
      frontLight: lerp(0.55, 0.3, back),
      keyIntensity: lerp(1.4, 1, back),
      bloom: 1.1,
      blackout: seg(t, d - 1.0, d - 0.05, easeSine),
    });
  },
  Overlay: ({ t, s, vertical }: OverlayProps) => (
    <AbsoluteFill
      style={{ justifyContent: 'flex-end', alignItems: 'center', paddingBottom: (vertical ? 280 : 120) * s }}
    >
      <RevealText
        text={i18n.finale.logo}
        t={t}
        start={1.0}
        stagger={0.16}
        wordDuration={0.9}
        s={s}
        fontSize={vertical ? 72 : 84}
        weight={200}
        letterSpacing={0.01}
      />
    </AbsoluteFill>
  ),
};
