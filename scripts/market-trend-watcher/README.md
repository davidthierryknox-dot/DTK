# Market Trend Watcher

Polls prediction-market data (Kalshi, or a bundled synthetic feed), flags
meaningful trend changes between snapshots, and drafts headline/lead
candidates from the flagged moves.

- `market_trend_watcher.py` — the original single-cycle prototype. Run it
  directly for a one-shot poll + printout:

  ```bash
  python3 market_trend_watcher.py            # demo data, no setup needed
  python3 market_trend_watcher.py --live      # real Kalshi API
  ```

  Each run compares against `snapshot_store.json` from the previous run and
  writes flagged leads to `leads_output.json`.

- `dashboard_server.py` — a live, auto-refreshing web dashboard built on top
  of the same detection pipeline. It polls on a background timer, keeps a
  rolling feed of drafted headlines, and serves everything over plain HTTP
  (stdlib only — no extra dependencies beyond `requests`, which the watcher
  itself already needs for `--live` mode).

  ```bash
  python3 dashboard_server.py                 # demo data, polls every 12s
  python3 dashboard_server.py --live           # real Kalshi API
  python3 dashboard_server.py --interval 30 --port 8080
  ```

  Then open `http://127.0.0.1:8787/` (or your chosen `--port`). The page
  shows a news-wire style headline feed (newest first, tagged by trigger
  type: new listing, probability move, volume spike, 50% crossing,
  near-certain crossing) alongside a live board of every tracked market's
  current implied probability and volume. It re-fetches `/api/state` every
  few seconds and shows a "next poll in Ns" countdown.

  Note: Kalshi's public market-listing endpoint currently returns `401` for
  unauthenticated requests, matching the warning already in the prototype's
  docstring. `--live` mode will surface that error in the dashboard (a red
  banner) and fall back to demo data for that cycle rather than stalling, so
  the dashboard stays usable while you wire up real Kalshi auth
  (`KALSHI_API_KEY_ID` / request signing) separately.
