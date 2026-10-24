# Particle Life — Emergent Artificial Ecosystem

A real-time artificial life and emergent ecosystem simulator built with vanilla HTML5, Canvas API, and the Web Audio API.

## Features

- **Emergent Multi-Species Physics**: 6 distinct particle species governed by an interactive $6 \times 6$ attraction and repulsion force matrix.
- **Spatial Hash Grid Partitioning**: High-performance broad-phase collision and neighbor queries allowing 2,000+ particles at steady 60 FPS.
- **Curated Biomes & Presets**:
  - *Primordial Soup*: Balanced chaotic self-assembly and swirling colonies.
  - *Cellular Mitosis*: Organic membrane structures and dividing nuclei.
  - *Predator & Prey*: Hunting loops and evasive defensive clustering.
  - *Spiral Disk*: Cosmic accretion discs and rotating spiral arms.
  - *Serpent Chains*: Flexible continuous crawling filaments.
  - *Crystal Net*: Periodic molecular crystal lattices.
  - *Symbiosis*: Interlocked orbits and paired cooperation.
- **Interactive Force Matrix Editor**: Click or right-click any cell to fine-tune attraction/repulsion in real time, with instant Symmetrize, Mutate, and Randomize operations.
- **Interactive Cursor Force Fields**: Switch between Attract (Gravity Well), Repel (Shockwave), Vortex (Angular Swirl), and Inject (Particle Spawner).
- **Web Audio Sonification**: Generative ambient drone chords and micro-chimes that modulate with aggregate kinetic energy and cluster interactions.
- **Visual Controls & Telemetry**: Configurable bloom glow, motion trails, toroidal wrapping, time speed, live FPS, particle count, kinetic energy telemetry, and high-resolution PNG snapshot export.
- **Fluid Viewport**: Smooth zoom (mouse wheel) and pan (drag/middle-click) navigation.

## Tech Stack

- Vanilla JavaScript (ES6+, typed Float32Arrays for zero-garbage physics)
- HTML5 Canvas API (batch-rendered by species, additive blend glow)
- Web Audio API (real-time harmonic synthesizers)
- Modern CSS (glassmorphism, CSS grid, responsive layout)
