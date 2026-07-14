#!/usr/bin/env python3
"""
Weekly arXiv traction tracker.

Searches arXiv for recent papers across a fixed set of topics, then enriches
each hit with "traction" signals (citation counts, Hacker News mentions,
GitHub stars via Papers with Code) and ranks everything by a combined score.

Output is a JSON report on stdout (and optionally a file), meant to be
consumed by whatever posts the weekly summary (e.g. a Notion page).
"""

import argparse
import json
import math
import re
import sys
import time
import urllib.parse
import xml.etree.ElementTree as ET
from datetime import datetime, timedelta, timezone

import requests

ARXIV_API = "http://export.arxiv.org/api/query"
SEMANTIC_SCHOLAR_API = "https://api.semanticscholar.org/graph/v1/paper/arXiv:{arxiv_id}"
PWC_REPOS_API = "https://paperswithcode.com/api/v1/papers/{paper_id}/repositories/"
PWC_SEARCH_API = "https://paperswithcode.com/api/v1/papers/"
HN_ALGOLIA_API = "https://hn.algolia.com/api/v1/search"

ATOM_NS = {"atom": "http://www.w3.org/2005/Atom", "arxiv": "http://arxiv.org/schemas/atom"}

REQUEST_TIMEOUT = 15
USER_AGENT = "arxiv-traction/1.0 (weekly research tracker)"

TOPICS = {
    "Harness Engineering": [
        "agent harness",
        "coding agent harness",
        "agentic coding",
        "LLM tool use harness",
        "software engineering agent",
    ],
    "Agent Orchestration": [
        "multi-agent orchestration",
        "LLM agent coordination",
        "multi-agent system large language model",
        "agent workflow orchestration",
    ],
    "Post-AI Labor Markets": [
        "artificial intelligence labor market",
        "AI automation employment",
        "future of work artificial intelligence",
        "AI displacement workers",
    ],
    "Neurodivergence": [
        "neurodivergence",
        "neurodiversity artificial intelligence",
        "autism large language model",
        "ADHD assistive technology",
    ],
}


def log(msg):
    print(f"[arxiv-traction] {msg}", file=sys.stderr)


def build_arxiv_query(keywords):
    clauses = [f'(ti:"{kw}" OR abs:"{kw}")' for kw in keywords]
    return " OR ".join(clauses)


def fetch_arxiv_papers(keywords, since_days, max_results):
    query = build_arxiv_query(keywords)
    params = {
        "search_query": query,
        "sortBy": "submittedDate",
        "sortOrder": "descending",
        "start": 0,
        "max_results": max_results,
    }
    url = f"{ARXIV_API}?{urllib.parse.urlencode(params)}"
    resp = requests.get(url, headers={"User-Agent": USER_AGENT}, timeout=REQUEST_TIMEOUT)
    resp.raise_for_status()
    root = ET.fromstring(resp.content)

    cutoff = datetime.now(timezone.utc) - timedelta(days=since_days)
    papers = []
    for entry in root.findall("atom:entry", ATOM_NS):
        published_raw = entry.findtext("atom:published", default="", namespaces=ATOM_NS)
        try:
            published = datetime.strptime(published_raw, "%Y-%m-%dT%H:%M:%SZ").replace(tzinfo=timezone.utc)
        except ValueError:
            continue
        if published < cutoff:
            continue

        id_url = entry.findtext("atom:id", default="", namespaces=ATOM_NS)
        raw_id = id_url.rstrip("/").split("/")[-1]
        arxiv_id = re.sub(r"v\d+$", "", raw_id)

        title = " ".join(entry.findtext("atom:title", default="", namespaces=ATOM_NS).split())
        summary = " ".join(entry.findtext("atom:summary", default="", namespaces=ATOM_NS).split())
        authors = [
            a.findtext("atom:name", default="", namespaces=ATOM_NS)
            for a in entry.findall("atom:author", ATOM_NS)
        ]
        primary_category_el = entry.find("arxiv:primary_category", ATOM_NS)
        primary_category = primary_category_el.get("term") if primary_category_el is not None else None

        papers.append(
            {
                "arxiv_id": arxiv_id,
                "title": title,
                "summary": summary,
                "authors": authors,
                "published": published_raw,
                "primary_category": primary_category,
                "url": id_url,
            }
        )
    return papers


def fetch_citation_count(arxiv_id):
    url = SEMANTIC_SCHOLAR_API.format(arxiv_id=arxiv_id)
    try:
        resp = requests.get(
            url,
            params={"fields": "citationCount,influentialCitationCount"},
            headers={"User-Agent": USER_AGENT},
            timeout=REQUEST_TIMEOUT,
        )
        if resp.status_code != 200:
            return {"citation_count": 0, "influential_citation_count": 0}
        data = resp.json()
        return {
            "citation_count": data.get("citationCount") or 0,
            "influential_citation_count": data.get("influentialCitationCount") or 0,
        }
    except requests.RequestException as exc:
        log(f"semantic scholar lookup failed for {arxiv_id}: {exc}")
        return {"citation_count": 0, "influential_citation_count": 0}


def fetch_github_stars(arxiv_id):
    try:
        resp = requests.get(
            PWC_REPOS_API.format(paper_id=arxiv_id),
            headers={"User-Agent": USER_AGENT},
            timeout=REQUEST_TIMEOUT,
        )
        if resp.status_code != 200:
            return {"github_stars": 0, "github_repo": None}
        results = resp.json().get("results", [])
        if not results:
            return {"github_stars": 0, "github_repo": None}
        top = max(results, key=lambda r: r.get("stars") or 0)
        return {"github_stars": top.get("stars") or 0, "github_repo": top.get("url")}
    except requests.RequestException as exc:
        log(f"papers with code lookup failed for {arxiv_id}: {exc}")
        return {"github_stars": 0, "github_repo": None}


def fetch_hn_mentions(title, arxiv_id):
    try:
        resp = requests.get(
            HN_ALGOLIA_API,
            params={"query": f"{title} OR {arxiv_id}", "tags": "story"},
            headers={"User-Agent": USER_AGENT},
            timeout=REQUEST_TIMEOUT,
        )
        if resp.status_code != 200:
            return {"hn_mentions": 0, "hn_top_points": 0, "hn_top_comments": 0, "hn_url": None}
        hits = resp.json().get("hits", [])
        if not hits:
            return {"hn_mentions": 0, "hn_top_points": 0, "hn_top_comments": 0, "hn_url": None}
        top = max(hits, key=lambda h: h.get("points") or 0)
        return {
            "hn_mentions": len(hits),
            "hn_top_points": top.get("points") or 0,
            "hn_top_comments": top.get("num_comments") or 0,
            "hn_url": f"https://news.ycombinator.com/item?id={top['objectID']}" if top.get("objectID") else None,
        }
    except requests.RequestException as exc:
        log(f"HN lookup failed for {title!r}: {exc}")
        return {"hn_mentions": 0, "hn_top_points": 0, "hn_top_comments": 0, "hn_url": None}


def score_paper(metrics):
    citation = metrics["citation_count"]
    influential = metrics["influential_citation_count"]
    stars = metrics["github_stars"]
    hn_points = metrics["hn_top_points"]
    hn_comments = metrics["hn_top_comments"]

    return round(
        3 * math.log1p(citation)
        + 5 * math.log1p(influential)
        + 0.2 * math.log1p(stars)
        + 1.0 * math.log1p(hn_points)
        + 0.5 * math.log1p(hn_comments),
        3,
    )


def enrich_paper(paper, sleep_between_calls):
    citations = fetch_citation_count(paper["arxiv_id"])
    time.sleep(sleep_between_calls)
    github = fetch_github_stars(paper["arxiv_id"])
    time.sleep(sleep_between_calls)
    hn = fetch_hn_mentions(paper["title"], paper["arxiv_id"])
    time.sleep(sleep_between_calls)

    metrics = {**citations, **github, **hn}
    paper.update(metrics)
    paper["traction_score"] = score_paper(metrics)
    return paper


def run(since_days, max_per_topic, sleep_between_calls):
    all_papers = []
    for topic, keywords in TOPICS.items():
        log(f"searching arXiv for topic '{topic}'")
        try:
            papers = fetch_arxiv_papers(keywords, since_days, max_per_topic)
        except requests.RequestException as exc:
            log(f"arXiv query failed for topic '{topic}': {exc}")
            continue

        log(f"  {len(papers)} papers within last {since_days} days, enriching traction signals")
        for paper in papers:
            paper["topic"] = topic
            enrich_paper(paper, sleep_between_calls)
            all_papers.append(paper)

    all_papers.sort(key=lambda p: p["traction_score"], reverse=True)

    return {
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "since_days": since_days,
        "topics": list(TOPICS.keys()),
        "paper_count": len(all_papers),
        "papers": all_papers,
    }


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--since-days", type=int, default=14, help="Only include papers published in the last N days (default: 14)")
    parser.add_argument("--max-per-topic", type=int, default=10, help="Max arXiv results fetched per topic before filtering (default: 10)")
    parser.add_argument("--sleep", type=float, default=0.5, help="Seconds to sleep between enrichment API calls, to be polite (default: 0.5)")
    parser.add_argument("--out", type=str, default=None, help="Optional path to also write the JSON report to")
    args = parser.parse_args()

    report = run(args.since_days, args.max_per_topic, args.sleep)

    output = json.dumps(report, indent=2)
    print(output)

    if args.out:
        with open(args.out, "w") as f:
            f.write(output)
        log(f"wrote report to {args.out}")


if __name__ == "__main__":
    main()
