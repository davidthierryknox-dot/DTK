import { useMemo, useState } from "react";
import { InstrumentPickerScreen } from "./components/screens/InstrumentPickerScreen";
import { OpeningScreen } from "./components/screens/OpeningScreen";
import { TimerOptInScreen } from "./components/screens/TimerOptInScreen";
import { SectionIntroScreen } from "./components/screens/SectionIntroScreen";
import { ItemScreen } from "./components/screens/ItemScreen";
import { ReportScreen } from "./components/screens/ReportScreen";
import { PR_ITEMS, RL_ITEMS, SA_ITEMS, TOL_ITEMS, MOD_ITEMS } from "./data/screenerItems";
import {
  PR_BATTERY_ITEMS,
  RL_BATTERY_ITEMS,
  SA_BATTERY_ITEMS,
  TOL_BATTERY_ITEMS,
  MOD_BATTERY_ITEMS,
} from "./data/batteryItems";
import { OPENING_COPY, BATTERY_OPENING_COPY, SECTION_INTRO_COPY, BATTERY_SECTION_INTRO_COPY } from "./data/reportCopy";
import type { Answer, Answers, Instrument, ItemId, LikertItem, PerformanceItem, Step } from "./lib/types";

const SCREENER_TOTAL = 20;
const BATTERY_TOTAL = 56;

function buildScreenerSteps(): Step[] {
  const steps: Step[] = [{ kind: "opening" }];
  let index = 0;
  const sections: { key: keyof typeof SECTION_INTRO_COPY; items: (PerformanceItem | LikertItem)[] }[] = [
    { key: "PR", items: PR_ITEMS },
    { key: "RL", items: RL_ITEMS },
    { key: "SA", items: SA_ITEMS },
    { key: "TOL", items: TOL_ITEMS },
    { key: "MOD", items: MOD_ITEMS },
  ];
  for (const { key, items } of sections) {
    const copy = SECTION_INTRO_COPY[key];
    steps.push({ kind: "section-intro", sectionLabel: copy.title, body: copy.body });
    for (const item of items) {
      index += 1;
      steps.push({ kind: "item", id: item.id, sectionLabel: copy.title, index, total: SCREENER_TOTAL, timed: false });
    }
  }
  steps.push({ kind: "report" });
  return steps;
}

function buildBatterySteps(): Step[] {
  const steps: Step[] = [{ kind: "opening" }, { kind: "timer-opt-in" }];
  let index = 0;
  const sections: { key: keyof typeof BATTERY_SECTION_INTRO_COPY; items: (PerformanceItem | LikertItem)[]; timeable: boolean }[] = [
    { key: "A1", items: PR_BATTERY_ITEMS, timeable: true },
    { key: "A2", items: SA_BATTERY_ITEMS, timeable: true },
    { key: "B", items: RL_BATTERY_ITEMS, timeable: false },
    { key: "C1", items: TOL_BATTERY_ITEMS.filter((i) => i.group === "REP"), timeable: false },
    { key: "C2", items: TOL_BATTERY_ITEMS.filter((i) => i.group === "RIG"), timeable: false },
    { key: "C3", items: TOL_BATTERY_ITEMS.filter((i) => i.group === "ISO"), timeable: false },
    { key: "D", items: MOD_BATTERY_ITEMS, timeable: false },
  ];
  for (const { key, items, timeable } of sections) {
    const copy = BATTERY_SECTION_INTRO_COPY[key];
    steps.push({ kind: "section-intro", sectionLabel: copy.title, body: copy.body });
    for (const item of items) {
      index += 1;
      // `timed` is resolved to the runtime timer choice when rendering — see App().
      steps.push({ kind: "item", id: item.id, sectionLabel: copy.title, index, total: BATTERY_TOTAL, timed: timeable });
    }
  }
  steps.push({ kind: "report" });
  return steps;
}

const SCREENER_STEPS = buildScreenerSteps();
const BATTERY_STEPS = buildBatterySteps();

const ITEM_BY_ID: Record<ItemId, PerformanceItem | LikertItem> = Object.fromEntries(
  [
    ...PR_ITEMS,
    ...RL_ITEMS,
    ...SA_ITEMS,
    ...TOL_ITEMS,
    ...MOD_ITEMS,
    ...PR_BATTERY_ITEMS,
    ...RL_BATTERY_ITEMS,
    ...SA_BATTERY_ITEMS,
    ...TOL_BATTERY_ITEMS,
    ...MOD_BATTERY_ITEMS,
  ].map((item) => [item.id, item]),
) as Record<ItemId, PerformanceItem | LikertItem>;

export default function App() {
  const [instrument, setInstrument] = useState<Instrument | null>(null);
  const [stepIndex, setStepIndex] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [timerUsed, setTimerUsed] = useState(false);

  const steps = useMemo(() => (instrument === "battery" ? BATTERY_STEPS : SCREENER_STEPS), [instrument]);
  const step = steps[stepIndex];

  const goNext = () => setStepIndex((i) => Math.min(i + 1, steps.length - 1));
  const goBack = () => setStepIndex((i) => Math.max(i - 1, 0));
  const setAnswer = (id: ItemId, answer: Answer) => setAnswers((prev) => ({ ...prev, [id]: answer }));

  if (!instrument) {
    return (
      <InstrumentPickerScreen
        onPick={(picked) => {
          setInstrument(picked);
          setStepIndex(0);
        }}
      />
    );
  }

  if (step.kind === "opening") {
    return <OpeningScreen copy={instrument === "battery" ? BATTERY_OPENING_COPY : OPENING_COPY} onStart={goNext} />;
  }

  if (step.kind === "timer-opt-in") {
    return (
      <TimerOptInScreen
        onChoose={(timed) => {
          setTimerUsed(timed);
          goNext();
        }}
        onBack={() => {
          setInstrument(null);
        }}
        canGoBack
      />
    );
  }

  if (step.kind === "section-intro") {
    return (
      <SectionIntroScreen
        sectionLabel={step.sectionLabel}
        body={step.body}
        onContinue={goNext}
        onBack={goBack}
        canGoBack={stepIndex > 0}
      />
    );
  }

  if (step.kind === "item") {
    const item = ITEM_BY_ID[step.id];
    return (
      <ItemScreen
        item={item}
        sectionLabel={step.sectionLabel}
        index={step.index}
        total={step.total}
        timed={step.timed && timerUsed}
        answer={answers[step.id]}
        onAnswerChange={(answer) => setAnswer(step.id, answer)}
        onBack={goBack}
        onContinue={goNext}
        canGoBack={stepIndex > 0}
      />
    );
  }

  return <ReportScreen answers={answers} instrument={instrument} timerUsed={timerUsed} />;
}
