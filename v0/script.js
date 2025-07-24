// Wait for DOM to load
document.addEventListener('DOMContentLoaded', function() {
  // Boot sequence and typing animation
  setTimeout(() => {
      simulateTyping("sudo start portfolio.sh", document.querySelector('.typed-text'), () => {
          setTimeout(() => {
              document.querySelector('.terminal-content').style.opacity = '1';
          }, 500);
      });
  }, 4000);

  // Set up interactive elements
  setupNavigation();
  setupThemeToggler();
  setupCustomCursor();
  setupSkillBars();
  setupStatusBar();
  setupMatrixBackground();
  simulateHackerData();
});

// Simulate typing animation
function simulateTyping(text, element, callback) {
  let i = 0;
  const typingInterval = setInterval(() => {
      element.textContent += text.charAt(i);
      i++;
      if (i >= text.length) {
          clearInterval(typingInterval);
          if (callback) callback();
      }
  }, 100);
}

// Setup navigation between sections
function setupNavigation() {
  const navBtns = document.querySelectorAll('.nav-btn');
  const sections = document.querySelectorAll('.section');

  navBtns.forEach(btn => {
      btn.addEventListener('click', () => {
          const target = btn.getAttribute('data-target');
          
          // Update active button
          navBtns.forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          
          // Show target section, hide others
          sections.forEach(section => {
              if (section.id === target) {
                  section.classList.add('active');
                  animateSection(section);
              } else {
                  section.classList.remove('active');
              }
          });

          // Simulate terminal command
          const commandInput = document.querySelector('.command-input');
          commandInput.textContent = `cd /${target}`;
      });
  });

  // Set initial active section
  navBtns[0].classList.add('active');
}

// Animate section elements when shown
function animateSection(section) {
  const elements = section.querySelectorAll('h2, h3, p, .project-card, .timeline-item, .skill');
  
  elements.forEach((el, index) => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(20px)';
      
      setTimeout(() => {
          el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
          el.style.opacity = '1';
          el.style.transform = 'translateY(0)';
      }, 100 * index);
  });
}

// Setup theme toggler
function setupThemeToggler() {
  const themeBtns = document.querySelectorAll('.theme-btn');
  const body = document.body;

  themeBtns.forEach(btn => {
      btn.addEventListener('click', () => {
          const theme = btn.getAttribute('data-theme');
          
          // Remove all theme classes
          body.classList.remove('kali-theme', 'matrix-theme', 'synthwave-theme', 'light-theme','retro-green-theme','blue-dusk-theme','ember-glow-theme','mono-chrome-theme');
          
          // Add selected theme class
          body.classList.add(`${theme}-theme`);
          
          // Update active button
          themeBtns.forEach(b => b.classList.remove('active'));
          btn.classList.add('active');

          // Apply special effects for certain themes
          if (theme === 'matrix') {
              document.querySelector('.matrix-bg').style.opacity = '0.3';
          } else {
              document.querySelector('.matrix-bg').style.opacity = '0.15';
          }
      });
  });

  // Set initial theme
  themeBtns[0].classList.add('active');
  body.classList.add('kali-theme');
}

// Setup custom cursor effect
function setupCustomCursor() {
  const cursor = document.querySelector('.cursor');
  
  if (window.innerWidth > 768) {
      cursor.style.display = 'block';
      
      document.addEventListener('mousemove', e => {
          cursor.style.left = e.clientX + 'px';
          cursor.style.top = e.clientY + 'px';
      });
      
      // Scale effect on clickable elements
      const clickables = document.querySelectorAll('button, a, input, textarea');
      clickables.forEach(el => {
          el.addEventListener('mouseenter', () => {
              cursor.style.transform = 'translate(-50%, -50%) scale(1.5)';
              cursor.style.borderColor = 'var(--kali-accent)';
          });
          
          el.addEventListener('mouseleave', () => {
              cursor.style.transform = 'translate(-50%, -50%) scale(1)';
              cursor.style.borderColor = 'var(--kali-text)';
          });
      });
      
      // Click animation
      document.addEventListener('mousedown', () => {
          cursor.style.transform = 'translate(-50%, -50%) scale(0.8)';
      });
      
      document.addEventListener('mouseup', () => {
          cursor.style.transform = 'translate(-50%, -50%) scale(1)';
      });
  }
}

// Setup skill bars animation
function setupSkillBars() {
  const skills = document.querySelectorAll('.skill');
  
  skills.forEach(skill => {
      const level = skill.getAttribute('data-level');
      skill.style.setProperty('--width', level);
  });
}

// Setup status bar with current time
function setupStatusBar() {
  const timeElement = document.getElementById('current-time');
  
  function updateTime() {
      const now = new Date();
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const seconds = String(now.getSeconds()).padStart(2, '0');
      
      timeElement.textContent = `${hours}:${minutes}:${seconds}`;
  }
  
  updateTime();
  setInterval(updateTime, 1000);
}

// Setup matrix background effect
function setupMatrixBackground() {
  const matrixBg = document.querySelector('.matrix-bg');
  
  // Create canvas
  const canvas = document.createElement('canvas');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  canvas.style.position = 'absolute';
  canvas.style.top = '0';
  canvas.style.left = '0';
  canvas.style.zIndex = '-1';
  matrixBg.appendChild(canvas);
  
  const ctx = canvas.getContext('2d');
  
  // Matrix characters
  const chars = 'アァカサタナハマヤャラワガザダバパイィキシチニヒミリヰギジヂビピウゥクスツヌフムユュルグズブヅプエェケセテネヘメレヱゲゼデベペオォコソトノホモヨョロヲゴゾドボポヴッン0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  
  // Columns and drops setup
  const fontSize = 14;
  const columns = Math.floor(canvas.width / fontSize);
  const drops = [];
  
  for (let i = 0; i < columns; i++) {
      drops[i] = Math.floor(Math.random() * -canvas.height / fontSize);
  }
  
  // Draw the matrix effect
  function drawMatrix() {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      ctx.fillStyle = 'var(--kali-text)';
      ctx.font = `${fontSize}px monospace`;
      
      for (let i = 0; i < drops.length; i++) {
          const text = chars[Math.floor(Math.random() * chars.length)];
          ctx.fillText(text, i * fontSize, drops[i] * fontSize);
          
          if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
              drops[i] = 0;
          }
          
          drops[i]++;
      }
  }
  
  // Update canvas size on window resize
  window.addEventListener('resize', () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      setupMatrix();
  });
  
  // Animation loop
  let matrixInterval;
  
  function setupMatrix() {
      clearInterval(matrixInterval);
      matrixInterval = setInterval(drawMatrix, 50);
  }
  
  setupMatrix();
}

// Simulate hacker data streams
function simulateHackerData() {
  const dataStreams = document.querySelectorAll('.data-stream');
  
  dataStreams.forEach(stream => {
      setInterval(() => {
          // Generate random binary/hex data
          let data = '';
          for (let i = 0; i < 50; i++) {
              if (Math.random() > 0.5) {
                  data += Math.random() > 0.5 ? '1' : '0';
              } else {
                  data += Math.floor(Math.random() * 16).toString(16);
              }
          }
          
          // Create and append data element
          const dataElement = document.createElement('div');
          dataElement.className = 'data-bit';
          dataElement.textContent = data;
          dataElement.style.position = 'absolute';
          dataElement.style.color = 'var(--kali-text)';
          dataElement.style.fontSize = '10px';
          dataElement.style.opacity = '0.7';
          dataElement.style.whiteSpace = 'nowrap';
          dataElement.style.left = Math.random() * 100 + '%';
          dataElement.style.top = Math.random() * 100 + '%';
          dataElement.style.transform = 'translateX(-50%)';
          dataElement.style.animation = 'fade-out 2s forwards';
          
          stream.appendChild(dataElement);
          
          // Remove after animation completes
          setTimeout(() => {
              dataElement.remove();
          }, 2000);
      }, Math.random() * 5000 + 2000);
  });
  
  // Add keyframe animation for fade-out
  const style = document.createElement('style');
  style.textContent = `
      @keyframes fade-out {
          from {
              opacity: 0.7;
          }
          to {
              opacity: 0;
              transform: translateY(20px) translateX(-50%);
          }
      }
  `;
  document.head.appendChild(style);
}

// Add terminal button interactions
document.querySelectorAll('.term-btn').forEach(btn => {
  btn.addEventListener('click', function() {
      if (this.classList.contains('close')) {
          document.querySelector('.terminal-container').style.animation = 'glitch-loop 5s infinite';
          document.querySelector('.terminal-container').style.display= "none";
          setTimeout(() => {
              document.querySelector('.terminal-container').style.display = 'block';
              document.querySelector('.terminal-container').style.opacity = '0.3';
              setTimeout(() => {
                  document.querySelector('.terminal-container').style.opacity = '1';
                  document.querySelector('.terminal-container').style.animation = '';
              }, 5000);
          }, 2000);
      } else if (this.classList.contains('minimize')) {
          document.querySelector('.terminal-body').style.opacity = document.querySelector('.terminal-body').style.opacity === '1' ? '0' : '1';
      } else if (this.classList.contains('maximize')) {
          document.querySelector('.terminal-container').style.width = document.querySelector('.terminal-container').style.width === '100%' ? '90%' : '100%';
          document.querySelector('.terminal-container').style.height = document.querySelector('.terminal-container').style.height === '100vh' ? '85vh' : '100vh';
          document.querySelector('.terminal-container').style.borderRadius = document.querySelector('.terminal-container').style.borderRadius === '0' ? '8px' : '0';
      }
  });
});

// Form submission handler
document.querySelector('.submit-btn').addEventListener('click', function(e) {
  e.preventDefault();
  
  const nameInput = document.getElementById('name');
  const emailInput = document.getElementById('email');
  const messageInput = document.getElementById('message');
  
  if (nameInput.value && emailInput.value && messageInput.value) {
      // Simulate sending animation
      this.textContent = 'SENDING...';
      this.disabled = true;
      
      setTimeout(() => {
          this.textContent = 'MESSAGE SENT!';
          
          // Reset form
          setTimeout(() => {
              this.textContent = 'SEND MESSAGE';
              this.disabled = false;
              nameInput.value = '';
              emailInput.value = '';
              messageInput.value = '';
          }, 2000);
      }, 1500);
  } else {
      // Show error animation
      this.style.color = 'var(--kali-accent)';
      setTimeout(() => {
          this.style.color = 'var(--kali-text)';
      }, 1000);
  }
});

// Add typewriter effect to section titles
document.querySelectorAll('.section-title').forEach(title => {
  const originalText = title.textContent;
  title.textContent = '';
  
  function typeTitle() {
      let i = 0;
      title.textContent = '';
      
      const typeInterval = setInterval(() => {
          if (i < originalText.length) {
              title.textContent += originalText.charAt(i);
              i++;
          } else {
              clearInterval(typeInterval);
              
              // Reset after a delay for endless animation
              setTimeout(() => {
                  typeTitle();
              }, 5000);
          }
      }, 100);
  }
  
  // Start typing when section becomes visible
  const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
          if (entry.isIntersecting) {
              typeTitle();
              observer.unobserve(entry.target);
          }
      });
  });
  
  observer.observe(title);
});

// Your project data
const projects = [
  {
    "name": "Idle Empire Builder Game",
    "category": "FCC Project",
    "image": "resource/Image/dreamscape.svg",
    "link": "dreamscape/index.html",
    "description": "A simulation-based browser game inspired by real estate dynamics, combining reflex-based gameplay with interactive decision-making elements. Players test their speed and timing by clicking on targets while managing virtual property outcomes.",
    "tech": ["JavaScript", "HTML5", "CSS3", "Canvas API", "Game Design"]
  },
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
    link: "Pomodoro/index.html",
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

// Function to populate projects on page load
function populateProjects() {
  const projectsGrid = document.querySelector('.projects-grid');
  
  // Clear any placeholder projects
  projectsGrid.innerHTML = '';
  
  // Generate HTML for each project
  projects.forEach(project => {
    const projectCard = document.createElement('div');
    projectCard.className = 'project-card';
    projectCard.setAttribute('data-category', project.category);
    
    // Create project tags from tech array
    const techTags = project.tech.map(tech => `<span class="tag">${tech}</span>`).join('');
    
    projectCard.innerHTML = `
      <div class="project-header">
        <h3>Project_${projects.indexOf(project) + 1}: ${project.name}</h3>
        <div class="project-tags">
          ${techTags}
        </div>
      </div>
      <div class="project-body">
        <div class="project-image">
          <img src="${project.image}" alt="${project.name}">
        </div>
        <p>${project.description}</p>
      </div>
      <div class="project-footer">
        <a href="${project.link}" class="btn" target="_blank">View Project <i class="fas fa-external-link-alt"></i></a>
        <span class="project-category">${project.category.toUpperCase()}</span>
      </div>
    `;
    
    // Add hover effect
    projectCard.addEventListener('mouseenter', () => {
      projectCard.style.borderColor = 'var(--kali-text)';
      projectCard.querySelector('.project-image').style.transform = 'scale(1.05)';
    });
    
    projectCard.addEventListener('mouseleave', () => {
      projectCard.style.borderColor = 'rgba(255, 255, 255, 0.1)';
      projectCard.querySelector('.project-image').style.transform = 'scale(1)';
    });
    
    projectsGrid.appendChild(projectCard);
  });
  
  // Add category filter
  setupProjectFilters();
}

// Add project filtering functionality
function setupProjectFilters() {
  // Create filter buttons
  const filterContainer = document.createElement('div');
  filterContainer.className = 'project-filters';
  
  const categories = ['all', ...new Set(projects.map(p => p.category))];
  
  categories.forEach(category => {
    const filterBtn = document.createElement('button');
    filterBtn.className = 'filter-btn';
    filterBtn.textContent = category.toUpperCase();
    filterBtn.setAttribute('data-filter', category);
    
    filterBtn.addEventListener('click', () => {
      // Update active filter
      document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
      });
      filterBtn.classList.add('active');
      
      // Filter projects
      const projectCards = document.querySelectorAll('.project-card');
      projectCards.forEach(card => {
        if (category === 'all' || card.getAttribute('data-category') === category) {
          card.style.display = 'block';
          setTimeout(() => {
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
          }, 50);
        } else {
          card.style.opacity = '0';
          card.style.transform = 'translateY(20px)';
          setTimeout(() => {
            card.style.display = 'none';
          }, 300);
        }
      });
    });
    
    filterContainer.appendChild(filterBtn);
  });
  
  // Add filters before project grid
  const projectsSection = document.querySelector('#projects .output');
  projectsSection.insertBefore(filterContainer, document.querySelector('.projects-grid'));
  
  // Set "ALL" as active by default
  document.querySelector('.filter-btn[data-filter="all"]').classList.add('active');
}

// Call this function during initial document load
document.addEventListener('DOMContentLoaded', function() {
  // Previous code...
  
  // Add this line to populate projects from your data
  populateProjects();
});