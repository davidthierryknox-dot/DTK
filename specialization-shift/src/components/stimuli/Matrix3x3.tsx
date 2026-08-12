import { Dots, Arrows } from "./MatrixDots";
import type { MatrixStimulusData } from "../../lib/stimulusTypes";

export function Matrix3x3({ data }: { data: MatrixStimulusData }) {
  return (
    <div>
      <div className="matrix-grid" role="img" aria-label="See text alternative below the stimulus.">
        {data.grid.flat().map((cell, i) => (
          <div className="matrix-cell" key={i}>
            {cell === "question" ? (
              <span className="matrix-cell__q">?</span>
            ) : cell.kind === "dots" ? (
              <Dots count={cell.count} filled={cell.filled} />
            ) : (
              <Arrows count={cell.count} filled={cell.filled} rotation={cell.rotation} />
            )}
          </div>
        ))}
      </div>
      <p className="visually-hidden">
        A 3 by 3 matrix with a blank cell marked with a question mark to be completed. One or more rules govern how
        the cell contents change moving across each row and down each column — count, fill, and in some items,
        rotation. Work out the pattern from the eight visible cells to determine what belongs in the blank cell.
      </p>
    </div>
  );
}
