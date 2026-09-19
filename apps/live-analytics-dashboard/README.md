# DevPulse: Live Telemetry & Observability Matrix

An over-engineered, real-time developer and systems observability command center. DevPulse fuses deep GitHub developer intelligence, client Web Vitals and 60Hz canvas render telemetry, global edge latency benchmark probes, NPM ecosystem analytics, live Hacker News tech pulse, and synthetic traffic simulation into a high-contrast cyber-HUD interface with procedural Web Audio effects.

## Telemetry Modules & Data Sources

### 1. GitHub Deep Intelligence & Starred Showcase
- **Profile & Reach**: Public repos, followers, following ratio, total accumulated stars, total forks, account age in days.
- **Starred & Top Repositories Showcase**: Dual sub-tabs displaying top user repositories and repositories starred by the user on GitHub with direct links, star counts, fork badges, language tags, descriptions, and live demo links.
- **Real-Time Repo Search**: Client-side filtering by repository name, description, or programming language.
- **Activity Streaks**: Current streak & record streak calculated from public event timeline with UTC calendar normalization across all contribution event types.
- **Commit Velocity Index**: `7d avg pushes / 30d avg pushes` ratio with momentum indicators (`ACCELERATING`, `CRUISING`, `DECELERATING`).
- **7x24 Activity Punchcard**: Hourly commit/push heatmap grid across all 7 days of the week.
- **Language Stack Donut**: Interactive SVG donut chart showing language distribution across top repositories.
- **Event Type Breakdown**: Categorization of Push, PullRequest, Issues, Create, Release, and Comment events.

### 2. Developer News & Tech Pulse Hub
- **Expanded Hacker News Feed**: Up to 12 real-time developer stories with upvote score badges, domain indicators, author details, relative timestamps, and direct links to both the story and HN discussion threads.
- **News Category Filtering**: Instant switching between **Top Stories**, **Show HN** prototypes, and **Ask HN** developer discussions.

### 3. Dedicated Diagnostics & Global Edge Network Deck
- **60Hz/120Hz Canvas FPS Oscilloscope**: Real-time waveform rendering tracking frame durations, average FPS, and dropped frames.
- **Navigation Timing Latency Waterfall**: High-precision breakdown of DNS lookup, TCP connect, TTFB (Time to First Byte), DOMContentLoaded, and Total Page Load latency.
- **Global Edge Latency Matrix**: Real-time round-trip HTTP ping probes to global CDN endpoints (Cloudflare Anycast, GitHub API Edge, Google Multi-Region DNS, Fastly CDN) with jitter computation and fastest node detection.
- **Hardware & Network Telemetry**: Logical CPU cores (`navigator.hardwareConcurrency`), Device Memory (`navigator.deviceMemory`), Network Downlink speed, RTT, and DOM node count.
- **NPM Package Intelligence**: 30-day download counts via `api.npmjs.org`, package versions, and license data.
- **Web Analytics & Synthetic Traffic**: Plausible Stats API integration with automatic synthetic simulation fallback when no token is provided.
- **Telemetry Event Log**: Real-time chronological console feed with clear functionality.

### 5. UI, Sensory FX & Productivity
- **5 Cyber Themes**: Cyber Neon, Deep Nebula, Solar Flare, Matrix Obsidian, and Hyper Frost.
- **Web Audio API Synthesizer**: Procedural sci-fi UI sound effects (blips, chimes, radar sweeps, with persistent mute control).
- **CRT Scanlines Mode**: Toggleable retro CRT monitor scanline and raster overlay.
- **Auto-Stream Polling**: Continuous live polling (15s, 30s, 60s) with status indicators.
- **Snapshot Export & URL Sync**: Export captured telemetry as JSON or CSV; shareable URLs sync username, package, and theme in query parameters (`?user=torvalds&theme=cyber-neon`).

## Local Proxy (CORS-safe)

The app includes an optional Node proxy at `proxy/server.mjs` that exposes `POST /api/plausible` and serves the dashboard:

1. Start proxy server from this app folder:
	- `cd apps/live-analytics-dashboard/proxy`
	- `PLAUSIBLE_API_KEY=your_token_here npm start`
2. Open `http://localhost:4173/`
3. In the dashboard controls:
	- Enable `Use Local Plausible Proxy`
	- Set `Plausible Site ID`
	- Keep API key input empty (key is read from server env)
