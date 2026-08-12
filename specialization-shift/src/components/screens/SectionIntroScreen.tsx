export function SectionIntroScreen({
  sectionLabel,
  body,
  onContinue,
  onBack,
  canGoBack,
}: {
  sectionLabel: string;
  body: string;
  onContinue: () => void;
  onBack: () => void;
  canGoBack: boolean;
}) {
  return (
    <div className="screen enter">
      <div className="centered-screen">
        <span className="eyebrow">{sectionLabel}</span>
        <p className="section-title">{body}</p>
        <div className="item-footer" style={{ marginTop: 16 }}>
          <button type="button" className="nav-button" onClick={onBack} disabled={!canGoBack}>
            ← Back
          </button>
          <button type="button" className="nav-button nav-button--continue" onClick={onContinue}>
            Continue →
          </button>
        </div>
      </div>
    </div>
  );
}
