# DevPulse

Real-time developer and systems telemetry dashboard with a cyber-HUD interface.

## Modules

**GitHub intelligence**
- Profile reach (repos, followers, stars, forks, account age)
- Top and starred repositories with live search by name, description or language
- Activity streaks, commit velocity index (7-day vs 30-day pushes), 7×24 punchcard heatmap
- Language donut chart and event-type breakdown

**Developer news**
- Up to 12 Hacker News stories with scores, domains, authors and links to the discussion
- Switch between Top, Show HN and Ask HN

**Diagnostics and edge network**
- Canvas FPS oscilloscope with average FPS and dropped frames
- Navigation timing waterfall (DNS, TCP, TTFB, DOMContentLoaded, load)
- Round-trip latency probes to global CDN endpoints with jitter and fastest-node detection
- Hardware and network info (CPU cores, device memory, downlink, RTT, DOM node count)
- NPM package stats from `api.npmjs.org`
- Plausible web analytics, falling back to synthetic traffic when no token is set
- Event log console

**Experience**
- Five themes: Cyber Neon, Deep Nebula, Solar Flare, Matrix Obsidian, Hyper Frost
- Procedural UI sounds with mute, optional CRT scanline overlay
- Auto-polling every 15, 30 or 60 seconds
- JSON/CSV snapshot export; shareable URLs such as `?user=torvalds&theme=cyber-neon`

## Local Plausible proxy

An optional Node proxy in `proxy/server.mjs` serves the dashboard and exposes `POST /api/plausible`, keeping the API key server-side.

```bash
cd apps/live-analytics-dashboard/proxy
PLAUSIBLE_API_KEY=your_token_here npm start
```

Open <http://localhost:4173/>, enable **Use Local Plausible Proxy**, set the **Plausible Site ID** and leave the API key field empty.
