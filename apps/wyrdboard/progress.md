Wyrdboard (formerly Lost Rules). Redesigned 2026-11-10.

Changes from the first build:
- Renamed to Wyrdboard. A first dark rune-night restyle was rejected as generic, so the original warm limestone, charcoal board and gold look was restored (shell/onyx, rosettes, Ur and Senet, Champollion ranks). Folder is apps/wyrdboard; storage key is wyrdboard-v1 (fresh start, old progress is not migrated).
- Rule space grew from 1,152 to 3,500: leap, approach, heart, warp and pair join the five slots. Puzzles were regenerated and verified against the new engine.
- Puzzle data moved into month folders: data/YYYY-MM/YYYY-MM-DD.json, plus data/index.json.
- UI rebuilt around a four-stage path (observe, test, deduce, inscribe) with a coach bar, a clarity ring, and an optional Foresight prediction step.
- First-time tour: eight spotlight steps, shown once (`tour` flag in wyrdboard-v1), replayable from the help dialog; phones highlight the field-notes bar.
- Layout: desktop windows fit one screen with no page scroll (checked at 1024x768, 1280x720, 1366x640, 1440x900 and 1920x1080); the result is a full-window overlay; phones keep a stacked page.
- Rewards and records are derived from saved runs (src/records.ts): ranks, stars, XP, levels, 13 badges, streaks (same-day solves only), a Museum with history, JSON export and import.
- The Playwright smoke script was removed because its selectors targeted the old DOM and playwright-cli is not installed here.

Not done: automated browser test, human playtest, name clearance, commit, push, deployment. TypeScript came from ~/node_modules (4.9.5); the npm registry was not reachable for a fresh install.
