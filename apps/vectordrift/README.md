# 🌀 VectorDrift — Micro-Evasion & Bullet-Hell Grazing

> The mouse agility and micro-movement equivalent of Reflex Arena.

VectorDrift is a high-octane cursor agility game inspired by *Super Hexagon* and bullet-hell "grazing" mechanics. Pure spatial anticipation, liquid cursor control, and high-risk/high-reward flow state.

---

## 🎮 Core Hook & Grazing Mechanics

- **Lethal Hitbox vs. Graze Aura**:
  - The cursor reticle consists of an inner lethal core dot (**3.5px radius**) and an outer graze aura (**28px radius**).
  - Touching any lethal hazard with your core causes instant disintegration (or consumes a shield in Cadet difficulty).
  - Keeping your core within the graze aura without touching the hazard triggers **Active Graze**.
- **Exponential Graze Multiplier**:
  - As long as you maintain micro-proximity to hazards, your Graze Multiplier charges exponentially:
    $$\Delta M = \Delta t \times \left(1.8 + 8.5 \times \left(\frac{R_{\text{graze}} - d}{R_{\text{graze}}}\right)^{1.8}\right)$$
  - Multiplier climbs from `x1.0` through `x10.0`, `x25.0`, `x50.0`+, directly multiplying score accumulation.
  - Leaving the danger zone causes the multiplier to decay gradually.

---

## 🕹️ Game Modes

1. **Graze Arena**:
   - Sweeping rotating geometric blades, multi-armed death stars, bouncing kinetic polyhedrons, and bullet spirals.
   - Rewards riding the contours of moving blades and skimming ricocheting hazards.
2. **Vortex**:
   - Central pulsing event horizon pulling your focus inward.
   - Expanding kinetic rings with rotating aperture gaps (Super Hexagon-style) that force the player to weave through narrow gaps while orbiting or evading.
3. **Laser Grid**:
   - Procedural laser tripwire network with dynamic anti-camping detection.
   - Lasers cycle through **Arming** (predictive dotted line + audio charge), **Firing** (high-energy lethal beam with shockwave bloom), and **Cooldown**.
   - **Anti-Camping Drone**: Hovering in a safe zone for > 1.2s triggers an immediate **Orbital Lock** crosshair directly on your cursor!
   - Dynamic shifting grids and moving sweeping beams ensure no spot remains safe.
4. **Hell Mode**:
   - The ultimate crucible: simultaneous rotating blades, expanding vortex rings, and procedural laser grids all active at once!

---

## 🔊 Audio & Visuals

- **Procedural 140 BPM Acid Synth Bassline**:
  - Built entirely with the browser's Web Audio API (`AudioContext`, `BiquadFilterNode`, `OscillatorNode`).
  - Driving 16th-note acid bassline whose resonant filter cutoff dynamically sweeps from **320Hz** up to **4,200Hz** as your Graze Multiplier climbs!
- **Graze Audio & Near-Miss Whoosh**:
  - Frequency-modulated proximity sizzle that increases in frequency and harmonic resonance the closer your cursor is to death.
- **Visual FX**:
  - Liquid particle trails following cursor momentum with chromatic dispersion.
  - Gravitational lens refraction rings around near-miss hazards.
  - Directional vector needle indicating velocity vectors.

---

## 📊 Analytics & Post-Run Telemetry

- **Movement Efficiency Heatmap**:
  - 64x36 2D spatial grid tracking cursor occupancy, active graze paths, and wasted wandering distance.
  - Overlaid with the player's actual trajectory (cyan for evasive maneuvers, magenta/white for graze stretches, red marker for fatal impact).
- **Average Graze Proximity**:
  - Real-time Euclidean distance tracking measuring average pixels from death and the closest near-miss of the run.
- **Survival Duration Timeline**:
  - SVG timeline graph plotting the Graze Multiplier progression and hazard proximity across the run.
- **Session Persistence**:
  - All runs (including manually finished/saved runs), personal bests, and simulation settings persist in `localStorage` under `vectordrift:v1`.

---

## ⌨️ Controls & Shortcuts

| Key | Action |
|---|---|
| `Mouse / Trackpad` | Guide cursor reticle |
| `1` / `2` / `3` / `4` | Select Mode (Graze Arena / Vortex / Laser Grid / Hell Mode) |
| `Enter` / `Space` | Launch VectorDrift / Play Again |
| `Esc` | Pause simulation / Resume / Return to Menu |
| `R` | Quick restart current run |
| `Q` / `F` | Quit & Save current run telemetry |
| `S` | Open Telemetry Stats |
