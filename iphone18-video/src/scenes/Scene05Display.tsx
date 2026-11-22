/**
 * SCÈNE 5 — 32 → 40 s — « Écran »
 * Face avant. L'écran s'allume (fond d'écran abstrait généré en shader, aucune
 * interface), la Dynamic Island se déploie puis se rétracte.
 * Annotations : 6,9" · 2868 × 1320 px – 460 ppi · 120 Hz ProMotion · 3000 nits.
 */
import { AbsoluteFill, spring } from 'remotion';
import { PHONE, VIDEO } from '../config';
import { t as i18n } from '../i18n';
import { easeSine, lerp, lerpV, qe, seg, shot } from '../lib/shot';
import { T2 } from '../phone/context';
import { Annotation } from '../ui/Annotation';
import type { OverlayProps, SceneDef } from './types';

const islandSpring = (t: number, from: number) =>
  spring({ frame: Math.max(0, Math.round((t - from) * VIDEO.fps)), fps: VIDEO.fps, config: { damping: 14, stiffness: 120 } });

export const scene05: SceneDef = {
  id: 'display',
  shot: (t, d) => {
    const p = seg(t, 0, d, easeSine);
    // Pilule : déploiement élastique puis retour
    const island = Math.max(0, islandSpring(t, 3.1) - islandSpring(t, 5.6));
    return shot({
      camPos: lerpV([0, 0, 380], [0, 3, 335], seg(t, 0, d - 1.2)),
      camTarget: [0, 0, 0],
      fov: 30,
      phoneQuat: qe(lerp(0, -3, p), lerp(12, -9, seg(t, 0, d - 1.2, easeSine))),
      screen: seg(t, 0.5, 2.3, easeSine),
      island,
      sweep: lerp(-1.2, 1.2, seg(t, 0.2, 2.2, easeSine)),
      sweepIntensity: Math.min(seg(t, 0.2, 0.7, easeSine), 1 - seg(t, 1.7, 2.2, easeSine)) * 0.8,
      shadow: 0,
      bloom: 1,
    });
  },
  Overlay: (p: OverlayProps) => {
    const common = { t: p.t, frame: p.frame, shot: p.shot, width: p.width, height: p.height, s: p.s, vertical: p.vertical };
    const ex = PHONE.display.activeWidth / 2;
    const ey = PHONE.display.activeHeight / 2;
    const z = T2;
    const D = i18n.display;
    const end = p.d - 1.1;
    return (
      <AbsoluteFill>
        <Annotation {...common} anchor={[-ex * 0.92, ey * 0.62, z]} title={D.size.title} sub={D.size.sub}
          offset={[-150, -120]} offsetVertical={[-70, -330]} appear={2.0} disappear={end} />
        <Annotation {...common} anchor={[ex * 0.92, ey * 0.42, z]} title={D.resolution.title} sub={D.resolution.sub}
          offset={[150, -110]} offsetVertical={[60, -390]} appear={2.7} disappear={end} />
        <Annotation {...common} anchor={[-ex * 0.92, -ey * 0.25, z]} title={D.promotion.title} sub={D.promotion.sub}
          offset={[-150, 90]} offsetVertical={[-70, 330]} appear={3.6} disappear={end} />
        <Annotation {...common} anchor={[ex * 0.92, -ey * 0.5, z]} title={D.brightness.title} sub={D.brightness.sub}
          offset={[150, 110]} offsetVertical={[60, 390]} appear={4.4} disappear={end} />
      </AbsoluteFill>
    );
  },
};
