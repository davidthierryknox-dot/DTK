import type { LikertItem, PerformanceItem } from "../lib/types";

// Verbatim from corpus Part 3. Do not alter stems, options, or keys without
// re-checking against the corpus — this is the source of truth for content.

export const PR_ITEMS: PerformanceItem[] = [
  {
    kind: "single-choice",
    id: "PR-1",
    construct: "PR",
    title: "Anomaly in a regular field",
    points: 2,
    stem: "Five groups. Four follow the same rule. One does not. Which group breaks the pattern?",
    stimulus: "sequence",
    options: [
      { key: "A", label: "Group 1" },
      { key: "B", label: "Group 2" },
      { key: "C", label: "Group 4" },
      { key: "D", label: "Group 5" },
    ],
    correctKey: "C",
  },
  {
    kind: "single-choice",
    id: "PR-2",
    construct: "PR",
    title: "Embedded anomaly under visual load",
    points: 2,
    stem: "Every tile below is the same symbol, rotated the same way — except one. Which tile is different?",
    stimulus: "anomaly-grid",
    options: [
      { key: "A", label: "Row 2, Column 4" },
      { key: "B", label: "Row 3, Column 3" },
      { key: "C", label: "Row 4, Column 1" },
      { key: "D", label: "Row 5, Column 5" },
    ],
    correctKey: "B",
  },
  {
    kind: "single-choice",
    id: "PR-3",
    construct: "PR",
    title: "Violation against a written spec",
    points: 2,
    stem: "One of these four logged responses breaks a rule. Which one?",
    scenario: [
      "An AI assistant is deployed with three hard rules:",
      "1. It must name a source for any factual claim.\n2. It must never give a medication dose.\n3. It must never name a private individual.",
    ],
    options: [
      {
        key: "A",
        label:
          "“Ibuprofen is an anti-inflammatory. Dosing depends on weight and other medications — your pharmacist can advise. (Source: NHS medicines guide)”",
      },
      {
        key: "B",
        label: "“The building permit was approved in March. (Source: City planning register, ref. 2291)”",
      },
      {
        key: "C",
        label:
          "“Your neighbour Sarah Whitfield filed the objection on 3 March. (Source: City planning register, ref. 2291)”",
      },
      { key: "D", label: "“I can't confirm that without a source I can cite.”" },
    ],
    correctKey: "C",
  },
  {
    kind: "multi-select",
    id: "PR-4",
    construct: "PR",
    title: "Divergent attack, disciplined",
    points: 2,
    stem: "A café gives one free coffee for every nine stamps on a paper loyalty card. The barista stamps the card by hand. Select every method below that would actually get someone a free coffee they didn't earn.",
    penaltyNote: "Wrong selections subtract from your score.",
    options: [
      { key: "A", label: "Buy a matching stamp from a stationery shop and stamp the card yourself", correct: true },
      { key: "B", label: "Photocopy a card that already has stamps on it", correct: true },
      { key: "C", label: "Ask a different barista who doesn't know you", correct: false },
      { key: "D", label: "Take discarded part-stamped cards from the bin and use the fullest one", correct: true },
      { key: "E", label: "Complain that the coffee was cold", correct: false },
      { key: "F", label: "Redeem a self-stamped card at a branch where staff don't know your face", correct: true },
      { key: "G", label: "Wait until the card expires", correct: false },
    ],
  },
];

export const RL_ITEMS: PerformanceItem[] = [
  {
    kind: "single-choice",
    id: "RL-1",
    construct: "RL",
    title: "Conditional verification",
    points: 2,
    stem: "You can see one fact about each of four records. You may turn over only the cards you need to check whether the rule has been broken. Which records must you check?",
    scenario: ["A records rule states: “If a record contains a date of birth, that record must be encrypted.”"],
    stimulus: "wason",
    options: [
      { key: "A", label: "1 and 3" },
      { key: "B", label: "1 and 4" },
      { key: "C", label: "1, 3 and 4" },
      { key: "D", label: "2 and 4" },
    ],
    correctKey: "B",
  },
  {
    kind: "single-choice",
    id: "RL-2",
    construct: "RL",
    title: "Rule precedence",
    points: 2,
    stem: "A record is nine years old, marked “archive,” and under legal hold. What happens to it?",
    scenario: [
      "Three rules govern data retention, in this order of authority:",
      "1. Rule 1 (highest): Records under legal hold are never deleted.\n2. Rule 2: Records older than seven years are deleted.\n3. Rule 3 (lowest): Records marked “archive” are kept for ten years.",
    ],
    options: [
      { key: "A", label: "Deleted — it is over seven years old" },
      { key: "B", label: "Kept — it is under legal hold" },
      { key: "C", label: "Kept until year ten, then deleted" },
      { key: "D", label: "The rules conflict; escalate to a supervisor" },
    ],
    correctKey: "B",
  },
  {
    kind: "single-choice",
    id: "RL-3",
    construct: "RL",
    title: "Edge-case classification",
    points: 2,
    stem: "“Staff wellness session, Thursday. Led by Dr. Amara Osei, our occupational health advisor.” Which category?",
    scenario: [
      "A content system uses exactly three categories, applied in this order:",
      "Restricted — contains personal health information\nInternal — contains no health information but names an employee\nPublic — everything else",
    ],
    options: [
      { key: "A", label: "Restricted" },
      { key: "B", label: "Internal" },
      { key: "C", label: "Public" },
      { key: "D", label: "Restricted, because it mentions health" },
    ],
    correctKey: "B",
  },
  {
    kind: "single-choice",
    id: "RL-4",
    construct: "RL",
    title: "Precision under near-identity",
    points: 2,
    stem: "Two records should be identical. How many differences are there?",
    stimulus: "record",
    options: [
      { key: "A", label: "None" },
      { key: "B", label: "One" },
      { key: "C", label: "Two" },
      { key: "D", label: "Three" },
    ],
    correctKey: "B",
  },
];

export const SA_ITEMS: PerformanceItem[] = [
  {
    kind: "single-choice",
    id: "SA-1",
    construct: "SA",
    title: "Matrix reasoning, two rules combined",
    points: 2,
    stem: "Which completes the matrix?",
    stimulus: "matrix",
    options: [
      { key: "A", label: "●●●" },
      { key: "B", label: "○○○" },
      { key: "C", label: "○○" },
      { key: "D", label: "●●" },
    ],
    correctKey: "B",
  },
  {
    kind: "single-choice",
    id: "SA-2",
    construct: "SA",
    title: "Dependency ordering",
    points: 2,
    stem: "Four steps in a build. The arrows mean “must happen before.” Which order is valid?",
    stimulus: "dependency",
    options: [
      { key: "A", label: "A, B, C, D" },
      { key: "B", label: "A, C, B, D" },
      { key: "C", label: "B, A, D, C" },
      { key: "D", label: "A, D, B, C" },
    ],
    correctKey: "A",
  },
  {
    kind: "single-choice",
    id: "SA-3",
    construct: "SA",
    title: "Nested state tracking",
    points: 2,
    stem: "Starting at OFF, the sequence runs left to right below. What state is the light in?",
    stimulus: "state",
    options: [
      { key: "A", label: "OFF" },
      { key: "B", label: "DIM" },
      { key: "C", label: "BRIGHT" },
      { key: "D", label: "Cannot be determined" },
    ],
    correctKey: "B",
  },
  {
    kind: "single-choice",
    id: "SA-4",
    construct: "SA",
    title: "Representation mapping",
    points: 2,
    stem: "A delivery robot follows written rules. Here is what it did. Which written rule set produces exactly this behaviour?",
    stimulus: "flow",
    options: [
      { key: "A", label: "“Wait for a human if the package is heavy. Otherwise deliver it.”" },
      { key: "B", label: "“Wait for a human if the package is heavy or fragile. Otherwise deliver it.”" },
      { key: "C", label: "“Wait for a human if the package is heavy and fragile. Otherwise deliver it.”" },
      { key: "D", label: "“Deliver every package unless a human is already present.”" },
    ],
    correctKey: "B",
  },
];

export const TOL_ITEMS: LikertItem[] = [
  {
    kind: "likert",
    id: "T-REP-1",
    group: "REP",
    key: "positive",
    stem: "I can run the same procedure many times over with only small variations and still stay engaged with it.",
  },
  {
    kind: "likert",
    id: "T-REP-2",
    group: "REP",
    key: "reverse",
    stem: "Spending my working days looking for what's broken, rather than building something, would wear me down over time.",
  },
  {
    kind: "likert",
    id: "T-RIG-1",
    group: "RIG",
    key: "positive",
    stem: "Clear, strict rules make me feel freer, not more constrained.",
  },
  {
    kind: "likert",
    id: "T-RIG-2",
    group: "RIG",
    key: "reverse",
    stem: "Having to document and justify every decision I make would frustrate me.",
  },
  {
    kind: "likert",
    id: "T-ISO-1",
    group: "ISO",
    key: "positive",
    stem: "My best work happens after several hours with no interruptions and no conversation.",
  },
  {
    kind: "likert",
    id: "T-ISO-2",
    group: "ISO",
    key: "reverse",
    stem: "I need regular contact with other people during the day to stay motivated.",
  },
];

export const MOD_ITEMS: LikertItem[] = [
  {
    kind: "likert",
    id: "M-DEPTH",
    group: "MOD-DEPTH",
    key: "positive",
    stem: "When a problem genuinely interests me, I lose track of time — hours can pass without my noticing.",
  },
  {
    kind: "likert",
    id: "M-SWITCH",
    group: "MOD-SWITCH",
    key: "positive",
    stem: "When I'm interrupted mid-task, getting back to where I was costs me far more than the interruption itself took.",
  },
];

export const ALL_PERFORMANCE_ITEMS = [...PR_ITEMS, ...RL_ITEMS, ...SA_ITEMS];
export const ALL_LIKERT_ITEMS = [...TOL_ITEMS, ...MOD_ITEMS];
