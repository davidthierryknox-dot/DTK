import { PR_ITEMS, RL_ITEMS, SA_ITEMS, TOL_ITEMS, MOD_ITEMS } from "../data/screenerItems";
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
 * PR-4 divergent-attack scoring: raw = correct selections − incorrect selections,
 * floored at 0. 2 pts if raw ≥ 3, 1 pt if raw = 2, 0 pt if raw ≤ 1.
 * Corpus Part 3, PR-4 scoring note — must not go negative.
 */
export function scorePr4(selected: string[], item: Extract<PerformanceItem, { kind: "multi-select" }>): number {
  const correctSet = new Set(item.options.filter((o) => o.correct).map((o) => o.key));
  let correct = 0;
  let incorrect = 0;
  for (const key of selected) {
    if (correctSet.has(key)) correct += 1;
    else incorrect += 1;
  }
  const raw = Math.max(0, correct - incorrect);
  if (raw >= 3) return 2;
  if (raw === 2) return 1;
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
      if (answer.kind === "multi-select") total += scorePr4(answer.value, item);
    }
  }
  return total;
}

/**
 * Likert response scored 0–4. Reverse-keyed items score (4 − response).
 * Corpus Part 3 §TOL: only T-REP-2, T-RIG-2, T-ISO-2 are reverse-keyed —
 * one reverse item per sub-scale, not the whole set. MOD items are both
 * positively keyed. Get this wrong and every tolerance/depth result inverts
 * silently.
 */
export function scoreLikert(item: LikertItem, response: number): number {
  return item.key === "reverse" ? 4 - response : response;
}

export type ToleranceResult = { raw: number; pct: number; band: ToleranceBand };

function scoreToleranceGroup(group: ToleranceCode, answers: Answers): ToleranceResult {
  const items = TOL_ITEMS.filter((i) => i.group === group);
  let raw = 0;
  for (const item of items) {
    const answer = answers[item.id];
    if (answer?.kind === "likert") raw += scoreLikert(item, answer.value);
  }
  const pct = (raw / 8) * 100;
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

export function computeScore(answers: Answers): ScoreResult {
  const rawPR = scorePerformanceSection(PR_ITEMS, answers);
  const rawRL = scorePerformanceSection(RL_ITEMS, answers);
  const rawSA = scorePerformanceSection(SA_ITEMS, answers);

  const spikeIndex: Record<Construct, number> = {
    PR: (rawPR / 8) * 100,
    RL: (rawRL / 8) * 100,
    SA: (rawSA / 8) * 100,
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
    REP: scoreToleranceGroup("REP", answers),
    RIG: scoreToleranceGroup("RIG", answers),
    ISO: scoreToleranceGroup("ISO", answers),
  };

  const fitCells: Record<Construct, FitCellResult> = {} as Record<Construct, FitCellResult>;
  for (const construct of ["PR", "RL", "SA"] as Construct[]) {
    const tol = tolerance[TRACK_TOLERANCE[construct]];
    const letter = computeFitCell(bands[construct], tol.band);
    fitCells[construct] = { letter, spikeBand: bands[construct], toleranceBand: tol.band };
  }

  const depthItem = MOD_ITEMS.find((i) => i.id === "M-DEPTH")!;
  const switchItem = MOD_ITEMS.find((i) => i.id === "M-SWITCH")!;
  const depthResponse = answers["M-DEPTH"];
  const switchResponse = answers["M-SWITCH"];
  const depthScore = depthResponse?.kind === "likert" ? scoreLikert(depthItem, depthResponse.value) : 0;
  const switchScore = switchResponse?.kind === "likert" ? scoreLikert(switchItem, switchResponse.value) : 0;
  const depthHigh = depthScore >= 3;
  const switchHigh = switchScore >= 3;

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
