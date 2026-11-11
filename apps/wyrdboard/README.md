# Wyrdboard

A daily deduction game built as a self-contained static app. Watch eight excavated fragments, question a deterministic stone oracle, and name the five hidden rules. Open `index.html` through a local HTTP server; all assets use relative paths for GitHub Pages.

## Play locally

From the repository root:

```sh
python3 -m http.server 4173
```

Open [Wyrdboard](http://localhost:4173/apps/wyrdboard/index.html). Both portfolio views discover it through the shared `projects.js` catalog.

## How a day plays

A first-time player gets an eight-step spotlight tour on their first visit (skippable, shown once, replayable from the ? dialog): fragments, the board, the stone, clarity, field notes, inscribing, and the path. The coach bar then guides each next action.

On a desktop window the whole game fits one screen with no page scrolling: the header carries the path, the board and fragments sit on the left, and the field notes on the right. The board scales to the height available, and very short windows drop the descriptive text first. Phones use a stacked layout with the field notes in a bottom sheet. The result opens as a full-window card that closes back to the board.

A four-step path guides every board, and a coach bar always says what to do next:

1. **Observe** – watch at least three of eight recorded fragments (replays are free).
2. **Test** – tap or drag any piece to any square. The stone says what happens. The clarity ring shows how far the evidence has narrowed the rules, and each test shows its clarity gain.
3. **Deduce** – pick one option in each of five field-note rows, crossing out what the evidence rules out.
4. **Inscribe** – submit. A wrong guess costs 3 and shows which rows were right; three wrong guesses reveal the board.

Optional **Foresight** asks for a legal/refused prediction before each test (+10 XP per hit). **Ask the Scribe** reveals one rule for 2 points. **Scribe assist** auto-crosses impossible options but earns less XP and no rank.

## Rewards and records

Everything is derived from the saved runs in `localStorage`, so records cannot drift out of sync with play (`src/records.ts`).

- **Rank** by score against par: Champollion (under), Decipherer (par), Epigrapher (+1), Scribe (+2–4), Digger (+5).
- **Stars**: three need par or better with no hints; two need within one of par.
- **XP and levels**: 100 base, a rank bonus, +25 for a clean solve, +10 per foresight hit. Assisted runs earn 50 and a reveal earns 20.
- **Streaks** only count a board solved on its own date, so archive play cannot inflate them.
- **13 badges**, a **Museum** with records (win rate, streaks, averages, rank distribution, history), a collection calendar with weekly murals, and an aurora board skin for completing a month.
- **Export and import** the records as JSON. Importing never downgrades a solved day.

## The rule space

3,500 rulesets: one option from each of five slots.

| Slot | Options |
|---|---|
| Movement | step, slide, hop, **leap** (exactly two squares, over anything) |
| Capture | none, flank, replace, liberty, **approach** (capture the enemy just beyond your landing square) |
| Safe squares | none, rosettes, corners, cross, edge midpoints, one lane, **heart** (the two centre squares) |
| Special squares | none, extra turn, return, swap, **warp** (carried to the next rosette) |
| Victory | far end, capture 3, no moves, hold centre, **pair** (two squares of the far edge) |

Two boards share one graph engine: the Royal Game of Ur (20 squares) and Senet (30 houses). The rules are invented, not historical reconstructions.

## Development

```sh
cd apps/wyrdboard
npm install
npm run build
npm test
npm run generate -- 365 2026-11-01
```

Commit `src/` and the compiled `js/`: the hosted app has no build step or runtime dependencies. Run the generator after any engine change, then the full test suite. Generating a year takes about 25 minutes.

## Data layout

Daily puzzles are grouped by month, with a small catalog beside them:

```
data/index.json                   # date, board, par for every day
data/2026-11/2026-11-10.json      # one file per day
```

The browser derives each path from the date. It uses the player's local date; after the schedule ends it shows the latest tablet rather than inventing an unvalidated one. The committed schedule covers **2026-11-01 to 2027-10-31**.

## Engine and puzzle contract

`src/engine.ts` exports the pure `play(board, state, move, ruleset)`; slot modules live in `src/rules/`. Inputs are never mutated, and the generator and browser share the same compiled engine. A relocation (return or warp) and a swap are part of the observable outcome, so replay never needs the hidden rule labels.

The generator self-plays legal moves while keeping 150–600 consistent rulesets. Every puzzle needs a greedy par of 4–7, a unique behaviour across all available probes, and benchmark probes that separate every slot's alternatives. Combinations cannot repeat within 30 days, and capture-none targets are excluded because their safe-square choices cannot be told apart.

Daily JSON holds fragment positions and outcomes, dictionary-coded oracle tables, briefing clues and the benchmark path, with no labelled answer. The client checks a submission by replaying the proposed rules against fixed snapshots and every meaningful probe. This is a casual puzzle, not protection against someone inspecting the client.

Par is a **greedy benchmark**, not a proof of optimal play. Monday announces three rules; Tuesday and Wednesday two; Thursday and Friday one; weekends none.

**Easy stretch.** 2026-11-07 to 2026-11-16 were replanned as an easy window: three rules announced every day, par 4, and at most 200 survivors after the fragments. To make another stretch easy, regenerate just those days; the run replaces only its own days in `data/index.json` and avoids combinations used within 30 days either side:

```sh
npm run generate -- 10 2026-11-07 easy
```

## Validation

`npm test` covers rule fixtures for every option, purity and invalid input, outcome reconstruction, the greedy solver, corrupt saved progress, ranks, records, streaks, badges, import merging, and every puzzle in the year (survivors, uniqueness, all oracle responses, slot coverage, repeat window).

There is no automated browser test. The browser behaviour was checked by hand in Chromium: stage progress, foresight, clarity, reward screen, Museum, archive, and the mobile field-notes sheet. Human playtesting and live deployment have not been done, and the name has not been through a trademark search.
