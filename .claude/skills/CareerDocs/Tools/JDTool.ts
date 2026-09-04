#!/usr/bin/env bun

/**
 * JDTool.ts - Deterministic helper for the CareerDocs skill
 *
 * PURPOSE:
 * The CareerDocs workflow (Workflows/GenerateCVAndCoverLetter.md) requires three
 * mechanically-verifiable checks that must NOT be eyeballed by the drafting model:
 *   1. Has this exact JD already been processed? (duplicate warning)
 *   2. What % of the required keyword list actually appears in the drafted CV + CL?
 *   3. Persist the outcome to the JD log so future runs can detect duplicates.
 *
 * This tool is intentionally dumb and auditable: normalized SHA-256 hashing for
 * dedup, case-insensitive substring matching for coverage. It does NOT do keyword
 * extraction — that step requires reading comprehension and is done by the model
 * during the workflow (see Step 2 of the workflow doc).
 *
 * USAGE:
 *   bun JDTool.ts hash               < jd.txt
 *   bun JDTool.ts check-duplicate --log Data/JDLog.json  < jd.txt
 *   bun JDTool.ts coverage --keywords keywords.json --doc draft.txt
 *   bun JDTool.ts log --log Data/JDLog.json --entry entry.json
 *
 * OUTPUT: JSON on stdout in all modes. Non-zero exit only on usage errors.
 */

import { existsSync, readFileSync, writeFileSync, mkdirSync } from "fs";
import { dirname } from "path";
import { createHash } from "crypto";

interface JDLogEntry {
  hash: string;
  company: string;
  title: string;
  dateProcessed: string; // ISO date
  attempts: number;
  keywordCoveragePct: number;
  missingKeywords: string[];
  cvDocUrl: string | null;
  coverLetterDocUrl: string | null;
  status: "COMPLETE" | "ALERTED_INCOMPLETE";
}

function readStdin(): string {
  try {
    return readFileSync(0, "utf-8");
  } catch {
    return "";
  }
}

function normalize(text: string): string {
  return text
    .toLowerCase()
    .replace(/\s+/g, " ")
    .replace(/[^\w\s%/.-]/g, "")
    .trim();
}

function sha256(text: string): string {
  return createHash("sha256").update(normalize(text)).digest("hex");
}

function loadLog(path: string): JDLogEntry[] {
  if (!existsSync(path)) return [];
  try {
    const parsed = JSON.parse(readFileSync(path, "utf-8"));
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveLog(path: string, entries: JDLogEntry[]) {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, JSON.stringify(entries, null, 2) + "\n", "utf-8");
}

function getFlag(args: string[], name: string): string | undefined {
  const i = args.indexOf(`--${name}`);
  return i >= 0 ? args[i + 1] : undefined;
}

function fail(message: string): never {
  console.log(JSON.stringify({ error: message }));
  process.exit(1);
}

const [, , cmd, ...rest] = process.argv;

switch (cmd) {
  case "hash": {
    const jd = readStdin();
    if (!jd.trim()) fail("No JD text provided on stdin.");
    console.log(JSON.stringify({ hash: sha256(jd) }));
    break;
  }

  case "check-duplicate": {
    const logPath = getFlag(rest, "log");
    if (!logPath) fail("--log <path> is required.");
    const jd = readStdin();
    if (!jd.trim()) fail("No JD text provided on stdin.");
    const hash = sha256(jd);
    const log = loadLog(logPath!);
    const match = log.find((e) => e.hash === hash) ?? null;
    console.log(JSON.stringify({ hash, duplicate: !!match, matchedEntry: match }));
    break;
  }

  case "coverage": {
    const keywordsPath = getFlag(rest, "keywords");
    const docPath = getFlag(rest, "doc");
    if (!keywordsPath || !docPath) fail("--keywords <path> and --doc <path> are required.");
    const keywords: string[] = JSON.parse(readFileSync(keywordsPath!, "utf-8"));
    const docText = normalize(readFileSync(docPath!, "utf-8"));
    const matched: string[] = [];
    const missing: string[] = [];
    for (const kw of keywords) {
      const n = normalize(kw);
      if (n && docText.includes(n)) matched.push(kw);
      else missing.push(kw);
    }
    const pct = keywords.length === 0 ? 100 : Math.round((matched.length / keywords.length) * 1000) / 10;
    console.log(
      JSON.stringify({
        totalKeywords: keywords.length,
        matchedCount: matched.length,
        missingCount: missing.length,
        coveragePct: pct,
        matched,
        missing,
      })
    );
    break;
  }

  case "log": {
    const logPath = getFlag(rest, "log");
    const entryPath = getFlag(rest, "entry");
    if (!logPath || !entryPath) fail("--log <path> and --entry <path> are required.");
    const entry: JDLogEntry = JSON.parse(readFileSync(entryPath!, "utf-8"));
    const log = loadLog(logPath!);
    const existingIdx = log.findIndex((e) => e.hash === entry.hash);
    if (existingIdx >= 0) {
      log[existingIdx] = entry;
    } else {
      log.push(entry);
    }
    saveLog(logPath!, log);
    console.log(JSON.stringify({ saved: true, totalEntries: log.length }));
    break;
  }

  default:
    fail(
      `Unknown command "${cmd}". Use: hash | check-duplicate --log <path> | coverage --keywords <path> --doc <path> | log --log <path> --entry <path>`
    );
}
