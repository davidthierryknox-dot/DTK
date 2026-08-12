import type { Glyph } from "../../lib/stimulusTypes";

export function ShapeIcon({ glyph, size = 32 }: { glyph: Glyph; size?: number }) {
  const pad = size * 0.15;
  if (glyph === "triangle") {
    const top = pad;
    const bottom = size - pad;
    const mid = size / 2;
    return (
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true">
        <polygon
          points={`${mid},${top} ${bottom},${bottom} ${pad},${bottom}`}
          fill="none"
          stroke="var(--ink)"
          strokeWidth="2"
          strokeLinejoin="round"
        />
      </svg>
    );
  }
  if (glyph === "circle") {
    return (
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true">
        <circle cx={size / 2} cy={size / 2} r={size / 2 - pad} fill="none" stroke="var(--ink)" strokeWidth="2" />
      </svg>
    );
  }
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true">
      <rect x={pad} y={pad} width={size - pad * 2} height={size - pad * 2} fill="none" stroke="var(--ink)" strokeWidth="2" />
    </svg>
  );
}
