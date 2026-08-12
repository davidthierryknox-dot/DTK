import { PR_ITEMS, RL_ITEMS, SA_ITEMS, TOL_ITEMS, MOD_ITEMS } from "../data/screenerItems";
import { PR_BATTERY_ITEMS, RL_BATTERY_ITEMS, SA_BATTERY_ITEMS, TOL_BATTERY_ITEMS, MOD_BATTERY_ITEMS } from "../data/batteryItems";
import type { Answers, Construct, LikertItem, PerformanceItem, ToleranceCode } from "./types";

export type SpikeBand = "Pronounced" | "Clear" | "Present" | "Quiet";
export type ToleranceBand = "Comfortable" | "Workable" | "Costly";
export type ShapeType = "Spiked" | "Leaning" | "Level";
export type FitCellLetter = "A" | "B" | "C" | "D" | "E" | "F" | "G" | "H" | "I";
export type DepthSignature = "Deep-single-thread" | "Deep-flexible" | "Fragmented-costly" | "Broad-flexible";

const TRACK_TOLERANCE: Record<Construct, ToleranceCode> = { PR: "REP", RL: "RIG", SA: "ISO" };

export function spikeBand(pct: number): SpikeBand {
  if (pct >= 78) return "Pronounced";
  if (pct >= 58) return "Clear";
  if (pct >= 38) return "Present";
  return "Quiet";
}

export function toleranceBand(pct: number): ToleranceBand {
  if (pct >= 65) return "Comfortable";
  if (pct >= 40) return "Workable";
  return "Costly";
}

/**
 * Divergent-attack multi-select scoring: raw = correct selections − incorrect
 * selections, floored at 0. Corpus PR-4 scoring note — must not go negative.
 * Thresholds default to PR-4/PR-F4's 4-valid-option formula (2pt at raw≥3,
 * 1pt at raw=2); PR-F8 (5 valid options) overrides via scoreThresholds.
 */
export function scoreMultiSelect(selected: string[], item: Extract<PerformanceItem, { kind: "multi-select" }>): number {
  const correctSet = new Set(item.options.filter((o) => o.correct).map((o) => o.key));
  let correct = 0;
  let incorrect = 0;
  for (const key of selected) {
    if (correctSet.has(key)) correct += 1;
    else incorrect += 1;
  }
  const raw = Math.max(0, correct - incorrect);
  const { twoPt, onePt } = item.scoreThresholds ?? { twoPt: 3, onePt: 2 };
  if (raw >= twoPt) return 2;
  if (raw >= onePt) return 1;
  return 0;
}

function scorePerformanceSection(items: PerformanceItem[], answers: Answers): number {
  let total = 0;
  for (const item of items) {
    const answer = answers[item.id];
    if (!answer) continue;
    if (item.kind === "single-choice") {
      if (answer.kind === "single-choice" && answer.value === item.correctKey) total += item.points;
    } else {
      if (answer.kind === "multi-select") total += scoreMultiSelect(answer.value, item);
    }
  }
  return total;
}

/**
 * Likert response scored 0–4. Reverse-keyed items score (4 − response).
 * Screener (corpus Part 3 §TOL): only T-REP-2, T-RIG-2, T-ISO-2 are
 * reverse-keyed — one reverse item per sub-scale, not the whole set.
 * Full battery (corpus §4.6-4.7): three reverse-keyed items per tolerance
 * sub-scale (…-F2/F4/F6) and one per modifier (M-D3, M-S3). Get this wrong
 * and every tolerance/depth result inverts silently.
 */
export function scoreLikert(item: LikertItem, response: number): number {
  return item.key === "reverse" ? 4 - response : response;
}

export type ToleranceResult = { raw: number; pct: number; band: ToleranceBand };

function scoreToleranceGroup(items: LikertItem[], group: ToleranceCode, answers: Answers, maxPoints: number): ToleranceResult {
  const groupItems = items.filter((i) => i.group === group);
  let raw = 0;
  for (const item of groupItems) {
    const answer = answers[item.id];
    if (answer?.kind === "likert") raw += scoreLikert(item, answer.value);
  }
  const pct = (raw / maxPoints) * 100;
  return { raw, pct, band: toleranceBand(pct) };
}

export type FitCellResult = { letter: FitCellLetter; spikeBand: SpikeBand; toleranceBand: ToleranceBand };

export function computeFitCell(spike: SpikeBand, tolerance: ToleranceBand): FitCellLetter {
  const row = spike === "Present" ? 1 : spike === "Quiet" ? 2 : 0; // Pronounced/Clear -> 0
  const col = tolerance === "Comfortable" ? 0 : tolerance === "Workable" ? 1 : 2;
  const grid: FitCellLetter[][] = [
    ["A", "B", "C"],
    ["D", "E", "F"],
    ["G", "H", "I"],
  ];
  return grid[row][col];
}

export type ScoreResult = {
  spikeIndex: Record<Construct, number>;
  spikeBand: Record<Construct, SpikeBand>;
  dominant: Construct;
  secondary: Construct;
  third: Construct;
  margin: number;
  shapeType: ShapeType;
  tolerance: Record<ToleranceCode, ToleranceResult>;
  fitCells: Record<Construct, FitCellResult>;
  depthSignature: DepthSignature;
  depthHigh: boolean;
  switchHigh: boolean;
};

type InstrumentConfig = {
  prItems: PerformanceItem[];
  rlItems: PerformanceItem[];
  saItems: PerformanceItem[];
  tolItems: LikertItem[];
  modItems: LikertItem[];
  constructMax: number; // max raw points per PR/RL/SA section
  toleranceMax: number; // max raw points per tolerance sub-scale
  /**
   * Sum of a modifier's items (raw points) at or above which it bands High.
   * Screener modifiers are a single item (0-4); the cutoff of 3 means
   * "Agree or Strongly agree". The full battery's modifiers are four items
   * (0-16); there is no corpus-stated cutoff for that case, so this
   * generalizes the screener's cutoff as "Agree, on average" — raw ≥ 12
   * (4 items × 3) — rather than inventing an unrelated threshold.
   */
  modifierHighCutoff: number;
};

const SCREENER_CONFIG: InstrumentConfig = {
  prItems: PR_ITEMS,
  rlItems: RL_ITEMS,
  saItems: SA_ITEMS,
  tolItems: TOL_ITEMS,
  modItems: MOD_ITEMS,
  constructMax: 8,
  toleranceMax: 8,
  modifierHighCutoff: 3,
};

const BATTERY_CONFIG: InstrumentConfig = {
  prItems: PR_BATTERY_ITEMS,
  rlItems: RL_BATTERY_ITEMS,
  saItems: SA_BATTERY_ITEMS,
  tolItems: TOL_BATTERY_ITEMS,
  modItems: MOD_BATTERY_ITEMS,
  constructMax: 20,
  toleranceMax: 24,
  modifierHighCutoff: 12,
};

function computeScoreWithConfig(answers: Answers, config: InstrumentConfig): ScoreResult {
  const rawPR = scorePerformanceSection(config.prItems, answers);
  const rawRL = scorePerformanceSection(config.rlItems, answers);
  const rawSA = scorePerformanceSection(config.saItems, answers);

  const spikeIndex: Record<Construct, number> = {
    PR: (rawPR / config.constructMax) * 100,
    RL: (rawRL / config.constructMax) * 100,
    SA: (rawSA / config.constructMax) * 100,
  };
  const bands: Record<Construct, SpikeBand> = {
    PR: spikeBand(spikeIndex.PR),
    RL: spikeBand(spikeIndex.RL),
    SA: spikeBand(spikeIndex.SA),
  };

  const ranked = (["PR", "RL", "SA"] as Construct[]).slice().sort((a, b) => spikeIndex[b] - spikeIndex[a]);
  const [dominant, secondary, third] = ranked;
  const margin = spikeIndex[dominant] - spikeIndex[secondary];
  const shapeType: ShapeType = margin >= 15 ? "Spiked" : margin >= 6 ? "Leaning" : "Level";

  const tolerance: Record<ToleranceCode, ToleranceResult> = {
    REP: scoreToleranceGroup(config.tolItems, "REP", answers, config.toleranceMax),
    RIG: scoreToleranceGroup(config.tolItems, "RIG", answers, config.toleranceMax),
    ISO: scoreToleranceGroup(config.tolItems, "ISO", answers, config.toleranceMax),
  };

  const fitCells: Record<Construct, FitCellResult> = {} as Record<Construct, FitCellResult>;
  for (const construct of ["PR", "RL", "SA"] as Construct[]) {
    const tol = tolerance[TRACK_TOLERANCE[construct]];
    const letter = computeFitCell(bands[construct], tol.band);
    fitCells[construct] = { letter, spikeBand: bands[construct], toleranceBand: tol.band };
  }

  const depthItems = config.modItems.filter((i) => i.group === "MOD-DEPTH");
  const switchItems = config.modItems.filter((i) => i.group === "MOD-SWITCH");
  const sumLikert = (items: LikertItem[]) =>
    items.reduce((sum, item) => {
      const response = answers[item.id];
      return sum + (response?.kind === "likert" ? scoreLikert(item, response.value) : 0);
    }, 0);
  const depthHigh = sumLikert(depthItems) >= config.modifierHighCutoff;
  const switchHigh = sumLikert(switchItems) >= config.modifierHighCutoff;

  let depthSignature: DepthSignature;
  if (depthHigh && switchHigh) depthSignature = "Deep-single-thread";
  else if (depthHigh && !switchHigh) depthSignature = "Deep-flexible";
  else if (!depthHigh && switchHigh) depthSignature = "Fragmented-costly";
  else depthSignature = "Broad-flexible";

  return {
    spikeIndex,
    spikeBand: bands,
    dominant,
    secondary,
    third,
    margin,
    shapeType,
    tolerance,
    fitCells,
    depthSignature,
    depthHigh,
    switchHigh,
  };
}

export function computeScore(answers: Answers): ScoreResult {
  return computeScoreWithConfig(answers, SCREENER_CONFIG);
}

export function computeBatteryScore(answers: Answers): ScoreResult {
  return computeScoreWithConfig(answers, BATTERY_CONFIG);
}

/**
 * PR-F10 / RL-F10 pairing (corpus §4.5): both items describe the same
 * scenario; PR-F10 is scored for catching the purpose violation, RL-F10 for
 * recognizing literal compliance. The corpus asks for the *difference*
 * between the two responses to be surfaced as a one-line report observation,
 * not scored into any construct.
 */
export type LetterSpiritLean = "spirit" | "letter" | "both" | "neither";

export function computeLetterSpiritLean(answers: Answers): LetterSpiritLean {
  const prAnswer = answers["PR-F10"];
  const rlAnswer = answers["RL-F10"];
  const caughtPurpose = prAnswer?.kind === "single-choice" && prAnswer.value === "B";
  const recognizedLiteral = rlAnswer?.kind === "single-choice" && rlAnswer.value === "A";
  if (caughtPurpose && recognizedLiteral) return "both";
  if (caughtPurpose) return "spirit";
  if (recognizedLiteral) return "letter";
  return "neither";
}

/**
 * Timer Pressure Note (corpus §4.2). The corpus's "accuracy holds within 10%
 * of untimed norm" wording implies a population baseline this instrument
 * explicitly doesn't have (no normative sample, stated repeatedly elsewhere
 * in the corpus). Fabricating one would break that commitment. Instead this
 * compares the person's own timed Section A (PR+SA) accuracy against their
 * own untimed Section B (RL) accuracy from the same sitting — self-
 * referential, not population-referential.
 */
export type PressureNote = "holds" | "drops" | null;

export function computePressureNote(answers: Answers, timerUsed: boolean): PressureNote {
  if (!timerUsed) return null;
  const rawPR = scorePerformanceSection(PR_BATTERY_ITEMS, answers);
  const rawSA = scorePerformanceSection(SA_BATTERY_ITEMS, answers);
  const rawRL = scorePerformanceSection(RL_BATTERY_ITEMS, answers);
  const pctA = ((rawPR + rawSA) / 40) * 100;
  const pctB = (rawRL / 20) * 100;
  return pctA >= pctB - 10 ? "holds" : "drops";
}
