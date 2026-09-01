"""
Market Trend Watcher — prototype
Polls Kalshi (and, optionally, other prediction-market APIs) for open markets,
compares each snapshot to the last one on disk, flags meaningful trend changes,
and drafts news-lead / headline candidates from the flagged moves.

Run modes:
  --demo   Uses bundled synthetic data (no API key needed) so you can see the
           whole pipeline work end-to-end immediately.
  --live   Hits the real Kalshi public markets endpoint. Some endpoints require
           an API key (KALSHI_API_KEY_ID / KALSHI_PRIVATE_KEY_PATH env vars);
           this prototype uses the unauthenticated-friendly market listing
           endpoint where possible and will warn if auth is required.

This is a single polling cycle. In production you'd run this on a schedule
(cron, a Claude Code background task, etc.) so each run compares against the
previous run's snapshot.
"""

import argparse
import json
import os
import random
import time
from dataclasses import dataclass, asdict
from datetime import datetime, timezone
from pathlib import Path
from typing import Optional

import requests

# ---------------------------------------------------------------------------
# Config
# ---------------------------------------------------------------------------

KALSHI_BASE_URL = "https://trading-api.kalshi.com/trade-api/v2"
SNAPSHOT_FILE = Path(__file__).parent / "snapshot_store.json"

THRESHOLDS = {
    "probability_move_pts": 8,       # flag if implied probability moves >= 8 points
    "volume_spike_ratio": 2.0,       # flag if volume is >= 2x the prior snapshot's volume
    "near_certain_high": 90,         # flag when a market crosses into "near certain yes"
    "near_certain_low": 10,          # flag when a market crosses into "near certain no"
    "fifty_crossing": True,          # flag when a market crosses the 50% line either way
}

MIN_VOLUME_TO_CONSIDER = 50  # ignore very thin markets — swings there are just noise


# ---------------------------------------------------------------------------
# Data model
# ---------------------------------------------------------------------------

@dataclass
class MarketSnapshot:
    ticker: str
    title: str
    yes_prob: float   # implied probability, 0-100
    volume: int
    fetched_at: str


@dataclass
class TrendFlag:
    ticker: str
    title: str
    trigger: str
    prev_prob: Optional[float]
    new_prob: float
    delta_pts: Optional[float]
    volume: int
    headline_draft: str
    lead_draft: str


# ---------------------------------------------------------------------------
# Data source: Kalshi client (+ demo fallback)
# ---------------------------------------------------------------------------

class KalshiClient:
    def __init__(self):
        self.api_key_id = os.environ.get("KALSHI_API_KEY_ID")

    def fetch_open_markets(self, limit: int = 25) -> list[MarketSnapshot]:
        """Fetch currently open markets. Falls back to a clear error message
        if the endpoint requires auth this prototype doesn't have configured."""
        headers = {}
        if self.api_key_id:
            headers["KALSHI-ACCESS-KEY"] = self.api_key_id
            # Real usage needs RSA-PSS request signing per Kalshi's auth docs —
            # not implemented here; wire that up before going live.

        resp = requests.get(
            f"{KALSHI_BASE_URL}/markets",
            params={"limit": limit, "status": "open"},
            headers=headers,
            timeout=10,
        )
        resp.raise_for_status()
        markets = resp.json().get("markets", [])

        snapshots = []
        now = datetime.now(timezone.utc).isoformat()
        for m in markets:
            yes_bid = m.get("yes_bid")
            if yes_bid is None:
                continue
            snapshots.append(
                MarketSnapshot(
                    ticker=m["ticker"],
                    title=m.get("title", m["ticker"]),
                    yes_prob=float(yes_bid),
                    volume=int(m.get("volume", 0)),
                    fetched_at=now,
                )
            )
        return snapshots


def fetch_demo_markets(seed_offset: int = 0) -> list[MarketSnapshot]:
    """Synthetic data so the pipeline is runnable with zero setup. Simulates
    a batch of markets, some of which have moved meaningfully since 'last time'."""
    random.seed(42 + seed_offset)
    now = datetime.now(timezone.utc).isoformat()

    base_markets = [
        ("FED-RATE-DEC", "Fed cuts rates at December meeting", 34),
        ("GOVSHUT-Q4", "Government shutdown before Nov 30", 18),
        ("PREZ-APPROVAL-45", "Approval rating below 45% by month end", 61),
        ("RECESSION-2026", "US recession declared in 2026", 22),
        ("SPACE-LAUNCH-Q4", "Starship reaches orbit this quarter", 47),
        ("ELECTION-TURNOUT", "Turnout exceeds 60% in special election", 8),
        ("AI-REGULATION-BILL", "Federal AI bill passes by year end", 29),
        ("INFLATION-CPI", "CPI print above 3.0% next release", 55),
    ]

    snapshots = []
    for ticker, title, base_prob in base_markets:
        drift = random.uniform(-15, 15) if seed_offset else 0
        prob = max(1, min(99, base_prob + drift))
        volume = random.randint(200, 5000)
        snapshots.append(MarketSnapshot(ticker, title, round(prob, 1), volume, now))
    return snapshots


# ---------------------------------------------------------------------------
# Snapshot storage (simple JSON file — swap for a real DB in production)
# ---------------------------------------------------------------------------

def load_previous_snapshots() -> dict[str, MarketSnapshot]:
    if not SNAPSHOT_FILE.exists():
        return {}
    raw = json.loads(SNAPSHOT_FILE.read_text())
    return {t: MarketSnapshot(**v) for t, v in raw.items()}


def save_snapshots(snapshots: list[MarketSnapshot]) -> None:
    data = {s.ticker: asdict(s) for s in snapshots}
    SNAPSHOT_FILE.write_text(json.dumps(data, indent=2))


# ---------------------------------------------------------------------------
# Trend detection
# ---------------------------------------------------------------------------

def detect_trends(
    current: list[MarketSnapshot], previous: dict[str, MarketSnapshot]
) -> list[TrendFlag]:
    flags = []

    for snap in current:
        if snap.volume < MIN_VOLUME_TO_CONSIDER:
            continue  # too thin to be meaningful

        prev = previous.get(snap.ticker)

        # New market listing
        if prev is None:
            flags.append(
                make_flag(snap, "new_listing", prev_prob=None)
            )
            continue

        delta = round(snap.yes_prob - prev.yes_prob, 1)

        # Probability swing
        if abs(delta) >= THRESHOLDS["probability_move_pts"]:
            flags.append(make_flag(snap, "probability_move", prev.yes_prob, delta))

        # Volume spike
        if prev.volume > 0 and snap.volume / prev.volume >= THRESHOLDS["volume_spike_ratio"]:
            flags.append(make_flag(snap, "volume_spike", prev.yes_prob, delta))

        # 50% crossing
        if THRESHOLDS["fifty_crossing"] and (prev.yes_prob - 50) * (snap.yes_prob - 50) < 0:
            flags.append(make_flag(snap, "fifty_crossing", prev.yes_prob, delta))

        # Near-certain crossing
        if prev.yes_prob < THRESHOLDS["near_certain_high"] <= snap.yes_prob:
            flags.append(make_flag(snap, "near_certain_high", prev.yes_prob, delta))
        if prev.yes_prob > THRESHOLDS["near_certain_low"] >= snap.yes_prob:
            flags.append(make_flag(snap, "near_certain_low", prev.yes_prob, delta))

    return flags


def make_flag(
    snap: MarketSnapshot, trigger: str, prev_prob: Optional[float], delta: Optional[float] = None
) -> TrendFlag:
    headline, lead = draft_headline_and_lead(snap, trigger, prev_prob, delta)
    return TrendFlag(
        ticker=snap.ticker,
        title=snap.title,
        trigger=trigger,
        prev_prob=prev_prob,
        new_prob=snap.yes_prob,
        delta_pts=delta,
        volume=snap.volume,
        headline_draft=headline,
        lead_draft=lead,
    )


# ---------------------------------------------------------------------------
# Headline / lead generation
# ---------------------------------------------------------------------------

def draft_headline_and_lead(
    snap: MarketSnapshot, trigger: str, prev_prob: Optional[float], delta: Optional[float]
) -> tuple[str, str]:
    topic = snap.title.rstrip(".")

    if trigger == "new_listing":
        headline = f"New prediction market opens on: {topic}"
        lead = (
            f"A new contract has launched asking whether {topic.lower()}, "
            f"opening at {snap.yes_prob:.0f}% implied probability."
        )
        return headline, lead

    direction = "up" if (delta or 0) > 0 else "down"

    if trigger == "probability_move":
        headline = f"Odds move {direction} on '{topic}' — now at {snap.yes_prob:.0f}%"
        lead = (
            f"Traders have pushed the implied probability that {topic.lower()} "
            f"{direction} {abs(delta):.0f} points, from {prev_prob:.0f}% to {snap.yes_prob:.0f}%, "
            f"on volume of {snap.volume:,} contracts."
        )
        return headline, lead

    if trigger == "volume_spike":
        headline = f"Trading surges on '{topic}' as market recalibrates"
        lead = (
            f"Volume on the '{topic}' contract has spiked, with the implied probability "
            f"now at {snap.yes_prob:.0f}% — a signal that new information is hitting the market."
        )
        return headline, lead

    if trigger == "fifty_crossing":
        headline = f"'{topic}' odds flip past the coin-flip line"
        lead = (
            f"The market on {topic.lower()} has crossed 50% for the first time in this window, "
            f"now pricing it as more likely than not at {snap.yes_prob:.0f}%."
        )
        return headline, lead

    if trigger == "near_certain_high":
        headline = f"Markets now see '{topic}' as all but certain"
        lead = (
            f"Traders have pushed the odds on {topic.lower()} to {snap.yes_prob:.0f}%, "
            f"crossing into near-certain territory."
        )
        return headline, lead

    if trigger == "near_certain_low":
        headline = f"'{topic}' odds collapse toward zero"
        lead = (
            f"The market has all but ruled out {topic.lower()}, with implied probability "
            f"falling to {snap.yes_prob:.0f}%."
        )
        return headline, lead

    return f"Notable move on '{topic}'", f"The market on {topic.lower()} has shifted meaningfully."


def score_flag(flag: TrendFlag) -> float:
    """Rough priority score: bigger moves + more volume = higher priority."""
    magnitude = abs(flag.delta_pts) if flag.delta_pts else 5
    return magnitude * (1 + flag.volume / 1000)


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def run(mode: str):
    previous = load_previous_snapshots()

    if mode == "demo":
        # seed_offset=0 on first run (no drift), seed_offset=1 simulates the "next poll"
        current = fetch_demo_markets(seed_offset=1 if previous else 0)
    else:
        client = KalshiClient()
        current = client.fetch_open_markets()

    flags = detect_trends(current, previous)
    flags.sort(key=score_flag, reverse=True)

    print(f"\n=== Market Trend Watcher — {datetime.now(timezone.utc).isoformat()} ===")
    print(f"Markets checked: {len(current)} | Trend flags: {len(flags)}\n")

    for f in flags:
        print(f"[{f.trigger}] {f.ticker}")
        print(f"  HEADLINE: {f.headline_draft}")
        print(f"  LEAD:     {f.lead_draft}")
        if f.prev_prob is not None:
            print(f"  Move: {f.prev_prob:.0f}% -> {f.new_prob:.0f}%  (vol: {f.volume:,})")
        print()

    save_snapshots(current)

    # Also write structured output for downstream use (e.g., feeding a CMS or Slack)
    out_path = Path(__file__).parent / "leads_output.json"
    out_path.write_text(json.dumps([asdict(f) for f in flags], indent=2))
    print(f"Structured leads written to {out_path}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Market Trend Watcher prototype")
    parser.add_argument("--live", action="store_true", help="Hit the real Kalshi API")
    args = parser.parse_args()
    run("live" if args.live else "demo")
