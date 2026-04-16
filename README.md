# Preetam Hegde — Portfolio

[Live Site](https://preetamhegde.in) · [Modern UI](https://preetamhegde.in/index.html) · [Classic UI](https://preetamhegde.in/index-classic.html)

This repository powers my interactive portfolio at [preetamhegde.in](https://preetamhegde.in). It includes two portfolio shells and a growing collection of self-contained mini-apps covering games, simulations, visualizers, and developer utilities.

Maintainer workflow details live in [PROJECT_PLAYBOOK.md](PROJECT_PLAYBOOK.md).

## Highlights
- Dual experience: modern interface plus terminal-inspired classic interface
- Shared project catalog and resume content across both shells
- Self-contained app folders under [apps](apps) for straightforward iteration
- Static hosting on a custom domain (preetamhegde.in)

## Featured Apps
| App | What it is | Live |
|---|---|---|
| Inkwell Editorial | Full-stack editorial blog with AI-assisted writing, Supabase backend, and admin analytics | [Open](https://inkwell.preetamhegde.in) |
| System Design Prototype | Interactive whiteboard for sketching distributed architectures with exportable diagrams | [Open](https://sysdesign.preetamhegde.in) |
| Bharatvarsha | Strategy simulation set in the Vedic era with economy, events, and progression | [Open](https://preetamhegde.in/apps/bharatvarsha/index.html) |
| Reflex Arena | Browser FPS aim trainer with accuracy and session metrics | [Open](https://preetamhegde.in/apps/aim-trainer/index.html) |
| Live Analytics Dashboard | Animated KPI dashboard with GitHub telemetry and optional Plausible data | [Open](https://preetamhegde.in/apps/live-analytics-dashboard/index.html) |
| Game of Life | Interactive Conway simulation with pattern experimentation | [Open](https://preetamhegde.in/apps/cellular-automata/index.html) |
| Nine Dimension | Physics and vector playground with multiple interactive panels | [Open](https://preetamhegde.in/apps/nine-dimension/index.html) |
| Sorting Visualizer | Step-by-step sorting algorithm visual learning tool | [Open](https://preetamhegde.in/apps/analyser/index.html) |
| GeoLocation Explorer | Coordinate and location utility powered by Geolocation API | [Open](https://preetamhegde.in/apps/geo-location/index.html) |
| Random Quote Generator | Quote fetch and share utility with smooth interactions | [Open](https://preetamhegde.in/apps/quote/index.html) |

For the complete app list and metadata, see [projects.js](projects.js).

## Project Layout
- [index.html](index.html): modern portfolio shell
- [index-classic.html](index-classic.html): terminal/classic shell
- [projects.js](projects.js): shared app catalog for portfolio views
- [apps](apps): individual mini-projects
- [resource](resource): shared assets and resume content

## Run Locally
1. From the repository root, start a static server:
```bash
python3 -m http.server 4173
```
2. Open [http://localhost:4173/index.html](http://localhost:4173/index.html)

Alternative:
```bash
npx http-server .
```

## Development Notes
- Keep app entry points at `apps/<slug>/index.html`
- Prefer app-local assets unless they are truly shared
- Keep resume path references in sync across both shells
- Use [AGENTS.md](AGENTS.md) and [PROJECT_PLAYBOOK.md](PROJECT_PLAYBOOK.md) for contributor and automation guidance

## External Experiments
- Dear Diary is intentionally external to this repository: [ptwo-diary](https://sites.google.com/view/ptwo-diary)

## Contact
- Site: [preetamhegde.in](https://preetamhegde.in)
- GitHub: [preetam-hegde](https://github.com/preetam-hegde)
- LinkedIn: [preetam-hegde-8b53311a7](https://www.linkedin.com/in/preetam-hegde-8b53311a7/)
