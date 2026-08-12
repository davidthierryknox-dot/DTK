import type { Instrument } from "../../lib/types";

export function InstrumentPickerScreen({ onPick }: { onPick: (instrument: Instrument) => void }) {
  return (
    <div className="screen enter">
      <div className="centered-screen">
        <span className="eyebrow">The Specialization Shift</span>
        <p className="prose">
          There are two ways to take this. Both measure the same three tracks — pick the one that fits the time you
          have.
        </p>
        <div className="instrument-options">
          <button type="button" className="instrument-option" onClick={() => onPick("screener")}>
            <span className="instrument-option__title">The 20-item screener</span>
            <span className="instrument-option__meta">10–12 minutes</span>
            <span className="instrument-option__body">
              A short read on your shape across all three tracks. The right choice for most people.
            </span>
          </button>
          <button type="button" className="instrument-option" onClick={() => onPick("battery")}>
            <span className="instrument-option__title">The full battery</span>
            <span className="instrument-option__meta">35–45 minutes</span>
            <span className="instrument-option__body">
              The same three tracks measured in more depth, with an optional timed section.
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
