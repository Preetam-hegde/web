# Faceoff

39 solo/duel games and 10 party games, served as plain HTML/CSS/JavaScript on GitHub Pages. There is no production build or runtime npm dependency. Keep assets relative to this folder.

## Run and check

From this folder, with Node.js 20 or newer:

```sh
npm ci
npx playwright install chromium
npm test                 # DOM-free rules, registry, lifecycle, loader and cache tests
npm run test:browser     # starts its own local server; game matrix and two-phone sync
npm run check            # unit tests + browser tests
npm run format:check
```

The lobby offers Quick Match, Faceoff Cup and Browse without walking through categories first. It remembers solo/one-phone play; joining another phone always remains explicit. Quick Match avoids its previous pick and respects room eligibility and sound requirements.

Faceoff Cup selects five distinct games from Mixed, Reflex or Precision presets. Each game is one round: a win earns 3 points, shared first earns 1 each, and failed attempts earn 0. The host advances room Cups. Solo Cups count personal bests across five games and update the usual per-game records. Cup completion writes one history entry; quitting does not write an unfinished Cup. Shared-phone party cards keep their separate social flow.

Stack ends after 12 layers, a miss or 24 seconds; most layers wins and retained width breaks ties. Pocket Golf supports pulling back from the ball or using the Aim/Power controls; it ends after a hole, five shots or 35 seconds. A holed ball always beats an unfinished course, and the same course is supplied to competitors.

The browser checks default to Playwright's Chromium. To use installed Chrome, run `FACEOFF_BROWSER_CHANNEL=chrome npm run check`. `FACEOFF_OUTPUT` optionally changes the screenshot/report folder (default `/tmp/faceoff-qa`). Tests never contact the public room broker; two-phone tests connect the real message handlers with an in-memory transport.

For manual play, serve the repository root with `python3 -m http.server 4173` and open `http://localhost:4173/apps/faceoff/`. The existing `test.html` also runs browser logic checks.

## Where changes belong

| File | Responsibility |
| --- | --- |
| `js/registry.js` | Game contract, unique IDs, categories and solo/room eligibility |
| `js/manifest.js` | Ordered script paths, stylesheet paths and release version |
| `js/boot.js` | Ordered loading and a visible recovery screen if loading fails |
| `js/core.js` | Match state, ready-up, countdowns, turns and the game context |
| `js/runtime.js` | Turn-owned timers, frames, event listeners and cleanup |
| `js/results.js` | Results, points, personal bests, history and rematches |
| `js/cup-rules.js`, `js/cup.js` | Five-game selection, validated standings, progression, room authority and Cup history |
| `js/rules.js` | Pure board/scoring/geometry/colour/rhythm logic; no DOM |
| `js/arcade-rules.js`, `js/games/arcade.js` | Pure overlap/golf physics and the registered Stack/Pocket Golf controls |
| `js/game-ui.js` | Shared canvas, pointer, time-bar and beat-light helpers |
| `js/games/` | Private game packs that register their definitions |
| `js/audio.js`, `share.js`, `icons.js` | Sound cues, share images and icon rendering |
| `js/main.js`, `js/ui/` | Lobby navigation, settings and history screens |
| `js/party.js`, `spy.js`, `table.js` | Party engine, hidden-role games and saved own-phone tables |
| `js/net.js`, `group.js` | Two-phone mirroring/local scoring and 3–10-player rooms |
| `css/` | Shell, party/theme rules, timer/rhythm instruments, boards, precision controls and responsive layouts |

`npm run check` includes the complete game matrix, two-phone Cup synchronization, focused lobby/arcade/Cup flows and a fresh service-worker offline reload. The Cup tests cover solo/split/pass/group progression, one final record, replay, stale callbacks and host-only advancement. Arcade tests exercise real controls, rotated drag, cancellation, keyboard, scoring and no-input deadlines. Offline checks derive the asset list from the manifest so registering a game does not require updating a second cache fixture.

Game packs use private function scopes so local names cannot collide with another game. Shared rules and rendering helpers belong in shared modules, not another game's file. Colour Recall intentionally reuses the registered Colour Match definition, so the manifest loads `more.js` before `match.js`.

## Add a scored game

Add a definition to the relevant existing pack. A new pack needs one entry in `FACEOFF_SCRIPTS` before `main.js`; the loader and service worker both use that list. A new category belongs in `gameCatalog.categories`.

```js
(() => {
	'use strict';
	registerGame({
		id: 'one-second',
		name: 'One Second',
		icon: '⏱️',
		group: 'timing',
		blurb: 'Tap one second after the round starts.',
		lowerIsBetter: true,
		config: () => ({ target: 1000 }),
		intro: () => 'Tap after <b>one second</b>.',
		play(ctx) {
			const started = performance.now();
			ctx.stage.innerHTML = '<button class="btn" type="button">Stop</button>';
			ctx.on(ctx.stage.querySelector('button'), 'pointerdown', (event) => {
				const error = Math.abs(tsOf(event) - started - ctx.cfg.target);
				ctx.done(error, `${Math.round(error)} ms off`);
			});
			ctx.after(10000, () => ctx.fail('Timed out'));
		},
	});
})();
```

The engine supplies the same config to both players. `ctx.done(number, labelHtml)` finishes exactly once; `ctx.fail(label)` supplies the losing infinity score. Escape player-supplied text with `esc()` before using it in HTML.

Use `ctx.after(ms, fn)`, `ctx.loop(fn)`, and `ctx.on(element, event, handler, options)` so timers, animation frames, and listeners stop when a turn ends. Returning `false` stops a loop. Register other resources with `ctx.onCleanup(fn)`. Avoid unowned timers or document listeners.

A plain game automatically supports solo, split-screen, pass-and-play, two-phone local scoring, and eligible group rooms. Add flags only when needed:

- `duel: true`: engine calls `play(ctx0, ctx1)` once for shared/secret state. Use `turns()`, `focus()` and `handoff()` for player flow.
- `coop: true`: also provide `verdict(score)` and `summary(total, rounds)`; the pair scores together.
- `passOnly`, `splitOnly`, `words`, `soloOk`, `turnBased`: existing device, dictionary, solo and turn-indicator requirements. `canSolo` and `groupOk` determine where a game appears.
- `rounds`: optional positive fixed match length.

An SVG entry in `GAME_ICONS` is optional; an unfamiliar game ID displays its registered emoji instead. Put testable rules in `rules.js` and add a small Node test. Exercise normal input, no-input timeout, repeat taps, quit/rematch, and both player orientations in the browser.

## Add a party game

Use `registerPartyGame({ id, name, blurb, need, steps, win, run })`. The party engine owns roster, rules, dock and final scores. `run()` uses `draw(html, handlers)`, `pass()`, `btn()`, and the current `ps` session. Every screen change clears its running party countdown. Reuse the existing 2/3/6/10-player browser checks and assert minimum-player gates for hidden-role games.

## Release

Bump `FACEOFF_VERSION` in `js/manifest.js`, manifest/boot/stylesheet versions in `index.html`, stylesheet import versions in `styles.css`, and the manifest import in `sw.js` together. Keep the version-consistency test passing. New manifest files are cached automatically; the dictionary is cached on demand. Increment `SPY_DATA` if hidden-role deals or word lists change so older phones reject incompatible table codes.
