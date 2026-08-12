import type { StimulusSpec } from "./stimulusTypes";

export type Construct = "PR" | "RL" | "SA";
export type ToleranceCode = "REP" | "RIG" | "ISO";

export const CONSTRUCTS: Construct[] = ["PR", "RL", "SA"];

export type Instrument = "screener" | "battery";

export type PerformanceItemId =
  | "PR-1"
  | "PR-2"
  | "PR-3"
  | "PR-4"
  | "RL-1"
  | "RL-2"
  | "RL-3"
  | "RL-4"
  | "SA-1"
  | "SA-2"
  | "SA-3"
  | "SA-4"
  | `PR-F${1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10}`
  | `SA-F${1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10}`
  | `RL-F${1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10}`;

export type ToleranceItemId =
  | "T-REP-1"
  | "T-REP-2"
  | "T-RIG-1"
  | "T-RIG-2"
  | "T-ISO-1"
  | "T-ISO-2"
  | `T-REP-F${1 | 2 | 3 | 4 | 5 | 6}`
  | `T-RIG-F${1 | 2 | 3 | 4 | 5 | 6}`
  | `T-ISO-F${1 | 2 | 3 | 4 | 5 | 6}`;

export type ModifierItemId = "M-DEPTH" | "M-SWITCH" | `M-D${1 | 2 | 3 | 4}` | `M-S${1 | 2 | 3 | 4}`;

export type ItemId = PerformanceItemId | ToleranceItemId | ModifierItemId;

export type SingleChoiceOption = {
  key: string;
  label: string;
  /** For optionRender: "flow" (SA-F9) — each option is itself a small diagram. */
  flow?: import("./stimulusTypes").FlowStimulusData;
  /** For optionRender: "arrows" (SA-F8) — each option is a rotated-glyph tile. */
  arrows?: { count: number; filled: boolean; rotation: 0 | 90 | 180 | 270 };
};

export type SingleChoiceItem = {
  kind: "single-choice";
  id: PerformanceItemId;
  construct: Construct;
  title: string;
  points: number;
  stem: string;
  scenario?: string[];
  stimulusSpec?: StimulusSpec;
  /**
   * When set, answer options render as glyph tiles or mini diagrams at the
   * same visual fidelity as the stimulus, rather than as plain text — the
   * option text itself would otherwise be a lower-fidelity shortcut around
   * the visual reasoning the item is meant to measure (matters most for
   * matrix items and reverse-mapping items, whose options are themselves
   * patterns/diagrams, not descriptions).
   */
  optionRender?: "dots" | "flow" | "arrows";
  options: SingleChoiceOption[];
  correctKey: string;
};

export type MultiSelectOption = {
  key: string;
  label: string;
  correct: boolean;
};

export type MultiSelectItem = {
  kind: "multi-select";
  id: PerformanceItemId;
  construct: Construct;
  title: string;
  points: number;
  stem: string;
  penaltyNote: string;
  options: MultiSelectOption[];
  /**
   * raw = correct − incorrect, floored at 0 (corpus PR-4 scoring rule).
   * Thresholds scale with how many valid options exist; default matches
   * PR-4/PR-F4's 4-valid-option formula (2pt at raw≥3, 1pt at raw=2).
   */
  scoreThresholds?: { twoPt: number; onePt: number };
};

export type PerformanceItem = SingleChoiceItem | MultiSelectItem;

export type LikertKey = "positive" | "reverse";

export type LikertItem = {
  kind: "likert";
  id: ToleranceItemId | ModifierItemId;
  group: ToleranceCode | "MOD-DEPTH" | "MOD-SWITCH";
  key: LikertKey;
  stem: string;
};

export const LIKERT_OPTIONS = [
  { value: 0, label: "Strongly disagree" },
  { value: 1, label: "Disagree" },
  { value: 2, label: "Neither" },
  { value: 3, label: "Agree" },
  { value: 4, label: "Strongly agree" },
] as const;

export type Answer =
  | { kind: "single-choice"; value: string }
  | { kind: "multi-select"; value: string[]; touched: true }
  | { kind: "likert"; value: number };

export type Answers = Partial<Record<ItemId, Answer>>;

// Step routing carries its own display strings (section label, item counter
// total) rather than looking them up from a construct code, so the screener
// and full battery — which label sections differently ("Pattern & Anomaly"
// vs "Section A1 — Pattern & Anomaly") and have different totals (20 vs 56)
// — can share the same screen components.
export type Step =
  | { kind: "opening" }
  | { kind: "timer-opt-in" }
  | { kind: "section-intro"; sectionLabel: string; body: string }
  | { kind: "item"; id: ItemId; sectionLabel: string; index: number; total: number; timed: boolean }
  | { kind: "report" };
