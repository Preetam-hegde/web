const projects = [
  {
    name: "Click The Circle!",
    category: "fcc",
    image: "resource/Image/gamecircle.svg",
    link: "circle/circle.html",
    description: "WebApp Game",
    tech: ["JavaScript", "HTML5", "CSS3"]
  },
  {
    name: "Random quotes",
    category: "fcc",
    image: "resource/Image/randomQuota.svg",
    link: "Game/Game.html",
    description: "#Free Api",
    tech: ["JavaScript", "API", "HTML5", "CSS3"]
  },
  {
    name: "Pomodoro Timer",
    category: "fcc",
    image: "resource/Image/pomoTimer.svg",
    link: "Pomodoro/timer.html",
    description: "#GET prodective",
    tech: ["JavaScript", "HTML5", "CSS3"]
  },
  {
    name: "Personal Portfolio",
    category: "personal",
    image: "resource/Image/portfolio.svg",
    link: "https://preetam-ptwo.github.io/Portfolio/",
    description: "My First Portfolio",
    tech: ["HTML5", "CSS3", "JavaScript"]
  },
  {
    name: "Dear Diary",
    category: "personal",
    image: "resource/Image/diary.svg",
    link: "https://sites.google.com/view/ptwo-diary",
    description: "Personal Scratch Pad",
    tech: ["Google Sites"]
  },
  {
    name: "Get Location",
    category: "personal",
    image: "resource/Image/geoLocation.svg",
    link: "geoLocation/index.html",
    description: "GeoLocation Finder",
    tech: ["JavaScript", "HTML5", "CSS3", "Geolocation API"]
  }
]
;

function generateProjectHTML(project) {
  return `
    <div class="portfolio__project col-xs-12 col-sm-6 col-lg-4 text-center" data-cat="${project.category}" data-tech="${project.tech.join(',')}">
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
