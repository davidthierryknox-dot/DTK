import { SECTION_INTRO_COPY } from "../../data/reportCopy";
import type { Section } from "../../lib/types";

export function SectionIntroScreen({
  section,
  onContinue,
  onBack,
  canGoBack,
}: {
  section: Section;
  onContinue: () => void;
  onBack: () => void;
  canGoBack: boolean;
}) {
  const copy = SECTION_INTRO_COPY[section];
  return (
    <div className="screen enter">
      <div className="centered-screen">
        <span className="eyebrow">{copy.title}</span>
        <p className="section-title">{copy.body}</p>
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
