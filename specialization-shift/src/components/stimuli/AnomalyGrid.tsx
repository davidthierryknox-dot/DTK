const ROWS = 5;
const COLS = 5;
// Corpus PR-2: anomaly at Row 3, Column 3 — differs from its neighbours by
// reflection only, never by size, weight, colour, or spacing.
const ANOMALY_ROW = 3;
const ANOMALY_COL = 3;

function BracketGlyph({ mirrored }: { mirrored: boolean }) {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" aria-hidden="true">
      <path
        d="M6,10 L26,10 L26,26"
        fill="none"
        stroke="var(--ink)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        transform={mirrored ? "scale(-1,1) translate(-32,0)" : undefined}
      />
    </svg>
  );
}

export function AnomalyGrid() {
  return (
    <div>
      <div className="anomaly-grid-wrap" role="img" aria-label="See text alternative below the stimulus.">
        <div />
        {Array.from({ length: COLS }, (_, i) => (
          <span className="anomaly-label" key={`col-label-${i}`}>
            C{i + 1}
          </span>
        ))}
        {Array.from({ length: ROWS }, (_, rIdx) => {
          const r = rIdx + 1;
          return (
            <>
              <span className="anomaly-label" key={`row-label-${r}`}>
                R{r}
              </span>
              {Array.from({ length: COLS }, (_, cIdx) => {
                const c = cIdx + 1;
                const mirrored = r === ANOMALY_ROW && c === ANOMALY_COL;
                return <BracketGlyph mirrored={mirrored} key={`cell-${r}-${c}`} />;
              })}
            </>
          );
        })}
      </div>
      <p className="visually-hidden">
        A 5 by 5 grid of tiles, columns labeled C1 through C5 and rows labeled R1 through R5. Every tile shows the
        same symbol in the same rotation, except exactly one tile, which shows the symbol mirrored. Scan the grid
        row by row to find the mirrored tile.
      </p>
    </div>
  );
}
