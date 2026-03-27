const projects = [
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
    name: "GeoLocation Explorer",
    category: "personal",
    image: "resource/Image/geoLocation.svg",
    link: "apps/geo-location/index.html",
    description: "Instantly retrieve your geographic coordinates, altitude, and accuracy radius via the browser Geolocation API, with map embed and shareable location links.",
    tech: ["HTML5", "CSS3", "JavaScript", "Geolocation API", "Maps"]
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
    link: "apps/quote/Game.html",
    description: "Fetch and display a new inspirational quote on demand from a public REST API — with smooth transitions and one-click sharing to social platforms.",
    tech: ["HTML5", "CSS3", "JavaScript", "REST API", "Fetch API"]
  },
  {
    name: "Personal Portfolio",
    category: "personal",
    image: "resource/Image/portfolio.svg",
    link: "https://preetam-ptwo.github.io/Portfolio/",
    description: "My first deployed portfolio — a static site built from scratch to present projects, skills, and contact information with a clean responsive layout.",
    tech: ["HTML5", "CSS3", "JavaScript", "Responsive Design"]
  },
  {
    name: "Dear Diary",
    category: "personal",
    image: "resource/Image/diary.svg",
    link: "https://sites.google.com/view/ptwo-diary",
    description: "A personal online notepad hosted on Google Sites — used to capture raw thoughts, project ideas, and daily reflections outside of any formal dev workflow.",
    tech: ["Google Sites", "Content Writing"]
  }
];

function generateProjectHTML(project) {
  return `
    <div class="portfolio__project col-xs-12 col-sm-6 col-lg-3 text-center" data-cat="${project.category}" data-tech="${project.tech.join(',')}">
      <a href="${project.link}" target="_blank" title="view live">
        <div class="portfolio__project__preview">
          <img src="${project.image}" alt="${project.name}">
        </div>
        <div class="portfolio__project__description">
          <div class="info-wrapper">
            <h3 class="portfolio__project__name">${project.name}</h3>
            <p class="portfolio__project__category">${project.description}</p>
          </div>
        </div>
      </a>
    </div>
  `;
}

function renderProjects() {
  const projectContainer = document.getElementById('projectContainer');
  projectContainer.innerHTML = projects.map(generateProjectHTML).join('');
}

document.addEventListener('DOMContentLoaded', renderProjects);
