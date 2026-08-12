import { ShapeIcon } from "./ShapeIcon";
import type { SequenceStimulusData } from "../../lib/stimulusTypes";

export function SequenceGroups({ data }: { data: SequenceStimulusData }) {
  return (
    <div>
      <div className="sequence-groups" role="img" aria-label="See text alternative below the stimulus.">
        {data.groups.map((group, i) => (
          <div className="sequence-group" key={i}>
            <div className="sequence-group__glyphs">
              {group.map((glyph, j) => (
                <ShapeIcon glyph={glyph} key={j} />
              ))}
            </div>
            <span className="sequence-group__index">Group {i + 1}</span>
          </div>
        ))}
      </div>
      <p className="visually-hidden">
        {data.groups.length} groups of shapes, labeled Group 1 through Group {data.groups.length}. Each group shows a
        sequence of shapes. Most groups share the same arrangement rule; compare the shapes and their order within
        each group to find the one that differs.
      </p>
    </div>
  );
}
