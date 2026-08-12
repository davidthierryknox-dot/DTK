import { ShapeIcon } from "./ShapeIcon";
import type { BalanceStimulusData } from "../../lib/stimulusTypes";

function GlyphRun({ glyph, count }: { glyph: BalanceStimulusData["question"]["glyph"]; count: number }) {
  return (
    <span style={{ display: "inline-flex", gap: 4 }}>
      {Array.from({ length: count }, (_, i) => (
        <ShapeIcon glyph={glyph} size={26} key={i} />
      ))}
    </span>
  );
}

export function Balance({ data }: { data: BalanceStimulusData }) {
  return (
    <div>
      <div className="balance" role="img" aria-label="See text alternative below the stimulus.">
        {data.equivalences.map((eq, i) => (
          <div className="balance__row" key={i}>
            <GlyphRun glyph={eq.left.glyph} count={eq.left.count} />
            <span className="balance__equals">=</span>
            <GlyphRun glyph={eq.right.glyph} count={eq.right.count} />
          </div>
        ))}
        <div className="balance__row balance__row--question">
          <GlyphRun glyph={data.question.glyph} count={data.question.count} />
          <span className="balance__equals">=</span>
          <span className="balance__question-mark">?</span>
          <GlyphRun glyph={data.question.targetGlyph} count={1} />
        </div>
      </div>
      <p className="visually-hidden">
        A set of equivalences between shapes:{" "}
        {data.equivalences
          .map((eq) => `${eq.left.count} ${eq.left.glyph}${eq.left.count > 1 ? "s" : ""} balance ${eq.right.count} ${eq.right.glyph}${eq.right.count > 1 ? "s" : ""}`)
          .join("; ")}
        . Question: how many {data.question.targetGlyph}s balance {data.question.count} {data.question.glyph}
        {data.question.count > 1 ? "s" : ""}? Use the equivalences to work out the answer.
      </p>
    </div>
  );
}
