# Particle Life — Emergent Artificial Ecosystem

A real-time artificial life and emergent ecosystem simulator built with vanilla HTML5, Canvas API, and the Web Audio API.

## Core Concepts & Emergence

Unlike grid-based cellular automata (such as Conway's Game of Life) that operate on discrete binary states, **Particle Life** operates in continuous 2D space.

Emergence is the phenomenon where simple, local, microscopic interactions between agents give rise to complex, organized macroscopic behaviors without any global plan or central coordinator:

1. **Non-Equilibrium Dynamics & Asymmetry**: In classical Newtonian physics, Newton's Third Law enforces that action equals opposite reaction ($F_{AB} = -F_{BA}$). In Particle Life, interaction matrices are intentionally non-symmetric ($A_{i,j} \ne A_{j,i}$). For example, Species A may be attracted to Species B ($+0.8$), while Species B is fiercely repelled by Species A ($-0.8$). This local violation produces eternal pursuit and self-propelling kinetic dynamics.
2. **Phase Changes**: By varying friction ($\mu$), interaction radius ($r_{max}$), and matrix coefficients, the system transitions between gas-like chaos, liquid fluid turbulence, organic cellular structures, and solid crystal lattices.

---

## Physics & Mathematics

For any two particles separated by distance $d$:

$$
F(d) = \begin{cases}
-1.2 \times \left(1 - \frac{d}{r_{min}}\right) & \text{if } 0 < d < r_{min} \quad \text{(Core Repulsion)} \\
A_{i,j} \times \left(1 - \frac{|2d - (r_{max} + r_{min})|}{r_{max} - r_{min}}\right) & \text{if } r_{min} \le d \le r_{max} \quad \text{(Inter-Species Force Ramp)} \\
0 & \text{if } d > r_{max} \quad \text{(Out of Range)}
\end{cases}
$$

- **$r\_{min}$ (Core Repulsion Radius)**: Prevents numerical collapse and clumping into singularities (similar to the Pauli exclusion principle).
- **$r\_{max}$ (Interaction Horizon)**: Maximum distance over which two particles influence each other.
- **$A\_{i,j} \in [-1.0, 1.0]$**: The interaction force matrix where positive denotes attraction and negative denotes repulsion.
- **Viscosity / Damping ($\mu$)**: Applied every step: $\vec{v}_{t+1} = (\vec{v}_t + \vec{a} \cdot \Delta t) \times \mu$.
- **Spatial Hash Grid Partitioning**: Divides space into cells of size $r_{max}$. Neighbors are resolved in $O(1)$ per cell, reducing overall complexity from $O(N^2)$ to $O(N)$, allowing 2,000+ particles at 60 FPS.

---

## Biomes & Curated Presets

- **Primordial Soup**: A balanced ecosystem with multi-species clusters, flowing channels, and swirling vortices.
- **Cellular Mitosis**: Strong mutual attraction with high surface tension produces outer membrane envelopes that encapsulate inner nuclei; perturbations trigger division.
- **Predator & Prey**: A non-commutative cyclical food web ($1 \to 2 \to 3 \dots$) creating migratory waves, evasive swarming, and pack hunting.
- **Spiral Disk**: Angular force vectors convert radial pull into rotational velocity, forming galactic cores with spiral accretion arms.
- **Serpent Chains**: Directed ring graph attractions ($A_{i, i+1} \approx 1$) yielding crawling serpentine filaments that self-steer through space.
- **Crystal Net**: Symmetric positive self-affinity with uniform inter-species repulsion generating geometric crystal lattices.
- **Symbiosis**: Stable binary pairs and synchronized orbital dances.

---

## Interactive Controls

- **Matrix Manipulation**: Click any cell to increase attraction ($+0.25$); right-click to decrease ($-0.25$).
- **Matrix Operators**: Quick buttons for **Symmetric**, **Mutate** (adds Gaussian noise), and **Randomize**.
- **Cursor Force Fields**:
  - `Attract`: Gravitational well pulling particles toward cursor.
  - `Repel`: Disperses particles with high-energy shockwave.
  - `Vortex`: Imparts tangential velocity to generate swirling eddies.
  - `Inject`: Spawns bursts of chosen particle species directly into the soup.
- **Camera**: Scroll wheel zooms in/out; middle-click / Shift+drag pans; double-click resets view.
- **Web Audio Sonification**: Generative harmonic drone synthesizers that detune and modulate based on total kinetic energy.

---

## Tech Stack

- **Vanilla JavaScript (ES6+)**: Zero dependencies, flat typed arrays (`Float32Array`, `Int32Array`) for garbage-collection-free physics loops.
- **HTML5 Canvas**: Batch rendering per species with optional additive bloom glow and motion trail decay.
- **Web Audio API**: Real-time multi-oscillator polyphonic drone and chime engine.
- **Modern Responsive CSS**: Glassmorphic UI, responsive drawer decks, accessible tabs, and telemetry tickers.
