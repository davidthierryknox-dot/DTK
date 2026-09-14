# AI-Writing Sanity Check

Source: [Wikipedia:Signs of AI writing](https://en.wikipedia.org/wiki/Wikipedia:Signs_of_AI_writing).
Run this as a final pass on every CV and Cover Letter draft, after keyword coverage
hits 100% and before publishing to Google Docs — it's a style/credibility gate, not a
substitute for the keyword coverage check in `Tools/JDTool.ts`.

## What to scan for

**Overused vocabulary** — grep the draft (case-insensitive) for: `delve`, `showcase`,
`underscore`, `emphasize`, `garner`, `foster`, `boasts`, `enhance`, `curated`, `robust`,
`vibrant`, `intricate`, `enduring`, `crucial`, `meticulous`, `tapestry`, `interplay`,
`nestled`, `align with`, `valuable insights`, and `additionally` at a sentence start.
Any hit is a rewrite, not a judgment call — these are reliably AI-coded in reader
perception even when the underlying claim is true.

**Avoiding plain "is/are"** — watch for `serves as` / `functions as` substituting for
a direct statement ("X is Y").

**Promotional/travel-guide language** — `rich heritage`, `vibrant community`, and
similar puffery have no place in a CV or cover letter regardless of source.

**Em-dash / dash-break overuse** — grep for `" - "` and em dashes. A cover letter
leaning on dash-interrupted clauses in almost every sentence reads as machine-generated
even when every claim is true. Rewrite with periods, colons, or parentheses instead.
More than roughly one dash-break per 150 words is worth a pass.

**Negative parallelism** — `"X isn't Y — it's Z"` / `"X weren't Y — they were Z"`.
Used once, it's a legitimate rhetorical device. Used two or more times in one document,
it reads as an AI tic. Grep pattern: `isn't .*- it's|weren't .*- they were`.

**Rule-of-three overuse** — three-item lists used purely for rhetorical cadence (not
because the underlying fact genuinely has three parts) are a tell. A JD's own
established triad (e.g. "paid, owned, and earned channels") is fine to use verbatim —
that's terminology matching, not padding.

**Undue significance / vague connective tissue** — phrases like "in connection with,"
"associated with," or sentences that link a mundane fact to a "broader trend" or
"legacy" without evidence. A CV/CL should stay concrete and evidence-first throughout
(this is also what `References/ExperienceOverSkills.md` already demands).

## How to apply it

1. Grep the combined CV+CL text for the vocabulary list above and the two regex
   patterns (dash-breaks, negative parallelism).
2. Fix every hit found — these are prose-quality issues, independent of and in
   addition to keyword coverage. Fixing them must never remove or reword a keyword
   substring that `Tools/JDTool.ts coverage` depends on; re-run the coverage check
   after any style pass to confirm nothing broke.
3. Report the before/after counts to the user as part of the summary, the same way
   keyword coverage is reported.
