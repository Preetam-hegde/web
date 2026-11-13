const projects = [
	// ── Featured (pinned to top) ────────────────────────────────────────────
	{
		name: "Inkwell Editorial",
		shot: "resource/Image/projects/inkwell.jpg",
		story: "A live reading-and-writing platform, not a demo: feed, topics, search, bookmarks and notifications, an AI drafting assistant, and an admin analytics dashboard, all on a Supabase backend.",
		category: "personal",
		featured: true,
		icon: "feather",
		link: "https://inkwell.preetamhegde.in",
		description:
			"A full-stack editorial blog platform with AI-assisted writing, Supabase backend, full-text search, author profiles, bookmarks, and an admin analytics dashboard.",
		tech: [
			"React",
			"TypeScript",
			"Supabase",
			"TanStack Query",
			"AI / OpenRouter",
			"Tailwind CSS",
		],
	},
	{
		name: "System Design Prototype",
		shot: "resource/Image/projects/sysdesign.jpg",
		story: "A whiteboard for sketching distributed architectures. Drag in components, wire them together, annotate, and export the diagram for your next design review.",
		category: "personal",
		featured: true,
		icon: "network",
		link: "https://sysdesign.preetamhegde.in",
		description:
			"An interactive system design whiteboard for sketching distributed architectures — nodes, connections, annotations, and exportable diagrams for engineering discussions.",
		tech: ["React", "TypeScript", "Canvas API", "System Design"],
	},

	// ── Games & Simulations ──────────────────────────────────────────────────
	{
		name: "Wyrdboard",
		shot: "apps/wyrdboard/assets/preview.png",
		blurb:
			"Eight excavated fragments. Five hidden rules. Question the stone and name them to decipher a new tablet every day.",
		category: "games",
		icon: "notebook-pen",
		link: "apps/wyrdboard/index.html",
		description:
			"A daily deduction game: watch eight replayable fragments, probe a deterministic stone, and infer five hidden rules from 3,500 possible rulesets. A guided four-step path, clarity gauge, optional foresight predictions, XP, levels, badges, a records museum with export and a year of generated, solver-verified puzzles.",
		tech: ["TypeScript", "SVG", "Canvas API", "Web Audio API", "Game Design"],
	},
	{
		name: "Bag & Blade",
		shot: "resource/Image/projects/bag-and-blade.jpg",
		blurb: "Tetris-grid inventory roguelike: rotate and place gear so adjacency synergies win fights.",
		category: "games",
		icon: "backpack",
		link: "apps/bag-and-blade/index.html",
		description:
			"A medieval parchment inventory management RPG and spatial puzzle roguelike — arrange weapons, shields, and potions on a Tetris grid where rotation, placement, and adjacency synergies drive tactical combat.",
		tech: [
			"HTML5",
			"CSS3",
			"JavaScript",
			"Web Audio API",
			"Game Design",
			"Pixel Art",
		],
	},
	{
		name: "VectorDrift",
		shot: "resource/Image/projects/vectordrift.jpg",
		blurb: "Bullet-hell grazing game. Dodge close to score, across four arenas and one brutal Hell Mode.",
		category: "games",
		icon: "zap",
		link: "apps/vectordrift/index.html",
		description:
			"Micro-evasion and bullet-hell grazing game — pure cursor agility, spatial anticipation, and risk-reward flow state across Graze Arena, Vortex, Laser Grid, and the all-out Hell Mode.",
		tech: [
			"HTML5",
			"CSS3",
			"JavaScript",
			"Canvas API",
			"Web Audio API",
			"Telemetry",
		],
	},
	{
		name: "Reflex Arena",
		shot: "resource/Image/projects/aim-trainer.jpg",
		blurb: "Browser aim trainer with six drills, tunable FOV, target size and difficulty, and personal records.",
		category: "games",
		icon: "crosshair",
		link: "apps/aim-trainer/index.html",
		description:
			"A browser-based FPS aim trainer with configurable FOV, target size, duration, and difficulty modes — track accuracy, hit rate, and personal records over sessions.",
		tech: [
			"HTML5",
			"CSS3",
			"JavaScript",
			"Canvas API",
			"Game Design",
			"Audio API",
		],
	},
	{
		name: "Keystorm",
		shot: "resource/Image/projects/keystorm.jpg",
		blurb: "Typing game with five modes, combo particles and a per-key WPM heatmap.",
		category: "games",
		icon: "keyboard",
		link: "apps/keystorm/index.html",
		description:
			"A typing game with five modes — Sprint, Razor, Rain, Orbit, and Zen — combo-driven particle effects, and a per-key analytics dashboard with WPM history and a keyboard heatmap.",
		tech: [
			"HTML5",
			"CSS3",
			"JavaScript",
			"Canvas API",
			"SVG Charts",
			"Game Design",
		],
	},
	{
		name: "Faceoff",
		shot: "resource/Image/projects/faceoff.jpg",
		blurb: "Two-player games on one phone or two: timing duels, Connect 4, party and couple games. No sign-up.",
		category: "games",
		icon: "swords",
		link: "apps/faceoff/index.html",
		description:
			"Two players, one phone (split-screen or pass-and-play) or two phones with a 4-letter room code. 34 two-player games in six categories: reflex, timing, rhythm, perception, board and couple, including Perceptle-style tests (Count, Track, Angle, Split), Keep the Beat, Copy the Rhythm, Simon, Dots & Boxes and Hangman Duel on your phone keyboard, and couple games: Tic-Tac-Toe, Connect 4, Memory Match, Green Flag Red Flag, Would You Rather, Who\u0027s More Likely, Never Have I Ever, Compatibility, Truth or Dare and Sync Tap — with your own dares, stats, offline caching and a shareable result card. Mobile-first, no sign-up.",
		tech: [
			"HTML5",
			"CSS3",
			"JavaScript",
			"Canvas API",
			"Web Audio API",
			"Touch Input",
			"Game Design",
		],
	},
	{
		name: "Synapse",
		shot: "resource/Image/projects/synapse.jpg",
		blurb: "Seven brain-training modes, from Stroop Duel to N-Back, for fast working-memory drills.",
		category: "games",
		icon: "brain",
		link: "apps/synapse/index.html",
		description:
			"High-speed working memory and cognitive matrix — train visual memory, mental processing speed, and rapid pattern recall across Chimp Matrix, Stroop Duel, Spatial Span, Change Blindness, Visual Matrix, N-Back Flux, and Neural Link modes.",
		tech: [
			"HTML5",
			"CSS3",
			"JavaScript",
			"Canvas API",
			"Web Audio API",
			"SVG Charts",
			"Cognitive Benchmarks",
		],
	},
	{
		name: "Idle Empire Builder",
		shot: "resource/Image/projects/dreamscape.jpg",
		blurb: "Real-estate idle game where reflex mini-challenges feed long-term strategy.",
		category: "games",
		icon: "building-2",
		link: "apps/dreamscape/index.html",
		description:
			"A real estate–inspired idle browser game where you invest, expand, and automate your way to an empire — blending reflex challenges with strategic decision-making.",
		tech: ["HTML5", "CSS3", "JavaScript", "Canvas API", "Game Design"],
	},
	{
		name: "Bharatvarsha",
		shot: "resource/Image/projects/bharatvarsha.jpg",
		blurb: "A nine-chapter story: guide a Vedic clan from a river village to a Mahajanapada.",
		category: "games",
		icon: "tent",
		link: "apps/bharatvarsha/index.html",
		description:
			"Lead a Vedic clan from a riverside village to a Mahajanapada — a nine-chapter story, royal decisions, sacred rites, and a living settlement that shifts with day, night, and monsoon.",
		tech: ["HTML5", "CSS3", "JavaScript", "Game Design", "Simulation"],
	},
	{
		name: "Natural Selection Simulator",
		shot: "resource/Image/projects/natural-selection-sim.jpg",
		story: "Organisms with polygenic traits compete across biomes and trophic tiers while you watch. Trigger a meteor, inspect any creature's genes, and track the population live. A spatial hash grid keeps neighbour queries cheap.",
		category: "games",
		icon: "dna",
		link: "apps/natural-selection-sim/index.html",
		description:
			"Watch evolution unfold beyond limits — organisms with complex polygenic traits, multi-tier trophic niches, and biomes compete in an expansive world with real-time analytics, cataclysms, and deep gene inspection.",
		tech: [
			"HTML5",
			"CSS3",
			"JavaScript",
			"Canvas API",
			"Spatial Hash Grid",
			"Evolutionary Dynamics",
		],
	},
	{
		name: "Particle Life",
		shot: "resource/Image/projects/particle-life.jpg",
		blurb: "Tune species attraction rules and watch cells, serpents and orbiting swarms emerge.",
		category: "games",
		icon: "sparkles",
		link: "apps/particle-life/index.html",
		description:
			"An emergent artificial ecosystem simulator — configure multi-species attraction/repulsion matrices to observe spontaneous cellular life, serpent chains, and orbital swarms with generative sound synthesis.",
		tech: [
			"HTML5",
			"CSS3",
			"JavaScript",
			"Canvas API",
			"Web Audio API",
			"Physics",
			"Artificial Life",
		],
	},
	{
		name: "Illusion Museum",
		shot: "resource/Image/projects/illusion-museum.jpg",
		blurb: "Nine interactive exhibits: living orbs, a warp-speed starfield and classic optical illusions.",
		category: "games",
		icon: "atom",
		link: "apps/illusion-museum/index.html",
		description:
			"Nine interactive exhibits in one museum — living orbs that bounce, divide, shatter or fall into a gravity well, a 3D warp-speed starfield, and classic optical illusions from hypno spirals to rotating snakes — with nine palettes and an auto-tour.",
		tech: ["HTML5", "CSS3", "JavaScript", "Canvas API", "Physics", "Animation"],
	},

	// ── Web Apps & Platforms ────────────────────────────────────────────────
	{
		name: "DevPulse: Live Telemetry Matrix",
		shot: "resource/Image/projects/live-analytics-dashboard.jpg",
		story: "Five live data sources (GitHub analytics, client Web Vitals, global edge latency probes, a synthetic stream and Plausible metrics) fused into one real-time telemetry matrix.",
		category: "personal",
		icon: "activity",
		link: "apps/live-analytics-dashboard/index.html",
		description:
			"An over-engineered real-time developer and systems telemetry matrix fusing GitHub deep analytics, client Web Vitals, global edge latency probes, live synthetic streaming, and Plausible metrics.",
		tech: [
			"HTML5",
			"CSS3",
			"JavaScript",
			"Web Vitals API",
			"Canvas API",
			"Web Audio API",
			"GitHub API",
			"Plausible API",
		],
	},
	{
		name: "GeoLocation Explorer",
		shot: "resource/Image/projects/geo-location.jpg",
		blurb: "Coordinates, altitude and accuracy from the Geolocation API, with a shareable map link.",
		category: "personal",
		icon: "map-pin",
		link: "apps/geo-location/index.html",
		description:
			"Instantly retrieve your geographic coordinates, altitude, and accuracy radius via the browser Geolocation API, with map embed and shareable location links.",
		tech: ["HTML5", "CSS3", "JavaScript", "Geolocation API", "Maps"],
	},
	{
		name: "Dear Diary",
		shot: "resource/Image/projects/dear-diary.jpg",
		blurb: "A scrapbook studio: stickers, washi tape and doodles, with whole pages saved in the URL.",
		category: "personal",
		icon: "notebook-pen",
		link: "apps/dear-diary/index.html",
		description:
			"A cozy, tactile DIY scrapbooking and personal journaling studio. Decorate with cute stickers, washi tapes, polaroids, sticky notes and freehand doodles, with instant URL-encoded state saving and sharing.",
		tech: [
			"HTML5",
			"CSS3",
			"JavaScript",
			"URL State Compression",
			"Canvas API",
			"Web Audio API",
		],
	},

	// ── Interactive Studies & Visualizers (FCC) ──────────────────────────────
	{
		name: "DSA Study Studio",
		shot: "resource/Image/projects/analyser.jpg",
		blurb: "An all-in-one DSA study guide with worked examples, interview practice and 24 visual explorations.",
		category: "fcc",
		icon: "chart-no-axes-column-increasing",
		link: "apps/analyser/index.html",
		description:
			"Learn DSA through detailed lessons, reusable coding patterns, worked examples and important interview questions with progressive hints and solutions. Connect the ideas to 24 interactive visualizations with scrubbable playback and live pseudocode.",
		tech: [
			"HTML5",
			"CSS3",
			"JavaScript",
			"SVG",
			"Canvas API",
			"Algorithms",
			"Data Structures",
		],
	},
	{
		name: "AI & ML Study Studio",
		shot: "resource/Image/projects/ai-ml-lab.jpg",
		blurb: "An all-in-one AI and ML study guide with worked examples, guided interview practice, and visual experiments.",
		category: "fcc",
		icon: "brain",
		link: "apps/ai-ml-lab/index.html",
		description:
			"Learn AI and machine learning through 35 detailed lessons, numerical worked examples, 140 interview questions with progressive hints and answers, a revision desk, primary references, and interactive visual experiments covering classical ML, deep learning, LLMs and production systems.",
		tech: ["HTML5", "CSS3", "JavaScript", "SVG", "Machine Learning", "AI"],
	},
	{
		name: "Pomodoro Timer",
		shot: "resource/Image/projects/pomodoro.jpg",
		blurb: "Work and break cycles with audio alerts and session history.",
		category: "fcc",
		icon: "timer",
		link: "apps/pomodoro/index.html",
		description:
			"A clean, customizable Pomodoro timer with work/break cycle management, audio alerts, and session history — built to keep deep-work streaks on track.",
		tech: ["HTML5", "CSS3", "JavaScript", "Audio API", "Productivity"],
	},
	{
		name: "Random Quote Generator",
		shot: "resource/Image/projects/quote.jpg",
		blurb: "A quote on demand from a public REST API, with one-click sharing.",
		category: "fcc",
		icon: "quote",
		link: "apps/quote/index.html",
		description:
			"Fetch and display a new inspirational quote on demand from a public REST API — with smooth transitions and one-click sharing to social platforms.",
		tech: ["HTML5", "CSS3", "JavaScript", "REST API", "Fetch API"],
	},
	{
		name: "Star Savior Guide",
		shot: "apps/star-savior-guide/images/journey_bg/ILLUST_BG_JOURNEY_EASTERN_SWORDMASTER_01.webp",
		blurb: "A read-first Star Savior reference: tier list, team builder, savior guides, arcana, stories and game-system guides.",
		category: "games",
		icon: "sparkles",
		link: "apps/star-savior-guide/index.html",
		description:
			"A fast, fan-made companion for Star Savior. Separate PvE and PvP tier lists with usage and investment signals, a team builder that works from the saviors you own, in-depth savior pages (kit, review, build, teams, stats), arcana database, story and game-system guides, hover details, quick search and a mobile-friendly layout. No account, no build step.",
		tech: [
			"HTML5",
			"CSS3",
			"JavaScript",
			"Canvas API",
			"Client-side routing",
			"JSON data",
		],
	},
];

// Lucide icons (ISC, https://lucide.dev) — stroke uses currentColor so each UI themes them via CSS `color`.
const projectIcons = {
	sparkles:
		'<path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/> <path d="M5 3v4"/> <path d="M19 17v4"/> <path d="M3 5h4"/> <path d="M17 19h4"/>	',
	feather:
		'<path d="M14.086 18.412A2 2 0 0112.67 19H5v-7.672a2 2 0 01.586-1.414L11.75 3.75a6 6 0 118.49 8.49z"/> <path d="M16 8 2 22"/> <path d="M17.488 15H9"/>',
	network:
		'<rect x="16" y="16" width="6" height="6" rx="1"/> <rect x="2" y="16" width="6" height="6" rx="1"/> <rect x="9" y="2" width="6" height="6" rx="1"/> <path d="M5 16v-3a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v3"/> <path d="M12 12V8"/>',
	tent: '<path d="M3.5 21 14 3"/> <path d="M20.5 21 10 3"/> <path d="M15.5 21 12 15l-3.5 6"/> <path d="M2 21h20"/>',
	dna: '<path d="m10 16 1.5 1.5"/> <path d="m14 8-1.5-1.5"/> <path d="M15 2c-1.798 1.998-2.518 3.995-2.807 5.993"/> <path d="m16.5 10.5 1 1"/> <path d="m17 6-2.891-2.891"/> <path d="M2 15c6.667-6 13.333 0 20-6"/> <path d="m20 9 .891.891"/> <path d="M3.109 14.109 4 15"/> <path d="m6.5 12.5 1 1"/> <path d="m7 18 2.891 2.891"/> <path d="M9 22c1.798-1.998 2.518-3.995 2.807-5.993"/>',
	keyboard:
		'<path d="M10 8h.01"/> <path d="M12 12h.01"/> <path d="M14 8h.01"/> <path d="M16 12h.01"/> <path d="M18 8h.01"/> <path d="M6 8h.01"/> <path d="M7 16h10"/> <path d="M8 12h.01"/> <rect width="20" height="16" x="2" y="4" rx="2"/>',
	"building-2":
		'<path d="M10 12h4"/> <path d="M10 8h4"/> <path d="M14 21v-3a2 2 0 0 0-4 0v3"/> <path d="M6 10H4a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-2"/> <path d="M6 21V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v16"/>',
	activity:
		'<path d="M22 12h-2.48a2 2 0 0 0-1.93 1.46l-2.35 8.36a.25.25 0 0 1-.48 0L9.24 2.18a.25.25 0 0 0-.48 0l-2.35 8.36A2 2 0 0 1 4.48 12H2"/>',
	"chart-no-axes-combined":
		'<path d="M12 16v5"/> <path d="M16 14.639V21"/> <path d="M20 10.656V21"/> <path d="m22 3-8.646 8.646a.5.5 0 0 1-.708 0L9.354 8.354a.5.5 0 0 0-.707 0L2 15"/> <path d="M4 18.463V21"/> <path d="M8 14.656V21"/>',
	"map-pin":
		'<path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/> <circle cx="12" cy="10" r="3"/>',
	crosshair:
		'<circle cx="12" cy="12" r="10"/> <line x1="22" x2="18" y1="12" y2="12"/> <line x1="6" x2="2" y1="12" y2="12"/> <line x1="12" x2="12" y1="6" y2="2"/> <line x1="12" x2="12" y1="22" y2="18"/>',
	"grid-3x3":
		'<rect width="18" height="18" x="3" y="3" rx="2"/> <path d="M3 9h18"/> <path d="M3 15h18"/> <path d="M9 3v18"/> <path d="M15 3v18"/>',
	orbit:
		'<path d="M20.341 6.484A10 10 0 0 1 10.266 21.85"/> <path d="M3.659 17.516A10 10 0 0 1 13.74 2.152"/> <circle cx="12" cy="12" r="3"/> <circle cx="19" cy="5" r="2"/> <circle cx="5" cy="19" r="2"/>',
	"chart-no-axes-column-increasing":
		'<path d="M5 21v-6"/> <path d="M12 21V9"/> <path d="M19 21V3"/>',
	cpu: '<path d="M12 20v2"/> <path d="M12 2v2"/> <path d="M17 20v2"/> <path d="M17 2v2"/> <path d="M2 12h2"/> <path d="M2 17h2"/> <path d="M2 7h2"/> <path d="M20 12h2"/> <path d="M20 17h2"/> <path d="M20 7h2"/> <path d="M7 20v2"/> <path d="M7 2v2"/> <rect x="4" y="4" width="16" height="16" rx="2"/> <rect x="8" y="8" width="8" height="8" rx="1"/>',
	atom: '<circle cx="12" cy="12" r="1"/> <path d="M20.2 20.2c2.04-2.03.02-7.36-4.5-11.9-4.54-4.52-9.87-6.54-11.9-4.5-2.04 2.03-.02 7.36 4.5 11.9 4.54 4.52 9.87 6.54 11.9 4.5Z"/> <path d="M15.7 15.7c4.52-4.54 6.54-9.87 4.5-11.9-2.03-2.04-7.36-.02-11.9 4.5-4.52 4.54-6.54 9.87-4.5 11.9 2.03 2.04 7.36.02 11.9-4.5Z"/>',
	timer:
		'<line x1="10" x2="14" y1="2" y2="2"/> <line x1="12" x2="15" y1="14" y2="11"/> <circle cx="12" cy="14" r="8"/>',
	quote:
		'<path d="M16 3a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2 1 1 0 0 1 1 1v1a2 2 0 0 1-2 2 1 1 0 0 0-1 1v2a1 1 0 0 0 1 1 6 6 0 0 0 6-6V5a2 2 0 0 0-2-2z"/> <path d="M5 3a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2 1 1 0 0 1 1 1v1a2 2 0 0 1-2 2 1 1 0 0 0-1 1v2a1 1 0 0 0 1 1 6 6 0 0 0 6-6V5a2 2 0 0 0-2-2z"/>',
	"notebook-pen":
		'<path d="M13.4 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-7.4"/> <path d="M2 6h4"/> <path d="M2 10h4"/> <path d="M2 14h4"/> <path d="M2 18h4"/> <path d="M21.378 5.626a1 1 0 1 0-3.004-3.004l-5.01 5.012a2 2 0 0 0-.506.854l-.837 2.87a.5.5 0 0 0 .62.62l2.87-.837a2 2 0 0 0 .854-.506z"/>',
	brain:
		'<path d="M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z"/> <path d="M12 5a3 3 0 1 1 5.997.125 4 4 0 0 1 2.526 5.77 4 4 0 0 1-.556 6.588A4 4 0 1 1 12 18Z"/> <path d="M12 5v13"/> <path d="M12 13a4.5 4.5 0 0 1-3-4"/> <path d="M12 13a4.5 4.5 0 0 0 3-4"/>',
	zap: '<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>',
	swords:
		'<polyline points="14.5 17.5 3 6 3 3 6 3 17.5 14.5"/> <line x1="13" x2="19" y1="19" y2="13"/> <line x1="16" x2="20" y1="16" y2="20"/> <line x1="19" x2="21" y1="21" y2="19"/> <polyline points="14.5 6.5 18 3 21 3 21 6 17.5 9.5"/> <line x1="5" x2="9" y1="14" y2="18"/> <line x1="7" x2="4" y1="17" y2="20"/> <line x1="3" x2="5" y1="19" y2="21"/>',
	backpack:
		'<path d="M4 10a4 4 0 0 1 4-4h8a4 4 0 0 1 4 4v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2Z"/> <path d="M9 6V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2"/> <path d="M8 21v-5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v5"/> <path d="M8 10h8"/> <path d="M9 18h6"/>',
};

function projectIcon(name) {
	return `<svg class="project-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${projectIcons[name] || ""}</svg>`;
}
