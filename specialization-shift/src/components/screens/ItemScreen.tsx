import type { ReactNode } from "react";
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
import { TwoView } from "../stimuli/TwoView";
import { Balance } from "../stimuli/Balance";
import { Dots, Arrows, parseDotGlyph } from "../stimuli/MatrixDots";
import type { Answer, LikertItem, PerformanceItem } from "../../lib/types";
import type { StimulusSpec } from "../../lib/stimulusTypes";

function StimulusRenderer({ spec }: { spec: StimulusSpec }) {
  switch (spec.kind) {
    case "sequence":
      return <SequenceGroups data={spec.data} />;
    case "anomaly-grid":
      return <AnomalyGrid data={spec.data} />;
    case "wason":
      return <WasonCards data={spec.data} />;
    case "record":
      return <RecordComparison data={spec.data} />;
    case "matrix":
      return <Matrix3x3 data={spec.data} />;
    case "dependency":
      return <DependencyGraph data={spec.data} />;
    case "state":
      return <StateChips data={spec.data} />;
    case "flow":
      return <FlowDiagram data={spec.data} />;
    case "two-view":
      return <TwoView data={spec.data} />;
    case "balance":
      return <Balance data={spec.data} />;
  }
}

export function ItemScreen({
  item,
  sectionLabel,
  index,
  total,
  timed,
  answer,
  onAnswerChange,
  onBack,
  onContinue,
  canGoBack,
}: {
  item: PerformanceItem | LikertItem;
  sectionLabel: string;
  index: number;
  total: number;
  timed?: boolean;
  answer: Answer | undefined;
  onAnswerChange: (answer: Answer) => void;
  onBack: () => void;
  onContinue: () => void;
  canGoBack: boolean;
}) {
  let canContinue = false;
  let body: ReactNode = null;

  if (item.kind === "single-choice") {
    const value = answer?.kind === "single-choice" ? answer.value : undefined;
    canContinue = Boolean(value);
    const isMonoRecord = item.stimulusSpec?.kind === "record";
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
        {item.stimulusSpec && (
          <>
            <div className="stimulus-spacer" />
            <div className={`stimulus-panel${isMonoRecord ? " stimulus-panel--mono" : ""}`}>
              <StimulusRenderer spec={item.stimulusSpec} />
            </div>
          </>
        )}
        <div className="stimulus-spacer" />
        <SingleChoiceList
          options={item.options}
          value={value}
          onChange={(key) => onAnswerChange({ kind: "single-choice", value: key })}
          renderOption={
            item.optionRender
              ? (option) => {
                  const full = item.options.find((o) => o.key === option.key);
                  if (item.optionRender === "dots") {
                    const { count, filled } = parseDotGlyph(option.label);
                    return (
                      <>
                        <Dots count={count} filled={filled} size={20} />
                        <span className="visually-hidden">{option.label}</span>
                      </>
                    );
                  }
                  if (item.optionRender === "arrows" && full?.arrows) {
                    return (
                      <>
                        <Arrows count={full.arrows.count} filled={full.arrows.filled} rotation={full.arrows.rotation} size={20} />
                        <span className="visually-hidden">{option.label}</span>
                      </>
                    );
                  }
                  if (item.optionRender === "flow" && full?.flow) {
                    return (
                      <>
                        <FlowDiagram data={full.flow} compact />
                        <span className="visually-hidden">{option.label}</span>
                      </>
                    );
                  }
                  return option.label;
                }
              : undefined
          }
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
      <Header label={sectionLabel} index={index} total={total} />
      <div className="content-column">
        <div className="item-body">
          {timed && <p className="timed-note">Timed section</p>}
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
