"""
Market Trend Watcher — live dashboard

Runs the polling pipeline from market_trend_watcher.py on a background timer
and serves a self-refreshing HTML dashboard of the drafted headlines plus the
current state of every tracked market. Pure standard library (http.server +
threading) — no extra dependencies beyond `requests`, which the watcher
itself already needs for --live mode.

Usage:
  python3 dashboard_server.py                  # demo data, polls every 12s
  python3 dashboard_server.py --live            # real Kalshi API
  python3 dashboard_server.py --interval 30     # custom poll interval (sec)
  python3 dashboard_server.py --port 8080
"""

import argparse
import json
import threading
import time
from dataclasses import asdict
from datetime import datetime, timezone
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

import market_trend_watcher as watcher

MAX_FEED_ITEMS = 60


class DashboardState:
    def __init__(self, mode: str):
        self.mode = mode
        self.lock = threading.Lock()
        self.markets: dict[str, watcher.MarketSnapshot] = {}
        self.feed: list[dict] = []
        self.cycle = 0
        self.last_poll: str | None = None
        self.status = "starting"
        self.error: str | None = None
        self.source = "demo" if mode == "demo" else "live"

    def snapshot(self) -> dict:
        with self.lock:
            markets = sorted(
                (asdict(m) for m in self.markets.values()),
                key=lambda m: m["title"],
            )
            return {
                "mode": self.mode,
                "source": self.source,
                "cycle": self.cycle,
                "last_poll": self.last_poll,
                "status": self.status,
                "error": self.error,
                "markets": markets,
                "feed": list(self.feed),
            }

    def record_cycle(self, current: list, flags: list, source: str, error: str | None):
        with self.lock:
            self.cycle += 1
            self.last_poll = datetime.now(timezone.utc).isoformat()
            self.source = source
            self.error = error
            self.status = "error" if error else "ok"

            if current:
                self.markets = {s.ticker: s for s in current}

            detected_at = self.last_poll
            for f in flags:
                item = asdict(f)
                item["detected_at"] = detected_at
                item["cycle"] = self.cycle
                item["score"] = round(watcher.score_flag(f), 1)
                self.feed.insert(0, item)

            del self.feed[MAX_FEED_ITEMS:]


def run_cycle(state: DashboardState, mode: str):
    previous = dict(state.markets)

    if mode == "demo":
        current = watcher.fetch_demo_markets(seed_offset=state.cycle)
        state.record_cycle(current, watcher.detect_trends(current, previous), "demo", None)
        return

    try:
        client = watcher.KalshiClient()
        current = client.fetch_open_markets()
        flags = watcher.detect_trends(current, previous)
        flags.sort(key=watcher.score_flag, reverse=True)
        state.record_cycle(current, flags, "live", None)
    except Exception as exc:  # network / auth failures from the real API
        # Fall back to demo data for this cycle so the dashboard keeps moving,
        # while surfacing the real error prominently in the UI.
        current = watcher.fetch_demo_markets(seed_offset=state.cycle)
        flags = watcher.detect_trends(current, previous)
        flags.sort(key=watcher.score_flag, reverse=True)
        state.record_cycle(current, flags, "demo (live fetch failed)", str(exc))


def poll_loop(state: DashboardState, mode: str, interval: float, stop_event: threading.Event):
    while not stop_event.is_set():
        try:
            run_cycle(state, mode)
        except Exception as exc:
            with state.lock:
                state.status = "error"
                state.error = f"poll loop crashed: {exc}"
        stop_event.wait(interval)


PAGE_TEMPLATE = """<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Market Trend Watcher — Live Headlines</title>
<style>
  :root {
    color-scheme: light dark;
    --bg: #0b0c10;
    --panel: #14161c;
    --panel-border: #262a34;
    --text: #e8e9ec;
    --muted: #8b90a0;
    --accent: #ff5a3c;
    --up: #35c471;
    --down: #ff5a5a;
    --badge-bg: #1f2230;
  }
  * { box-sizing: border-box; }
  body {
    margin: 0;
    background: var(--bg);
    color: var(--text);
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif;
  }
  header {
    padding: 20px 28px 16px;
    border-bottom: 1px solid var(--panel-border);
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 10px;
  }
  header h1 {
    margin: 0;
    font-size: 20px;
    letter-spacing: 0.02em;
  }
  header h1 span { color: var(--accent); }
  #status-line {
    font-size: 13px;
    color: var(--muted);
    display: flex;
    gap: 14px;
    align-items: center;
    flex-wrap: wrap;
  }
  .pill {
    padding: 3px 10px;
    border-radius: 999px;
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    background: var(--badge-bg);
    border: 1px solid var(--panel-border);
  }
  .pill.live { color: var(--up); border-color: var(--up); }
  .pill.demo { color: #ffb454; border-color: #ffb454; }
  .pill.error { color: var(--down); border-color: var(--down); }
  main {
    display: grid;
    grid-template-columns: minmax(0, 2fr) minmax(280px, 1fr);
    gap: 0;
    max-width: 1280px;
    margin: 0 auto;
  }
  @media (max-width: 860px) {
    main { grid-template-columns: 1fr; }
  }
  section { padding: 20px 28px; }
  #feed-col { border-right: 1px solid var(--panel-border); }
  h2 {
    font-size: 12px;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: var(--muted);
    margin: 0 0 14px;
  }
  .error-banner {
    display: none;
    background: #2a1414;
    border: 1px solid var(--down);
    color: #ffb4b4;
    padding: 10px 14px;
    border-radius: 8px;
    font-size: 13px;
    margin-bottom: 16px;
  }
  .card {
    background: var(--panel);
    border: 1px solid var(--panel-border);
    border-radius: 10px;
    padding: 14px 16px;
    margin-bottom: 12px;
    animation: fadein 0.4s ease;
  }
  @keyframes fadein {
    from { opacity: 0; transform: translateY(-4px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .card-top {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 10px;
    margin-bottom: 6px;
  }
  .trigger-badge {
    font-size: 10px;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    font-weight: 700;
    padding: 2px 8px;
    border-radius: 999px;
    background: var(--badge-bg);
    color: var(--accent);
    white-space: nowrap;
  }
  .card-time { font-size: 11px; color: var(--muted); }
  .headline { font-size: 15px; font-weight: 600; margin: 4px 0 4px; }
  .lead { font-size: 13px; color: var(--muted); line-height: 1.45; margin: 0 0 8px; }
  .move-row {
    font-size: 12px;
    color: var(--muted);
    display: flex;
    gap: 12px;
  }
  .move-row .up { color: var(--up); }
  .move-row .down { color: var(--down); }
  #markets-list { display: flex; flex-direction: column; gap: 8px; }
  .market-row {
    background: var(--panel);
    border: 1px solid var(--panel-border);
    border-radius: 8px;
    padding: 10px 12px;
    font-size: 13px;
  }
  .market-row .m-title { font-weight: 600; margin-bottom: 4px; }
  .market-row .m-meta {
    display: flex;
    justify-content: space-between;
    color: var(--muted);
    font-size: 12px;
  }
  .prob-bar {
    height: 4px;
    background: var(--badge-bg);
    border-radius: 2px;
    margin: 6px 0;
    overflow: hidden;
  }
  .prob-bar-fill { height: 100%; background: var(--accent); }
  #empty-feed { color: var(--muted); font-size: 13px; }
  footer {
    padding: 16px 28px 30px;
    color: var(--muted);
    font-size: 11px;
    text-align: center;
  }
</style>
</head>
<body>
<header>
  <h1>Market Trend <span>Watcher</span> — Live Headlines</h1>
  <div id="status-line">
    <span class="pill" id="mode-pill">…</span>
    <span id="cycle-count"></span>
    <span id="last-poll"></span>
    <span id="next-poll"></span>
  </div>
</header>
<main>
  <section id="feed-col">
    <h2>Headline Feed</h2>
    <div class="error-banner" id="error-banner"></div>
    <div id="feed"><div id="empty-feed">Waiting for first poll…</div></div>
  </section>
  <section id="markets-col">
    <h2>Tracked Markets</h2>
    <div id="markets-list"></div>
  </section>
</main>
<footer>Polling every __INTERVAL__s · data source: __SOURCE_LABEL__ · Market Trend Watcher prototype</footer>
<script>
const POLL_INTERVAL = __INTERVAL__;
let nextPollAt = Date.now() + POLL_INTERVAL * 1000;

function timeAgo(iso) {
  if (!iso) return "";
  const secs = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 1000));
  if (secs < 5) return "just now";
  if (secs < 60) return secs + "s ago";
  return Math.round(secs / 60) + "m ago";
}

function triggerLabel(t) {
  return t.replaceAll("_", " ");
}

function render(data) {
  const modePill = document.getElementById("mode-pill");
  modePill.textContent = data.source;
  modePill.className = "pill " + (data.error ? "error" : (data.source.startsWith("live") ? "live" : "demo"));

  document.getElementById("cycle-count").textContent = "cycle #" + data.cycle;
  document.getElementById("last-poll").textContent = data.last_poll ? ("updated " + timeAgo(data.last_poll)) : "";

  const banner = document.getElementById("error-banner");
  if (data.error) {
    banner.style.display = "block";
    banner.textContent = "Live fetch failed, showing demo data instead: " + data.error;
  } else {
    banner.style.display = "none";
  }

  const feedEl = document.getElementById("feed");
  if (!data.feed.length) {
    feedEl.innerHTML = '<div id="empty-feed">No trend flags yet — waiting for the next poll…</div>';
  } else {
    feedEl.innerHTML = data.feed.map(f => {
      const moveHtml = (f.prev_prob !== null && f.prev_prob !== undefined)
        ? `<div class="move-row"><span class="${f.delta_pts >= 0 ? 'up' : 'down'}">${f.prev_prob.toFixed(0)}% → ${f.new_prob.toFixed(0)}%</span><span>vol ${f.volume.toLocaleString()}</span></div>`
        : `<div class="move-row"><span>opening at ${f.new_prob.toFixed(0)}%</span><span>vol ${f.volume.toLocaleString()}</span></div>`;
      return `<div class="card">
        <div class="card-top">
          <span class="trigger-badge">${triggerLabel(f.trigger)}</span>
          <span class="card-time">${timeAgo(f.detected_at)}</span>
        </div>
        <div class="headline">${f.headline_draft}</div>
        <div class="lead">${f.lead_draft}</div>
        ${moveHtml}
      </div>`;
    }).join("");
  }

  const marketsEl = document.getElementById("markets-list");
  marketsEl.innerHTML = data.markets.map(m => `
    <div class="market-row">
      <div class="m-title">${m.title}</div>
      <div class="prob-bar"><div class="prob-bar-fill" style="width:${m.yes_prob}%"></div></div>
      <div class="m-meta"><span>${m.yes_prob.toFixed(0)}% yes</span><span>vol ${m.volume.toLocaleString()}</span></div>
    </div>
  `).join("");
}

async function poll() {
  try {
    const resp = await fetch("/api/state");
    const data = await resp.json();
    render(data);
    nextPollAt = Date.now() + POLL_INTERVAL * 1000;
  } catch (e) {
    console.error("state fetch failed", e);
  }
}

function tickCountdown() {
  const secs = Math.max(0, Math.round((nextPollAt - Date.now()) / 1000));
  document.getElementById("next-poll").textContent = "next poll in " + secs + "s";
}

poll();
setInterval(poll, 4000);
setInterval(tickCountdown, 1000);
</script>
</body>
</html>
"""


def make_handler(state: DashboardState, interval: float):
    page = PAGE_TEMPLATE.replace("__INTERVAL__", str(int(interval))).replace(
        "__SOURCE_LABEL__", "Kalshi (live)" if state.mode == "live" else "synthetic demo feed"
    )

    class Handler(BaseHTTPRequestHandler):
        def log_message(self, fmt, *args):
            pass  # keep stdout clean; poll loop already prints cycle info

        def do_GET(self):
            if self.path.startswith("/api/state"):
                body = json.dumps(state.snapshot()).encode()
                self.send_response(200)
                self.send_header("Content-Type", "application/json")
                self.send_header("Content-Length", str(len(body)))
                self.end_headers()
                self.wfile.write(body)
            elif self.path in ("/", "/index.html"):
                body = page.encode()
                self.send_response(200)
                self.send_header("Content-Type", "text/html; charset=utf-8")
                self.send_header("Content-Length", str(len(body)))
                self.end_headers()
                self.wfile.write(body)
            else:
                self.send_response(404)
                self.end_headers()

    return Handler


def main():
    parser = argparse.ArgumentParser(description="Market Trend Watcher — live headline dashboard")
    parser.add_argument("--live", action="store_true", help="Poll the real Kalshi API instead of demo data")
    parser.add_argument("--interval", type=float, default=12.0, help="Seconds between polls (default: 12)")
    parser.add_argument("--port", type=int, default=8787, help="HTTP port (default: 8787)")
    parser.add_argument("--host", default="127.0.0.1", help="Bind host (default: 127.0.0.1)")
    args = parser.parse_args()

    mode = "live" if args.live else "demo"
    state = DashboardState(mode)

    # First cycle synchronously so the dashboard has data the instant it's served.
    run_cycle(state, mode)

    stop_event = threading.Event()
    poller = threading.Thread(
        target=poll_loop, args=(state, mode, args.interval, stop_event), daemon=True
    )
    poller.start()

    handler = make_handler(state, args.interval)
    server = ThreadingHTTPServer((args.host, args.port), handler)
    print(f"Market Trend Watcher dashboard running at http://{args.host}:{args.port}  (mode={mode}, interval={args.interval}s)")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        stop_event.set()
        server.shutdown()


if __name__ == "__main__":
    main()
