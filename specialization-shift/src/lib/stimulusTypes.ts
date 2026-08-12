// Shared, parameterized stimulus data shapes. The screener's 8 stimulus
// components were originally hardcoded to their one instance each; the full
// battery reuses the same rendering with new content, so every component
// now takes a typed `data` prop instead. Screener items carry the same
// shapes as their `stimulusData`, so there is exactly one rendering path.

export type Glyph = "triangle" | "square" | "circle";

export type SequenceStimulusData = {
  groups: Glyph[][];
};

export type AnomalyGridStimulusData = {
  rows: number;
  cols: number;
  anomalyRow: number; // 1-indexed
  anomalyCol: number; // 1-indexed
  showLabels: boolean;
};

export type WasonStimulusData = {
  cards: { index: number; text: string }[];
};

export type RecordStimulusData = {
  recordA: string;
  recordB: string;
};

export type DotCell = { kind: "dots"; count: number; filled: boolean };
export type ArrowCell = { kind: "arrow"; count: number; filled: boolean; rotation: 0 | 90 | 180 | 270 };
export type MatrixCell = DotCell | ArrowCell | "question";

export type MatrixStimulusData = {
  grid: MatrixCell[][]; // 3x3, row-major
};

export type DependencyNode = { id: string; x: number; y: number };

export type DependencyStimulusData = {
  nodes: DependencyNode[];
  edges: [string, string][];
};

export type StateStimulusData = {
  rules: string[];
  sequence: string[];
};

export type FlowBox = { id: string; label: string; x: number; y: number; w: number; h: number };
export type FlowEdge = { from: string; to: string; label?: string; direction: "vertical" | "horizontal" };
export type FlowStimulusData = {
  boxes: FlowBox[];
  edges: FlowEdge[];
  width: number;
  height: number;
};

export type TwoViewStimulusData = {
  unit: string;
  rows: { label: string; tableValue: number; chartValue: number }[];
};

export type BalanceStimulusData = {
  equivalences: { left: { glyph: Glyph; count: number }; right: { glyph: Glyph; count: number } }[];
  question: { glyph: Glyph; count: number; targetGlyph: Glyph };
};

export type StimulusSpec =
  | { kind: "sequence"; data: SequenceStimulusData }
  | { kind: "anomaly-grid"; data: AnomalyGridStimulusData }
  | { kind: "wason"; data: WasonStimulusData }
  | { kind: "record"; data: RecordStimulusData }
  | { kind: "matrix"; data: MatrixStimulusData }
  | { kind: "dependency"; data: DependencyStimulusData }
  | { kind: "state"; data: StateStimulusData }
  | { kind: "flow"; data: FlowStimulusData }
  | { kind: "two-view"; data: TwoViewStimulusData }
  | { kind: "balance"; data: BalanceStimulusData };
