# Reflex Arena

Browser FPS aim trainer built with Three.js, procedural Web Audio and SVG analytics. No build step.

## Modes

| Key | Mode | Focus |
|---|---|---|
| 1 | Gridshot | Speed and precision with three simultaneous targets |
| 2 | Tracking | Smooth target lock on moving orbs |
| 3 | Reflex | Reaction time with instant spawn/despawn |
| 4 | Microshot | Small targets in tight clusters |
| 5 | Razor | Sudden death — one miss ends the run |
| 6 | Zen | Endless warm-up; atmosphere and target count evolve with combo |

## Features

- Neon 3D arena with mode-coloured targets, particle bursts, hitmarkers and combo toasts
- Procedural audio that rises in pitch along combo streaks (no sound files)
- Results screen with session timeline, accuracy and reaction-time breakdowns
- 30-run progression chart (filterable by mode), personal bests per mode, difficulty and duration, and a recent-sessions table
- Calibration: live crosshair designer (size, thickness, gap, outline, colour, opacity, dot, presets), sensitivity profiles (Standard, Valorant, Overwatch), optional mouse acceleration, FOV 60–120°, target size 0.5–2×, volume and FX toggles

## Controls

| Input | Action |
|---|---|
| Mouse | Aim |
| Left click | Shoot (hold in Tracking) |
| 1–4 | Launch a mode from the menu |
| Esc | Pause / back to menu |
| R | Restart session |
| Enter | Play again from results |

## Data

Settings, crosshair, personal bests and history are stored in `localStorage` under `reflex:v2`.

## Tech

Three.js r128, Web Audio API, hand-written SVG charts, plain CSS.
