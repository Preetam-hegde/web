const projects = [
  // ── Featured (pinned to top) ────────────────────────────────────────────
  {
    name: "Inkwell Editorial",
    category: "personal",
    featured: true,
    icon: "feather",
    link: "https://inkwell.preetamhegde.in",
    description: "A full-stack editorial blog platform with AI-assisted writing, Supabase backend, full-text search, author profiles, bookmarks, and an admin analytics dashboard.",
    tech: ["React", "TypeScript", "Supabase", "TanStack Query", "AI / OpenRouter", "Tailwind CSS"]
  },
  {
    name: "System Design Prototype",
    category: "personal",
    featured: true,
    icon: "network",
    link: "https://sysdesign.preetamhegde.in",
    description: "An interactive system design whiteboard for sketching distributed architectures — nodes, connections, annotations, and exportable diagrams for engineering discussions.",
    tech: ["React", "TypeScript", "Canvas API", "System Design"]
  },

  // ── Personal ────────────────────────────────────────────────────────────
  {
    name: "Bharatvarsha",
    category: "personal",
    icon: "tent",
    link: "apps/bharatvarsha/index.html",
    description: "Lead a Vedic clan from a riverside village to a Mahajanapada — a nine-chapter story, royal decisions, sacred rites, and a living settlement that shifts with day, night, and monsoon.",
    tech: ["HTML5", "CSS3", "JavaScript", "Game Design", "Simulation"]
  },
  {
    name: "Natural Selection Simulator",
    category: "personal",
    icon: "dna",
    link: "apps/natural-selection-sim/index.html",
    description: "Watch evolution unfold in real time — organisms with randomized traits compete to survive, reproduce, mutate, and diverge into new species across generations.",
    tech: ["HTML5", "CSS3", "JavaScript", "Canvas API", "Simulation", "Genetics"]
  },
  {
    name: "Idle Empire Builder",
    category: "personal",
    icon: "building-2",
    link: "apps/dreamscape/index.html",
    description: "A real estate–inspired idle browser game where you invest, expand, and automate your way to an empire — blending reflex challenges with strategic decision-making.",
    tech: ["HTML5", "CSS3", "JavaScript", "Canvas API", "Game Design"]
  },
  {
    name: "Keystorm",
    category: "personal",
    icon: "keyboard",
    link: "apps/keystorm/index.html",
    description: "A typing game with five modes — Sprint, Razor, Rain, Orbit, and Zen — combo-driven particle effects, and a per-key analytics dashboard with WPM history and a keyboard heatmap.",
    tech: ["HTML5", "CSS3", "JavaScript", "Canvas API", "SVG Charts", "Game Design"]
  },
  {
    name: "DevPulse: Live Telemetry Matrix",
    category: "personal",
    icon: "activity",
    link: "apps/live-analytics-dashboard/index.html",
    description: "An over-engineered real-time developer and systems telemetry matrix fusing GitHub deep analytics, client Web Vitals, global edge latency probes, live synthetic streaming, and Plausible metrics.",
    tech: ["HTML5", "CSS3", "JavaScript", "Web Vitals API", "Canvas API", "Web Audio API", "GitHub API", "Plausible API"]
  },
  {
    name: "GeoLocation Explorer",
    category: "personal",
    icon: "map-pin",
    link: "apps/geo-location/index.html",
    description: "Instantly retrieve your geographic coordinates, altitude, and accuracy radius via the browser Geolocation API, with map embed and shareable location links.",
    tech: ["HTML5", "CSS3", "JavaScript", "Geolocation API", "Maps"]
  },

  // ── For-fun / FCC ────────────────────────────────────────────────────────
  {
    name: "Reflex Arena",
    category: "fcc",
    icon: "crosshair",
    link: "apps/aim-trainer/index.html",
    description: "A browser-based FPS aim trainer with configurable FOV, target size, duration, and difficulty modes — track accuracy, hit rate, and personal records over sessions.",
    tech: ["HTML5", "CSS3", "JavaScript", "Canvas API", "Game Design", "Audio API"]
  },
  {
    name: "Game of Life",
    category: "fcc",
    icon: "grid-3x3",
    link: "apps/cellular-automata/index.html",
    description: "An interactive canvas implementation of Conway's Game of Life — draw seed patterns, control simulation speed, and observe emergent complexity from simple rules.",
    tech: ["HTML5", "CSS3", "JavaScript", "Canvas API", "Algorithms", "Cellular Automata"]
  },
  {
    name: "Nine Dimension",
    category: "fcc",
    icon: "orbit",
    link: "apps/nine-dimension/index.html",
    description: "Nine distinct physics and vector playgrounds in a single app — each panel demonstrates a different principle through interactive, real-time canvas animations.",
    tech: ["HTML5", "CSS3", "JavaScript", "Canvas API", "Physics", "Vectors"]
  },
  {
    name: "Sorting Algorithm Visualizer",
    category: "fcc",
    icon: "chart-no-axes-column-increasing",
    link: "apps/analyser/index.html",
    description: "Watch Bubble, Insertion, Selection, Quick, and Merge sorts animate step-by-step — compare time complexities live and develop intuition for algorithmic efficiency.",
    tech: ["HTML5", "CSS3", "JavaScript", "Algorithms", "Data Structures", "Animation"]
  },
  {
    name: "Verilog Vectors Playground",
    category: "fcc",
    icon: "cpu",
    link: "apps/vector-01/index.html",
    description: "A visual learning tool that demystifies Verilog vector operations — manipulate bit-widths, indexing, and part-selects interactively to reinforce digital design concepts.",
    tech: ["HTML5", "CSS3", "JavaScript", "Digital Design", "Verilog"]
  },
  {
    name: "Ball Physics Illusion",
    category: "fcc",
    icon: "atom",
    link: "apps/bg-illusion/index.html",
    description: "A mesmerizing canvas experience where hundreds of collision-aware balls create vivid optical illusions through physics-driven motion, color blending, and layered trails.",
    tech: ["HTML5", "CSS3", "JavaScript", "Canvas API", "Physics", "Animation"]
  },
  {
    name: "Pomodoro Timer",
    category: "fcc",
    icon: "timer",
    link: "apps/pomodoro/index.html",
    description: "A clean, customizable Pomodoro timer with work/break cycle management, audio alerts, and session history — built to keep deep-work streaks on track.",
    tech: ["HTML5", "CSS3", "JavaScript", "Audio API", "Productivity"]
  },
  {
    name: "Random Quote Generator",
    category: "fcc",
    icon: "quote",
    link: "apps/quote/index.html",
    description: "Fetch and display a new inspirational quote on demand from a public REST API — with smooth transitions and one-click sharing to social platforms.",
    tech: ["HTML5", "CSS3", "JavaScript", "REST API", "Fetch API"]
  },
  {
    name: "Dear Diary",
    category: "personal",
    icon: "notebook-pen",
    link: "https://sites.google.com/view/ptwo-diary",
    description: "An external Google Sites experiment for journaling and notes — not part of this repository's in-repo app set.",
    tech: ["Google Sites", "Content Writing"]
  }
];

// Lucide icons (ISC, https://lucide.dev) — stroke uses currentColor so each UI themes them via CSS `color`.
const projectIcons = {
  'feather': '<path d="M14.086 18.412A2 2 0 0112.67 19H5v-7.672a2 2 0 01.586-1.414L11.75 3.75a6 6 0 118.49 8.49z"/> <path d="M16 8 2 22"/> <path d="M17.488 15H9"/>',
  'network': '<rect x="16" y="16" width="6" height="6" rx="1"/> <rect x="2" y="16" width="6" height="6" rx="1"/> <rect x="9" y="2" width="6" height="6" rx="1"/> <path d="M5 16v-3a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v3"/> <path d="M12 12V8"/>',
  'tent': '<path d="M3.5 21 14 3"/> <path d="M20.5 21 10 3"/> <path d="M15.5 21 12 15l-3.5 6"/> <path d="M2 21h20"/>',
  'dna': '<path d="m10 16 1.5 1.5"/> <path d="m14 8-1.5-1.5"/> <path d="M15 2c-1.798 1.998-2.518 3.995-2.807 5.993"/> <path d="m16.5 10.5 1 1"/> <path d="m17 6-2.891-2.891"/> <path d="M2 15c6.667-6 13.333 0 20-6"/> <path d="m20 9 .891.891"/> <path d="M3.109 14.109 4 15"/> <path d="m6.5 12.5 1 1"/> <path d="m7 18 2.891 2.891"/> <path d="M9 22c1.798-1.998 2.518-3.995 2.807-5.993"/>',
  'keyboard': '<path d="M10 8h.01"/> <path d="M12 12h.01"/> <path d="M14 8h.01"/> <path d="M16 12h.01"/> <path d="M18 8h.01"/> <path d="M6 8h.01"/> <path d="M7 16h10"/> <path d="M8 12h.01"/> <rect width="20" height="16" x="2" y="4" rx="2"/>',
  'building-2':'<path d="M10 12h4"/> <path d="M10 8h4"/> <path d="M14 21v-3a2 2 0 0 0-4 0v3"/> <path d="M6 10H4a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-2"/> <path d="M6 21V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v16"/>',
  'activity': '<path d="M22 12h-2.48a2 2 0 0 0-1.93 1.46l-2.35 8.36a.25.25 0 0 1-.48 0L9.24 2.18a.25.25 0 0 0-.48 0l-2.35 8.36A2 2 0 0 1 4.48 12H2"/>',
  'chart-no-axes-combined': '<path d="M12 16v5"/> <path d="M16 14.639V21"/> <path d="M20 10.656V21"/> <path d="m22 3-8.646 8.646a.5.5 0 0 1-.708 0L9.354 8.354a.5.5 0 0 0-.707 0L2 15"/> <path d="M4 18.463V21"/> <path d="M8 14.656V21"/>',
  'map-pin': '<path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/> <circle cx="12" cy="10" r="3"/>',
  'crosshair': '<circle cx="12" cy="12" r="10"/> <line x1="22" x2="18" y1="12" y2="12"/> <line x1="6" x2="2" y1="12" y2="12"/> <line x1="12" x2="12" y1="6" y2="2"/> <line x1="12" x2="12" y1="22" y2="18"/>',
  'grid-3x3': '<rect width="18" height="18" x="3" y="3" rx="2"/> <path d="M3 9h18"/> <path d="M3 15h18"/> <path d="M9 3v18"/> <path d="M15 3v18"/>',
  'orbit': '<path d="M20.341 6.484A10 10 0 0 1 10.266 21.85"/> <path d="M3.659 17.516A10 10 0 0 1 13.74 2.152"/> <circle cx="12" cy="12" r="3"/> <circle cx="19" cy="5" r="2"/> <circle cx="5" cy="19" r="2"/>',
  'chart-no-axes-column-increasing': '<path d="M5 21v-6"/> <path d="M12 21V9"/> <path d="M19 21V3"/>',
  'cpu': '<path d="M12 20v2"/> <path d="M12 2v2"/> <path d="M17 20v2"/> <path d="M17 2v2"/> <path d="M2 12h2"/> <path d="M2 17h2"/> <path d="M2 7h2"/> <path d="M20 12h2"/> <path d="M20 17h2"/> <path d="M20 7h2"/> <path d="M7 20v2"/> <path d="M7 2v2"/> <rect x="4" y="4" width="16" height="16" rx="2"/> <rect x="8" y="8" width="8" height="8" rx="1"/>',
  'atom': '<circle cx="12" cy="12" r="1"/> <path d="M20.2 20.2c2.04-2.03.02-7.36-4.5-11.9-4.54-4.52-9.87-6.54-11.9-4.5-2.04 2.03-.02 7.36 4.5 11.9 4.54 4.52 9.87 6.54 11.9 4.5Z"/> <path d="M15.7 15.7c4.52-4.54 6.54-9.87 4.5-11.9-2.03-2.04-7.36-.02-11.9 4.5-4.52 4.54-6.54 9.87-4.5 11.9 2.03 2.04 7.36.02 11.9-4.5Z"/>',
  'timer': '<line x1="10" x2="14" y1="2" y2="2"/> <line x1="12" x2="15" y1="14" y2="11"/> <circle cx="12" cy="14" r="8"/>',
  'quote': '<path d="M16 3a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2 1 1 0 0 1 1 1v1a2 2 0 0 1-2 2 1 1 0 0 0-1 1v2a1 1 0 0 0 1 1 6 6 0 0 0 6-6V5a2 2 0 0 0-2-2z"/> <path d="M5 3a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2 1 1 0 0 1 1 1v1a2 2 0 0 1-2 2 1 1 0 0 0-1 1v2a1 1 0 0 0 1 1 6 6 0 0 0 6-6V5a2 2 0 0 0-2-2z"/>',
  'notebook-pen': '<path d="M13.4 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-7.4"/> <path d="M2 6h4"/> <path d="M2 10h4"/> <path d="M2 14h4"/> <path d="M2 18h4"/> <path d="M21.378 5.626a1 1 0 1 0-3.004-3.004l-5.01 5.012a2 2 0 0 0-.506.854l-.837 2.87a.5.5 0 0 0 .62.62l2.87-.837a2 2 0 0 0 .854-.506z"/>',
};

function projectIcon(name) {
  return `<svg class="project-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${projectIcons[name] || ''}</svg>`;
}
