# Project Playbook

Maintenance guide for this portfolio repository.

## Architecture

- Modern UI: `index.html` + `v1/script.js`
- Classic terminal UI: `index-classic.html` + `v0/script.js`
- Shared project catalog: `projects.js` (loaded by both UIs)
- Shared resume parser: `resource/resume-common.js`
- Mini-apps: `apps/<slug>/`

The site is static and served from the repository root, so keep every path relative.

## Naming

App folders are lowercase kebab-case: `apps/aim-trainer`, `apps/natural-selection-sim`. Avoid `apps/NaturalSelectionSim` or `apps/vector01`.

## Adding a project

1. Create `apps/<slug>/index.html`; keep its assets in the same folder.
2. Choose a [Lucide](https://lucide.dev/icons) icon. If it is not already in `projectIcons` at the bottom of `projects.js`, paste its inner SVG markup there.
3. Add an object to the `projects` array in `projects.js` with:
   - `name`, `category`, `description`
   - `icon` — a key of `projectIcons` (colour comes from each UI's CSS; never hardcode it)
   - `link` — usually `apps/<slug>/index.html`
   - `tech` — array of strings
4. Add a row to the featured table in `README.md` if the app is worth highlighting.
5. Open `index.html`, `index-classic.html` and the new app link to confirm everything loads.

## Dependency map

Project catalog:

- `index.html` and `index-classic.html` both load `projects.js`
- `v1/script.js` renders `#projectContainer` from it

Resume:

- Markdown source: `resource/RESUME.md`
- PDF: `resource/pdf/Preetam_resume_2026.pdf`
- Parser: `resource/resume-common.js`
- Used by `index.html` (PDF links), `index-classic.html` (Markdown and PDF links), `v0/script.js` (terminal file map) and `v1/script.js` (`loadResumeData('resource/RESUME.md')`)

## Updating the resume

- **Text:** edit `resource/RESUME.md`, keeping the heading and bullet structure so the parser still reads it.
- **PDF, same filename:** replace `resource/pdf/Preetam_resume_2026.pdf`; nothing else changes.
- **PDF, new filename:** update every reference in `index.html`, `index-classic.html` and `v0/script.js`, and in any docs.

## Validation

List app folders:

```bash
find apps -maxdepth 1 -mindepth 1 -type d | sort
```

Find mixed-case app paths:

```bash
grep -RInE "apps/[A-Z]" --include=*.html --include=*.js --include=*.md .
```

Check resume references:

```bash
grep -RInE "Preetam_resume_2026.pdf|resource/RESUME.md" index.html index-classic.html v0/script.js v1/script.js
```

Formatting (tabs):

```bash
npx prettier@latest --check "**/*.{html,css,js}" --use-tabs
```

## Deployment

Pushes to `main` redeploy via GitHub Pages at `preetamhegde.in` (see `CNAME`). After a deploy, hard-refresh the live site to rule out cache issues.
