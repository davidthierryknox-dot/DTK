export function OpeningScreen({ copy, onStart }: { copy: string[]; onStart: () => void }) {
  return (
    <div className="screen enter">
      <div className="centered-screen">
        <span className="eyebrow">The Specialization Shift</span>
        <div>
          {copy.map((paragraph, i) => (
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
