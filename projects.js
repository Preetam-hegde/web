const projects = [
  // ── Featured (pinned to top) ────────────────────────────────────────────
  {
    name: "Inkwell Editorial",
    category: "personal",
    featured: true,
    image: "resource/Image/inkwell.svg",
    link: "https://inkwell.preetamhegde.in",
    description: "A full-stack editorial blog platform with AI-assisted writing, Supabase backend, full-text search, author profiles, bookmarks, and an admin analytics dashboard.",
    tech: ["React", "TypeScript", "Supabase", "TanStack Query", "AI / OpenRouter", "Tailwind CSS"]
  },
  {
    name: "System Design Prototype",
    category: "personal",
    featured: true,
    image: "resource/Image/sysdesign.svg",
    link: "https://sysdesign.preetamhegde.in",
    description: "An interactive system design whiteboard for sketching distributed architectures — nodes, connections, annotations, and exportable diagrams for engineering discussions.",
    tech: ["React", "TypeScript", "Canvas API", "System Design"]
  },

  // ── Personal ────────────────────────────────────────────────────────────
  {
    name: "Bharatvarsha",
    category: "personal",
    image: "resource/Image/bharatvarsha.svg",
    link: "apps/bharatvarsha/index.html",
    description: "Step into the Later Vedic period as a tribal chief — manage resources, make alliances, and shape your civilization's destiny in this historical strategy simulation.",
    tech: ["HTML5", "CSS3", "JavaScript", "Game Design", "Simulation"]
  },
  {
    name: "Natural Selection Simulator",
    category: "personal",
    image: "resource/Image/naturalSelectionSim.svg",
    link: "apps/natural-selection-sim/index.html",
    description: "Watch evolution unfold in real time — organisms with randomized traits compete to survive, reproduce, mutate, and diverge into new species across generations.",
    tech: ["HTML5", "CSS3", "JavaScript", "Canvas API", "Simulation", "Genetics"]
  },
  {
    name: "Idle Empire Builder",
    category: "personal",
    image: "resource/Image/dreamscape.svg",
    link: "apps/dreamscape/index.html",
    description: "A real estate–inspired idle browser game where you invest, expand, and automate your way to an empire — blending reflex challenges with strategic decision-making.",
    tech: ["HTML5", "CSS3", "JavaScript", "Canvas API", "Game Design"]
  },
  {
    name: "Live Analytics Dashboard",
    category: "personal",
    image: "resource/Image/analytics.svg",
    link: "apps/live-analytics-dashboard/index.html",
    description: "A live data dashboard case study that fuses GitHub profile telemetry, optional Plausible pageview analytics, and activity streak insights into animated KPI widgets.",
    tech: ["HTML5", "CSS3", "JavaScript", "Data Visualization", "GitHub API", "Plausible API"]
  },
  {
    name: "GeoLocation Explorer",
    category: "personal",
    image: "resource/Image/geoLocation.svg",
    link: "apps/geo-location/index.html",
    description: "Instantly retrieve your geographic coordinates, altitude, and accuracy radius via the browser Geolocation API, with map embed and shareable location links.",
    tech: ["HTML5", "CSS3", "JavaScript", "Geolocation API", "Maps"]
  },

  // ── For-fun / FCC ────────────────────────────────────────────────────────
  {
    name: "Reflex Arena",
    category: "fcc",
    image: "resource/Image/gamecircle.svg",
    link: "apps/aim-trainer/index.html",
    description: "A browser-based FPS aim trainer with configurable FOV, target size, duration, and difficulty modes — track accuracy, hit rate, and personal records over sessions.",
    tech: ["HTML5", "CSS3", "JavaScript", "Canvas API", "Game Design", "Audio API"]
  },
  {
    name: "Game of Life",
    category: "fcc",
    image: "resource/Image/cellularAutomata.svg",
    link: "apps/cellular-automata/index.html",
    description: "An interactive canvas implementation of Conway's Game of Life — draw seed patterns, control simulation speed, and observe emergent complexity from simple rules.",
    tech: ["HTML5", "CSS3", "JavaScript", "Canvas API", "Algorithms", "Cellular Automata"]
  },
  {
    name: "Nine Dimension",
    category: "fcc",
    image: "resource/Image/9D.svg",
    link: "apps/nine-dimension/index.html",
    description: "Nine distinct physics and vector playgrounds in a single app — each panel demonstrates a different principle through interactive, real-time canvas animations.",
    tech: ["HTML5", "CSS3", "JavaScript", "Canvas API", "Physics", "Vectors"]
  },
  {
    name: "Sorting Algorithm Visualizer",
    category: "fcc",
    image: "resource/Image/sort.svg",
    link: "apps/analyser/index.html",
    description: "Watch Bubble, Insertion, Selection, Quick, and Merge sorts animate step-by-step — compare time complexities live and develop intuition for algorithmic efficiency.",
    tech: ["HTML5", "CSS3", "JavaScript", "Algorithms", "Data Structures", "Animation"]
  },
  {
    name: "Verilog Vectors Playground",
    category: "fcc",
    image: "resource/Image/vector.svg",
    link: "apps/vector-01/index.html",
    description: "A visual learning tool that demystifies Verilog vector operations — manipulate bit-widths, indexing, and part-selects interactively to reinforce digital design concepts.",
    tech: ["HTML5", "CSS3", "JavaScript", "Digital Design", "Verilog"]
  },
  {
    name: "Ball Physics Illusion",
    category: "fcc",
    image: "resource/Image/BGI.svg",
    link: "apps/bg-illusion/index.html",
    description: "A mesmerizing canvas experience where hundreds of collision-aware balls create vivid optical illusions through physics-driven motion, color blending, and layered trails.",
    tech: ["HTML5", "CSS3", "JavaScript", "Canvas API", "Physics", "Animation"]
  },
  {
    name: "Pomodoro Timer",
    category: "fcc",
    image: "resource/Image/pomoTimer.svg",
    link: "apps/pomodoro/index.html",
    description: "A clean, customizable Pomodoro timer with work/break cycle management, audio alerts, and session history — built to keep deep-work streaks on track.",
    tech: ["HTML5", "CSS3", "JavaScript", "Audio API", "Productivity"]
  },
  {
    name: "Random Quote Generator",
    category: "fcc",
    image: "resource/Image/randomQuota.svg",
    link: "apps/quote/index.html",
    description: "Fetch and display a new inspirational quote on demand from a public REST API — with smooth transitions and one-click sharing to social platforms.",
    tech: ["HTML5", "CSS3", "JavaScript", "REST API", "Fetch API"]
  },
  {
    name: "Dear Diary",
    category: "personal",
    image: "resource/Image/diary.svg",
    link: "https://sites.google.com/view/ptwo-diary",
    description: "An external Google Sites experiment for journaling and notes — not part of this repository's in-repo app set.",
    tech: ["Google Sites", "Content Writing"]
  }
];

/* ── Post-render image + featured badge enhancement ────────────────────────
   Watches the project container and injects a .card-img-area into every
   .project-card after script.js's renderModernProjects() populates the grid.
   Uses a MutationObserver so it also fires on search/filter re-renders.
────────────────────────────────────────────────────────────────────────── */
function setupCardEnhancement() {
  const container = document.getElementById('projectContainer');
  if (!container) return;

  const imageMap   = Object.fromEntries(projects.map(p => [p.name, p.image]));
  const featuredSet = new Set(projects.filter(p => p.featured).map(p => p.name));

  function enhanceCard(card) {
    if (card.dataset.enhanced) return;
    card.dataset.enhanced = '1';

    const nameEl = card.querySelector('h3');
    const name   = nameEl?.textContent?.trim() ?? '';
    const src    = imageMap[name];

    const area = document.createElement('div');
    area.className = 'card-img-area';

    if (src) {
      const img = document.createElement('img');
      img.src     = src;
      img.alt     = '';
      img.className = 'card-proj-img';
      img.loading  = 'lazy';
      area.appendChild(img);
    }

    if (featuredSet.has(name)) {
      card.classList.add('is-featured');
      const badge = document.createElement('span');
      badge.className   = 'card-feat-badge';
      badge.textContent = 'Featured';
      area.appendChild(badge);
    }

    card.insertBefore(area, card.firstChild);
  }

  const observer = new MutationObserver(() => {
    container.querySelectorAll('.project-card:not([data-enhanced])').forEach(enhanceCard);
    // Disconnect once all rendered cards are enhanced (no unenhanced cards remain)
    if (!container.querySelector('.project-card:not([data-enhanced])')) {
      observer.disconnect();
    }
  });
  observer.observe(container, { childList: true });

  // Catch any cards already present (e.g. if DOMContentLoaded fires late)
  container.querySelectorAll('.project-card:not([data-enhanced])').forEach(enhanceCard);
}

document.addEventListener('DOMContentLoaded', setupCardEnhancement);
