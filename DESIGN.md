# Design notes: home page

Short design brief for `index.html` + `v1/home.css`, in the spirit of a DESIGN.md. Read it before changing the look.

## Atmosphere
A flat poster hero with one large illustrated portrait and the name set huge. Its colour follows the visitor's local time: red during the day, blue overnight. Below it, warm paper for the personal introduction, an open dark surface for experience and projects, and paper again for contact. Large type and project imagery carry the page; avoid repeated panels, coloured outlines, and technology badges.

## Colour
| Name | Hex | Use |
|---|---|---|
| field, day | `#ef624c` | hero and accents from 06:00 to 17:59, visitor's local time |
| field, night | `#7da0ed` | hero and accents from 18:00 to 05:59; also the no-JavaScript fallback |
| ink | `#14100f` | text and buttons on the colour field |
| lacquer | `#14100f` | dark sections (same as ink) |
| lacquer-soft | `#1c1715` | alternate dark sections |
| paper | `#f1e8d8` | text on dark, introduction and contact backgrounds |
| accent | current field | hero, focus indicators and back-to-top control |

The small inline theme script runs before the stylesheet to avoid a wrong-colour flash, checks once a minute, and updates immediately when a hidden tab becomes visible. The browser's theme colour follows the hero. The shared 404 page retains its yellow field.

## Typography
- Fraunces 600 for the name and headings. DM Sans for all body text, labels, buttons and nav. DM Mono only for the 404 terminal.
- Hero copy is sentence case. No tracked all-caps labels, no italic accent word, no middle-dot strings, no arrows on buttons, no big-number stat strip.

## Hero rules
- Switch to compact navigation at 860px. Keep links on one line and reserve a gap beside the logo.
- Open with the most characteristic element: the portrait (`resource/Image/loom/portrait-cutout.webp`, a transparent WebP cut from `loom-portrait-v1.jpg`).
- Copy formula: role and place, one sentence on what you build, two specific verbs for actions, one plain proof sentence.
- The name sits behind the portrait in z-order; keep their boxes from overlapping so no letter is hidden.
- Mobile order is copy, name, portrait (flex `order`), with the portrait flush to the hero's bottom edge.

## Performance rules
- Animate only `transform` and `opacity`. No `mix-blend-mode`, `filter`, `backdrop-filter`, `will-change`, canvas or infinite loops.
- Scroll motion is CSS scroll-driven animation inside `@supports (animation-timeline: view())`; without support, everything simply shows.
- Hero image under 200 KB, explicit `width`/`height`, `fetchpriority="high"`. All other images `loading="lazy"` (set `loading` before `src` when created in JS).
- Respect `prefers-reduced-motion` (a global rule at the end of `home.css` disables animation).

## Repo rules (from AGENTS.md)
Tabs for indentation, `'use strict'` in JS, lowercase hyphenated class names, kebab-case app folders, relative paths only, images under `resource/Image/`.

## Motion
- Hero entrance, scroll progress, back-to-top, reveals and the introduction's two opposing text movements are CSS and compositor-only. Text movement follows scrolling, with no automatic loop. The 404 terminal uncovers its lines on load.
- Reveals are limited to section headings and lead blocks; do not fade every card.
- Press feedback (`:active`), copy-button pop, image fade-in on load and filter view transitions are the small quality-of-life touches.

## Below the hero
- Introduction: one oversized two-line statement, followed by personal copy with links to real experiments. No illustrative code or capability tiles.
- Experience: a sticky heading alongside the roles on desktop; a single column on mobile. Toolkit and education remain plain text, without an enclosing panel.
- Selected work: alternating wide image/text pairs, with unboxed technology names. Stack image before text on mobile.
- Playground: a filterable list with small landscape previews, titles and short descriptions. Keep every project reachable by keyboard and touch.
- Contact: large type and direct contact details on paper; no dark contact card.

## Guidance sources
Anthropic `frontend-design` SKILL.md, Vercel `web-interface-guidelines`, and the DESIGN.md format from VoltAgent `awesome-design-md`.
