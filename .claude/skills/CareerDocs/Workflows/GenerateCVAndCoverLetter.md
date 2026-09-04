# GenerateCVAndCoverLetter Workflow

Turns one pasted job description into a keyword-verified CV and Cover Letter, published
as Google Docs. Every step below is mandatory and ordered — do not skip the duplicate
check or the mechanical coverage check, and never self-grade coverage from a read-through.

## Voice Notification

```bash
curl -s -X POST http://localhost:8888/notify \
  -H "Content-Type: application/json" \
  -d '{"message": "Running the GenerateCVAndCoverLetter workflow in the CareerDocs skill to analyze the JD and draft tailored documents"}' \
  > /dev/null 2>&1 &
```

Running **GenerateCVAndCoverLetter** in **CareerDocs** to analyze the JD and draft
tailored documents...

---

## Step 0 — Locate the Base CV / Work History (prerequisite, first run only)

This skill tailors real experience; it never invents it. Before drafting anything:

1. Look for a base CV/résumé/work-history source at
   `~/.claude/skills/PAI/USER/SKILLCUSTOMIZATIONS/CareerDocs/` (e.g. `BaseCV.md`,
   `BaseCV.docx`, `WorkHistory.md`) or ask the user directly if none exists.
2. If no base source is found and none is provided, **stop and ask the user** for it —
   do not fabricate employers, titles, dates, or metrics. Every years-of-experience,
   employer name, title, and outcome number in the final CV/CL must trace back to this
   source.
3. Cache the parsed content for the rest of this run (name, contact info, employment
   history with dates, existing bullet points, education, certifications).

## Step 1 — Ingest the JD and Check for Duplicates

1. Take the JD text the user just pasted verbatim. Save it to a scratch file, e.g.
   `/tmp/careerdocs-jd.txt`.
2. Run the duplicate check:
   ```bash
   bun .claude/skills/CareerDocs/Tools/JDTool.ts check-duplicate \
     --log .claude/skills/CareerDocs/Data/JDLog.json \
     < /tmp/careerdocs-jd.txt
   ```
3. **If `duplicate: true`**: surface the matched entry to the user in full (company,
   title, `dateProcessed`, `keywordCoveragePct`, `cvDocUrl`, `coverLetterDocUrl`) and
   ask via `AskUserQuestion` whether to (a) reuse those existing docs, (b) regenerate
   anyway (e.g. base CV has since changed), or (c) stop. Only continue past this step on
   explicit "regenerate anyway" — never silently redraft a duplicate.
4. **If `duplicate: false`**: proceed. Keep the returned `hash` — it is the log key for
   this run.

## Step 2 — Exhaustive Keyword Analysis (log every keyword)

This is the step the user explicitly requires be exhaustive: **every** keyword in the
JD must be captured, not just the obviously important ones.

1. Read the JD line by line. Extract every discrete requirement, tool, credential,
   methodology, KPI term, soft-skill phrase, seniority signal, and language requirement
   as its own candidate keyword/phrase (2-6 words each; split compound requirements the
   same way `PAI/SKILL.md`'s ISC extraction splits compound criteria — one concern per
   entry).
2. Cross-reference each extracted term against `References/HardSkills.md` and
   `References/SoftSkills.md`. Where a JD term maps to an existing bank entry, keep the
   bank's canonical phrasing available for drafting (it's proven, pre-vetted language).
   Where a JD term is genuinely new (a specific product name, a JD-only metric, a
   region), keep it verbatim — do not drop it for not being in the bank.
3. Also check `References/TargetRoleProfiles.md`'s cross-role terminology cheat sheet —
   if this JD belongs to the same role family, expect (and double-check for) those
   recurring terms even if phrased slightly differently.
4. Write the full candidate list to `/tmp/careerdocs-keywords.json` as a flat JSON
   array of strings, e.g. `["Salesforce", "SAP S/4HANA", "quota management", ...]`.
5. **Log this list to the user** in the chat response as a visible checklist — this
   satisfies "every keyword analyzed and logged," independent of the mechanical
   coverage check in Step 5. Group it (Hard / Soft / JD-specific) for readability.

## Step 3 — Draft the CV and Cover Letter (attempt 1)

1. Apply `References/ExperienceOverSkills.md` as the governing drafting philosophy:
   lead every section with tenure/scope/outcome from the Step 0 source material, weave
   keywords as evidence inside experience statements, never append a bare keyword-dump
   section to fake coverage.
2. Draft both documents as plain text/markdown in memory (not yet published):
   - CV: contact header, a 2-3 line experience-led summary, reverse-chronological
     experience with keyword-bearing bullets, skills section (secondary, evidence-based
     — not the lead), education/certifications, languages if relevant to the JD.
   - Cover Letter: 3-4 paragraphs, opens with role + why-now framed around experience
     fit (not a skills list), one paragraph mapping 2-3 concrete past outcomes to the
     JD's stated priorities, closes with a clear ask.
3. Save the combined text of both documents to `/tmp/careerdocs-draft.txt` (concatenate
   CV + CL — coverage is checked across both documents together, since a keyword woven
   naturally into whichever document fits best still counts).

## Step 4 — Mechanical Coverage Check (never self-graded)

```bash
bun .claude/skills/CareerDocs/Tools/JDTool.ts coverage \
  --keywords /tmp/careerdocs-keywords.json \
  --doc /tmp/careerdocs-draft.txt
```

Read `coveragePct` and `missing` directly from the tool's JSON output. Do not estimate
or eyeball this — the tool is the source of truth.

## Step 5 — Revise-and-Recheck Loop (up to 5 attempts total)

- **If `coveragePct == 100`**: proceed to Step 6.
- **If `coveragePct < 100`**: revise the draft to tactfully work each `missing` keyword
  into the most natural spot (an experience bullet, the summary, or the cover letter
  paragraph mapping outcomes to priorities — never a bolted-on list). Re-save
  `/tmp/careerdocs-draft.txt` and re-run Step 4.
- Track the attempt count explicitly (attempt 1 = Step 3's first draft). **Maximum 5
  attempts total.**
- **If attempt 5 completes and `coveragePct < 100`**: STOP. Do not attempt a 6th
  revision and do not publish either document. Go to Step 7 (alert) instead of Step 6.

## Step 6 — Publish to Google Docs (only on 100% coverage)

For each of the two documents:

```
mcp__Google_Drive__create_file
  title: "<Candidate Name> - CV - <Company> <Role Title>"    (or "... - Cover Letter - ...")
  textContent: <the final document's plain text/markdown>
  contentMimeType: "text/markdown"
```

This auto-converts to a native Google Doc (`application/vnd.google-apps.document`)
since `disableConversionToGoogleType` is left `false`. Capture the returned file's `id`
and construct the doc URL as `https://docs.google.com/document/d/<id>/edit`.

Then log the outcome:

```bash
cat > /tmp/careerdocs-entry.json <<'EOF'
{
  "hash": "<hash from Step 1>",
  "company": "<Company>",
  "title": "<Role Title>",
  "dateProcessed": "<today, YYYY-MM-DD>",
  "attempts": <N>,
  "keywordCoveragePct": 100,
  "missingKeywords": [],
  "cvDocUrl": "<CV doc URL>",
  "coverLetterDocUrl": "<CL doc URL>",
  "status": "COMPLETE"
}
EOF
bun .claude/skills/CareerDocs/Tools/JDTool.ts log \
  --log .claude/skills/CareerDocs/Data/JDLog.json \
  --entry /tmp/careerdocs-entry.json
```

Report both doc links to the user along with the keyword checklist from Step 2, marked
fully matched, and the attempt count it took to reach 100%.

## Step 7 — Alert on Incomplete Coverage (only after 5 failed attempts)

Log the failed attempt too (so future duplicate checks still recognize this JD and
don't silently re-run 5 more attempts without telling the user):

```bash
cat > /tmp/careerdocs-entry.json <<'EOF'
{
  "hash": "<hash from Step 1>",
  "company": "<Company>",
  "title": "<Role Title>",
  "dateProcessed": "<today, YYYY-MM-DD>",
  "attempts": 5,
  "keywordCoveragePct": <final coveragePct>,
  "missingKeywords": [<final missing list>],
  "cvDocUrl": null,
  "coverLetterDocUrl": null,
  "status": "ALERTED_INCOMPLETE"
}
EOF
bun .claude/skills/CareerDocs/Tools/JDTool.ts log \
  --log .claude/skills/CareerDocs/Data/JDLog.json \
  --entry /tmp/careerdocs-entry.json
```

Then tell the user plainly, in the chat response (do not soften or bury this):

> After 5 drafting attempts, keyword coverage plateaued at **N%**. The following
> keywords could not be tactfully and truthfully worked into the CV or Cover Letter:
> `[missing list]`. No Google Doc was published. This is usually because either (a) the
> keyword requires experience not present in the base CV/work history — flag which
> ones, since fabricating them isn't an option — or (b) the phrase is too awkward to
> weave naturally and needs your judgment call on whether/how to include it.

Do not publish partial documents. Wait for the user's direction (provide missing
experience detail, approve a manual insertion, or accept the gap).

## Notes

- Coverage is checked against the **combined** CV+CL text, so a keyword only needs to
  appear naturally in whichever document it fits — it does not need to be duplicated in
  both.
- Matching in `Tools/JDTool.ts coverage` is case-insensitive substring matching on
  normalized text. A keyword phrased as "SAP S/4HANA integrations" in the JD will not
  match a draft that only contains "S/4HANA" — when revising, match phrasing closely
  enough to pass, without resorting to an unnatural verbatim quote if a close, honest
  paraphrase reads better AND still contains the tool-matchable substring.
- `References/TargetRoleProfiles.md` is background context only — never log those
  exemplar JDs into `Data/JDLog.json`; only JDs the user actually pastes for a live
  application get logged.
