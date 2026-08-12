type Glyph = "triangle" | "square";

// Corpus PR-1: four groups follow ▲ ▲ ■, group 4 breaks the pattern as ▲ ■ ▲.
const GROUPS: Glyph[][] = [
  ["triangle", "triangle", "square"],
  ["triangle", "triangle", "square"],
  ["triangle", "triangle", "square"],
  ["triangle", "square", "triangle"],
  ["triangle", "triangle", "square"],
];

function GlyphIcon({ glyph }: { glyph: Glyph }) {
  if (glyph === "triangle") {
    return (
      <svg width="32" height="32" viewBox="0 0 32 32" aria-hidden="true">
        <polygon points="16,5 28,27 4,27" fill="none" stroke="var(--ink)" strokeWidth="2" strokeLinejoin="round" />
      </svg>
    );
  }
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" aria-hidden="true">
      <rect x="5" y="5" width="22" height="22" fill="none" stroke="var(--ink)" strokeWidth="2" />
    </svg>
  );
}

export function SequenceGroups() {
  return (
    <div>
      <div className="sequence-groups" role="img" aria-label="See text alternative below the stimulus.">
        {GROUPS.map((group, i) => (
          <div className="sequence-group" key={i}>
            <div className="sequence-group__glyphs">
              {group.map((glyph, j) => (
                <GlyphIcon glyph={glyph} key={j} />
              ))}
            </div>
            <span className="sequence-group__index">Group {i + 1}</span>
          </div>
        ))}
      </div>
      <p className="visually-hidden">
        Five groups of three shapes each, labeled Group 1 through Group 5. Each group shows a sequence of triangles
        and squares. Four of the five groups share the same arrangement. Compare the order of shapes within each
        group to find the one group whose arrangement differs from the others.
      </p>
    </div>
  );
}
