import type { Construct } from "../lib/types";

export type TrackMeta = {
  construct: Construct;
  trackNumber: 1 | 2 | 3;
  trackName: string;
  constructLabel: string;
  whatTheWorkIs: string;
  cognitiveDemand: string;
  statedCost: string;
  /** Short lowercase clause for inline substitution into fit-cell copy — from corpus §2.3 sub-scale descriptions. */
  costClause: string;
};

export const TRACKS: Record<Construct, TrackMeta> = {
  PR: {
    construct: "PR",
    trackNumber: 1,
    trackName: "Frontier AI Safety and Red Teaming",
    constructLabel: "Pattern & Anomaly Detection",
    whatTheWorkIs:
      "Deliberately finding ways to break advanced AI models before they are deployed — testing autonomous agents for replication risks, evaluating whether a model can generate dangerous outputs.",
    cognitiveDemand:
      "Extreme hyperfocus, divergent problem solving, and a persistently critical, adversarial lens held for long periods — spotting flaws others overlook.",
    statedCost:
      "Lack of creative freedom. Requires high tolerance for repetitive testing, in an environment focused solely on risk and failure.",
    costClause: "repetition and a negative-valence field of work",
  },
  RL: {
    construct: "RL",
    trackNumber: 2,
    trackName: "Domain-Specific Models and Compliance",
    constructLabel: "Rule Adherence & Literal Logic",
    whatTheWorkIs:
      "Ensuring AI training data and outputs adhere strictly to complex legal, state, and federal mandates — operating as the rule enforcer for domain-specific models that trade breadth for accuracy inside one strictly defined field.",
    cognitiveDemand:
      "Meticulous attention to detail, comfort working inside rigid, bureaucratic frameworks, categorising information, following absolute rules.",
    statedCost: "Rigidity. Zero margin for error. Bureaucratic process is the medium, not an obstacle to it.",
    costClause: "rigidity, documentation, and zero-error margin",
  },
  SA: {
    construct: "SA",
    trackNumber: 3,
    trackName: "Neuro-Symbolic Integration and Agentic Architecture",
    constructLabel: "Systems Architecture & Abstract Reasoning",
    whatTheWorkIs:
      "Building hybrid systems that encase the unpredictable behaviour of neural networks inside strict, verifiable, symbolic logic rules — closing the attribution gap that autonomous agents open.",
    cognitiveDemand:
      "Systems architecture, abstract reasoning, prolonged deep work and mental stamina to bridge two engineering methods that don't naturally mix.",
    statedCost: "Isolation. Sustained depth over long periods, often without visible intermediate results.",
    costClause: "isolation and prolonged, uninterrupted depth",
  },
};

export const CROSS_TRACK_STRATEGY = [
  "Bypass traditional corporate HR filters, which are built to select generalists.",
  "Avoid unstructured social interviews — they measure masking, not capability.",
  "Build a portfolio of specialised evaluations instead.",
  "Participate in open bug bounties offered by frontier labs.",
  "The leverage comes from finding the exact technical bottleneck that matches your specific cognitive spike.",
];
