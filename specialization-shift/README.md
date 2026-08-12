# The Specialization Shift

A single-page assessment app built from `specialization-shift-assessment-corpus.md`
(content/logic, source of truth) and the accompanying art direction brief v1.1
(presentation, source of truth). Implements both instruments:

- **Instrument A — the 20-item screener** (corpus Part 3), 10–12 minutes.
- **Instrument B — the full battery** (corpus Part 4), 35–45 minutes, 56 items.
  The corpus specified the battery's 56 items by type/difficulty/design
  constraint only — its 30 performance stems (PR-F1–10, SA-F1–10, RL-F1–10)
  were never written out (Part 8 §7: "Say the word and I'll write them out to
  the same standard as the screener"). They're authored in
  `src/data/batteryItems.ts`, following each item's design note precisely
  (e.g. PR-F10/RL-F10 share one scenario scored two ways; RL-F8 makes
  "escalate" correct where screener RL-2 made it wrong; SA-F7's "No valid
  order exists" also appears as a false option on two other SA items).

Both instruments share one design system, one scoring engine (parameterized
by instrument), and the same report structure.

## Running it

```
npm install
npm run dev      # dev server
npm run build    # type-check + production build
```

## What's implemented

- All 20 screener items and all 56 battery items (performance + tolerance +
  depth-signature), each construct-scored per corpus rules.
- SVG stimuli, generalized to take data props so both instruments reuse the
  same renderer: matrix (dots and rotation-sensitive arrow glyphs), anomaly
  grid (with/without coordinate labels), sequence groups, dependency graph
  (including cycles), state-machine chips, flow diagrams (including as
  answer-option thumbnails for SA-F9's reverse-mapping format), a two-view
  table/chart (PR-F5), and a balance/equivalence stimulus (SA-F6). Wason
  cards and the monospace record-comparison item use styled text/HTML rather
  than SVG, since the brief's per-item-type SVG rules (§6) don't enumerate
  those two types. Every stimulus has a non-revealing text alternative.
- Scoring (`src/lib/scoring.ts`): spike index/bands, ipsative shape, tolerance
  sub-scale scoring with reverse-key handling, multi-select penalty scoring
  floored at zero (thresholds scale with each item's valid-option count), the
  9-cell fit matrix with H/I routing to the dominant track, the 4-branch depth
  signature, the PR-F10/RL-F10 letter-vs-spirit discriminator, and the
  battery's optional-timer Pressure Note.
- The full report per corpus §6.1, extended for the battery with the Pressure
  Note and the letter-vs-spirit one-line observation.
- Light/dark palettes per brief §3, held to the same contrast floors; no
  browser storage — all state is in-memory React state.

## Judgment calls, documented rather than asked

**The timer's "Pressure Note" and normative data.** Corpus §4.2 frames the
optional-timer feature as comparing timed accuracy to an "untimed norm" — but
the corpus is explicit and repeated elsewhere that this instrument has no
normative sample. Fabricating a population baseline to make that comparison
would contradict that commitment directly. Instead, `computePressureNote()`
compares a person's timed Section A (PR+SA) accuracy against their own
untimed Section B (RL) accuracy from the same sitting — self-referential,
not population-referential.

**Full-battery depth-signature banding.** The screener's M-DEPTH/M-SWITCH
cutoff ("High at ≥3, i.e. Agree or Strongly agree") is for a single item.
The battery uses four items per modifier (raw 0–16) and the corpus doesn't
state a battery-specific cutoff. `computeBatteryScore()` generalizes the
screener's cutoff as "Agree, on average" — raw ≥ 12 (4 × 3) — rather than
inventing an unrelated threshold.

**A correction against the task brief, not the corpus.** The build task
described "4 of the 6 screener self-report items" as reverse-keyed. The
corpus (Part 3 §TOL) is explicit that each tolerance sub-scale has one
positively-keyed and one reverse-keyed item — 3 of 6, not 4 — and the full
battery's tolerance sub-scales are 3-and-3 per corpus §4.6. `scoreLikert()`
implements the corpus's reverse-key sets as written.

**A property of the screener's own scoring granularity.** Each screener
performance section is 4 items × 2 points, so a track's Spike Index can only
land on 0/25/50/75/100% — margins are always 0 or a multiple of 25, which
makes the "Leaning" shape band (margin 6–14) mathematically unreachable in
the screener specifically. The full battery (10 items × 2 points per
section, steps of 10%) doesn't have this problem. Not patched in the
screener, since doing so would mean deviating from the corpus's explicit
point values.
