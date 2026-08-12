const CARDS = [
  { index: 1, text: "CONTAINS A DATE OF BIRTH" },
  { index: 2, text: "NO DATE OF BIRTH" },
  { index: 3, text: "ENCRYPTED" },
  { index: 4, text: "NOT ENCRYPTED" },
];

export function WasonCards() {
  return (
    <div>
      <div className="wason-cards" role="img" aria-label="See text alternative below the stimulus.">
        {CARDS.map((card) => (
          <div className="wason-card" key={card.index}>
            <span className="wason-card__text">{card.text}</span>
            <span className="wason-card__index">({card.index})</span>
          </div>
        ))}
      </div>
      <p className="visually-hidden">
        Four cards on a desk, numbered 1 to 4. Card 1 reads "contains a date of birth." Card 2 reads "no date of
        birth." Card 3 reads "encrypted." Card 4 reads "not encrypted." You can see one fact about each card; the
        other side is unknown until turned over.
      </p>
    </div>
  );
}
