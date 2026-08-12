// Shared with Matrix3x3's stimulus grid so that answer options are rendered
// at the same visual weight as the matrix cells — same radius, stroke, and
// spacing. Raven's-style matrix items lose their difficulty if the answer
// options are lower-fidelity than the stimulus (e.g. plain text glyphs),
// since the distinct-looking option *strings* become a shortcut that
// bypasses the visual reasoning the item is meant to measure.
export function Dots({ count, filled, size = 16 }: { count: number; filled: boolean; size?: number }) {
  const spacing = size + 4;
  const radius = size / 2 - 1;
  const width = count * spacing - 4;
  return (
    <svg width={width} height={size} viewBox={`0 0 ${width} ${size}`} aria-hidden="true">
      {Array.from({ length: count }, (_, i) => (
        <circle
          key={i}
          cx={radius + 1 + i * spacing}
          cy={size / 2}
          r={radius}
          fill={filled ? "var(--ink)" : "none"}
          stroke="var(--ink)"
          strokeWidth="2"
        />
      ))}
    </svg>
  );
}

// Parses the corpus's plain-text option labels ("●●●", "○○") into the same
// {count, filled} shape the stimulus grid uses, so both are drawn by the
// same component.
export function parseDotGlyph(label: string): { count: number; filled: boolean } {
  const glyphs = [...label];
  return { count: glyphs.length, filled: glyphs[0] === "●" };
}

// Single arrow glyph — used where a matrix rule needs a rotation-sensitive
// shape; dots are rotationally symmetric so they can't carry a rotation rule.
function ArrowGlyph({ filled, rotation, size = 24 }: { filled: boolean; rotation: 0 | 90 | 180 | 270; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <polygon
        points="12,3 21,19 3,19"
        fill={filled ? "var(--ink)" : "none"}
        stroke="var(--ink)"
        strokeWidth="2"
        strokeLinejoin="round"
        transform={`rotate(${rotation} 12 12)`}
      />
    </svg>
  );
}

// Repeated arrow glyphs, laid out the same way Dots lays out circles, so a
// matrix cell (or answer option) can carry count + fill + rotation together.
export function Arrows({
  count,
  filled,
  rotation,
  size = 24,
}: {
  count: number;
  filled: boolean;
  rotation: 0 | 90 | 180 | 270;
  size?: number;
}) {
  return (
    <span style={{ display: "inline-flex", gap: 2 }}>
      {Array.from({ length: count }, (_, i) => (
        <ArrowGlyph filled={filled} rotation={rotation} size={size} key={i} />
      ))}
    </span>
  );
}
