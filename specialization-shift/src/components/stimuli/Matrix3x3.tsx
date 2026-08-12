import { Dots } from "./MatrixDots";

type CellSpec = { count: number; filled: boolean } | "question";

// Corpus SA-1: count increments left to right; fill alternates by row (open, filled, open).
const GRID: CellSpec[][] = [
  [
    { count: 1, filled: false },
    { count: 2, filled: false },
    { count: 3, filled: false },
  ],
  [
    { count: 1, filled: true },
    { count: 2, filled: true },
    { count: 3, filled: true },
  ],
  [{ count: 1, filled: false }, { count: 2, filled: false }, "question"],
];

export function Matrix3x3() {
  return (
    <div>
      <div className="matrix-grid" role="img" aria-label="See text alternative below the stimulus.">
        {GRID.flat().map((cell, i) => (
          <div className="matrix-cell" key={i}>
            {cell === "question" ? (
              <span className="matrix-cell__q">?</span>
            ) : (
              <Dots count={cell.count} filled={cell.filled} />
            )}
          </div>
        ))}
      </div>
      <p className="visually-hidden">
        A 3 by 3 matrix. Row 1 shows open circles, increasing in count from 1 to 3 left to right. Row 2 shows filled
        circles, also increasing from 1 to 3. Row 3 begins with 1 open circle, then 2 open circles, then a blank
        cell marked with a question mark to be completed. Two separate rules apply across the matrix: how the
        circle count changes, and how the fill alternates by row.
      </p>
    </div>
  );
}
