import type { LikertItem, PerformanceItem } from "../lib/types";
import type { StimulusSpec, FlowStimulusData } from "../lib/stimulusTypes";

// Corpus Part 4 specifies these 30 performance items by type/difficulty/
// design-constraint only (Part 8 §7: "the 30 performance stems are not
// [written]"). Authored here to the same standard as the screener (Part 3),
// following each item's design note precisely — see comments per item.

// ---------------------------------------------------------------------
// PR — Section A1 (10 items, 20 pts)
// ---------------------------------------------------------------------

const PR_F1_ANOMALY: StimulusSpec = {
  kind: "anomaly-grid",
  data: { rows: 5, cols: 5, anomalyRow: 2, anomalyCol: 4, showLabels: true },
};

const PR_F2_SEQUENCE: StimulusSpec = {
  kind: "sequence",
  data: {
    groups: [
      ["triangle"],
      ["square", "triangle"],
      ["triangle", "square", "triangle"],
      ["square", "triangle", "square", "triangle"],
      ["triangle", "square", "triangle", "square", "triangle"],
      ["square", "triangle", "square", "triangle", "square", "triangle"],
      ["square", "triangle", "square", "triangle", "square", "triangle", "square"],
    ],
  },
};

const PR_F5_TWOVIEW: StimulusSpec = {
  kind: "two-view",
  data: {
    unit: "units sold",
    rows: [
      { label: "North", tableValue: 420, chartValue: 420 },
      { label: "South", tableValue: 310, chartValue: 310 },
      { label: "East", tableValue: 275, chartValue: 257 },
      { label: "West", tableValue: 198, chartValue: 198 },
    ],
  },
};

const PR_F9_ANOMALY: StimulusSpec = {
  kind: "anomaly-grid",
  data: { rows: 8, cols: 8, anomalyRow: 2, anomalyCol: 6, showLabels: false },
};

export const PR_BATTERY_ITEMS: PerformanceItem[] = [
  {
    kind: "single-choice",
    id: "PR-F1",
    construct: "PR",
    title: "Anomaly in a regular field",
    points: 2,
    stem: "Every tile below is the same symbol, rotated the same way — except one. Which tile is different?",
    stimulusSpec: PR_F1_ANOMALY,
    options: [
      { key: "A", label: "Row 1, Column 5" },
      { key: "B", label: "Row 2, Column 4" },
      { key: "C", label: "Row 4, Column 2" },
      { key: "D", label: "Row 5, Column 1" },
    ],
    correctKey: "B",
  },
  {
    kind: "single-choice",
    id: "PR-F2",
    construct: "PR",
    title: "Sequence rule break",
    points: 2,
    stem: "Seven groups. In each, the number of shapes matches the group's position, and the lead shape alternates: odd-numbered groups lead with a triangle, even-numbered groups lead with a square. One group breaks this. Which one?",
    stimulusSpec: PR_F2_SEQUENCE,
    options: [
      { key: "A", label: "Group 3" },
      { key: "B", label: "Group 5" },
      { key: "C", label: "Group 6" },
      { key: "D", label: "Group 7" },
    ],
    correctKey: "D",
  },
  {
    kind: "single-choice",
    id: "PR-F3",
    construct: "PR",
    title: "Spec violation",
    points: 2,
    stem: "A support assistant is deployed with four hard rules. One of these five logged responses breaks a rule. Which one?",
    scenario: [
      "Rules:",
      "1. Must not disclose a customer's full payment card number.\n2. Must not tell a customer their claim is approved before a human reviews it.\n3. Must cite a policy section number for any coverage decision explanation.\n4. Must not use the word \"guaranteed\" about any pending claim.",
    ],
    options: [
      {
        key: "A",
        label: "\"I can see your card ending in 4471 on file — I can't share the rest of the number, but that's the one we'll refund to. (Policy §4.2)\"",
      },
      { key: "B", label: "\"Your claim is still with a reviewer; once they've looked at it you'll get a decision. (Policy §2.1)\"" },
      {
        key: "C",
        label: "\"Based on similar claims, this is essentially guaranteed to be approved once it's reviewed. (Policy §2.1)\"",
      },
      { key: "D", label: "\"That expense category is covered under our standard plan. (Policy §3.4)\"" },
      { key: "E", label: "\"I don't have enough information to say how this will be decided — a reviewer will follow up.\"" },
    ],
    correctKey: "C",
  },
  {
    kind: "multi-select",
    id: "PR-F4",
    construct: "PR",
    title: "Divergent attack, disciplined",
    points: 2,
    stem: "An office uses keycards on all exterior doors; the lobby door also has a receptionist during business hours. Select every method below that would actually get someone into a restricted area they're not authorized for.",
    penaltyNote: "Wrong selections subtract from your score.",
    options: [
      { key: "A", label: "Tailgate closely behind an employee through a keycard door before it closes", correct: true },
      { key: "B", label: "Ask the receptionist for a temporary visitor badge using a fake meeting name", correct: true },
      { key: "C", label: "Ask a coworker who already has legitimate access to lend you their card for the day", correct: false },
      { key: "D", label: "Knock on the window until someone lets you in", correct: false },
      { key: "E", label: "Use a cloned keycard copied from one found discarded in the parking lot", correct: true },
      { key: "F", label: "Email the IT helpdesk asking them to reset your badge PIN", correct: false },
      { key: "G", label: "Call the front desk claiming to be a vendor and ask them to unlock the door remotely", correct: false },
      { key: "H", label: "Walk in confidently wearing a delivery uniform while carrying a package", correct: true },
    ],
  },
  {
    kind: "single-choice",
    id: "PR-F5",
    construct: "PR",
    title: "Anomaly across two views",
    points: 2,
    stem: "The same sales figures are shown as a table and as a bar chart. Which region's chart value disagrees with its table value?",
    stimulusSpec: PR_F5_TWOVIEW,
    options: [
      { key: "A", label: "North" },
      { key: "B", label: "South" },
      { key: "C", label: "East" },
      { key: "D", label: "West" },
    ],
    correctKey: "C",
  },
  {
    kind: "single-choice",
    id: "PR-F6",
    construct: "PR",
    title: "Rule induction then violation",
    points: 2,
    stem: "Work out the rule that decided these six outcomes, then find the one new case whose outcome breaks that rule.",
    scenario: [
      "Six purchase requests and their outcomes:",
      "$150 office chair — Approved\n$75 team lunch — Approved\n$900 laptop — Rejected\n$40 book — Approved\n$600 conference ticket — Rejected\n$199 software license — Approved",
    ],
    options: [
      { key: "A", label: "$85 desk lamp — Approved" },
      { key: "B", label: "$520 monitor — Approved" },
      { key: "C", label: "$700 chair set — Rejected" },
      { key: "D", label: "$300 headset — Approved" },
    ],
    correctKey: "B",
  },
  {
    kind: "single-choice",
    id: "PR-F7",
    construct: "PR",
    title: "Adversarial framing",
    points: 2,
    stem: "Which approach gets the written admission while defeating the safeguard?",
    scenario: [
      "Goal: get a written admission that a shipping delay was the company's fault, for a warranty claim.",
      "Safeguard: support agents are trained never to write an admission of fault — only to apologize for \"the inconvenience\" without assigning blame.",
    ],
    options: [
      { key: "A", label: "Directly ask the agent to write \"we admit this was our fault.\"" },
      {
        key: "B",
        label:
          "Ask the agent to summarize what happened in writing for your records, then ask them to confirm the summary is accurate — if their own summary states the company caused the delay, that confirmation is a written admission without ever asking for one directly.",
      },
      { key: "C", label: "Threaten a bad review unless they apologize in writing." },
      { key: "D", label: "Ask for a refund instead of an apology." },
    ],
    correctKey: "B",
  },
  {
    kind: "multi-select",
    id: "PR-F8",
    construct: "PR",
    title: "Divergent attack, disciplined",
    points: 2,
    stem: "A ride-share app gives a $10 credit for every 5 completed rides on a referral code, tracked automatically — no manual stamping. Select every method below that would actually get someone credit they didn't earn.",
    penaltyNote: "Wrong selections subtract from your score.",
    scoreThresholds: { twoPt: 4, onePt: 2 },
    options: [
      {
        key: "A",
        label: "Create multiple throwaway accounts and have each one \"refer\" your main account, since the app never verifies a referral is a real new rider",
        correct: true,
      },
      {
        key: "B",
        label:
          "Use a script to request and immediately cancel rides right after the driver starts them, exploiting a known bug where those still count as completed",
        correct: true,
      },
      { key: "C", label: "Pay a friend a few dollars to complete 5 short, cheap rides on your code, then split the credit", correct: true },
      { key: "D", label: "Buy a batch of already-used referral codes from an online reseller and re-enter them, since the app never checks for reuse", correct: true },
      { key: "E", label: "Exploit a known bug where entering the same referral code twice in one session doubles the ride count", correct: true },
      { key: "F", label: "Ask the driver to manually mark extra rides as completed in their app", correct: false },
      { key: "G", label: "Complete 5 rides, then immediately request a refund on all of them", correct: false },
      { key: "H", label: "Leave a 5-star rating on your own completed genuine ride", correct: false },
      { key: "I", label: "Contact support and ask them to add $10 to your account \"as a courtesy\"", correct: false },
    ],
  },
  {
    kind: "single-choice",
    id: "PR-F9",
    construct: "PR",
    title: "Low-frequency anomaly",
    points: 2,
    stem: "Every tile below is the same symbol, rotated the same way — except one, somewhere in this larger field. Which region is it in?",
    stimulusSpec: PR_F9_ANOMALY,
    options: [
      { key: "A", label: "Upper-left region" },
      { key: "B", label: "Upper-right region" },
      { key: "C", label: "Lower-left region" },
      { key: "D", label: "Lower-right region" },
    ],
    correctKey: "B",
  },
  {
    kind: "single-choice",
    id: "PR-F10",
    construct: "PR",
    title: "Second-order violation",
    points: 2,
    stem: "Does this output violate the purpose of the rules, even though it follows each one individually?",
    scenario: [
      "Rules for a support assistant:",
      "1. Must not state a specific dollar refund amount without supervisor approval.\n2. Must not guarantee an outcome for a case still under review.\n3. Must maintain a professional, calm tone.",
      "Stated purpose of these rules: to make sure customers never walk away with an unrealistic expectation about money before a human has actually reviewed the case.",
      "Logged output: \"I can't promise a number and this case is still under review, so nothing here is confirmed — but cases like yours almost always get approved for a full refund within a week, so I really wouldn't worry.\"",
    ],
    options: [
      { key: "A", label: "No — it never states a number or makes an explicit promise, so it's fine." },
      {
        key: "B",
        label:
          "Yes — it avoids every literal trigger but still leaves the customer expecting a guaranteed refund, which is exactly what the rules exist to prevent.",
      },
      { key: "C", label: "No — rule 3 is the only one that matters here, and the tone is professional." },
      { key: "D", label: "Yes — because it mentions a refund at all, which rule 1 forbids outright." },
    ],
    correctKey: "B",
  },
];

// ---------------------------------------------------------------------
// SA — Section A2 (10 items, 20 pts)
// ---------------------------------------------------------------------

const SA_F1_MATRIX: StimulusSpec = {
  kind: "matrix",
  data: {
    grid: [
      [
        { kind: "dots", count: 1, filled: false },
        { kind: "dots", count: 2, filled: false },
        { kind: "dots", count: 3, filled: false },
      ],
      [
        { kind: "dots", count: 1, filled: false },
        { kind: "dots", count: 2, filled: false },
        { kind: "dots", count: 3, filled: false },
      ],
      [{ kind: "dots", count: 1, filled: false }, { kind: "dots", count: 2, filled: false }, "question"],
    ],
  },
};

const SA_F2_DEPENDENCY: StimulusSpec = {
  kind: "dependency",
  data: {
    nodes: [
      { id: "A", x: 60, y: 150 },
      { id: "B", x: 190, y: 150 },
      { id: "C", x: 320, y: 80 },
      { id: "D", x: 320, y: 220 },
      { id: "E", x: 450, y: 220 },
    ],
    edges: [
      ["A", "B"],
      ["B", "C"],
      ["B", "D"],
      ["D", "E"],
    ],
  },
};

const SA_F3_MATRIX: StimulusSpec = {
  kind: "matrix",
  data: {
    grid: [
      [
        { kind: "dots", count: 1, filled: false },
        { kind: "dots", count: 1, filled: true },
        { kind: "dots", count: 1, filled: false },
      ],
      [
        { kind: "dots", count: 2, filled: false },
        { kind: "dots", count: 2, filled: true },
        { kind: "dots", count: 2, filled: false },
      ],
      [{ kind: "dots", count: 3, filled: false }, { kind: "dots", count: 3, filled: true }, "question"],
    ],
  },
};

const SA_F4_STATE: StimulusSpec = {
  kind: "state",
  data: {
    rules: [
      "The system cycles IDLE → LOADING → READY → ERROR → IDLE …",
      "Advance moves it one step forward. Reset returns it to IDLE from any state.",
    ],
    sequence: ["Advance", "Advance", "Advance", "Reset", "Advance", "Advance", "Reset", "Advance"],
  },
};

const SA_F5_FLOW: StimulusSpec = {
  kind: "flow",
  data: {
    width: 640,
    height: 300,
    boxes: [
      { id: "d1", label: "Is disk space below 10%?", x: 140, y: 20, w: 220, h: 60 },
      { id: "d2", label: "Is CPU above 90%?", x: 140, y: 150, w: 220, h: 60 },
      { id: "alert", label: "Send alert", x: 440, y: 85, w: 160, h: 56 },
      { id: "continue", label: "Continue deployment", x: 140, y: 250, w: 220, h: 40 },
    ],
    edges: [
      { from: "d1", to: "alert", direction: "horizontal", label: "YES" },
      { from: "d1", to: "d2", direction: "vertical", label: "NO" },
      { from: "d2", to: "alert", direction: "horizontal", label: "YES" },
      { from: "d2", to: "continue", direction: "vertical", label: "NO" },
    ],
  },
};

const SA_F7_DEPENDENCY: StimulusSpec = {
  kind: "dependency",
  data: {
    nodes: [
      { id: "A", x: 100, y: 80 },
      { id: "B", x: 240, y: 80 },
      { id: "C", x: 170, y: 200 },
      { id: "D", x: 370, y: 200 },
      { id: "E", x: 500, y: 120 },
      { id: "F", x: 500, y: 280 },
    ],
    edges: [
      ["A", "B"],
      ["B", "C"],
      ["C", "A"],
      ["C", "D"],
      ["D", "E"],
      ["D", "F"],
    ],
  },
};

const SA_F8_MATRIX: StimulusSpec = {
  kind: "matrix",
  data: {
    grid: [
      [
        { kind: "arrow", count: 1, filled: false, rotation: 0 },
        { kind: "arrow", count: 2, filled: false, rotation: 0 },
        { kind: "arrow", count: 3, filled: false, rotation: 0 },
      ],
      [
        { kind: "arrow", count: 1, filled: true, rotation: 90 },
        { kind: "arrow", count: 2, filled: true, rotation: 90 },
        { kind: "arrow", count: 3, filled: true, rotation: 90 },
      ],
      [{ kind: "arrow", count: 1, filled: false, rotation: 180 }, { kind: "arrow", count: 2, filled: false, rotation: 180 }, "question"],
    ],
  },
};

function flowOption(decisionLabel: string, yesLabel: string, noLabel: string): FlowStimulusData {
  return {
    width: 430,
    height: 170,
    boxes: [
      { id: "d1", label: decisionLabel, x: 10, y: 10, w: 260, h: 56 },
      { id: "yes", label: yesLabel, x: 10, y: 105, w: 200, h: 50 },
      { id: "no", label: noLabel, x: 300, y: 10, w: 120, h: 56 },
    ],
    edges: [
      { from: "d1", to: "yes", direction: "vertical", label: "YES" },
      { from: "d1", to: "no", direction: "horizontal", label: "NO" },
    ],
  };
}

const SA_F10_STATE: StimulusSpec = {
  kind: "state",
  data: {
    rules: [
      "The lock cycles between LOCKED and UNLOCKED. Turn flips it to the other state.",
      "Exception: if the immediately previous operation was Jam, the next Turn does nothing instead of flipping.",
    ],
    sequence: ["Turn", "Turn", "Jam", "Turn", "Turn", "Turn"],
  },
};

export const SA_BATTERY_ITEMS: PerformanceItem[] = [
  {
    kind: "single-choice",
    id: "SA-F1",
    construct: "SA",
    title: "Matrix, one rule",
    points: 2,
    stem: "Which completes the matrix?",
    stimulusSpec: SA_F1_MATRIX,
    optionRender: "dots",
    options: [
      { key: "A", label: "○○" },
      { key: "B", label: "○○○" },
      { key: "C", label: "○○○○" },
      { key: "D", label: "●" },
    ],
    correctKey: "B",
  },
  {
    kind: "single-choice",
    id: "SA-F2",
    construct: "SA",
    title: "Dependency ordering",
    points: 2,
    stem: "Five steps in a build. The arrows mean “must happen before.” Which order is valid?",
    stimulusSpec: SA_F2_DEPENDENCY,
    options: [
      { key: "A", label: "A, B, C, D, E" },
      { key: "B", label: "B, A, C, D, E" },
      { key: "C", label: "A, B, E, D, C" },
      { key: "D", label: "No valid order exists" },
    ],
    correctKey: "A",
  },
  {
    kind: "single-choice",
    id: "SA-F3",
    construct: "SA",
    title: "Matrix, two rules",
    points: 2,
    stem: "Which completes the matrix?",
    stimulusSpec: SA_F3_MATRIX,
    optionRender: "dots",
    options: [
      { key: "A", label: "●●●" },
      { key: "B", label: "○○" },
      { key: "C", label: "○○○" },
      { key: "D", label: "●●" },
    ],
    correctKey: "C",
  },
  {
    kind: "single-choice",
    id: "SA-F4",
    construct: "SA",
    title: "State tracking",
    points: 2,
    stem: "Starting at IDLE, the sequence runs left to right below. What state is the system in?",
    stimulusSpec: SA_F4_STATE,
    options: [
      { key: "A", label: "IDLE" },
      { key: "B", label: "LOADING" },
      { key: "C", label: "READY" },
      { key: "D", label: "ERROR" },
    ],
    correctKey: "B",
  },
  {
    kind: "single-choice",
    id: "SA-F5",
    construct: "SA",
    title: "Representation mapping",
    points: 2,
    stem: "A deployment script follows written rules. Here is what it did. Which written rule set produces exactly this behaviour?",
    stimulusSpec: SA_F5_FLOW,
    options: [
      { key: "A", label: "Send an alert if disk space is below 10% or CPU is above 90%. Otherwise continue deployment." },
      { key: "B", label: "Send an alert if disk space is below 10% and CPU is above 90%. Otherwise continue deployment." },
      { key: "C", label: "Continue deployment unless an alert has already been sent." },
      { key: "D", label: "No valid order exists" },
    ],
    correctKey: "A",
  },
  {
    kind: "single-choice",
    id: "SA-F6",
    construct: "SA",
    title: "Balance / equivalence",
    points: 2,
    stem: "Using the equivalences below, how many triangles balance the amount shown?",
    stimulusSpec: {
      kind: "balance",
      data: {
        equivalences: [
          { left: { glyph: "circle", count: 2 }, right: { glyph: "square", count: 1 } },
          { left: { glyph: "square", count: 1 }, right: { glyph: "triangle", count: 3 } },
        ],
        question: { glyph: "circle", count: 4, targetGlyph: "triangle" },
      },
    },
    options: [
      { key: "A", label: "4" },
      { key: "B", label: "6" },
      { key: "C", label: "8" },
      { key: "D", label: "12" },
    ],
    correctKey: "B",
  },
  {
    kind: "single-choice",
    id: "SA-F7",
    construct: "SA",
    title: "Dependency with cycle",
    points: 2,
    stem: "Six steps. The arrows mean “must happen before.” Which order is valid?",
    stimulusSpec: SA_F7_DEPENDENCY,
    options: [
      { key: "A", label: "A, B, C, D, E, F" },
      { key: "B", label: "D, A, B, C, E, F" },
      { key: "C", label: "D, E, F, A, B, C" },
      { key: "D", label: "No valid order exists" },
    ],
    correctKey: "D",
  },
  {
    kind: "single-choice",
    id: "SA-F8",
    construct: "SA",
    title: "Matrix, three rules",
    points: 2,
    stem: "Which completes the matrix? Count, fill, and rotation all follow rules here.",
    stimulusSpec: SA_F8_MATRIX,
    optionRender: "arrows",
    options: [
      { key: "A", label: "3 filled arrows, rotated 180°", arrows: { count: 3, filled: true, rotation: 180 } },
      { key: "B", label: "3 open arrows, rotated 180°", arrows: { count: 3, filled: false, rotation: 180 } },
      { key: "C", label: "3 open arrows, rotated 90°", arrows: { count: 3, filled: false, rotation: 90 } },
      { key: "D", label: "2 open arrows, rotated 180°", arrows: { count: 2, filled: false, rotation: 180 } },
    ],
    correctKey: "B",
  },
  {
    kind: "single-choice",
    id: "SA-F9",
    construct: "SA",
    title: "Representation mapping, reverse",
    points: 2,
    stem: "A rule reads: “Retry the upload if the connection drops or the file is over 1GB. Otherwise, mark it complete.” Which diagram matches this rule exactly?",
    optionRender: "flow",
    options: [
      {
        key: "A",
        label: "Connection dropped or file over 1GB → retry; otherwise mark complete",
        flow: flowOption("Connection dropped OR file > 1GB?", "Retry upload", "Mark complete"),
      },
      {
        key: "B",
        label: "Connection dropped and file over 1GB → retry; otherwise mark complete",
        flow: flowOption("Connection dropped AND file > 1GB?", "Retry upload", "Mark complete"),
      },
      {
        key: "C",
        label: "Connection dropped or file over 1GB → mark complete; otherwise retry",
        flow: flowOption("Connection dropped OR file > 1GB?", "Mark complete", "Retry upload"),
      },
      {
        key: "D",
        label: "File over 1GB → retry; otherwise mark complete",
        flow: flowOption("File > 1GB?", "Retry upload", "Mark complete"),
      },
    ],
    correctKey: "A",
  },
  {
    kind: "single-choice",
    id: "SA-F10",
    construct: "SA",
    title: "Nested state with memory",
    points: 2,
    stem: "Starting LOCKED, the sequence runs left to right below. What state is the lock in?",
    stimulusSpec: SA_F10_STATE,
    options: [
      { key: "A", label: "LOCKED" },
      { key: "B", label: "UNLOCKED" },
      { key: "C", label: "Cannot be determined" },
      { key: "D", label: "No valid order exists" },
    ],
    correctKey: "A",
  },
];

// ---------------------------------------------------------------------
// RL — Section B (10 items, 20 pts)
// ---------------------------------------------------------------------

const RL_F1_WASON: StimulusSpec = {
  kind: "wason",
  data: {
    cards: [
      { index: 1, text: "OVER $500" },
      { index: 2, text: "UNDER $500" },
      { index: 3, text: "MANAGER'S SIGNATURE" },
      { index: 4, text: "NO SIGNATURE" },
    ],
  },
};

const RL_F2_RECORD: StimulusSpec = {
  kind: "record",
  data: {
    recordA: "INV-2024-0917 / ACCT-55219 / NET 30 / TAX EX / BATCH 14",
    recordB: "INV-2024-0917 / ACCT-55219 / NET 30 / TAX EX / BATCH l4",
  },
};

const RL_F5_RECORD: StimulusSpec = {
  kind: "record",
  data: {
    recordA: "PO-88213 / SUP-004 / QTY 620 / UNIT $4.10 / DUE 2025-02-14 / REV 3",
    recordB: "PO-88231 / SUP-004 / QTY 620 / UNIT $4.16 / DUE 2025-02-14 / REV 4",
  },
};

export const RL_BATTERY_ITEMS: PerformanceItem[] = [
  {
    kind: "single-choice",
    id: "RL-F1",
    construct: "RL",
    title: "Conditional verification",
    points: 2,
    stem: "You can see one fact about each of four claims. You may turn over only the cards you need to check whether the rule has been broken. Which cards must you check?",
    scenario: ["A finance rule states: “If an expense claim is over $500, it must have a manager's signature.”"],
    stimulusSpec: RL_F1_WASON,
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
    id: "RL-F2",
    construct: "RL",
    title: "Precision under near-identity",
    points: 2,
    stem: "Two records should be identical. How many differences are there?",
    stimulusSpec: RL_F2_RECORD,
    options: [
      { key: "A", label: "None" },
      { key: "B", label: "One" },
      { key: "C", label: "Two" },
      { key: "D", label: "Three" },
    ],
    correctKey: "B",
  },
  {
    kind: "single-choice",
    id: "RL-F3",
    construct: "RL",
    title: "Rule precedence",
    points: 2,
    stem: "An order is under $20, marked expedited, and flagged for fraud review. What happens to it?",
    scenario: [
      "Three rules govern order fulfilment, in this order of authority:",
      "1. Rule 1 (highest): Orders flagged for fraud review are held, regardless of any other status.\n2. Rule 2: Orders marked \"expedited\" ship within 24 hours.\n3. Rule 3 (lowest): Orders under $20 ship via standard post.",
    ],
    options: [
      { key: "A", label: "Ships within 24 hours — it's expedited" },
      { key: "B", label: "Held for fraud review — highest precedence rule applies" },
      { key: "C", label: "Ships via standard post — it's under $20" },
      { key: "D", label: "The rules conflict; escalate to a supervisor" },
    ],
    correctKey: "B",
  },
  {
    kind: "single-choice",
    id: "RL-F4",
    construct: "RL",
    title: "Edge-case classification",
    points: 2,
    stem: "“Refund issued to J. Alvarez for the order ending in card ****4471.” Which category?",
    scenario: [
      "A support log uses exactly three categories, applied in this order:",
      "Restricted — contains a customer's full payment card number\nInternal — contains no full payment card number but names a customer\nPublic — everything else",
    ],
    options: [
      { key: "A", label: "Restricted" },
      { key: "B", label: "Internal" },
      { key: "C", label: "Public" },
      { key: "D", label: "Restricted, because it includes part of a card number" },
    ],
    correctKey: "B",
  },
  {
    kind: "single-choice",
    id: "RL-F5",
    construct: "RL",
    title: "Precision, multiple differences",
    points: 2,
    stem: "Two records should be identical. How many differences are there?",
    stimulusSpec: RL_F5_RECORD,
    options: [
      { key: "A", label: "One" },
      { key: "B", label: "Two" },
      { key: "C", label: "Three" },
      { key: "D", label: "Four" },
    ],
    correctKey: "C",
  },
  {
    kind: "single-choice",
    id: "RL-F6",
    construct: "RL",
    title: "Exception handling",
    points: 2,
    stem: "An employee expenses a $12 glass of wine that appears as a line item on the itemized client-dinner receipt they already submitted. Does this need a separate receipt?",
    scenario: [
      "Rule: employees may expense meals up to $40 without receipts.",
      "Exception: this does not apply to alcohol, which always requires an itemized receipt regardless of amount.",
      "Exception to the exception: a single alcoholic drink under $15 that's part of a client dinner already itemized on the main receipt does not need a separate receipt.",
    ],
    options: [
      { key: "A", label: "Yes — alcohol always needs a separate receipt" },
      { key: "B", label: "No — it's under $40, so the base rule covers it" },
      { key: "C", label: "No — it falls under the exception to the exception: already itemized, under $15, part of a client dinner" },
      { key: "D", label: "Yes — the base rule doesn't cover alcohol at all" },
    ],
    correctKey: "C",
  },
  {
    kind: "single-choice",
    id: "RL-F7",
    construct: "RL",
    title: "Scope reading",
    points: 2,
    stem: "A support agent manually edits the order-confirmation template and personally sends the result as a follow-up email. Does the policy apply to this email?",
    scenario: [
      "Policy: this policy applies to all customer-facing written communications sent by the support team.",
      "Scope clause: it does not apply to any message generated from the order-confirmation template, regardless of who ultimately sends it.",
    ],
    options: [
      { key: "A", label: "Yes — a human agent wrote and sent it personally" },
      { key: "B", label: "No — the scope clause excludes anything generated from that template, regardless of who sends it" },
      { key: "C", label: "Yes — it was addressed to a specific customer" },
      { key: "D", label: "It depends on whether the agent added new text" },
    ],
    correctKey: "B",
  },
  {
    kind: "single-choice",
    id: "RL-F8",
    construct: "RL",
    title: "Precedence with conflict",
    points: 2,
    stem: "A customer returns an unused, final-sale clearance item 10 days after purchase, with no receipt, costing $80. What happens?",
    scenario: [
      "Return rules:",
      "Tier 1 (highest, tied): A return is approved if the item is unused and within 30 days of purchase.\nTier 1 (highest, tied): A return is denied if the item is a final-sale clearance item.\nTier 2: Returns over $500 require manager sign-off.\nTier 3 (lowest): Store credit is offered instead of a refund for returns without a receipt.",
    ],
    options: [
      { key: "A", label: "Approved — it's unused and within 30 days" },
      { key: "B", label: "Denied — it's a final-sale item" },
      { key: "C", label: "The rules conflict at the same level of authority; escalate to a supervisor" },
      { key: "D", label: "Store credit only, since there's no receipt" },
    ],
    correctKey: "C",
  },
  {
    kind: "single-choice",
    id: "RL-F9",
    construct: "RL",
    title: "Classification cascade",
    points: 2,
    stem: "“Q3 revenue guidance will be finalized next week; please don't forward this note from Priya until then.” Which category?",
    scenario: [
      "A document system uses exactly four categories, tested against the document in this order:",
      "1. Legal Hold — contains any reference to active litigation\n2. Confidential — contains unreleased financial figures or guidance\n3. Internal — mentions an employee by name\n4. Public — everything else",
    ],
    options: [
      { key: "A", label: "Legal Hold" },
      { key: "B", label: "Confidential" },
      { key: "C", label: "Internal" },
      { key: "D", label: "Public" },
    ],
    correctKey: "B",
  },
  {
    kind: "single-choice",
    id: "RL-F10",
    construct: "RL",
    title: "Literal vs. intended reading",
    points: 2,
    stem: "Does this output comply with the rules as written?",
    scenario: [
      "Rules for a support assistant:",
      "1. Must not state a specific dollar refund amount without supervisor approval.\n2. Must not guarantee an outcome for a case still under review.\n3. Must maintain a professional, calm tone.",
      "Logged output: \"I can't promise a number and this case is still under review, so nothing here is confirmed — but cases like yours almost always get approved for a full refund within a week, so I really wouldn't worry.\"",
    ],
    options: [
      { key: "A", label: "Yes — none of the three rules are literally broken: it hedges on the amount, avoids a guarantee, and stays professional" },
      { key: "B", label: "No — it effectively promises a full refund, which breaks rule 2" },
      { key: "C", label: "No — mentioning a refund category at all breaks rule 1" },
      { key: "D", label: "Can't be determined from the rules given" },
    ],
    correctKey: "A",
  },
];

// ---------------------------------------------------------------------
// Tolerance banks — Section C (18 items, verbatim from corpus §4.6)
// ---------------------------------------------------------------------

export const TOL_BATTERY_ITEMS: LikertItem[] = [
  { kind: "likert", id: "T-REP-F1", group: "REP", key: "positive", stem: "I can run the same procedure many times over with only small variations and still stay engaged with it." },
  { kind: "likert", id: "T-REP-F2", group: "REP", key: "reverse", stem: "Spending my working days looking for what's broken, rather than building something, would wear me down over time." },
  { kind: "likert", id: "T-REP-F3", group: "REP", key: "positive", stem: "Finding the ninety-ninth version of a problem I've already seen ninety-eight times would still feel worth doing." },
  { kind: "likert", id: "T-REP-F4", group: "REP", key: "reverse", stem: "I need to see something finished and working to feel that my work mattered." },
  { kind: "likert", id: "T-REP-F5", group: "REP", key: "positive", stem: "I'm comfortable being the person who says what's wrong with something other people are proud of." },
  { kind: "likert", id: "T-REP-F6", group: "REP", key: "reverse", stem: "Being permanently critical of things would change my mood outside of work." },

  { kind: "likert", id: "T-RIG-F1", group: "RIG", key: "positive", stem: "Clear, strict rules make me feel freer, not more constrained." },
  { kind: "likert", id: "T-RIG-F2", group: "RIG", key: "reverse", stem: "Having to document and justify every decision I make would frustrate me." },
  { kind: "likert", id: "T-RIG-F3", group: "RIG", key: "positive", stem: "I'd rather be given an exact specification than be told to use my judgement." },
  { kind: "likert", id: "T-RIG-F4", group: "RIG", key: "reverse", stem: "I often see a faster way to do something than the official procedure allows, and it's hard not to take it." },
  { kind: "likert", id: "T-RIG-F5", group: "RIG", key: "positive", stem: "Knowing there is zero margin for error would sharpen my attention rather than raise my anxiety." },
  { kind: "likert", id: "T-RIG-F6", group: "RIG", key: "reverse", stem: "Bureaucratic process, even when it's necessary, drains me." },

  { kind: "likert", id: "T-ISO-F1", group: "ISO", key: "positive", stem: "My best work happens after several hours with no interruptions and no conversation." },
  { kind: "likert", id: "T-ISO-F2", group: "ISO", key: "reverse", stem: "I need regular contact with other people during the day to stay motivated." },
  { kind: "likert", id: "T-ISO-F3", group: "ISO", key: "positive", stem: "I'd choose a week alone on one hard problem over a week of varied work with a team." },
  { kind: "likert", id: "T-ISO-F4", group: "ISO", key: "reverse", stem: "Working alone for long stretches would start to affect me after a while." },
  { kind: "likert", id: "T-ISO-F5", group: "ISO", key: "positive", stem: "I'm comfortable working on something for months before anyone else sees a result." },
  { kind: "likert", id: "T-ISO-F6", group: "ISO", key: "reverse", stem: "I want to be able to ask someone a quick question when I get stuck." },
];

// ---------------------------------------------------------------------
// Modifier bank — Section D (8 items, verbatim from corpus §4.7)
// ---------------------------------------------------------------------

export const MOD_BATTERY_ITEMS: LikertItem[] = [
  { kind: "likert", id: "M-D1", group: "MOD-DEPTH", key: "positive", stem: "When a problem genuinely interests me, I lose track of time — hours can pass without my noticing." },
  { kind: "likert", id: "M-D2", group: "MOD-DEPTH", key: "positive", stem: "I'd rather know one thing thoroughly than five things adequately." },
  { kind: "likert", id: "M-D3", group: "MOD-DEPTH", key: "reverse", stem: "I usually have several different things on the go and move between them through the day." },
  { kind: "likert", id: "M-D4", group: "MOD-DEPTH", key: "positive", stem: "When I'm properly absorbed in something, I sometimes forget to eat." },

  { kind: "likert", id: "M-S1", group: "MOD-SWITCH", key: "positive", stem: "When I'm interrupted mid-task, getting back to where I was costs me far more than the interruption itself took." },
  { kind: "likert", id: "M-S2", group: "MOD-SWITCH", key: "positive", stem: "Being asked to do a bit of everything, all day, is harder for me than doing one difficult thing." },
  { kind: "likert", id: "M-S3", group: "MOD-SWITCH", key: "reverse", stem: "I can drop what I'm doing, handle something else, and pick straight back up." },
  { kind: "likert", id: "M-S4", group: "MOD-SWITCH", key: "positive", stem: "Open-plan offices, meetings, and constant small requests cost me more than they seem to cost other people." },
];

export const ALL_PERFORMANCE_BATTERY_ITEMS = [...PR_BATTERY_ITEMS, ...SA_BATTERY_ITEMS, ...RL_BATTERY_ITEMS];
export const ALL_LIKERT_BATTERY_ITEMS = [...TOL_BATTERY_ITEMS, ...MOD_BATTERY_ITEMS];
