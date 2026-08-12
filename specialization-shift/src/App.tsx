import { useState } from "react";
import { OpeningScreen } from "./components/screens/OpeningScreen";
import { SectionIntroScreen } from "./components/screens/SectionIntroScreen";
import { ItemScreen } from "./components/screens/ItemScreen";
import { ReportScreen } from "./components/screens/ReportScreen";
import { PR_ITEMS, RL_ITEMS, SA_ITEMS, TOL_ITEMS, MOD_ITEMS } from "./data/screenerItems";
import type { Answer, Answers, ItemId, LikertItem, PerformanceItem, Step } from "./lib/types";

const TOTAL_ITEMS = 20;

function buildSteps(): Step[] {
  const steps: Step[] = [{ kind: "opening" }];
  let index = 0;

  const sections: { section: "PR" | "RL" | "SA" | "TOL" | "MOD"; items: (PerformanceItem | LikertItem)[] }[] = [
    { section: "PR", items: PR_ITEMS },
    { section: "RL", items: RL_ITEMS },
    { section: "SA", items: SA_ITEMS },
    { section: "TOL", items: TOL_ITEMS },
    { section: "MOD", items: MOD_ITEMS },
  ];

  for (const { section, items } of sections) {
    steps.push({ kind: "section-intro", section });
    for (const item of items) {
      index += 1;
      steps.push({ kind: "item", id: item.id, section, index });
    }
  }

  steps.push({ kind: "report" });
  return steps;
}

const STEPS = buildSteps();
const ITEM_BY_ID: Record<ItemId, PerformanceItem | LikertItem> = Object.fromEntries(
  [...PR_ITEMS, ...RL_ITEMS, ...SA_ITEMS, ...TOL_ITEMS, ...MOD_ITEMS].map((item) => [item.id, item]),
) as Record<ItemId, PerformanceItem | LikertItem>;

export default function App() {
  const [stepIndex, setStepIndex] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});

  const step = STEPS[stepIndex];

  const goNext = () => setStepIndex((i) => Math.min(i + 1, STEPS.length - 1));
  const goBack = () => setStepIndex((i) => Math.max(i - 1, 0));

  const setAnswer = (id: ItemId, answer: Answer) => setAnswers((prev) => ({ ...prev, [id]: answer }));

  if (step.kind === "opening") {
    return <OpeningScreen onStart={goNext} />;
  }

  if (step.kind === "section-intro") {
    return (
      <SectionIntroScreen section={step.section} onContinue={goNext} onBack={goBack} canGoBack={stepIndex > 0} />
    );
  }

  if (step.kind === "item") {
    const item = ITEM_BY_ID[step.id];
    return (
      <ItemScreen
        item={item}
        section={step.section}
        index={step.index}
        total={TOTAL_ITEMS}
        answer={answers[step.id]}
        onAnswerChange={(answer) => setAnswer(step.id, answer)}
        onBack={goBack}
        onContinue={goNext}
        canGoBack={stepIndex > 0}
      />
    );
  }

  return <ReportScreen answers={answers} />;
}
