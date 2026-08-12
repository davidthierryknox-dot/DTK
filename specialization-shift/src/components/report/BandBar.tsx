import type { SpikeBand } from "../../lib/scoring";

// Brief §3 band-fill rule: one colour, length varies, nothing else.
const BAND_WIDTH: Record<SpikeBand, string> = {
  Pronounced: "90%",
  Clear: "68%",
  Present: "47%",
  Quiet: "26%",
};

export function BandBar({ label, band }: { label: string; band: SpikeBand }) {
  return (
    <div className="band-bar__row">
      <span className="band-bar__label">{label}</span>
      <div className="band-bar__track">
        <div className="band-bar__fill" style={{ width: BAND_WIDTH[band] }} />
      </div>
      <span className="band-bar__word">{band}</span>
    </div>
  );
}
