Original prompt: in faceoff check all the games ui logic 2 player logic 2+ player logic single play logic + sound

- Checking every registered game, solo and split/pass modes, party flows, room scoring, and sound.
- Existing checks are in test.html. Browser coverage will exercise actual game controls and lifecycle transitions.

Verified on 2026-11-11:

- 200/200 Chromium browser checks passed: 37 registered games, 25 solo-capable games, split/pass modes, scoring inputs and timeout paths, 23 games in simulated three-player rooms, all 10 party games at 2/3/6/10 players (including minimum-player gates), and all 6 own-phone spy tables with code validation and saved-table rejoining.
- Two-page network checks passed for ready-up, audio activation, mirrored Tic-Tac-Toe turns, local timer scoring, shared results, muted guest cues, and sudden-death history updates. Transport is in memory; the real host/guest message handlers run unchanged.
- All game layouts fit 320×568 and 844×390 viewports. Independent review also checked every plain game's pass-and-play handoff at both sizes.
- The existing test.html logic page passed, including its 152,309-entry dictionary.
- Offline reload passed with all 37 games, 10 party games, and the cached dictionary on faceoff-v27.
- Three Node regressions passed for group deadline restart/cancellation and isolation of other apps' caches. Syntax checks passed for 27 scripts. New test files pass Prettier; the 26 legacy files already failed the formatter in the original checkout. git diff --check passed.
- The bundled web-game client passed its menu smoke check. Gameplay screenshots and the full browser report are in /tmp/faceoff-qa/.

Fixed:

- Ready/result screens now scroll, keeping actions reachable; split-screen verdict text fits a phone.
- Old two-phone deadlines cannot fail a later round. Group Quit resets its deadline handle, and Leave cancels it.
- Sudden death updates one match in history and play counts, including on the second phone.
- Share images use a snapshot of the finished match, so quitting while fonts load cannot crash generation.
- Sound Off also silences Hz Match. The second phone unlocks audio from its own tap and receives shared sound cues.
- The logic-check page loads the fun-word list it uses.
- Asset/cache version is v27; service-worker activation removes only Faceoff's old caches.

Re-run with the repository served at http://127.0.0.1:4173 and Playwright available to Node:

```sh
node apps/faceoff/tests/browser.cjs
node apps/faceoff/tests/network.cjs
node --test apps/faceoff/tests/*.test.mjs
```

No outstanding failures in these checks. Real PeerJS/WebRTC connectivity, Firefox/iOS touch and autoplay, and audible speaker quality still need browser/device testing. Changes are local; no commit, push, or deployment was made.

## Modular architecture and visual quality pass — v29

Follow-up requests: make the UI enjoyable and impressive, make the code modular and easy to extend/test, then replace the generated-looking theme with a more deliberate, refined treatment across every game. The latest direction supersedes the initial preference to retain the aurora. Specifically improve timer/rhythm, Size Match, and Colour Match with displayed RGB values.

- Replaced decorative neon gradients, glow, animated menu background and tap rings with matte surfaces, warm-white Inter/JetBrains Mono typography, fine borders and restrained player colours. Updated the lobby, category/library, ready/result, party and share-card presentation.
- Added timer instruments, explicit hold/release/tap affordances and numbered rhythm feedback. Hidden timer intervals have no animated progress cue. Polished board, keypad, memory, Hangman, reflex and perception controls.
- Colour Match/Recall now use labelled R/G/B sliders, per-channel values, combined live RGB readout and channel tracks that reflect the current mix. Target RGB stays hidden; Recall hides the reference on schedule.
- Size Match separates Observe and Rebuild, gates input during the reference phase and fits the arena to its pane. Pitch Match uses a reference control and tuning rail and stops replaced/abandoned tones.
- Added a validated game registry and one shared script/style manifest for loading and caching. Scoped game packs, pure rules, shared game UI, round-owned resources, results, audio, sharing, settings and history have separate files. New-game contracts and commands are documented in README.md.
- Turn indicators now mirror between phones. Lifecycle cleanup prevents stale timers, listeners, animation frames and pitch voices. Fixed dark party actions/rule numbers and removed the logic page's unused share-button dependency after screenshot/error review.

Final verification on 2026-11-11:

- `FACEOFF_BROWSER_CHANNEL=chrome FACEOFF_OUTPUT=/tmp/faceoff-final-qa npm run check` (from apps/faceoff): 26/26 Node tests, 200/200 gameplay/browser checks, two-page networking checks, RGB/Recall/size/pitch checks, contrast checks across all 10 party games and the developer logic page passed. No browser exceptions.
- Fresh offline v29 reload passed with all 37 games, 10 party games, all eight imported stylesheets and the 152,309-word dictionary. The browser logic page reported ALL PASSED.
- All Faceoff-owned HTML/CSS/JS/CJS/MJS now pass the app's pinned Prettier check; this supersedes the earlier legacy-formatting limitation. `git diff --check` passed. Clean offline `npm ci --ignore-scripts` verified the locked development dependencies.
- Inspected desktop/phone lobby, timer, rhythm, size, colour, pitch, boards, party, result and share-card screenshots. The bundled web-game client passed its final menu smoke check. Game layouts were exercised at 320×568 and 844×390; board-specific review also covered 390×844.
- Browser reports/screenshots: /tmp/faceoff-final-qa and /tmp/faceoff-final-preview. A four-game preview is saved under the task's visualization folder as faceoff-games.png.

Remaining manual checks: public PeerJS/WebRTC connectivity, Firefox/iOS, physical touch/autoplay and audible speaker quality. Two-phone tests use the real handlers with an in-memory transport. No deployment, commit or push was requested or performed.

## Faster lobby, Faceoff Cup, Stack and Pocket Golf — v30

User selected and authorized the proposed next pass: faster lobby + Faceoff Cup + Stack and Pocket Golf.

- Home now exposes Quick Match, Mixed/Reflex/Precision Cup presets, Browse, new games and recent standalone games. It remembers solo/one-phone play and keeps room joining explicit. Quick Match respects player/device eligibility and mute, avoids its last pick and still shows rules before play.
- Added a five-game Cup schedule with no duplicate games, one round per game, cumulative standings and direct Next Game/replay controls. Solo counts personal bests; competitive wins earn 3, shared first earns 1, failed attempts earn 0. Host alone advances room Cups. A completed Cup writes one history entry; old callbacks and duplicate results cannot advance or record it again.
- Added Stack (drop moving blocks, overlap narrows the tower, 12 layers/24 seconds) and Pocket Golf (pull-back drag plus keyboard-accessible Aim/Power/Shoot, obstacle/wall bounces, five shots/35 seconds). Both use shared pure rules and scoped canvas/input resources, and work in solo, split/pass and eligible rooms.
- Modules: cup-rules.js/cup.js for Cup data, state validation and lifecycle; arcade-rules.js/games/arcade.js for pure geometry/physics and game UI. New CSS layers and assets are in the shared manifest. Asset release is v30.
- Review found one material bug: historical departed group slots could make a valid room exceed Cup's ten-player validation. Reproduced it with 3 active/8 departed slots, then fixed it by tracking compact Cup participants with original room seat indices. The browser regression verifies five games, final room-board mapping and a rejoined guest's own points. No other material findings were reported.

Final checks on 2026-11-11:

- `FACEOFF_BROWSER_CHANNEL=chrome FACEOFF_OUTPUT=/tmp/faceoff-cup-final npm run check`: 37/37 Node tests and 210/210 game-matrix checks passed, followed by the two-page normal/Cup transport checks, visual regressions, focused lobby/arcade/Cup flows and fresh offline reload. No browser exceptions.
- Cup checks cover solo/split/pass/group, host authority, ties/failures, replay, single history records, old-session/earlier-leg callbacks, visible Next Game at 390px split, and group churn with preserved room records.
- Arcade checks cover real Drop/canvas/keyboard input, true holed-in-one scoring, deadlines, mute, quit cleanup, rotated drag, outside release/cancellation, and 320×568/844×390 geometry. Lobby checks cover fast launch, direct recent/new games, Browse/back, guest rules-only access, remembered mode, no automatic room connections and phone/desktop layouts.
- Offline v30 passed with all 39 games, 10 party games, 11 imported stylesheets, dictionary and Cup startup. The developer logic page passed. Cache tests now derive expected assets/version from the manifest.
- App Prettier and `git diff --check` passed. The bundled game client played both Stack and Golf and produced screenshots plus text state without console errors. Inspected actual lobby, Cup and arcade screenshots. Reports: /tmp/faceoff-cup-final; focused arcade screenshots: /tmp/faceoff-arcade; client output: /tmp/faceoff-cup-game-client.

No outstanding automated failures. Remaining checks are physical-device audio/touch/autoplay, Firefox/iOS and public PeerJS/WebRTC connectivity. All changes remain local and uncommitted; no push or deployment.
