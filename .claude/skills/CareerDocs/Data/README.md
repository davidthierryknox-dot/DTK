# Data

`JDLog.json` is the single source of truth for every job description this skill has
processed. It is an array of entries shaped like:

```json
{
  "hash": "sha256 of the normalized JD text",
  "company": "Avalara",
  "title": "US Enterprise CAM",
  "dateProcessed": "2026-09-04",
  "attempts": 2,
  "keywordCoveragePct": 100,
  "missingKeywords": [],
  "cvDocUrl": "https://docs.google.com/document/d/...",
  "coverLetterDocUrl": "https://docs.google.com/document/d/...",
  "status": "COMPLETE"
}
```

`status` is either `COMPLETE` (100% keyword coverage reached, docs published) or
`ALERTED_INCOMPLETE` (5 attempts exhausted without 100% coverage — user was alerted,
docs were NOT published as final). Never delete or hand-edit entries; the workflow and
`Tools/JDTool.ts` own this file. See `Workflows/GenerateCVAndCoverLetter.md`.
