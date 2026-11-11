# Faceoff: play experience and game architecture

User request: make the UI more impressive and enjoyable to play, and make the code modular, maintainable, and easy to extend and test.

## Direction

Latest direction from the user supersedes the initial request to keep the current look: remove the generated-looking neon/aurora treatment and give every game a more deliberate, refined interface. Use matte near-black surfaces, warm-white typography, fine borders, restrained orange/teal player ownership, and clear control states. No new player-facing theme settings are needed.

Timer games use large tabular readouts with explicit tap/hold/release instructions. Rhythm games use a fixed metronome marker and numbered beat record. Size Match separates observing from rebuilding. Colour Match and Recall use labelled RGB sliders with live values; never expose the target RGB. Board, reflex, perception and party games share the quieter treatment with layouts tailored to their controls. Motion must never delay a timed input or disclose a hidden interval. Respect reduced motion, muted sound, safe areas, touch targets, and small screens.

## Boundaries

Keep all 37 games, 10 party games, solo/split/pass/room modes, saved history and settings, relative GitHub Pages paths, and offline play. No framework, build step, new game, account system, or backend is needed.

## Structure

- A validated registry owns registration, categories, unique IDs, and mode eligibility.
- One manifest owns ordered scripts and the asset version; both the app loader and service worker use it.
- Game packs run in private scopes. Shared game UI helpers and pure scoring/board/geometry rules have explicit homes rather than living in another game pack.
- The match engine owns lifecycle and scores. A small round scope cancels timers, animation frames, and registered listeners when a turn ends. Audio and result-card rendering are separate from content/icons.
- Existing static delivery and engine callbacks stay compatible. New games register through a documented contract; a new file is added to one manifest, not page and cache lists separately.
- CSS is divided by shell, game controls, and party screens, with a single theme/token layer with ownership for theme and responsive overrides.

## Validation

Use the existing 200 browser checks, two-page transport checks, and Node regressions as the baseline. Add registry, manifest/loading, pure-rules, and lifecycle unit tests. Capture lobby, library, ready, gameplay, party and result screens at phone and desktop sizes; check touch controls, reduced motion and keyboard focus. Public PeerJS connectivity and physical-device speaker quality remain separate manual checks.
