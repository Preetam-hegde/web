# Preetam Hegde — Portfolio

[Live site](https://preetamhegde.in) · [Modern UI](https://preetamhegde.in/index.html) · [Classic UI](https://preetamhegde.in/index-classic.html)

Source for [preetamhegde.in](https://preetamhegde.in): two portfolio front-ends (modern and terminal-style) plus a collection of self-contained mini-apps — games, simulations, visualizers and developer tools. Everything is static HTML/CSS/JS with no build step, hosted on GitHub Pages.

## Featured apps

| App | What it is |
|---|---|
| [Inkwell Editorial](https://inkwell.preetamhegde.in) | Full-stack editorial blog with AI-assisted writing, Supabase backend and admin analytics |
| [System Design Prototype](https://sysdesign.preetamhegde.in) | Whiteboard for sketching distributed architectures, with diagram export |
| [Bharatvarsha](apps/bharatvarsha/index.html) | Vedic-era strategy simulation with economy, events and progression |
| [Reflex Arena](apps/aim-trainer/index.html) | Three.js FPS aim trainer with accuracy and session analytics |
| [Keystorm](apps/keystorm/index.html) | Typing game with five modes and per-key analytics |
| [Faceoff](apps/faceoff/index.html) | Two-player duels on one phone: timing, hangman, couple games, shareable result card |
| [VectorDrift](apps/vectordrift/index.html) | Bullet-hell cursor-grazing game with post-run telemetry |
| [Particle Life](apps/particle-life/index.html) | Artificial life & emergent ecosystem with multi-species physics and sound synthesis |
| [DevPulse](apps/live-analytics-dashboard/index.html) | Real-time developer and systems telemetry dashboard |
| [GeoLocation Explorer](apps/geo-location/index.html) | Geolocation, IP/phone lookup, coordinate conversion and mapping |

The full list, with tech tags, lives in [projects.js](projects.js).

## Repository layout

| Path | Purpose |
|---|---|
| `index.html`, `v1/` | Modern portfolio and its scripts/styles |
| `index-classic.html`, `v0/` | Terminal-style portfolio and its scripts/styles |
| `projects.js` | Shared project catalog and icon set used by both UIs |
| `apps/<slug>/` | One folder per mini-app, entry point `index.html` |
| `resource/` | Resume (`RESUME.md`, `pdf/`), parser (`resume-common.js`) and images |

## Run locally

```bash
python3 -m http.server 4173
```

Then open <http://localhost:4173/index.html>. `npx http-server .` works too.

## Adding a project

1. Create `apps/<kebab-case-slug>/index.html` and keep its assets inside that folder, using relative paths.
2. Add an entry to the `projects` array in `projects.js` (`name`, `category`, `icon`, `link`, `description`, `tech`). Both UIs read it, so no second list is needed.
3. Open `index.html`, `index-classic.html` and the new app to check they load.

See [PROJECT_PLAYBOOK.md](PROJECT_PLAYBOOK.md) for details and [AGENTS.md](AGENTS.md) for contributor conventions.

## Contact

[preetamhegde.in](https://preetamhegde.in) · [GitHub](https://github.com/preetam-hegde) · [LinkedIn](https://www.linkedin.com/in/preetam-hegde-8b53311a7/)
