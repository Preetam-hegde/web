# ComicClash — Retro Comic Gacha & Rogues Gallery

A browser-based retro comic book gacha game and turn-based squad battler featuring authentic Ben-Day halftone visuals, tactile foil booster pack tearing, 16 collectible superheroes, and tactical comic strip combat.

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
  - 16 unique heroes across 4 rarities with inline vector artwork and distinct backstories.
  - 3D card tilt physics on hover.
  - Level Up (Coins & Ink) and Rank Up (Shards).
- **Procedural Comic Sound Engine**:
  - Web Audio API synthesizer generating foil tearing noises, heavy punches, laser zaps, blade cuts, and rarity fanfare chimes without any external audio downloads.
- **Save State**: Progress, coins, ink, pity counters, and inventory automatically persist in `localStorage` under `comic_clash:v1`.

## Tech Stack

- Vanilla JavaScript (ES6+, Strict Mode)
- HTML5 & CSS3 (Halftone Ben-Day dot screens, 3D card tilt, responsive grid)
- Web Audio API (procedural synthesis)
- Vector SVG artwork (fully offline and self-contained)
