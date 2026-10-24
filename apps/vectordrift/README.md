# VectorDrift

A cursor-agility game in the vein of *Super Hexagon* and bullet-hell grazing: the closer you fly to danger without dying, the faster your score multiplier climbs.

## Core mechanic

The reticle has a lethal core (3.5 px radius) and a graze aura (28 px radius). Touching a hazard with the core ends the run (or spends a shield on Cadet difficulty). Staying inside the aura without touching anything charges the graze multiplier, which grows faster the closer you are and decays once you leave the danger zone. The multiplier scales from ×1 up through ×50+ and multiplies all score.

## Modes

| Key | Mode | Description |
|---|---|---|
| 1 | Graze Arena | Rotating blades, multi-armed stars, bouncing polyhedra and bullet spirals |
| 2 | Vortex | Pulsing core with expanding rings and rotating gaps to thread through |
| 3 | Laser Grid | Tripwire lasers that arm, fire and cool down; hovering in one spot for over 1.2 s triggers an orbital lock |
| 4 | Hell Mode | Blades, vortex rings and lasers all at once |

## Audio and visuals

- 140 BPM acid bassline synthesised with Web Audio; the filter cutoff sweeps from 320 Hz to 4.2 kHz as the multiplier rises
- Proximity sizzle and near-miss whoosh that rise as you approach a hazard
- Momentum particle trails, lens-refraction rings around near misses and a velocity needle

## Post-run telemetry

- 64×36 movement heatmap with your trajectory overlaid (evasion, graze stretches, fatal impact)
- Average and closest graze distance
- Timeline of multiplier and hazard proximity across the run
- Runs, personal bests and settings persist in `localStorage` under `vectordrift:v1`

## Controls

| Input | Action |
|---|---|
| Mouse / trackpad | Steer the reticle |
| 1–4 | Select mode |
| Enter / Space | Launch or play again |
| Esc | Pause, resume or return to menu |
| R | Restart run |
| Q / F | Quit and save run telemetry |
| S | Open stats |
