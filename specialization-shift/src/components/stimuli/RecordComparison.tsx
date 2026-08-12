const RECORD_A = "RX-4471-BB / 2024-11-03 / QTY 1,240 / LOT 88-A / REV 2";
const RECORD_B = "RX-4471-B8 / 2024-11-03 / QTY 1,240 / LOT 88-A / REV 2";

export function RecordComparison() {
  return (
    <div>
      <div className="record-comparison" role="img" aria-label="See text alternative below the stimulus.">
        <div className="record-row">
          <span className="record-row__label">Record A</span>
          <span className="record-row__value">{RECORD_A}</span>
        </div>
        <div className="record-row">
          <span className="record-row__label">Record B</span>
          <span className="record-row__value">{RECORD_B}</span>
        </div>
      </div>
      <p className="visually-hidden">
        Two records, Record A and Record B, each with five fields separated by slashes: a reference code, a date, a
        quantity, a lot number, and a revision number. Compare the two records field by field to count how many
        fields differ.
      </p>
    </div>
  );
}
