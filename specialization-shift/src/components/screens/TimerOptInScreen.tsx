import { TIMER_OPT_IN_COPY } from "../../data/reportCopy";

export function TimerOptInScreen({
  onChoose,
  onBack,
  canGoBack,
}: {
  onChoose: (timed: boolean) => void;
  onBack: () => void;
  canGoBack: boolean;
}) {
  return (
    <div className="screen enter">
      <div className="centered-screen">
        <p className="section-title">{TIMER_OPT_IN_COPY.question}</p>
        <p className="prose">{TIMER_OPT_IN_COPY.body}</p>
        <div className="start-actions" style={{ display: "flex", gap: 16 }}>
          <button type="button" className="primary-button" onClick={() => onChoose(false)}>
            Run untimed
          </button>
          <button type="button" className="nav-button" onClick={() => onChoose(true)}>
            Add a timer
          </button>
        </div>
        <div className="item-footer" style={{ marginTop: 16 }}>
          <button type="button" className="nav-button" onClick={onBack} disabled={!canGoBack}>
            ← Back
          </button>
        </div>
      </div>
    </div>
  );
}
