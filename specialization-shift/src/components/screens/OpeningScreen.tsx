import { OPENING_COPY } from "../../data/reportCopy";

export function OpeningScreen({ onStart }: { onStart: () => void }) {
  return (
    <div className="screen enter">
      <div className="centered-screen">
        <span className="eyebrow">The Specialization Shift</span>
        <div>
          {OPENING_COPY.map((paragraph, i) => (
            <p className="prose" key={i}>
              {paragraph}
            </p>
          ))}
        </div>
        <div className="start-actions">
          <button type="button" className="primary-button" onClick={onStart}>
            Begin
          </button>
        </div>
      </div>
    </div>
  );
}
