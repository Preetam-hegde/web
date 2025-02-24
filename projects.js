const projects = [

  {
    name: "Click The Circle!",
    category: "fcc",
    image: "resource/Image/gamecircle.svg",
    link: "circle/circle.html",
    description: "A simple and engaging web game where you test your reflexes by clicking circles as quickly as possible.",
    tech: ["JavaScript", "HTML5", "CSS3", "Game"]
  },
  {
    name: "Game of life",
    category: "fcc",
    image: "resource/Image/cellularAutomata.svg",
    link: "cellularAutomata/index.html",
    description: "An interactive implementation of Conway's Game of Life, a fascinating cellular automaton.",
    tech: ["Canvas", "JavaScript", "HTML5", "CSS3", "Cellular Automata"]
  },
  {
    name: "Get Location",
    category: "personal",
    image: "resource/Image/geoLocation.svg",
    link: "geoLocation/index.html",
    description: "Find your current geographic coordinates and location information using the Geolocation API.",
    tech: ["JavaScript", "HTML5", "CSS3", "Geolocation API", "Maps"]
  },
  {
    name: "High Life BG",
    category: "fcc",
    image: "resource/Image/BGI.svg",
    link: "BGIllusion/index.html",
    description: "Experience mesmerizing background ball physics with visually stunning effects and illusions.",
    tech: ["Logic", "JavaScript", "HTML5", "CSS3", "Physics"]
  },
  {
    name: "Sorting Algorithms",
    category: "fcc",
    image: "resource/Image/sort.svg",
    link: "analyser/index.html",
    description: "Visualize various sorting algorithms in action to understand their efficiency and logic.",
    tech: ["Sorting Algorithms", "JavaScript", "HTML5", "CSS3", "Data Structures"]
  },
  {
    name: "Personal Portfolio",
    category: "personal",
    image: "resource/Image/portfolio.svg",
    link: "https://preetam-ptwo.github.io/Portfolio/",
    description: "My first online portfolio to showcase my projects and skills.",
    tech: ["HTML5", "CSS3", "JavaScript", "Portfolio"]
  },
  {
    name: "Pomodoro Timer",
    category: "fcc",
    image: "resource/Image/pomoTimer.svg",
    link: "Pomodoro/timer.html",
    description: "A web-based Pomodoro Timer to help you boost your productivity with time management techniques.",
    tech: ["JavaScript", "HTML5", "CSS3", "Productivity", "Timer"]
  },
  {
    name: "Random quotes",
    category: "fcc",
    image: "resource/Image/randomQuota.svg",
    link: "quote/Game.html",
    description: "Generate random quotes fetched from a free API. Get inspired with new quotes daily.",
    tech: ["JavaScript", "API", "HTML5", "CSS3", "Quotes"]
  },
  {
    name: "Verilog vectors",
    category: "fcc",
    image: "resource/Image/vector.svg",
    link: "vector01/index.html",
    description: "A visual learning tool for Verilog vectors and their applications in digital design.",
    tech: ["JavaScript", "HTML5", "CSS3", "Vectors", "Verilog"]
  },
  {
    name: "Dear Diary",
    category: "personal",
    image: "resource/Image/diary.svg",
    link: "https://sites.google.com/view/ptwo-diary",
    description: "A personal online scratchpad to jot down thoughts, ideas, and daily reflections using Google Sites.",
    tech: ["Google Sites", "Personal Notes"]
  },
  {
    name: "9 Dimension",
    category: "fcc",
    image: "resource/Image/9D.svg",
    link: "nineDimension/index.html",
    description: "Explore nine different dimensions with JavaScript physics simulations. Experience interactive visuals and physics-based animations.",
    tech: ["JavaScript", "HTML5", "CSS3", "Vectors", "Physics"]
  },
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
