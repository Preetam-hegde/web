# Faceoff Cup and arcade additions Implementation Plan

> **For agentic workers:** Use focused parallel implementation for the independent lobby and arcade surfaces; integrate and review the Cup/engine changes in this session.

**Goal:** Ship the authorized faster lobby, five-game Faceoff Cup, Stack and Pocket Golf.

**Architecture:** Extend the existing registry and match engines. Keep Cup selection/scoring separate from its lifecycle UI and transport. Add the two arcade games as a private registered pack with pure rules.

**Tech Stack:** Existing static HTML/CSS/classic JavaScript, Node test runner and Playwright. No runtime dependencies.

**Spec:** `docs/superpowers/specs/2026-11-11-faceoff-cup-design.md`

## Global constraints

- Preserve all earlier uncommitted changes, existing settings/history, tabs and relative GitHub Pages paths.
- Preserve matte styling, reduced motion, mute, lifecycle cleanup and identical challenge config across competitors.
- Changes stay local; no commit, push or deployment requested.

## Review focus

- Abandoning a Cup while an old result callback is queued cannot advance a later session.
- Guest taps cannot start/advance Cups or duplicate standings/history entries.
- Missing/no-input results and ties produce finite, comparable standings.
- Drag controls map correctly in rotated panes and release/cancel outside the board safely.
- Small phones, landscape, keyboard controls and offline reload keep all actions reachable.

### Task 1: arcade pack

Files: `js/arcade-rules.js`, `js/games/arcade.js`, `css/arcade.css`, focused Node/browser tests.

- [x] Test overlap, bounces, obstacles, speed/settling, score ordering and invalid/missed shots before implementing.
- [x] Register `stack` and `golf`; use scoped input/timers/frames, deterministic per-round config and accessible controls.
- [x] Exercise real play, timeout/quit and rotated/small panes.

### Task 2: faster lobby

Files: `js/main.js`, `js/ui/lobby.js`, `index.html`, `css/lobby.css`, focused browser checks.

- [x] Check current selection flow; add a failing fast-launch/control check.
- [x] Add session choices, compatible Quick Match, Cup preset entry and fast recent/new game access while preserving Browse and room setup.
- [x] Verify player/device choices, host/guest restrictions, navigation and small-screen geometry.

Interface: `startCup(presetId, isSolo)` starts a compatible Cup; `CUP_PRESETS` describes presets. Main continues owning `mode`, `step`, navigation and saved setup.

### Task 3: Cup lifecycle and transport

Files: `js/cup-rules.js`, `js/cup.js`, `js/core.js`, `js/results.js`, `js/net.js`, `js/group.js`, `js/ui/history.js`, `css/cup.css`, Cup tests.

- [x] Test distinct preset selection/eligibility, ties, scoring and idempotent progression before implementation.
- [x] Add Cup state, one-round game launch, cumulative intermission, final record, replay/quit and solo personal-best progress.
- [x] Extend existing host-owned mirroring/group messages for standings and next-game controls, preserving normal matches and disconnect cleanup.
- [x] Verify five-game progression, quit/restart, stale/duplicate outcomes, failed players and guest authority locally and through real handlers.

### Task 4: integration and verification

Files: manifest/worker/page stylesheet versions, test runner/matrix, README and progress.

- [x] Add modules/styles to the single manifest and bump release consistently.
- [x] Run unit, full browser and transport suites, developer logic page, fresh offline cache and formatter/diff checks.
- [x] Inspect actual lobby/Cup/Stack/Golf screenshots at phone/desktop and rotated inputs.
- [x] Obtain a fresh code review of this pass, resolve material findings with regression checks, and document results/remaining device checks.

## Completion record

- Implemented the authorized bundle in the existing checkout, preserving all earlier uncommitted work.
- Cup/arcade rules and fast-lobby entry were observed failing before implementation; focused checks then passed.
- Review: one P2 group-churn failure reproduced RED, fixed with explicit Cup-to-room seat mapping, then GREEN with five-game and guest-points regression coverage. No other material findings.
- Final suite: 37/37 Node tests, 210/210 game-matrix checks, two-page normal/Cup transport, visual/lobby/arcade/Cup flows and v30 offline reload passed. Formatting and diff checks passed.
- No commit, push or deployment; physical-device, Firefox/iOS and live public-room checks remain manual.
