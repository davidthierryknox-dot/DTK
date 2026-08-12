import { Fragment } from "react";
import type { AnomalyGridStimulusData } from "../../lib/stimulusTypes";

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

export function AnomalyGrid({ data }: { data: AnomalyGridStimulusData }) {
  const { rows, cols, anomalyRow, anomalyCol, showLabels } = data;
  return (
    <div>
      <div
        className="anomaly-grid-wrap"
        style={{ gridTemplateColumns: `${showLabels ? "auto " : ""}repeat(${cols}, 32px)` }}
        role="img"
        aria-label="See text alternative below the stimulus."
      >
        {showLabels && (
          <>
            <div />
            {Array.from({ length: cols }, (_, i) => (
              <span className="anomaly-label" key={`col-label-${i}`}>
                C{i + 1}
              </span>
            ))}
          </>
        )}
        {Array.from({ length: rows }, (_, rIdx) => {
          const r = rIdx + 1;
          return (
            <Fragment key={`row-${r}`}>
              {showLabels && <span className="anomaly-label">R{r}</span>}
              {Array.from({ length: cols }, (_, cIdx) => {
                const c = cIdx + 1;
                const mirrored = r === anomalyRow && c === anomalyCol;
                return <BracketGlyph mirrored={mirrored} key={`cell-${r}-${c}`} />;
              })}
            </Fragment>
          );
        })}
      </div>
      <p className="visually-hidden">
        A {rows} by {cols} grid of tiles{showLabels ? ", columns and rows labeled" : ""}. Every tile shows the same
        symbol in the same rotation, except exactly one tile, which shows the symbol mirrored. Scan the grid
        systematically to find the mirrored tile.
      </p>
    </div>
  );
}
