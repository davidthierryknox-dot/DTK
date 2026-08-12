const RULES = ["Press advances one state, cycling OFF → DIM → BRIGHT → OFF …", "Hold returns it to OFF from any state."];

const SEQUENCE = ["Press", "Press", "Hold", "Press", "Press", "Press", "Press"];

export function StateChips() {
  return (
    <div>
      <ul className="rule-list" aria-hidden="true">
        {RULES.map((rule, i) => (
          <li key={i}>{rule}</li>
        ))}
      </ul>
      <div className="chip-sequence" role="img" aria-label="See text alternative below the stimulus.">
        {SEQUENCE.map((op, i) => (
          <span className="chip" key={i}>
            {op}
          </span>
        ))}
      </div>
      <p className="visually-hidden">
        A light has three states that cycle in order: off, dim, bright, then back to off. A press advances the
        light one state forward. A hold returns it to off from any state. Starting at off, this sequence of seven
        operations occurs in order: press, press, hold, press, press, press, press. Trace the sequence one
        operation at a time to find the final state.
      </p>
    </div>
  );
}
