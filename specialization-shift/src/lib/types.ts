export type Construct = "PR" | "RL" | "SA";
export type ToleranceCode = "REP" | "RIG" | "ISO";

export const CONSTRUCTS: Construct[] = ["PR", "RL", "SA"];

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
  | "SA-4";

export type ToleranceItemId =
  | "T-REP-1"
  | "T-REP-2"
  | "T-RIG-1"
  | "T-RIG-2"
  | "T-ISO-1"
  | "T-ISO-2";

export type ModifierItemId = "M-DEPTH" | "M-SWITCH";

export type ItemId = PerformanceItemId | ToleranceItemId | ModifierItemId;

export type SingleChoiceOption = {
  key: string;
  label: string;
};

export type SingleChoiceItem = {
  kind: "single-choice";
  id: PerformanceItemId;
  construct: Construct;
  title: string;
  points: number;
  stem: string;
  scenario?: string[];
  stimulus?: "sequence" | "anomaly-grid" | "wason" | "matrix" | "dependency" | "state" | "flow" | "record";
  /**
   * When set, answer options render as glyph tiles at the same visual
   * fidelity as the stimulus, rather than as plain text — the option text
   * itself would otherwise be a lower-fidelity shortcut around the visual
   * reasoning the item is meant to measure (matters most for matrix items,
   * whose options are themselves patterns, not descriptions).
   */
  optionRender?: "dots";
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

export type Section = "PR" | "RL" | "SA" | "TOL" | "MOD";

export type Step =
  | { kind: "opening" }
  | { kind: "section-intro"; section: Section }
  | { kind: "item"; id: ItemId; section: Section; index: number }
  | { kind: "report" };
