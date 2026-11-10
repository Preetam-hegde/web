# Design notes: home page

Short design brief for `index.html` + `v1/home.css`, in the spirit of a DESIGN.md. Read it before changing the look.

## Atmosphere
A flat yellow poster hero with one large illustrated portrait and the name set huge, dark editorial sections in the middle, and the yellow returning for contact so the page is bookended. One memorable thing per screen; everything else stays quiet.

## Colour
| Name | Hex | Use |
|---|---|---|
| field | `#f2c230` | hero background |
| ink | `#14100f` | text and buttons on the yellow field |
| lacquer | `#14100f` | dark sections (same as ink) |
| lacquer-soft | `#1c1715` | alternate dark sections |
| paper | `#f1e8d8` | text on dark |
| accent | `#f2c230` | the same yellow as the field: links, rules, dots and buttons on dark |

## Typography
- Fraunces 600 for the name and headings. DM Sans for all body text, labels, buttons and nav. DM Mono only for code (the widget panel and the 404 terminal).
- Hero copy is sentence case. No tracked all-caps labels, no italic accent word, no middle-dot strings, no arrows on buttons, no big-number stat strip.

## Hero rules
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
- Hero entrance, scroll progress, back-to-top, heading rules, reveals and the code panel are all CSS and compositor-only. The code panel uncovers its lines like typing and grows the tile bars; on the home page it is scroll-linked (`.is-scroll`), on the 404 it plays on load.
- Reveals are limited to section headings and lead blocks; do not fade every card.
- Press feedback (`:active`), copy-button pop, image fade-in on load and filter view transitions are the small quality-of-life touches.

## Guidance sources
Anthropic `frontend-design` SKILL.md, Vercel `web-interface-guidelines`, and the DESIGN.md format from VoltAgent `awesome-design-md`.
