import type { Construct } from "../lib/types";
import type { FitCellLetter } from "../lib/scoring";

export const OPENING_COPY = [
  "This is not an IQ test. It produces no clinical score and compares you to no one.",
  "It looks at the shape of how you think — where your attention naturally goes and what kind of work you can sustain — and maps that against three specialised roles that the AI industry is currently short of people for.",
  "There is no failing result. Every profile has a peak somewhere.",
  "Take as long as you want on any question. Nothing here is timed.",
];

export const SECTION_INTRO_COPY: Record<string, { title: string; body: string }> = {
  PR: { title: "Pattern & Anomaly", body: "Four questions about spotting the thing that's off." },
  RL: { title: "Rule & Logic", body: "Four questions about applying a rule exactly as written." },
  SA: { title: "Systems & Abstraction", body: "Four questions about holding a structure together in your head." },
  TOL: {
    title: "Condition Tolerance",
    body: "Six questions about conditions, not ability. There are no right answers here — only accurate ones. Answer for how you actually are, not how you'd like to be.",
  },
  MOD: {
    title: "Depth Signature",
    body: "Two questions about focus and switching.",
  },
};

// §6.3 — shape copy. {DOMINANT} / {SECONDARY} are track names.
export function shapeCopy(shapeType: "Spiked" | "Leaning" | "Level", dominant: string, secondary: string): string {
  switch (shapeType) {
    case "Spiked":
      return `Your profile has one clear peak: **${dominant}**. That's a useful thing to have. Spiky profiles get filtered out by generalist hiring, which is exactly the problem these three tracks exist on the other side of.`;
    case "Leaning":
      return `Your profile peaks at **${dominant}**, with **${secondary}** close behind. Two real options rather than one. The deciding factor for you is likely to be conditions rather than capability — read the cost sections for both carefully.`;
    case "Level":
      return `Your three scores sit close together. That means capability isn't what decides this for you — conditions are.\n\nThat's a more useful finding than it might look. The three tracks impose genuinely different working conditions: constant adversarial testing, rigid documented process, or long isolated depth. Those are very different lives. Your tolerance results below are the ones to read closely — for a profile like yours, they carry more information than the reasoning scores do.`;
  }
}

// §6.2 — fit-cell copy, {TRACK} and {COST} substituted from track content. {DOMINANT_TRACK} for H/I.
const FIT_CELL_TEMPLATES: Record<FitCellLetter, { name: string; body: string }> = {
  A: {
    name: "Direct fit",
    body: "This is the clearest match in your profile. The thinking the work needs is the thinking you already do, and the conditions it imposes — {COST} — are conditions you've said you can live inside. That combination is less common than it sounds. Most people have one or the other.",
  },
  B: {
    name: "Fit with conditions",
    body: "The capability is clearly there. The conditions are survivable rather than comfortable — {COST}. That's worth knowing before you commit rather than after. It doesn't rule the track out; it means the environment you do it in will matter more for you than it would for someone who finds those conditions easy.",
  },
  C: {
    name: "Capability without conditions",
    body: "This is the most useful thing this assessment found, so it's worth reading carefully.\n\nYou have the thinking this track runs on. That part is not in question.\n\nWhat you don't have is an easy relationship with the conditions it comes with — {COST}. You told us that clearly, and it's worth taking seriously, because the mismatch between capability and conditions is what burns people out in roles they were otherwise built for.\n\nThis is not a deficiency, and it isn't fixed. Conditions are negotiable in a way that capability isn't — contract rather than staff, a lab that works asynchronously, part-time depth rather than full-time immersion. Go in knowing the cost is real for you and structure around it. That's a much better position than finding out in year two.",
  },
  D: {
    name: "Buildable fit",
    body: "The signal here is moderate rather than pronounced, but the conditions suit you — {COST} reads as something you could genuinely work inside. Capability of this kind responds to deliberate practice more reliably than tolerance does. If this track interests you, it's a reasonable one to test with a small real project before committing.",
  },
  E: {
    name: "Open question",
    body: "Moderate on both counts. This one is genuinely open — not a yes, not a no. If it interests you, the way to find out is a small piece of real work rather than another assessment.",
  },
  F: {
    name: "Costly on both sides",
    body: "The signal is moderate and the conditions — {COST} — read as expensive for you. Of the three, this is the one to leave for now. That's a statement about fit, not about you; the other two tracks in this report are better bets with the profile you have.",
  },
  G: {
    name: "Right conditions, unproven spike",
    body: "Interesting combination. The conditions this track imposes — {COST} — don't trouble you at all, which removes the obstacle that stops most people. The specific thinking style didn't show up strongly in this snapshot, but a short assessment measures a narrow slice on a single day. If this track is the one that actually interests you, that interest is worth more than these twenty questions. Test it directly.",
  },
  H: {
    name: "Not indicated here",
    body: "Nothing in this snapshot points here, and the conditions — {COST} — would be work for you. That's a clear enough signal to set this one aside and put your attention on {DOMINANT_TRACK} instead.",
  },
  I: {
    name: "Not indicated here",
    body: "Nothing in this snapshot points here, and the conditions — {COST} — would be work for you. That's a clear enough signal to set this one aside and put your attention on {DOMINANT_TRACK} instead.",
  },
};

export function fitCellCopy(letter: FitCellLetter, cost: string, dominantTrackName: string) {
  const template = FIT_CELL_TEMPLATES[letter];
  return {
    name: template.name,
    body: template.body.replaceAll("{COST}", cost).replaceAll("{DOMINANT_TRACK}", dominantTrackName),
  };
}

// §6.4 — the reverse side, generated from the person's dominant spike.
export const REVERSE_SIDE_COPY: Record<Construct, string> = {
  PR: "The thing that makes you good at this is that you see what's wrong before you see what's right. That's genuinely valuable and it's why Track 1 exists as a job.\n\nThe backside of it is that the same reflex doesn't switch off at the end of the day. People with a strong version of this trait often find they're the one pointing out the flaw in the plan, the holiday, the idea someone was excited about. It's the same skill. Worth knowing it has a cost outside the work, and worth deciding deliberately when to run it and when to leave it alone.",
  RL: "The thing that makes you good at this is that rules are real to you — you read what's written rather than what was probably meant, and you apply it consistently. In a compliance context that's not pedantry, it's the entire job.\n\nThe backside is that environments without clear rules are genuinely harder for you than they are for other people, and you may have been told you're inflexible by people who simply hadn't noticed they were making the rules up as they went. The trait isn't the problem. Unstructured environments are a bad fit for it, and there are a lot of them.",
  SA: "The thing that makes you good at this is that you can hold a whole structure in your head at once and see where it doesn't hold together. That's the rarest of the three and the hardest to teach.\n\nThe backside is that it needs uninterrupted time to work, and uninterrupted time is the thing modern offices are worst at providing. It's likely you've been told you're slow to respond or hard to reach when you were, in fact, doing the thing you're best at. Protecting that time isn't a preference. It's the operating requirement for the capability.",
};

// §6.5 — depth signature copy.
export type DepthSignature = "Deep-single-thread" | "Deep-flexible" | "Fragmented-costly" | "Broad-flexible";

export const DEPTH_SIGNATURE_COPY: Record<DepthSignature, string> = {
  "Deep-single-thread":
    "You go deep and you pay heavily to be pulled out. All three of these tracks are built for that. Most conventional office roles are built against it — which may explain some things.",
  "Deep-flexible":
    "You can go deep and you can also switch without much cost. That's an unusually good combination and it widens your options well beyond these three tracks.",
  "Fragmented-costly":
    "This is the hardest combination in the way work is currently designed: interruptions cost you a lot, but long single-thread absorption isn't where you naturally sit either.\n\nWhat tends to work for people with this pattern is neither the open-plan generalist role nor the months-long solo project, but protected medium-length blocks — a few hours of real quiet on one thing, with genuine variety between blocks. That's a structural need, not a preference, and it's worth being explicit about it when you're choosing where to work rather than hoping it resolves itself.",
  "Broad-flexible":
    "You move between things easily and interruptions don't cost you much. That's a real strength and it's the profile most workplaces are actually built for — which means your options are wider than this assessment's three tracks. Read the results below as three possibilities among many, rather than as the shortlist.",
};

// §6.6 — mandatory closing methodology copy.
export const METHODOLOGY_COPY = [
  "This was a short set of reasoning puzzles and some questions about the conditions you work well in. It isn't an IQ test, it produced no clinical score, and it compared you to no one — there's no normative sample behind it.",
  "Short reasoning measures are noisy. Even the full clinical versions of tasks like these have test–retest stability around .74, which means a person's score moves between sittings for reasons that have nothing to do with them. Treat the shape as more reliable than any single number, and treat the whole thing as a prompt for a decision rather than the decision itself.",
  "The part of this you should trust most is the tolerance section — because you answered it about yourself, and you're the authority on that.",
];
