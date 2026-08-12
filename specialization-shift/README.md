# The Specialization Shift — 20-Item Screener

A single-page assessment app built from `specialization-shift-assessment-corpus.md`
(content/logic, source of truth) and the accompanying art direction brief v1.1
(presentation, source of truth). This implements **Instrument A only** — the
20-item screener (corpus Part 3). Instrument B, the 56-item full battery, is
specification-only in the corpus (30 of its performance stems were never
written) and is intentionally not implemented here.

## Running it

```
npm install
npm run dev      # dev server
npm run build    # type-check + production build
```

## What's implemented

- All 20 screener items (4 PR, 4 RL, 4 SA performance items; 6 tolerance
  Likert items; 2 depth-signature Likert items), verbatim from corpus Part 3.
- SVG stimuli for the matrix, anomaly-grid, sequence, dependency-graph, and
  flow-diagram item types, each with a non-revealing text alternative.
  Wason-selection cards and the monospace record-comparison item use styled
  text/HTML rather than SVG, since the brief's per-item-type SVG rules (§6)
  don't enumerate those two types.
- Scoring (`src/lib/scoring.ts`): spike index/bands, ipsative shape
  (dominant/secondary/margin), tolerance sub-scale scoring with reverse-key
  handling, PR-4's floor-at-zero penalty scoring, the 9-cell fit matrix with
  H/I routing back to the dominant track, and the 4-branch depth signature.
- The full report (depth signature → shape → leading/second/third track with
  fit cells → reverse side → next steps → methodology), per corpus §6.1.
- Light/dark palettes per brief §3, held to the same contrast floors; no
  browser storage — all state is in-memory React state.

## A correction against the task brief, not the corpus

The build task described "4 of the 6 screener self-report items" as
reverse-keyed. The corpus (the substance source of truth, Part 3 §TOL) is
explicit that each tolerance sub-scale has **one** positively-keyed and **one**
reverse-keyed item — T-REP-2, T-RIG-2, and T-ISO-2 are reverse-keyed, i.e.
**3 of 6**, with both depth-signature items positively keyed. `scoreLikert()`
implements the corpus's 3-item reverse-key set; worth flagging in case the "4"
figure was meant to change something rather than just describe it.

## A property of the corpus's own scoring granularity

Each performance section is 4 items × 2 points, so a track's Spike Index can
only land on 0/25/50/75/100%. Margin between any two tracks is therefore
always either 0 or a multiple of 25 — the "Leaning" shape band (margin 6–14,
corpus §2.2) is mathematically unreachable with this item count. "Spiked" and
"Level" are reachable; "Leaning" isn't. This wasn't patched, since doing so
would mean deviating from the corpus's explicit point values.
