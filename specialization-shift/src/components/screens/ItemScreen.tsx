import type * as React from "react";
import { Header } from "../Header";
import { LikertList, MultiSelectList, SingleChoiceList } from "../OptionList";
import { SequenceGroups } from "../stimuli/SequenceGroups";
import { AnomalyGrid } from "../stimuli/AnomalyGrid";
import { WasonCards } from "../stimuli/WasonCards";
import { RecordComparison } from "../stimuli/RecordComparison";
import { Matrix3x3 } from "../stimuli/Matrix3x3";
import { DependencyGraph } from "../stimuli/DependencyGraph";
import { StateChips } from "../stimuli/StateChips";
import { FlowDiagram } from "../stimuli/FlowDiagram";
import type { Answer, LikertItem, PerformanceItem, Section } from "../../lib/types";

const STIMULUS_COMPONENTS: Record<string, () => React.JSX.Element> = {
  sequence: SequenceGroups,
  "anomaly-grid": AnomalyGrid,
  wason: WasonCards,
  record: RecordComparison,
  matrix: Matrix3x3,
  dependency: DependencyGraph,
  state: StateChips,
  flow: FlowDiagram,
};

export function ItemScreen({
  item,
  section,
  index,
  total,
  answer,
  onAnswerChange,
  onBack,
  onContinue,
  canGoBack,
}: {
  item: PerformanceItem | LikertItem;
  section: Section;
  index: number;
  total: number;
  answer: Answer | undefined;
  onAnswerChange: (answer: Answer) => void;
  onBack: () => void;
  onContinue: () => void;
  canGoBack: boolean;
}) {
  let canContinue = false;
  let body: React.ReactNode = null;

  if (item.kind === "single-choice") {
    const value = answer?.kind === "single-choice" ? answer.value : undefined;
    canContinue = Boolean(value);
    const Stimulus = item.stimulus ? STIMULUS_COMPONENTS[item.stimulus] : undefined;
    body = (
      <>
        <p className="item-stem">{item.stem}</p>
        {item.scenario && (
          <div className="item-scenario">
            {item.scenario.map((paragraph, i) => (
              <p key={i} style={{ whiteSpace: "pre-line" }}>
                {paragraph}
              </p>
            ))}
          </div>
        )}
        {Stimulus && (
          <>
            <div className="stimulus-spacer" />
            <div className={`stimulus-panel${item.stimulus === "record" ? " stimulus-panel--mono" : ""}`}>
              <Stimulus />
            </div>
          </>
        )}
        <div className="stimulus-spacer" />
        <SingleChoiceList
          options={item.options}
          value={value}
          onChange={(key) => onAnswerChange({ kind: "single-choice", value: key })}
        />
      </>
    );
  } else if (item.kind === "multi-select") {
    const value = answer?.kind === "multi-select" ? answer.value : [];
    canContinue = answer?.kind === "multi-select";
    body = (
      <>
        <p className="item-stem">{item.stem}</p>
        <div className="stimulus-spacer" />
        <p className="penalty-note">{item.penaltyNote}</p>
        <MultiSelectList
          options={item.options}
          value={value}
          onToggle={(key) => {
            const next = value.includes(key) ? value.filter((k) => k !== key) : [...value, key];
            onAnswerChange({ kind: "multi-select", value: next, touched: true });
          }}
        />
      </>
    );
  } else {
    const value = answer?.kind === "likert" ? answer.value : undefined;
    canContinue = value !== undefined;
    body = (
      <>
        <p className="item-stem">{item.stem}</p>
        <div className="stimulus-spacer" />
        <LikertList value={value} onChange={(v) => onAnswerChange({ kind: "likert", value: v })} />
      </>
    );
  }

  return (
    <div className="screen enter">
      <Header section={section} index={index} total={total} />
      <div className="content-column">
        <div className="item-body">
          {body}
          <div className="item-footer">
            <button type="button" className="nav-button" onClick={onBack} disabled={!canGoBack}>
              ← Back
            </button>
            <button
              type="button"
              className="nav-button nav-button--continue"
              onClick={onContinue}
              disabled={!canContinue}
            >
              Continue →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
