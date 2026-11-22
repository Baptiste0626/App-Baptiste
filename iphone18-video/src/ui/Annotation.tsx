/**
 * Annotation reliée au téléphone : un point d'ancrage 3D (repère du téléphone)
 * est projeté en 2D à chaque image, puis une ligne de 1 px se dessine
 * (stroke-dashoffset) jusqu'au libellé. La ligne suit l'objet en mouvement.
 */
import { projectPhonePoint } from '../lib/pose';
import { easeSine, seg, type Shot, type Vec3 } from '../lib/shot';
import { RevealText } from './RevealText';

export interface AnnotationProps {
  anchor: Vec3;
  title: string;
  sub?: string;
  /** Coude de la ligne, en px (base 1080) par rapport à l'ancre — format horizontal. */
  offset: [number, number];
  /** Même chose pour le format vertical (sinon `offset`). */
  offsetVertical?: [number, number];
  /** Longueur du segment horizontal final (px base 1080). */
  tail?: number;
  appear: number;
  disappear: number;
  t: number;
  frame: number;
  shot: Shot;
  width: number;
  height: number;
  s: number;
  vertical: boolean;
}

export const Annotation: React.FC<AnnotationProps> = ({
  anchor,
  title,
  sub,
  offset,
  offsetVertical,
  tail = 70,
  appear,
  disappear,
  t,
  frame,
  shot,
  width,
  height,
  s,
  vertical,
}) => {
  if (t < appear - 0.05 || t > disappear + 0.6) return null;
  const p = projectPhonePoint(shot, frame, anchor, width, height);
  if (!p.visible) return null;

  const [ox, oy] = vertical && offsetVertical ? offsetVertical : offset;
  const titleSize = vertical ? 40 : 44;
  const subSize = vertical ? 24 : 26;
  // Largeur estimée du libellé (Inter ≈ 0,56 em par caractère) pour le garder dans le cadre
  const labelW = Math.max(title.length * 0.56 * titleSize, (sub?.length ?? 0) * 0.5 * subSize) * s;
  const margin = 48 * s;
  const dir = ox >= 0 ? 1 : -1;
  let ex = p.x + ox * s;
  const ey = Math.min(height - margin, Math.max(margin + titleSize * s, p.y + oy * s));
  // Recadrage CONTINU (min/max) : le libellé reste dans le cadre sans jamais sauter d'un côté à l'autre
  if (dir > 0) ex = Math.min(ex, width - margin - labelW - (tail + 14) * s);
  else ex = Math.max(ex, margin + labelW + (tail + 14) * s);
  const tx = ex + dir * tail * s;

  const l1 = Math.hypot(ex - p.x, ey - p.y);
  const l2 = Math.abs(tx - ex);
  const total = l1 + l2;
  const draw = seg(t, appear, appear + 0.7);
  const fade = 1 - seg(t, disappear, disappear + 0.5, easeSine);
  const dot = seg(t, appear - 0.05, appear + 0.2, easeSine) * fade;

  const labelX = tx + dir * 14 * s;
  return (
    <>
      <svg
        width={width}
        height={height}
        style={{ position: 'absolute', inset: 0, overflow: 'visible' }}
      >
        <path
          d={`M ${p.x} ${p.y} L ${ex} ${ey} L ${tx} ${ey}`}
          fill="none"
          stroke="rgba(255,255,255,0.85)"
          strokeWidth={Math.max(1, s)}
          strokeDasharray={total}
          strokeDashoffset={total * (1 - draw)}
          opacity={fade}
        />
        <circle cx={p.x} cy={p.y} r={3.2 * s} fill="rgba(255,255,255,0.95)" opacity={dot} />
        <circle cx={p.x} cy={p.y} r={8 * s * (0.6 + 0.4 * dot)} fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth={Math.max(1, s)} opacity={dot} />
      </svg>
      <div
        style={{
          position: 'absolute',
          left: dir > 0 ? labelX : undefined,
          right: dir < 0 ? width - labelX : undefined,
          top: ey,
          transform: 'translateY(-62%)',
          textAlign: dir > 0 ? 'left' : 'right',
          opacity: fade,
        }}
      >
        <RevealText text={title} t={t} start={appear + 0.45} s={s} fontSize={titleSize} weight={500} />
        {sub ? (
          <RevealText
            text={sub}
            t={t}
            start={appear + 0.65}
            s={s}
            fontSize={subSize}
            weight={200}
            style={{ marginTop: 6 * s, opacity: 0.85 }}
          />
        ) : null}
      </div>
    </>
  );
};
