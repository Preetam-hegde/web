# Reflex Arena — Pro FPS Aim Trainer

A high-octane browser-based FPS aim trainer built with **Three.js**, **procedural Web Audio API**, **interactive SVG charts**, and **deep performance analytics** — designed to the standard of **Keystorm**.

---

## 🎯 Game Modes

- **Gridshot** (<kbd>1</kbd>) — Speed & precision training with 3 simultaneous targets
- **Tracking** (<kbd>2</kbd>) — Smoothness and target lock on moving orbs
- **Reflex** (<kbd>3</kbd>) — Reaction time training with instant spawn/despawn
- **Microshot** (<kbd>4</kbd>) — Micro-adjustments and precision with small targets in tight clusters
- **Razor** (<kbd>5</kbd>) — Sudden death: one miss and the run terminates immediately
- **Zen** (<kbd>6</kbd>) — Infinite warmup flow (`∞` time) that dynamically evolves atmosphere and target counts as combo climbs

---

## ✨ Features & Polish

### 💎 Keystorm-Grade Aesthetic & Interface
- **Modern Typography**: JetBrains Mono for metrics and timers; Space Grotesk for headings.
- **3D Interactive Tilt Cards**: Mode cards track cursor movement with dynamic 3D perspective and radial spotlights.
- **Neon Cyber Arena**: Three.js 3D volume with glowing floor & ceiling grids, starfield motes, and mode-matched emissive targets.
- **Tactile Feedback**:
  - Procedural Web Audio synthesizer with ascending musical pitch on combo streaks.
  - Milestone combo toasts (`10 COMBO!`, `25 COMBO!`, `50 COMBO!`) with shockwaves.
  - Radial vignette flashes on hits and misses.
  - 3D particle explosions upon target destruction.
  - 2D center-screen hitmarkers.

### 📈 Deep Analytics & Interactive SVG Charts
- **Session Timeline Chart**: Plots cumulative score, hits, and misses over time on the results screen.
- **30-Run Progression Chart**: Historical SVG line chart with area gradient fill and data points, filterable by mode.
- **Personal Bests Tracking**: Saved per mode, difficulty, and duration.
- **Aim Accuracy & Reaction Breakdown**: Visual distribution bars for accuracy tiers and reaction time speeds.
- **Recent Sessions Table**: Clean tabular breakdown of recent sessions with color-coded badges.

### ⚙️ Calibration & Live Crosshair Designer
- **Interactive Crosshair Preview**: Live preview box with real-time target backdrop.
- **Crosshair Customization**: Size, thickness, center gap, black outline, RGB color picker, opacity, and center dot toggle.
- **Presets**: Dot, Cross, Circle, Plus.
- **Sensitivity Profiles**: Standard (Source/Apex/CS), Valorant (3.18x converter), and Overwatch.
- **Mouse Acceleration**: Toggleable dynamic speed multiplier.
- **Field of View (FOV)**: 60° to 120°.
- **Target Size**: 0.5x to 2.0x multiplier.
- **Audio & Visual FX Toggles**: Volume slider, sound FX toggle, and 3D particle toggle.

---

## 🎮 Controls & Shortcuts

| Key | Context | Action |
|---|---|---|
| **Mouse** | Gameplay | Aim and look around |
| **Left Click** | Gameplay | Shoot (hold for Tracking mode) |
| <kbd>1</kbd> – <kbd>4</kbd> | Main Menu | Quick-launch game modes |
| <kbd>Esc</kbd> | Gameplay / Menu | Pause run / Return to menu |
| <kbd>R</kbd> | Any | Restart current session |
| <kbd>Enter</kbd> | Results | Play again |

---

## 💾 Data Persistence

All user preferences, crosshair setups, personal bests, and session histories are persisted in `localStorage` under `reflex:v2` (with automatic backward compatibility for legacy data).

---

## 🛠️ Technical Details

- **3D Engine**: Three.js r128
- **Audio**: Web Audio API (zero external sound files, 100% procedural synthesis)
- **Charts**: Custom SVG vector graphics with animated line draws and area fills
- **Styling**: Pure CSS with custom design tokens (no heavy external CSS frameworks)
- **Zero Build**: Runs directly in modern browsers
