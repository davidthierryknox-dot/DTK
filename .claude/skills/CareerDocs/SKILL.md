---
name: CareerDocs
description: Turns a pasted job description into a keyword-verified, ATS-ready CV and Cover Letter published as Google Docs. USE WHEN paste a JD, job description, apply for this role, tailor my resume, tailor my CV, cover letter for this job, OR job application. Tracks every JD processed, warns on duplicates, and refuses to publish until 100% of JD keywords are verified present.
---

## Customization

**Before executing, check for user customizations at:**
`~/.claude/skills/PAI/USER/SKILLCUSTOMIZATIONS/CareerDocs/`

If this directory exists, load and apply any `PREFERENCES.md`, base résumé file, or
other resources found there (in particular, the base CV/work-history source of truth —
see Step 0 of the workflow). If it does not exist, ask the user for that source once
before drafting anything.

## 🚨 MANDATORY: Voice Notification

```bash
curl -s -X POST http://localhost:8888/notify \
  -H "Content-Type: application/json" \
  -d '{"message": "Running the GenerateCVAndCoverLetter workflow in the CareerDocs skill"}' \
  > /dev/null 2>&1 &
```

```
Running **GenerateCVAndCoverLetter** in **CareerDocs**...
```

## What This Skill Does

The user pastes a job description. This skill:

1. Hashes the JD and checks `Data/JDLog.json` for a prior submission against the same
   text — **warns on duplicates** before doing any drafting work.
2. Exhaustively extracts and logs every keyword/requirement in the JD (hard skills,
   soft skills, tools, certifications, KPIs, language requirements) against
   `References/HardSkills.md` and `References/SoftSkills.md`.
3. Drafts a CV and Cover Letter from the user's real work history, applying the
   experience-over-skills drafting philosophy in `References/ExperienceOverSkills.md`
   (recent a16z research: hiring now weighs years/scope of experience over breadth of
   skills — so lead with tenure and outcomes, use keywords as supporting evidence).
4. Mechanically verifies keyword coverage with `Tools/JDTool.ts coverage` — never
   self-graded. Revises and re-checks up to **5 attempts**. If 100% coverage is not
   reached after 5 attempts, **stops and alerts the user** with the exact missing list
   instead of publishing.
5. On 100% coverage, publishes both documents to Google Drive as native Google Docs and
   logs the outcome (company, title, coverage %, attempts, doc links) to
   `Data/JDLog.json`.

## Workflow Routing

| Workflow | Trigger | File |
|----------|---------|------|
| **GenerateCVAndCoverLetter** | User pastes a job description / asks to tailor CV+CL for a role | `Workflows/GenerateCVAndCoverLetter.md` |

## Reference Material (loaded by the workflow, not user-facing on their own)

| File | Purpose |
|------|---------|
| `References/HardSkills.md` | Canonical hard-skill keyword bank |
| `References/SoftSkills.md` | Canonical soft-skill keyword bank |
| `References/ExperienceOverSkills.md` | a16z-derived drafting philosophy (experience > skills) |
| `References/TargetRoleProfiles.md` | Exemplar target-role JD/KPI library (Avalara/Vertex ecosystem) for fast recognition of recurring terminology — background context, not a source of live applications |
| `References/AIWritingSignsGuide.md` | Final style/credibility QA pass (Wikipedia's "Signs of AI writing" checklist) run after 100% keyword coverage, before publishing |

## Data

| File | Purpose |
|------|---------|
| `Data/JDLog.json` | Every JD processed: hash, company, title, date, attempts, coverage %, doc links, status |

## Tools

| Tool | Purpose |
|------|---------|
| `Tools/JDTool.ts` | `hash`, `check-duplicate`, `coverage`, `log` — the four mechanical, auditable checks the workflow relies on instead of self-grading |

## Examples

**Example 1: New JD, no prior submission**
```
User: [pastes a JD] "Tailor my CV and cover letter for this."
→ Invokes GenerateCVAndCoverLetter workflow
→ No duplicate found → full keyword analysis logged → CV+CL drafted → coverage
  verified at 100% on attempt 2 → two Google Docs created and linked back to the user
```

**Example 2: Duplicate JD**
```
User: [pastes a JD they already applied to weeks ago]
→ Hash matches an existing Data/JDLog.json entry
→ User is warned with the prior date, coverage %, and doc links before any redraft work begins
```

**Example 3: Keyword coverage never reaches 100%**
```
User: [pastes a JD with highly unusual, unverifiable requirements]
→ 5 drafting attempts run, coverage plateaus at 92%
→ Workflow STOPS, alerts the user with the exact list of unmatched keywords, and does
  NOT publish a Google Doc for either document
```
