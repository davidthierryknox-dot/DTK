import type { RecordStimulusData } from "../../lib/stimulusTypes";

export function RecordComparison({ data }: { data: RecordStimulusData }) {
  return (
    <div>
      <div className="record-comparison" role="img" aria-label="See text alternative below the stimulus.">
        <div className="record-row">
          <span className="record-row__label">Record A</span>
          <span className="record-row__value">{data.recordA}</span>
        </div>
        <div className="record-row">
          <span className="record-row__label">Record B</span>
          <span className="record-row__value">{data.recordB}</span>
        </div>
      </div>
      <p className="visually-hidden">
        Two records, Record A and Record B, each with several fields separated by slashes. Compare the two records
        field by field to count how many fields differ.
      </p>
    </div>
  );
}
