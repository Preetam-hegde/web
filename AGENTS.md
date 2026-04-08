# Repository Guidelines

## Project Structure & Module Organization
- Root portfolios: `index.html` (modern UI, scripts in `v1/`) and `index-classic.html` (terminal UI, scripts in `v0/`). Both consume the shared catalog in `projects.js`.
- Mini-projects live in `apps/<project-slug>/` with self-contained HTML/CSS/JS. Keep assets local to app unless shared.
- Shared assets and resume data live under `resource/` (`Image/`, `pdf/`, `RESUME.md`, and `resume-common.js`). Update both UIs if you change file names.
- External integrations should load via per-app scripts inside `apps/<project-slug>/`; keep the root static for GitHub Pages.

## Build, Test, and Development Commands
- Serve locally with `python3 -m http.server 4173` (or `npx http-server .`) and open `http://localhost:4173/index.html`.
- Quick sanity checks from the playbook:
  - `find apps -maxdepth 1 -mindepth 1 -type d | sort` verifies app folders stay kebab-case.
  - `grep -RIn "Preetam_resume_2026.pdf|resource/RESUME.md" index.html index-classic.html v0/script.js v1/script.js` keeps resume paths in sync.
- For linting, run `npx prettier@latest --check "**/*.{html,css,js}" --use-tabs` before opening a PR.

## Coding Style & Naming Conventions
- Preserve tab-based indentation used across HTML, CSS, and JS; avoid auto-formatters that reflow to spaces.
- Prefer descriptive, verb-led function names in JS (`renderModernProjects`, `applyProjectCardTilt`). Keep modules in strict mode with `'use strict';` at the top.
- Component classes in CSS use lower-case hyphenated names; match existing naming when adding blocks.
- App directories must remain lowercase kebab-case (see `apps/aim-trainer`, `apps/natural-selection-sim`).

## Testing Guidelines
- Manual QA: confirm both `index.html` and `index-classic.html` render, switch themes, load resume content, and open each project card.
- For new apps, smoke-test the route (`apps/<slug>/index.html`) in Chromium and Firefox; capture console output for regressions.
- Validate `projects.js` links while the local server runs; watch for slow embeds.

## Commit & Pull Request Guidelines
- Follow Conventional Commits where practical (`feat(aim-trainer): …`, `fix: …`, `docs: …`). Group related asset updates with the code that references them.
- Every PR should include: summary of changes, screenshots for UI updates, a checklist of manual tests run, and links to any GitHub issue or roadmap item.
- Rebase before requesting review, and ensure CI/preview steps (local server + formatter) pass.

## Deployment & Hosting
- The site is served via GitHub Pages from the `main` branch at `https://preetam-hegde.github.io/web/`. Pushes to `main` redeploy automatically.
- Keep assets on relative paths so Pages resolves them; double-check new app links use `apps/<project-slug>/index.html`.
- After merging, rerun the local server to spot cache issues, then hard-refresh the live site.
