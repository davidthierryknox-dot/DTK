#!/usr/bin/env python3
"""
arxiv_traction.py — Rank arXiv papers by real-world attention signals.

Signals used:
  - Semantic Scholar: citationCount, influentialCitationCount
  - Hacker News (Algolia): points + num_comments across matching stories
  - Reddit: post score + num_comments across matching posts
  - GitHub (optional): stars for a repo linked in the abstract

Usage:
  python arxiv_traction.py --query "agent harness" --max-results 30
  python arxiv_traction.py --ids 2607.11698,2607.11423
"""

import argparse
import csv
import re
import sys
import time
import urllib.parse
import xml.etree.ElementTree as ET

import requests

ARXIV_API = "http://export.arxiv.org/api/query"
S2_API = "https://api.semanticscholar.org/graph/v1/paper/arXiv:{}"
HN_API = "https://hn.algolia.com/api/v1/search"
REDDIT_API = "https://www.reddit.com/search.json"
GITHUB_API = "https://api.github.com/repos/{}"

HEADERS = {"User-Agent": "arxiv-traction-monitor/0.1 (personal research tool)"}


def fetch_arxiv(query=None, ids=None, max_results=25):
    """Return list of dicts: id, title, summary, link, github (if found)."""
    papers = []
    if ids:
        id_list = ",".join(ids)
        params = {"id_list": id_list, "max_results": len(ids)}
    else:
        params = {
            "search_query": f"all:{query}",
            "start": 0,
            "max_results": max_results,
            "sortBy": "submittedDate",
            "sortOrder": "descending",
        }
    resp = requests.get(ARXIV_API, params=params, headers=HEADERS, timeout=20)
    resp.raise_for_status()
    root = ET.fromstring(resp.text)
    ns = {"atom": "http://www.w3.org/2005/Atom"}
    for entry in root.findall("atom:entry", ns):
        raw_id = entry.find("atom:id", ns).text
        arxiv_id = raw_id.rstrip("/").split("/")[-1]
        arxiv_id = re.sub(r"v\d+$", "", arxiv_id)  # strip version suffix
        title = entry.find("atom:title", ns).text.strip().replace("\n", " ")
        summary = entry.find("atom:summary", ns).text or ""
        gh_match = re.search(r"github\.com/([\w.-]+/[\w.-]+)", summary)
        papers.append({
            "id": arxiv_id,
            "title": title,
            "link": f"https://arxiv.org/abs/{arxiv_id}",
            "github": gh_match.group(1).rstrip(".,)") if gh_match else None,
        })
    return papers


def get_citations(arxiv_id):
    try:
        resp = requests.get(
            S2_API.format(arxiv_id),
            params={"fields": "citationCount,influentialCitationCount"},
            headers=HEADERS, timeout=15,
        )
        if resp.status_code == 200:
            data = resp.json()
            return data.get("citationCount", 0) or 0, data.get("influentialCitationCount", 0) or 0
    except requests.RequestException:
        pass
    return 0, 0


def get_hn_signal(arxiv_id, title):
    """Sum points + num_comments across HN stories/comments mentioning this paper."""
    points, comments, hits = 0, 0, 0
    for q in (arxiv_id, title):
        try:
            resp = requests.get(HN_API, params={"query": q}, headers=HEADERS, timeout=15)
            resp.raise_for_status()
            for hit in resp.json().get("hits", []):
                # only count if it actually looks like a match (avoid noise)
                if arxiv_id in (hit.get("url") or "") or arxiv_id in (hit.get("story_text") or "") \
                        or arxiv_id in (hit.get("comment_text") or ""):
                    points += hit.get("points") or 0
                    comments += hit.get("num_comments") or 0
                    hits += 1
        except requests.RequestException:
            continue
    return points, comments, hits


def get_reddit_signal(arxiv_id, title):
    """Sum upvote score + num_comments across Reddit posts mentioning this paper."""
    score_total, comments_total, hits = 0, 0, 0
    seen_ids = set()
    for q in (arxiv_id, title):
        try:
            resp = requests.get(
                REDDIT_API,
                params={"q": q, "limit": 15, "sort": "relevance"},
                headers=HEADERS, timeout=15,
            )
            if resp.status_code != 200:
                continue
            for child in resp.json().get("data", {}).get("children", []):
                d = child.get("data", {})
                post_id = d.get("id")
                if post_id in seen_ids:
                    continue
                text_blob = " ".join([
                    d.get("title") or "", d.get("selftext") or "", d.get("url") or ""
                ])
                if arxiv_id in text_blob:
                    seen_ids.add(post_id)
                    score_total += d.get("score") or 0
                    comments_total += d.get("num_comments") or 0
                    hits += 1
        except requests.RequestException:
            continue
    return score_total, comments_total, hits


def get_github_stars(repo):
    if not repo:
        return 0
    try:
        resp = requests.get(GITHUB_API.format(repo), headers=HEADERS, timeout=15)
        if resp.status_code == 200:
            return resp.json().get("stargazers_count", 0) or 0
    except requests.RequestException:
        pass
    return 0


def traction_score(citations, influential, hn_points, hn_comments, stars, reddit_score, reddit_comments):
    # Simple weighted blend — tune to taste.
    return (
        citations * 1.0
        + influential * 3.0
        + hn_points * 2.0
        + hn_comments * 1.0
        + stars * 0.5
        + reddit_score * 2.0
        + reddit_comments * 1.0
    )


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--query", help="arXiv search query, e.g. 'agent harness'")
    ap.add_argument("--ids", help="comma-separated arXiv IDs instead of a query")
    ap.add_argument("--max-results", type=int, default=25)
    ap.add_argument("--check-github", action="store_true", help="also fetch GitHub stars (slower)")
    ap.add_argument("--csv", help="write results to this CSV file")
    ap.add_argument("--delay", type=float, default=1.2, help="seconds between API calls (rate-limit friendly)")
    args = ap.parse_args()

    if not args.query and not args.ids:
        sys.exit("Provide --query or --ids")

    ids = [i.strip() for i in args.ids.split(",")] if args.ids else None
    papers = fetch_arxiv(query=args.query, ids=ids, max_results=args.max_results)

    results = []
    for i, p in enumerate(papers, 1):
        print(f"[{i}/{len(papers)}] {p['id']} — checking signals...", file=sys.stderr)
        citations, influential = get_citations(p["id"])
        time.sleep(args.delay)
        hn_points, hn_comments, hn_hits = get_hn_signal(p["id"], p["title"])
        time.sleep(args.delay)
        reddit_score, reddit_comments, reddit_hits = get_reddit_signal(p["id"], p["title"])
        time.sleep(args.delay)
        stars = get_github_stars(p["github"]) if (args.check_github and p["github"]) else 0
        if args.check_github and p["github"]:
            time.sleep(args.delay)

        score = traction_score(citations, influential, hn_points, hn_comments, stars, reddit_score, reddit_comments)
        results.append({
            **p, "citations": citations, "influential_citations": influential,
            "hn_points": hn_points, "hn_comments": hn_comments, "hn_mentions": hn_hits,
            "reddit_score": reddit_score, "reddit_comments": reddit_comments, "reddit_mentions": reddit_hits,
            "github_stars": stars, "traction_score": round(score, 1),
        })

    results.sort(key=lambda r: r["traction_score"], reverse=True)

    print(f"\n{'Score':>7} | {'Cites':>5} | {'HN pts':>6} | {'Reddit':>6} | {'Stars':>5} | Title")
    print("-" * 100)
    for r in results:
        print(f"{r['traction_score']:>7} | {r['citations']:>5} | {r['hn_points']:>6} | "
              f"{r['reddit_score']:>6} | {r['github_stars']:>5} | {r['title'][:70]}  ({r['link']})")

    if args.csv:
        with open(args.csv, "w", newline="") as f:
            writer = csv.DictWriter(f, fieldnames=list(results[0].keys()))
            writer.writeheader()
            writer.writerows(results)
        print(f"\nWrote {len(results)} rows to {args.csv}", file=sys.stderr)


if __name__ == "__main__":
    main()
