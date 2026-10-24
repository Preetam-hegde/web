# Bag & Blade — The Parchment Guildmaster

A browser inventory roguelike. Your satchel is both your inventory and your battle deck: where an item sits decides how strong it is. Vanilla HTML/CSS/JS, no build step.

## How it plays

- **Satchel**: Tetris-style packing with rotation (`R`, right-click, or the Rotate button). Drag with mouse, touch or pen; the cell you grab stays under the cursor and a green/red preview shows where the piece will land.
- **Synergies** are data-driven (`js/items.js`) and resolved by one engine (`js/grid.js`): a Whetstone buffs the weapons it touches, a Coin Purse raises the value of touching gems and treasure, a Greatsword wants empty slots around it, potions in a 🧪 holster slot heal more, ranged weapons in a 🏹 quiver slot hit harder. The inspector lists which synergies of an item are active.
- **Delve**: weapons, shields and scrolls cost Energy; potions and provisions are free but single-use; armor is passive Block each turn. Enemies telegraph their move. Burn, chill, stun, thorns, crit, dodge, pierce and lifesteal are all implemented. Floors 5 and 10 are bosses; the Wyrm on floor 10 ends the dungeon, and the depths continue after that.
- **Orders**: three client orders per day, with a live requirement checklist, tips for surplus, and a wax-seal button. Everything in the delivery satchel is handed over.
- **Market**: daily stock that widens with guild rank, a restock option, slot unlocks you place yourself (escalating price), the Merchant's Scale for selling (satchel items sell at their boosted value), and an Inn that ends the day.
- **Vault**: ten packing puzzles on boards with holes. Goals use the same synergy engine, and every level ships with a stored solution that powers the Hint button.
- **Time and rank**: winning a fight or sealing an order spends one of five daily time slots. Reputation is lifetime progress; each guild rank gives a new run one more starting slot, rarer market stock and a 5% discount.
- Runs auto-save to `localStorage` and resume on reload. Reputation, rank and puzzle stars survive a death.

Hotkeys: `1`–`4` tabs · `Space` auto-turn · `Enter` end turn · `R` rotate · `M` mute · `?` help · `Esc` cancel a drag.

## Files

| File | Role |
| --- | --- |
| `js/items.js` | 63 items, shapes, synergy definitions, loot tables |
| `js/grid.js` | Grid engine: placement, rotation with kicks, synergy calculator |
| `js/store.js` | Run state, meta progress, save/load, time slots |
| `js/combat.js` | Turn-based fights |
| `js/orders.js`, `js/market.js` | Contracts, shop, selling, Inn |
| `js/puzzles.js` | Puzzle table with stored solutions |
| `js/drag.js` | Pointer-based drag & drop |
| `js/ui.js`, `js/app.js` | Rendering and the action controller |
| `js/audio.js` | Web Audio sound effects (procedural, no audio files) |

Add `?debug` to the URL to expose `window.__bb` for scripted testing.

## Credits & asset licenses

- **Pixel Fantasy Icons**: [Raven Fantasy Icons](https://clockworkraven.itch.io/raven-fantasy-icons) by Clockwork Raven Studios (Caio).
- **Paper UI Elements**: [Paper UI System](https://humblepixel.itch.io/) by Humble Pixel / GameChef.
- Used under creator asset license terms for game project creation.
