import type { StateStimulusData } from "../../lib/stimulusTypes";

export function StateChips({ data }: { data: StateStimulusData }) {
  return (
    <div>
      <ul className="rule-list" aria-hidden="true">
        {data.rules.map((rule, i) => (
          <li key={i}>{rule}</li>
        ))}
      </ul>
      <div className="chip-sequence" role="img" aria-label="See text alternative below the stimulus.">
        {data.sequence.map((op, i) => (
          <span className="chip" key={i}>
            {op}
          </span>
        ))}
      </div>
      <p className="visually-hidden">
        A machine with a set of rules: {data.rules.join(" ")} Starting from its initial state, this sequence of{" "}
        {data.sequence.length} operations occurs in order: {data.sequence.join(", ")}. Trace the sequence one
        operation at a time to find the final state.
      </p>
    </div>
  );
}
