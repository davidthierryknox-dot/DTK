import { fitCellCopy } from "../../data/reportCopy";
import type { FitCellLetter } from "../../lib/scoring";

export function FitCellBlock({
  letter,
  cost,
  dominantTrackName,
  brief,
}: {
  letter: FitCellLetter;
  cost: string;
  dominantTrackName: string;
  brief?: boolean;
}) {
  const { name, body } = fitCellCopy(letter, cost, dominantTrackName);
  return (
    <div className={`fit-cell${brief ? " fit-cell--brief" : ""}`}>
      <span className="fit-cell__label">{name}</span>
      {body.split("\n\n").map((paragraph, i) => (
        <p className="prose" key={i}>
          {paragraph}
        </p>
      ))}
    </div>
  );
}
