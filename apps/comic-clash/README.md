# ComicClash — Retro Comic Gacha & Rogues Gallery

A browser-based retro comic book gacha game and turn-based squad battler featuring authentic Ben-Day halftone visuals, tactile foil booster pack tearing, 40 collectible superheroes, and tactical comic strip combat.

## Core Features

- **Tactile Booster Pack Tearing**: Interactive sealed foil comic booster packs with tearing paper sound synthesis, holographic shimmer, and dramatic reveal animations.
- **Fair & Hooking Gacha Mechanics**:
  - **Drop Rates**: 5★ Mythic (3%), 4★ Super Rare (15%), 3★ Rare (35%), 2★ Common (47%).
  - **Pity Counters**: Guaranteed 4★+ on every 10-pull; Guaranteed 5★ Mythic Hero every 40 pulls.
  - **Duplicate Awakening**: Duplicates automatically convert into Hero Shards to awaken and rank up heroes with stat boosts and shiny holographic card frames.
- **Turn-Based Comic Strip Battles**:
  - Assemble a squad of 3 heroes against the Rogues Gallery across multiple comic issues.
  - Basic Attacks (+30 Energy), Tactical Skills with cooldowns (Shields, Stuns, Armor Shred), and cinematic full-screen Ultimate Bursts with iconic comic dialogue.
  - **Affinity Circle**: Cosmic ➔ Tech ➔ Brawler ➔ Mystic ➔ Cosmic (+30% damage on advantage).
  - Animated onomatopoeia popups: `POW!`, `BAM!`, `KAPOW!`, `KRAK!`, `ZAP!`.
- **Roster & Squad Builder**:
  - 40 unique heroes across 4 rarities with inline vector artwork and distinct backstories.
  - 3D card tilt physics on hover.
  - Level Up (Coins & Ink) and Rank Up (Shards).
- **Procedural Comic Sound Engine**:
  - Web Audio API synthesizer generating foil tearing noises, heavy punches, laser zaps, blade cuts, and rarity fanfare chimes without any external audio downloads.
- **Save State**: Progress, coins, ink, pity counters, and inventory automatically persist in `localStorage` under `comic_clash:v1`.

## v2 Additions

- **Multi-wave campaign**: 8 issues with waves, boss specials (telegraphed one turn early), 3-star ratings (clear / no KOs / within par), sequential unlocks and an **Infinite Gauntlet** endless mode.
- **Real hero kits**: every skill and ultimate does what its card says (heals, shields, stuns, bleed, marks, taunts, chains, multi-hit) via `js/kits.js`.
- **Combat depth**: click-to-target, combo chains, status icons, squad affinity synergy, auto-battle, fast mode, hotkeys (1/2/3/A/F), floating damage numbers and screen shake.
- **Gacha polish**: draggable foil tear, strip fly-off, light-beam charge-up and full-screen rays/particles scaled to the best rarity, tap-to-flip card reveals, pity meters, odds and pull history.
- **40 heroes**, roster filters, hero detail modal, XP auto-leveling, daily streak, daily missions and stats.
- Animated halftone/ray background with floating onomatopoeia.

## v3 Additions

- **Pixel art**: Tiny Swords battle sprites with attack animations and hit FX, Raven Fantasy pixel icons throughout.
- **Card redesign**: foil-framed hero cards (rank pips, XP bar, stat icons, move preview) and detailed battle **move cards** with power, targets and effect tags, plus a played-card animation.
- **Tactic cards**: Brace Up (shield + guard), Focus Fire (mark + energy) and Combo Breaker (spend a combo for an AoE) alongside every hero's Basic/Skill/Ultimate.
- **New mechanics**: lifesteal, energy gain, cleanse. 8 more heroes (32 total) and 2 more issues (10 total).

## v4 Additions

- **Pair combos**: 19 named duos (e.g. Storm Lance, Pack Hunt, Time Lock). Put partners in neighbouring squad slots and the second one hits harder with bonus effects; the Combo Book tracks discovery. Following the affinity circle triggers a Chain Reaction.
- **Arcade**: Panel Match (memory), Power Punch (timing), Who's That Hero? (silhouette quiz) and a daily **Mutator Gauntlet** (endless battle with a rule twist and bigger payout). Rewards cap at 3 plays per game per day.
- **8 more heroes** (40 total).

## v5: Battle Overhaul

- **Side-view battlefield** with a themed backdrop per issue (sky, drifting clouds, Tiny Swords buildings, ground). Units stand in formation with nameplates; tap a villain to target it.
- **Physical attacks**: melee fighters dash into the target, archers and caster-style moves fire arrows/orbs, hits flash, and HP only drops when the blow lands.
- **Timed attacks**: pick a move, then tap when the shrinking ring hits the circle (Perfect x1.35, Good x1.15, Miss x0.9). Perfect also grants +10 energy.
- **Timed blocks**: when a villain attacks, a ring shrinks onto your hero. Tap (Space / B / the block button) on impact to cut damage; a perfect block takes ~80% less, gives +20 energy and counter-attacks.
- Ultimates get a cut-in band with the hero art and a camera zoom; crits freeze the frame for a beat; victorious heroes hop. Timing and Block can be turned off in the battle toolbar, and Auto-battle skips both.

## Tech Stack

- Vanilla JavaScript (ES6+, Strict Mode)
- HTML5 & CSS3 (Halftone Ben-Day dot screens, 3D card tilt, responsive grid)
- Web Audio API (procedural synthesis)
- Vector SVG artwork (fully offline and self-contained)

## Credits & Asset Licenses

- **Battle sprites & hit FX**: [Tiny Swords (Free Pack)](https://pixelfrog-assets.itch.io/tiny-swords) by Pixel Frog. Only the idle/attack sheets used in battle are bundled under `assets/sprites` and `assets/fx`.
- **Pixel icons**: Raven Fantasy Icons by Clockwork Raven Studios (29 icons bundled under `assets/icons`).
- These are third-party assets and are not covered by the repository license; do not redistribute them as a standalone pack.
- Humble Pixel's "Paper UI System" was evaluated but **not** bundled: its license forbids redistributing original or modified files, which includes publishing them in a public repo / GitHub Pages site.
