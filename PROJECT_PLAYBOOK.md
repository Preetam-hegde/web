# Project Playbook (AI + Developer Guide)

This file is the maintenance source of truth for this portfolio repository.

## 1. Quick Architecture

Two portfolio UIs are served from the same root:

- Modern portfolio: `index.html` + `v1/script.js`
- Classic terminal portfolio: `index-classic.html` + `v0/script.js`

Both portfolios load the same project catalog:

- `projects.js`

Both portfolios also load shared resume parsing logic:

- `resource/resume-common.js`

All mini-project apps live under:

- `apps/`

## 2. Naming Convention

Use lowercase kebab-case for app folders.

Examples:

- Good: `apps/aim-trainer`, `apps/natural-selection-sim`, `apps/vector-01`
- Avoid: `apps/NaturalSelectionSim`, `apps/vector01`, `apps/SomeProject`

## 3. Add A New Project (Required Steps)

1. Create a new app folder in `apps/`.
2. Add entry point file at `apps/<project-slug>/index.html`.
3. Add assets inside that app folder (prefer relative paths).
4. Add preview image under `resource/Image/`.
5. Add a new object to `projects.js` in the `projects` array.

Required fields in each `projects.js` item:

- `name`
- `category`
- `image` (usually `resource/Image/<file>.svg` or `.png`)
- `link` (usually `apps/<project-slug>/index.html`)
- `description`
- `tech` (array)

### Important Sync Note

You do not need separate project lists for modern/classic views.

Why: both `index.html` and `index-classic.html` load `projects.js`, so one update in `projects.js` reflects in both portfolios.

## 4. Linked Files Map (What Depends On What)

Project catalog linkage:

- `index.html` -> loads `projects.js`
- `index-classic.html` -> loads `projects.js`
- `v1/script.js` -> renders `#projectContainer` from `projects.js`

Resume linkage:

- Resume markdown source: `resource/RESUME.md`
- Resume pdf source: `resource/pdf/Preetam_resume_2026.pdf`
- Shared parser: `resource/resume-common.js`

Resume is linked/used in:

- `index.html` (direct pdf links)
- `index-classic.html` (markdown + pdf links)
- `v0/script.js` (terminal file map and loader paths)
- `v1/script.js` (calls `resumeCommon.loadResumeData('resource/RESUME.md')`)

## 5. How To Update Resume

### Update markdown resume

1. Edit `resource/RESUME.md`.
2. Verify sections still parse correctly (headings + bullet structure).

### Update pdf resume content only (same filename)

1. Replace `resource/pdf/Preetam_resume_2026.pdf`.
2. No path changes needed if filename remains the same.

### Update pdf resume filename

If the pdf filename changes, update every hardcoded reference:

- `index.html`
- `index-classic.html`
- `v0/script.js`

Also re-check any docs that mention the old filename.

## 6. Optional But Recommended When Adding Projects

1. Add/update project row in `README.md` project table.
2. Open both pages and verify:
	- `index.html`
	- `index-classic.html`
3. Open the new card link and confirm app loads.

## 7. Validation Commands (No rg Required)

Check app directories:

```bash
find apps -maxdepth 1 -mindepth 1 -type d | sort
```

Find stale mixed-case app paths:

```bash
grep -RInE "apps/[A-Z]|apps/.*[A-Z]" -- *.html *.js *.md apps/**/*.html apps/**/*.js apps/**/*.md 2>/dev/null || true
```

Find resume filename references:

```bash
grep -RIn "Preetam_resume_2026.pdf|resource/RESUME.md" index.html index-classic.html v0/script.js v1/script.js
```

