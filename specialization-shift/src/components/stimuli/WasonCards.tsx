import type { WasonStimulusData } from "../../lib/stimulusTypes";

export function WasonCards({ data }: { data: WasonStimulusData }) {
  return (
    <div>
      <div className="wason-cards" role="img" aria-label="See text alternative below the stimulus.">
        {data.cards.map((card) => (
          <div className="wason-card" key={card.index}>
            <span className="wason-card__text">{card.text}</span>
            <span className="wason-card__index">({card.index})</span>
          </div>
        ))}
      </div>
      <p className="visually-hidden">
        {data.cards.length} cards on a desk, numbered 1 to {data.cards.length}.{" "}
        {data.cards.map((c) => `Card ${c.index} reads "${c.text.toLowerCase()}."`).join(" ")} You can see one fact
        about each card; the other side is unknown until turned over.
      </p>
    </div>
  );
}
