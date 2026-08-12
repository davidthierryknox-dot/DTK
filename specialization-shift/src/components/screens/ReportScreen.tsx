import { computeScore, computeBatteryScore, computeLetterSpiritLean, computePressureNote } from "../../lib/scoring";
import type { Answers, Instrument } from "../../lib/types";
import { CONSTRUCTS } from "../../lib/types";
import { TRACKS, CROSS_TRACK_STRATEGY } from "../../data/trackContent";
import {
  shapeCopy,
  REVERSE_SIDE_COPY,
  DEPTH_SIGNATURE_COPY,
  METHODOLOGY_COPY,
  PRESSURE_NOTE_COPY,
  LETTER_SPIRIT_COPY,
} from "../../data/reportCopy";
import { BandBar } from "../report/BandBar";
import { FitCellBlock } from "../report/FitCellBlock";

function Prose({ text, className = "prose" }: { text: string; className?: string }) {
  return (
    <>
      {text.split("\n\n").map((paragraph, i) => (
        <p className={className} key={i}>
          {paragraph.split(/\*\*(.+?)\*\*/g).map((chunk, j) => (j % 2 === 1 ? <strong key={j}>{chunk}</strong> : chunk))}
        </p>
      ))}
    </>
  );
}

export function ReportScreen({
  answers,
  instrument,
  timerUsed,
}: {
  answers: Answers;
  instrument: Instrument;
  timerUsed?: boolean;
}) {
  const score = instrument === "battery" ? computeBatteryScore(answers) : computeScore(answers);
  const dominantMeta = TRACKS[score.dominant];
  const secondaryMeta = TRACKS[score.secondary];
  const thirdMeta = TRACKS[score.third];
  const dominantFit = score.fitCells[score.dominant];
  const secondaryFit = score.fitCells[score.secondary];
  const thirdFit = score.fitCells[score.third];

  const pressureNote = instrument === "battery" ? computePressureNote(answers, Boolean(timerUsed)) : null;
  const letterSpiritLean = instrument === "battery" ? computeLetterSpiritLean(answers) : "neither";

  return (
    <div className="screen enter">
      <div className="report">
        <p className="depth-signature">{DEPTH_SIGNATURE_COPY[score.depthSignature]}</p>

        <hr className="report-rule" />

        <section className="report-section">
          <h2>Your shape</h2>
          <Prose text={shapeCopy(score.shapeType, dominantMeta.trackName, secondaryMeta.trackName)} />
          <div className="band-bars">
            {CONSTRUCTS.map((construct) => (
              <BandBar key={construct} label={TRACKS[construct].constructLabel} band={score.spikeBand[construct]} />
            ))}
          </div>
          {pressureNote && <p className="prose pressure-note">{PRESSURE_NOTE_COPY[pressureNote]}</p>}
        </section>

        <section className="report-section">
          <h2>
            Track {dominantMeta.trackNumber} — {dominantMeta.trackName}
          </h2>
          <p className="prose">{dominantMeta.whatTheWorkIs}</p>
          <p className="prose">It draws on: {dominantMeta.cognitiveDemand}</p>
          <FitCellBlock
            letter={dominantFit.letter}
            cost={dominantMeta.costClause}
            dominantTrackName={dominantMeta.trackName}
          />
        </section>

        <section className="report-section">
          <h3>
            Track {secondaryMeta.trackNumber} — {secondaryMeta.trackName}
          </h3>
          <p className="prose">{secondaryMeta.whatTheWorkIs}</p>
          <FitCellBlock
            letter={secondaryFit.letter}
            cost={secondaryMeta.costClause}
            dominantTrackName={dominantMeta.trackName}
            brief
          />
        </section>

        <section className="report-section">
          <h3>
            Track {thirdMeta.trackNumber} — {thirdMeta.trackName}
          </h3>
          <p className="prose">
            The least indicated of the three in this snapshot. {thirdMeta.whatTheWorkIs}
          </p>
          <FitCellBlock
            letter={thirdFit.letter}
            cost={thirdMeta.costClause}
            dominantTrackName={dominantMeta.trackName}
            brief
          />
        </section>

        {letterSpiritLean !== "neither" && (
          <p className="prose letter-spirit-note">{LETTER_SPIRIT_COPY[letterSpiritLean]}</p>
        )}

        <section className="reverse-side">
          <h2>The reverse side</h2>
          <Prose text={REVERSE_SIDE_COPY[score.dominant]} />
        </section>

        <section className="report-section">
          <h2>What to do next</h2>
          <ul className="next-list">
            {CROSS_TRACK_STRATEGY.map((line, i) => (
              <li key={i}>{line}</li>
            ))}
          </ul>
        </section>

        <section className="methodology">
          <p style={{ fontFamily: "var(--font-sans)", fontSize: 14, fontWeight: 600, color: "var(--ink-2)", marginBottom: 8 }}>
            What this was, and what it wasn't.
          </p>
          {METHODOLOGY_COPY.map((paragraph, i) => (
            <p className="prose" key={i}>
              {paragraph}
            </p>
          ))}
        </section>
      </div>
    </div>
  );
}
