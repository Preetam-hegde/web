# Live Analytics Dashboard

A browser-based data visualization case study that combines:

- GitHub profile stats (public repos + followers)
- GitHub activity streaks from recent public events
- Commit velocity trend (`7d avg pushes / 30d avg pushes`)
- Optional Plausible aggregate pageview metrics (30-day period)

## Data Sources

- GitHub REST API
	- `GET /users/{username}`
	- `GET /users/{username}/events/public?per_page=100`
- Plausible Stats API
	- `GET /api/v1/stats/aggregate`

## Notes

- Plausible integration supports two modes:
	- Direct mode: requires `site_id` and API bearer token in the dashboard UI.
	- Proxy mode: set `Use Local Plausible Proxy`, provide only `site_id`, and run the local proxy with API key in env vars.
- Streak metrics are computed from sampled public events and are intended for dashboard visualization, not canonical contribution history.

## Local Proxy (CORS-safe)

The app includes a tiny Node proxy at `proxy/server.mjs` that exposes `POST /api/plausible` and serves this dashboard app.

1. Start proxy server from this app folder:
	- `cd apps/live-analytics-dashboard/proxy`
	- `PLAUSIBLE_API_KEY=your_token_here npm start`
2. Open `http://localhost:4173/`
3. In the dashboard controls:
	- Enable `Use Local Plausible Proxy`
	- Set `Plausible Site ID`
	- Keep API key input empty (key is read from server env)

Optional environment variables:

- `PORT` (default: `4173`)
- `PLAUSIBLE_ENDPOINT` (default: `https://plausible.io/api/v1/stats/aggregate`)
