// Wait for DOM to load
let shellRuntime = null;
const sharedProjects = typeof projects !== 'undefined' && Array.isArray(projects) ? projects : [];

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
  setupTerminalMusicPlayer();
  setupDesktopEnvironment();
  setupInteractiveShell();
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

  navBtns.forEach(btn => {
      btn.addEventListener('click', () => {
          const target = btn.getAttribute('data-target');
      activateSection(target);
      });
  });

  activateSection('home');
}

function activateSection(target) {
  const navBtns = document.querySelectorAll('.nav-btn');
  const sections = document.querySelectorAll('.section');

  navBtns.forEach(btn => {
    btn.classList.toggle('active', btn.getAttribute('data-target') === target);
  });

  sections.forEach(section => {
    if (section.id === target) {
      section.classList.add('active');
      animateSection(section);
    } else {
      section.classList.remove('active');
    }
  });

  const commandInput = document.querySelector('.command-input');
  if (commandInput) {
    commandInput.textContent = `cd /${target}`;
  }

  if (shellRuntime && typeof shellRuntime.syncPathFromSection === 'function') {
    shellRuntime.syncPathFromSection(target);
  }
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

  themeBtns.forEach(btn => {
      btn.addEventListener('click', () => {
          const theme = btn.getAttribute('data-theme');
      applyTheme(theme);
      });
  });

  applyTheme('kali');
}

function applyTheme(theme) {
  const body = document.body;
  const themeBtns = document.querySelectorAll('.theme-btn');
  const matrixBg = document.querySelector('.matrix-bg');

  body.classList.remove('kali-theme', 'matrix-theme', 'synthwave-theme', 'light-theme','retro-green-theme','blue-dusk-theme','ember-glow-theme','mono-chrome-theme');
  body.classList.add(`${theme}-theme`);

  themeBtns.forEach(btn => {
    btn.classList.toggle('active', btn.getAttribute('data-theme') === theme);
  });

  if (matrixBg) {
    matrixBg.style.opacity = theme === 'matrix' ? '0.3' : '0.15';
  }
}

function setupInteractiveShell() {
  const shellOutput = document.getElementById('shell-output');
  const shellInput = document.getElementById('shell-command');
  const shellPrompt = document.getElementById('shell-prompt');
  const shellContainer = document.getElementById('linux-shell');
  const quickCommandButtons = document.querySelectorAll('.quick-cmd');

  if (!shellOutput || !shellInput || !shellPrompt || !shellContainer) {
    return;
  }

  const SECTION_TO_PATH = {
    home: '/home',
    projects: '/projects',
    experience: '/experience',
    resume: '/resume',
    contact: '/contact'
  };

  const PATH_ENTRIES = {
    '/': ['home/', 'projects/', 'experience/', 'resume/', 'contact/', 'README.md'],
    '/home': ['about_me.txt', 'skills.json', 'resume.md', 'whoami.txt'],
    '/projects': ['featured.list', 'open <name-or-index>'],
    '/experience': ['career.log'],
    '/resume': ['summary.txt', 'skills.list', 'experience.list', 'highlights.list', 'resume.pdf'],
    '/contact': ['contact.txt', 'resume.md', 'resume.pdf']
  };

  const FILES = {
    '/README.md': 'Portfolio Linux Shell\\nUse commands: help, ls, cd, cat, projects, open, theme, clear',
    '/home/about_me.txt': 'Preetam Hegde | Software Developer at Oracle | Full-stack + AI/ML',
    '/home/skills.json': '{"languages":["Python","JavaScript","Java","C++"],"focus":["Full Stack","AI","Oracle JET"]}',
    '/home/resume.md': 'Open: resource/RESUME.md\\nPDF: resource/pdf/Preetam_resume_2026.pdf',
    '/home/whoami.txt': 'ptwo (creative developer mode)',
    '/experience/career.log': 'Oracle (MTS)\\nTaproot.ai (Intern)',
    '/resume/summary.txt': 'Loading from resource/RESUME.md ...',
    '/resume/skills.list': 'Loading from resource/RESUME.md ...',
    '/resume/experience.list': 'Loading from resource/RESUME.md ...',
    '/resume/highlights.list': 'Loading from resource/RESUME.md ...',
    '/resume/resume.pdf': 'Download: resource/pdf/Preetam_resume_2026.pdf',
    '/contact/contact.txt': 'email: hegde451@gmail.com\\ngithub: github.com/preetam-hegde\\nlinkedin: linkedin.com/in/preetam-hegde-8b53311a7',
    '/contact/resume.md': 'Open: resource/RESUME.md',
    '/contact/resume.pdf': 'Download: resource/pdf/Preetam_resume_2026.pdf'
  };

  const COMMANDS = ['help', 'ls', 'pwd', 'cd', 'cat', 'clear', 'whoami', 'uname', 'date', 'echo', 'projects', 'open', 'openall', 'openmodern', 'theme', 'goto', 'resume', 'lsapps', 'openapp', 'ps', 'kill', 'systemctl', 'history', 'services', 'which', 'man', 'uptime', 'neofetch', 'sudo'];
  const THEMES = ['kali', 'matrix', 'synthwave', 'light', 'retro-green', 'blue-dusk', 'ember-glow', 'mono-chrome'];
  const SHELL_START_TIME = Date.now();
  const state = {
    cwd: '/home',
    history: [],
    historyIndex: -1
  };

  function promptPath() {
    return state.cwd === '/home' ? '~' : state.cwd;
  }

  function updatePrompt() {
    shellPrompt.textContent = `ptwo@kali:${promptPath()}$`;
  }

  function printLine(text, variant = '') {
    const line = document.createElement('div');
    line.className = `shell-line ${variant}`.trim();
    line.textContent = text;
    shellOutput.appendChild(line);
    shellOutput.scrollTop = shellOutput.scrollHeight;
  }

  function printCommand(command) {
    printLine(`${shellPrompt.textContent} ${command}`);
  }

  function syncPathFromSection(sectionId) {
    const mapped = SECTION_TO_PATH[sectionId] || '/home';
    state.cwd = mapped;
    updatePrompt();
  }

  async function hydrateResumeFromMarkdown() {
    if (!window.resumeCommon || typeof window.resumeCommon.loadResumeData !== 'function') return;

    try {
      const resumeData = await window.resumeCommon.loadResumeData('resource/RESUME.md');
      const summary = window.resumeCommon.findSection(resumeData, ['summary']);
      const skills = window.resumeCommon.findSection(resumeData, ['core skills', 'skills']);
      const experience = window.resumeCommon.findSection(resumeData, ['professional experience', 'experience']);
      const highlights = window.resumeCommon.findSection(resumeData, ['impact highlights']);

      const summaryText = summary && summary.paragraphs.length ? summary.paragraphs.join(' ') : 'Summary unavailable.';
      const skillsText = skills && skills.bullets.length ? skills.bullets.join(', ') : 'Skills unavailable.';
      const expText = experience && experience.bullets.length ? experience.bullets.join(' | ') : 'Experience unavailable.';
      const highlightsText = highlights && highlights.bullets.length ? highlights.bullets.join('\n') : 'Highlights unavailable.';

      FILES['/resume/summary.txt'] = summaryText;
      FILES['/resume/skills.list'] = skillsText;
      FILES['/resume/experience.list'] = expText;
      FILES['/resume/highlights.list'] = highlightsText;

      const summaryNode = document.getElementById('classicResumeSummary');
      const skillsNode = document.getElementById('classicResumeSkills');
      const experienceNode = document.getElementById('classicResumeExperience');
      const homeSummaryNode = document.getElementById('classicHomeSummary');
      const homeTitleNode = document.getElementById('classicHomeTitle');
      const homeSkillBar = document.getElementById('classicHomeSkillBar');

      if (summaryNode) summaryNode.textContent = summaryText;
      if (skillsNode) skillsNode.textContent = skillsText;
      if (experienceNode) experienceNode.textContent = expText;

      if (homeSummaryNode) {
        homeSummaryNode.textContent = summaryText;
      }

      if (homeTitleNode && experience && experience.bullets.length) {
        const firstRole = experience.bullets[0].split(' - ')[0].trim();
        homeTitleNode.textContent = firstRole || 'Software Developer';
      }

      if (homeSkillBar && skills && skills.bullets.length) {
        homeSkillBar.innerHTML = '';
        skills.bullets.slice(0, 7).forEach((skill, index) => {
          const level = Math.max(68, 95 - index * 4);
          const skillEl = document.createElement('div');
          skillEl.className = 'skill';
          skillEl.setAttribute('data-skill', skill);
          skillEl.setAttribute('data-level', `${level}%`);
          homeSkillBar.appendChild(skillEl);
        });
        setupSkillBars();
      }
    } catch (error) {
      const summaryNode = document.getElementById('classicResumeSummary');
      if (summaryNode) {
        summaryNode.textContent = 'Unable to load resume data right now.';
      }
    }
  }

  hydrateResumeFromMarkdown();

  function resolveTargetPath(rawTarget) {
    if (!rawTarget || rawTarget === '~') return '/home';
    if (rawTarget === '/') return '/';
    if (rawTarget === '.') return state.cwd;
    if (rawTarget === '..') {
      if (state.cwd === '/' || state.cwd === '/home') return '/';
      return '/';
    }

    const cleaned = rawTarget.replace(/^\.\//, '').replace(/\/$/, '').replace(/^~\//, '');
    if (cleaned === 'home') return '/home';
    if (cleaned === 'projects') return '/projects';
    if (cleaned === 'experience') return '/experience';
    if (cleaned === 'resume') return '/resume';
    if (cleaned === 'contact') return '/contact';

    if (rawTarget.startsWith('/')) {
      return rawTarget.replace(/\/$/, '') || '/';
    }

    if (state.cwd === '/') {
      return `/${cleaned}`;
    }

    return `${state.cwd}/${cleaned}`;
  }

  function sectionForPath(path) {
    if (path === '/projects') return 'projects';
    if (path === '/experience') return 'experience';
    if (path === '/resume') return 'resume';
    if (path === '/contact') return 'contact';
    return 'home';
  }

  function runCommand(rawInput) {
    const input = rawInput.trim();
    if (!input) return;

    printCommand(input);
    state.history.push(input);
    state.historyIndex = state.history.length;

    const [command, ...rest] = input.split(/\s+/);
    const arg = rest.join(' ');

    switch (command) {
    case 'help':
      printLine('Available commands:');
      printLine('help, ls, pwd, cd <dir>, cat <file>, projects, open <name|index>, openall <window|tabs>, openmodern, resume, lsapps, openapp <app>, ps, kill <pid>, systemctl <status|start|stop> <service>, services, history [-c], which <cmd>, man <cmd>, uptime, theme <name>, goto <section>, neofetch, sudo <cmd>, whoami, uname, date, echo <msg>, clear', 'shell-line-muted');
      break;
    case 'ls': {
      const entries = PATH_ENTRIES[state.cwd] || [];
      if (!entries.length) {
        printLine('No files found.', 'shell-line-muted');
        break;
      }
      printLine(entries.join('   '));
      break;
    }
    case 'pwd':
      printLine(state.cwd);
      break;
    case 'cd': {
      const nextPath = resolveTargetPath(arg || '~');
      if (!PATH_ENTRIES[nextPath] && nextPath !== '/home' && nextPath !== '/') {
        printLine(`cd: no such file or directory: ${arg || ''}`.trim(), 'shell-line-error');
        break;
      }

      state.cwd = nextPath;
      updatePrompt();
      activateSection(sectionForPath(nextPath));
      break;
    }
    case 'cat': {
      if (!arg) {
        printLine('cat: missing file operand', 'shell-line-error');
        break;
      }

      const candidate = arg.startsWith('/') ? arg : `${state.cwd}/${arg}`;
      const normalized = candidate.replace(/\/\//g, '/');
      const content = FILES[normalized] || FILES[`/${arg}`];

      if (!content) {
        printLine(`cat: ${arg}: No such file`, 'shell-line-error');
        break;
      }

      content.split('\\n').forEach(line => printLine(line, 'shell-line-muted'));
      break;
    }
    case 'projects':
      sharedProjects.forEach((project, index) => {
        printLine(`${index + 1}. ${project.name} (${project.category})`, 'shell-line-muted');
      });
      break;
    case 'open': {
      if (!arg) {
        printLine('open: usage -> open <project name or index>', 'shell-line-error');
        break;
      }

      let project = null;
      if (!Number.isNaN(Number(arg))) {
        project = sharedProjects[Number(arg) - 1] || null;
      }

      if (!project) {
        const lowerArg = arg.toLowerCase();
        project = sharedProjects.find(item => item.name.toLowerCase().includes(lowerArg)) || null;
      }

      if (!project) {
        printLine(`open: project not found: ${arg}`, 'shell-line-error');
        break;
      }

      window.open(project.link, '_blank');
      printLine(`Opening ${project.name} ...`, 'shell-line-muted');
      break;
    }
    case 'openall': {
      const mode = (arg || 'window').toLowerCase();
      if (!window.desktopOS) {
        printLine('openall: desktop manager not ready', 'shell-line-error');
        break;
      }
      if (mode === 'tabs') {
        window.desktopOS.openAllProjectsInTabs();
        printLine('Opening all projects in new pages...', 'shell-line-muted');
        break;
      }
      if (mode === 'window') {
        window.desktopOS.openAllProjectsInWindow();
        printLine('Opening project browser window with all projects...', 'shell-line-muted');
        break;
      }
      printLine("openall: use 'window' or 'tabs'", 'shell-line-error');
      break;
    }
    case 'openmodern': {
      if (window.desktopOS && typeof window.desktopOS.openModernInNewWindow === 'function') {
        window.desktopOS.openModernInNewWindow();
        printLine('Opening modern portfolio in a new window...', 'shell-line-muted');
      } else {
        window.open('index.html', '_blank');
        printLine('Opening modern portfolio in a new window...', 'shell-line-muted');
      }
      break;
    }
    case 'theme': {
      if (!arg) {
        printLine(`Current themes: ${THEMES.join(', ')}`, 'shell-line-muted');
        break;
      }

      if (!THEMES.includes(arg)) {
        printLine(`theme: unknown theme '${arg}'`, 'shell-line-error');
        break;
      }

      applyTheme(arg);
      printLine(`Theme changed to '${arg}'.`, 'shell-line-muted');
      break;
    }
    case 'goto': {
      const section = arg.toLowerCase();
      if (!SECTION_TO_PATH[section]) {
        printLine(`goto: invalid section '${arg}'`, 'shell-line-error');
        break;
      }
      activateSection(section);
      break;
    }
    case 'whoami':
      printLine('ptwo', 'shell-line-muted');
      break;
    case 'uname':
      printLine('Linux kali 6.8.13-portfolio #1 SMP x86_64 GNU/Linux', 'shell-line-muted');
      break;
    case 'date':
      printLine(new Date().toString(), 'shell-line-muted');
      break;
    case 'echo':
      printLine(arg);
      break;
    case 'clear':
      shellOutput.innerHTML = '';
      break;
    case 'neofetch':
      printLine('ptwo@kali', 'shell-line-muted');
      printLine('OS: Kali Linux Portfolio Edition', 'shell-line-muted');
      printLine('Shell: portfolio-sh 2.0', 'shell-line-muted');
      printLine('Theme Engine: multi-profile terminal UI', 'shell-line-muted');
      break;
    case 'resume':
      if (window.desktopOS && typeof window.desktopOS.openApp === 'function') {
        window.desktopOS.openApp('resume');
        printLine('Opening resume application window...', 'shell-line-muted');
      } else {
        window.open('resource/pdf/Preetam_resume_2026.pdf', '_blank');
        printLine('Opening resume PDF in a new tab...', 'shell-line-muted');
      }
      break;
    case 'lsapps': {
      const appNames = window.desktopOS && typeof window.desktopOS.listApps === 'function'
        ? window.desktopOS.listApps()
        : ['terminal', 'resume', 'projects', 'aimtrainer', 'music'];
      appNames.forEach(name => printLine(name, 'shell-line-muted'));
      break;
    }
    case 'openapp': {
      if (!arg) {
        printLine('openapp: usage -> openapp <terminal|resume|projects|aimtrainer|music>', 'shell-line-error');
        break;
      }
      if (window.desktopOS && typeof window.desktopOS.openApp === 'function') {
        const opened = window.desktopOS.openApp(arg);
        if (!opened) {
          printLine(`openapp: unknown app '${arg}'`, 'shell-line-error');
          break;
        }
        printLine(`Launching ${arg} ...`, 'shell-line-muted');
      } else {
        printLine('openapp: desktop manager not ready', 'shell-line-error');
      }
      break;
    }
    case 'ps': {
      if (window.desktopOS && typeof window.desktopOS.getProcessLines === 'function') {
        window.desktopOS.getProcessLines().forEach(line => printLine(line, 'shell-line-muted'));
      } else {
        printLine('1001 portfolio-sh', 'shell-line-muted');
        printLine('1002 ui-renderer', 'shell-line-muted');
      }
      break;
    }
    case 'kill': {
      if (!arg) {
        printLine('kill: usage -> kill <pid>', 'shell-line-error');
        break;
      }
      if (!window.desktopOS || typeof window.desktopOS.killProcess !== 'function') {
        printLine('kill: desktop manager not ready', 'shell-line-error');
        break;
      }
      const ok = window.desktopOS.killProcess(arg);
      if (!ok) {
        printLine(`kill: (${arg}) - No such process`, 'shell-line-error');
        break;
      }
      printLine(`Process ${arg} terminated`, 'shell-line-muted');
      break;
    }
    case 'systemctl': {
      const action = (rest[0] || '').toLowerCase();
      const service = (rest[1] || '').toLowerCase();
      if (!action || !service) {
        printLine('systemctl: usage -> systemctl <status|start|stop> <service>', 'shell-line-error');
        break;
      }
      if (!window.desktopOS || typeof window.desktopOS.controlService !== 'function') {
        printLine('systemctl: desktop manager not ready', 'shell-line-error');
        break;
      }
      const result = window.desktopOS.controlService(action, service);
      if (!result) {
        printLine(`systemctl: unknown service '${service}' or action '${action}'`, 'shell-line-error');
        break;
      }
      printLine(result, 'shell-line-muted');
      break;
    }
    case 'history': {
      if (arg === '-c') {
        state.history = [];
        state.historyIndex = -1;
        printLine('history cleared', 'shell-line-muted');
        break;
      }
      state.history.forEach((cmd, index) => {
        printLine(`${index + 1}  ${cmd}`, 'shell-line-muted');
      });
      break;
    }
    case 'services': {
      if (!window.desktopOS || typeof window.desktopOS.getServiceStatusLines !== 'function') {
        printLine('services: desktop manager not ready', 'shell-line-error');
        break;
      }
      window.desktopOS.getServiceStatusLines().forEach(line => printLine(line, 'shell-line-muted'));
      break;
    }
    case 'which': {
      if (!arg) {
        printLine('which: usage -> which <command>', 'shell-line-error');
        break;
      }
      const exists = COMMANDS.includes(arg);
      printLine(exists ? `/usr/bin/${arg}` : `${arg} not found`, exists ? 'shell-line-muted' : 'shell-line-error');
      break;
    }
    case 'man': {
      if (!arg) {
        printLine('man: usage -> man <command>', 'shell-line-error');
        break;
      }
      const manPages = {
        openall: 'openall <window|tabs>: Open projects in browser window or new tabs',
        openmodern: 'openmodern: Open modern portfolio in new browser window',
        systemctl: 'systemctl <status|start|stop> <service>: Manage desktop app services',
        kill: 'kill <pid>: Terminate a desktop app process',
        ps: 'ps: List desktop app process table',
        services: 'services: List service status table'
      };
      printLine(manPages[arg] || `No manual entry for ${arg}`, manPages[arg] ? 'shell-line-muted' : 'shell-line-error');
      break;
    }
    case 'uptime': {
      const uptimeMs = Date.now() - SHELL_START_TIME;
      const seconds = Math.floor((uptimeMs / 1000) % 60);
      const minutes = Math.floor((uptimeMs / 60000) % 60);
      const hours = Math.floor(uptimeMs / 3600000);
      printLine(`up ${hours}h ${minutes}m ${seconds}s`, 'shell-line-muted');
      break;
    }
    case 'sudo':
      printLine(`Permission granted for simulated action: ${arg || 'noop'}`, 'shell-line-muted');
      break;
    default:
      printLine(`${command}: command not found`, 'shell-line-error');
    }
  }

  shellInput.addEventListener('keydown', event => {
    if (event.key === 'Enter') {
      runCommand(shellInput.value);
      shellInput.value = '';
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault();
      if (!state.history.length) return;
      state.historyIndex = Math.max(0, state.historyIndex - 1);
      shellInput.value = state.history[state.historyIndex] || '';
    }

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      if (!state.history.length) return;
      state.historyIndex = Math.min(state.history.length, state.historyIndex + 1);
      shellInput.value = state.history[state.historyIndex] || '';
    }

    if (event.key === 'Tab') {
      event.preventDefault();
      const value = shellInput.value.trim();
      const matches = COMMANDS.filter(cmd => cmd.startsWith(value));
      if (matches.length === 1) {
        shellInput.value = `${matches[0]} `;
      }
    }
  });

  shellContainer.addEventListener('click', () => {
    shellInput.focus();
  });

  quickCommandButtons.forEach(button => {
    button.addEventListener('click', () => {
      const command = button.getAttribute('data-command') || '';
      if (!command) return;
      runCommand(command);
      shellInput.value = '';
      shellInput.focus();
    });
  });

  printLine('Welcome to Portfolio Linux Shell v2.0');
  printLine("Type 'help' to explore commands.", 'shell-line-muted');
  updatePrompt();
  shellInput.focus();

  shellRuntime = {
    syncPathFromSection
  };
}

// Setup custom cursor effect
function setupCustomCursor() {
  const cursor = document.querySelector('.cursor');
  if (!cursor) return;
  
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

function setupTerminalMusicPlayer() {
  const albumGrid = document.getElementById('musicAlbumGrid');
  const titleEl = document.getElementById('musicTrackTitle');
  const genreEl = document.getElementById('musicTrackGenre');
  const currentCard = document.getElementById('musicCurrentCard');
  const playBtn = document.getElementById('musicPlayBtn');
  const prevBtn = document.getElementById('musicPrevBtn');
  const nextBtn = document.getElementById('musicNextBtn');
  const volumeSlider = document.getElementById('musicVolumeSlider');

  if (!albumGrid || !titleEl || !genreEl || !currentCard || !playBtn || !prevBtn || !nextBtn || !volumeSlider) {
    return;
  }

  const playlist = [
    { id: 'lofi', title: 'Love LoFi', genre: 'Focus Beats', src: 'resource/audio/music/loveLoFiM.mp3' },
    { id: 'nature', title: 'Forest Pulse', genre: 'Nature Ambience', src: 'resource/audio/music/natureM.mp3' },
    { id: 'jazz', title: 'Night Jazz', genre: 'Late Cafe Jazz', src: 'resource/audio/music/jazzM.mp3' },
    { id: 'medieval', title: 'Castle Echo', genre: 'Medieval Ambient', src: 'resource/audio/music/medievalM.mp3' }
  ];

  const player = new Audio();
  player.loop = true;
  player.volume = Number(volumeSlider.value) / 100;

  const state = {
    index: 0,
    isPlaying: false
  };

  function updateAlbumActive() {
    albumGrid.querySelectorAll('.music-album').forEach((album, idx) => {
      album.classList.toggle('active', idx === state.index);
    });
  }

  function updateNowPlaying() {
    const track = playlist[state.index];
    titleEl.textContent = track.title;
    genreEl.textContent = track.genre;
    currentCard.dataset.cover = track.id;
    updateAlbumActive();
  }

  function loadTrack(index) {
    state.index = (index + playlist.length) % playlist.length;
    player.src = playlist[state.index].src;
    updateNowPlaying();
  }

  function updatePlayButton() {
    playBtn.textContent = state.isPlaying ? 'Pause' : 'Play';
  }

  async function playCurrentTrack() {
    try {
      await player.play();
      state.isPlaying = true;
      updatePlayButton();
    } catch (error) {
      state.isPlaying = false;
      updatePlayButton();
    }
  }

  function pauseCurrentTrack() {
    player.pause();
    state.isPlaying = false;
    updatePlayButton();
  }

  function renderAlbums() {
    albumGrid.innerHTML = playlist.map((track, idx) => `
      <button class="music-album" data-cover="${track.id}" data-track-index="${idx}" type="button">
        <span class="music-album-art" aria-hidden="true"></span>
        <strong class="music-album-title">${track.title}</strong>
        <span class="music-album-genre">${track.genre}</span>
      </button>
    `).join('');
  }

  renderAlbums();
  loadTrack(0);
  updatePlayButton();

  playBtn.addEventListener('click', () => {
    if (state.isPlaying) {
      pauseCurrentTrack();
      return;
    }
    playCurrentTrack();
  });

  prevBtn.addEventListener('click', () => {
    const shouldResume = state.isPlaying;
    loadTrack(state.index - 1);
    if (shouldResume) {
      playCurrentTrack();
    }
  });

  nextBtn.addEventListener('click', () => {
    const shouldResume = state.isPlaying;
    loadTrack(state.index + 1);
    if (shouldResume) {
      playCurrentTrack();
    }
  });

  volumeSlider.addEventListener('input', () => {
    player.volume = Number(volumeSlider.value) / 100;
  });

  albumGrid.addEventListener('click', event => {
    const albumBtn = event.target.closest('.music-album');
    if (!albumBtn) return;
    const idx = Number(albumBtn.getAttribute('data-track-index'));
    if (Number.isNaN(idx)) return;
    const shouldResume = state.isPlaying;
    loadTrack(idx);
    if (shouldResume) {
      playCurrentTrack();
    }
  });
}

function setupDesktopEnvironment() {
  const windows = Array.from(document.querySelectorAll('.app-window'));
  const openers = Array.from(document.querySelectorAll('[data-open-window]'));
  const terminalWindow = document.getElementById('window-terminal');
  const snapPreview = document.getElementById('snapPreview');
  const startMenu = document.getElementById('startMenu');
  const startMenuToggle = document.getElementById('startMenuToggle');
  const startMenuSearch = document.getElementById('startMenuSearch');
  const startMenuList = document.getElementById('startMenuList');
  const openModernNewWindowBtn = document.getElementById('openModernNewWindow');
  const MIN_WIDTH = 420;
  const MIN_HEIGHT = 320;
  let zCounter = 50;

  const APP_CONFIG = {
    terminal: { windowId: 'window-terminal', aliases: ['terminal', 'shell'], service: 'shell' },
    resume: { windowId: 'window-resume', aliases: ['resume', 'cv'], service: 'resume' },
    projects: { windowId: 'window-projects-folder', aliases: ['projects', 'projects-folder', 'folder'], service: 'files' },
    browser: { windowId: 'window-project-browser', aliases: ['browser', 'projectbrowser', 'preview'], service: 'browser' },
    aimtrainer: { windowId: 'window-aim-trainer', aliases: ['aimtrainer', 'aim', 'game'], service: 'games' },
    music: { windowId: 'window-music-player', aliases: ['music', 'musicplayer', 'player'], service: 'audio' },
    portfolio: { windowId: 'window-modern-portfolio', aliases: ['portfolio', 'modern', 'ui'], service: 'portfolio' }
  };

  const aliasToWindowId = {};
  const serviceMap = {};
  const processByPid = {};

  Object.keys(APP_CONFIG).forEach(key => {
    const app = APP_CONFIG[key];
    app.aliases.forEach(alias => {
      aliasToWindowId[alias] = app.windowId;
    });
    serviceMap[app.service] = key;
  });

  windows.forEach((win, idx) => {
    processByPid[String(1200 + idx)] = win.id;
  });

  function currentVisibleWindows() {
    return windows.filter(win => !win.classList.contains('window-hidden'));
  }

  function bringToFront(windowEl) {
    if (!windowEl) return;
    zCounter += 1;
    windowEl.style.zIndex = String(zCounter);
    const activeId = windowEl.id;
    document.querySelectorAll('.task-app').forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-open-window') === activeId);
    });
  }

  function hideSnapPreview() {
    if (!snapPreview) return;
    snapPreview.classList.add('window-hidden');
  }

  function showSnapPreview(mode) {
    if (!snapPreview) return;
    snapPreview.classList.remove('window-hidden');
    const taskbarHeight = 38;
    if (mode === 'left') {
      snapPreview.style.left = '0px';
      snapPreview.style.top = '0px';
      snapPreview.style.width = `${Math.floor(window.innerWidth / 2)}px`;
      snapPreview.style.height = `${window.innerHeight - taskbarHeight}px`;
      return;
    }
    if (mode === 'right') {
      const half = Math.floor(window.innerWidth / 2);
      snapPreview.style.left = `${half}px`;
      snapPreview.style.top = '0px';
      snapPreview.style.width = `${window.innerWidth - half}px`;
      snapPreview.style.height = `${window.innerHeight - taskbarHeight}px`;
      return;
    }
    snapPreview.style.left = '0px';
    snapPreview.style.top = '0px';
    snapPreview.style.width = `${window.innerWidth}px`;
    snapPreview.style.height = `${window.innerHeight - taskbarHeight}px`;
  }

  function applySnap(windowEl, mode) {
    if (!windowEl || window.innerWidth <= 768) return;
    const taskbarHeight = 38;
    windowEl.classList.remove('is-maximized');
    if (mode === 'left') {
      windowEl.style.left = '0px';
      windowEl.style.top = '0px';
      windowEl.style.width = `${Math.floor(window.innerWidth / 2)}px`;
      windowEl.style.height = `${window.innerHeight - taskbarHeight}px`;
      return;
    }
    if (mode === 'right') {
      const half = Math.floor(window.innerWidth / 2);
      windowEl.style.left = `${half}px`;
      windowEl.style.top = '0px';
      windowEl.style.width = `${window.innerWidth - half}px`;
      windowEl.style.height = `${window.innerHeight - taskbarHeight}px`;
      return;
    }
    windowEl.classList.add('is-maximized');
  }

  function closeWindow(windowEl) {
    if (!windowEl) return;
    windowEl.classList.add('window-hidden');
    windowEl.classList.remove('is-maximized');
    hideSnapPreview();
  }

  function minimizeWindow(windowEl) {
    if (!windowEl) return;
    windowEl.classList.add('window-hidden');
    hideSnapPreview();
  }

  function maximizeWindow(windowEl) {
    if (!windowEl) return;
    windowEl.classList.toggle('is-maximized');
    bringToFront(windowEl);
  }

  function openWindow(windowId) {
    const windowEl = document.getElementById(windowId);
    if (!windowEl) return false;
    windowEl.classList.remove('window-hidden');
    bringToFront(windowEl);
    return true;
  }

  function createResizeHandles(windowEl) {
    const handles = ['left', 'right', 'top', 'bottom', 'corner top-left', 'corner top-right', 'corner bottom-left', 'corner bottom-right'];
    handles.forEach(definition => {
      const handle = document.createElement('div');
      handle.className = `resize-handle ${definition}`;
      windowEl.appendChild(handle);
    });
  }

  function registerResize(windowEl) {
    let resizing = false;
    let activeHandle = null;
    let startX = 0;
    let startY = 0;
    let startRect = null;

    windowEl.querySelectorAll('.resize-handle').forEach(handle => {
      handle.addEventListener('mousedown', event => {
        if (window.innerWidth <= 768 || windowEl.classList.contains('is-maximized')) return;
        resizing = true;
        activeHandle = handle;
        startX = event.clientX;
        startY = event.clientY;
        startRect = windowEl.getBoundingClientRect();
        bringToFront(windowEl);
        event.preventDefault();
      });
    });

    document.addEventListener('mousemove', event => {
      if (!resizing || !activeHandle || !startRect) return;
      const dx = event.clientX - startX;
      const dy = event.clientY - startY;
      let nextLeft = startRect.left;
      let nextTop = startRect.top;
      let nextWidth = startRect.width;
      let nextHeight = startRect.height;

      const cls = activeHandle.className;
      if (cls.includes('right')) nextWidth = Math.max(MIN_WIDTH, startRect.width + dx);
      if (cls.includes('left')) {
        nextWidth = Math.max(MIN_WIDTH, startRect.width - dx);
        nextLeft = startRect.right - nextWidth;
      }
      if (cls.includes('bottom')) nextHeight = Math.max(MIN_HEIGHT, startRect.height + dy);
      if (cls.includes('top')) {
        nextHeight = Math.max(MIN_HEIGHT, startRect.height - dy);
        nextTop = startRect.bottom - nextHeight;
      }

      nextLeft = Math.max(0, Math.min(window.innerWidth - MIN_WIDTH, nextLeft));
      nextTop = Math.max(0, Math.min(window.innerHeight - 100, nextTop));
      windowEl.style.left = `${nextLeft}px`;
      windowEl.style.top = `${nextTop}px`;
      windowEl.style.width = `${nextWidth}px`;
      windowEl.style.height = `${nextHeight}px`;
    });

    document.addEventListener('mouseup', () => {
      resizing = false;
      activeHandle = null;
      startRect = null;
    });
  }

  function registerDragging(windowEl) {
    const header = windowEl.querySelector('.terminal-header');
    if (!header) return;
    let dragging = false;
    let startX = 0;
    let startY = 0;
    let snapMode = null;

    header.addEventListener('mousedown', event => {
      if (window.innerWidth <= 768 || windowEl.classList.contains('is-maximized')) return;
      if (event.target.closest('.terminal-buttons')) return;
      dragging = true;
      const rect = windowEl.getBoundingClientRect();
      startX = event.clientX - rect.left;
      startY = event.clientY - rect.top;
      bringToFront(windowEl);
      event.preventDefault();
    });

    document.addEventListener('mousemove', event => {
      if (!dragging) return;
      const nextLeft = Math.max(0, Math.min(window.innerWidth - 260, event.clientX - startX));
      const nextTop = Math.max(0, Math.min(window.innerHeight - 140, event.clientY - startY));
      windowEl.style.left = `${nextLeft}px`;
      windowEl.style.top = `${nextTop}px`;

      if (event.clientY <= 12) {
        snapMode = 'max';
        showSnapPreview('max');
      } else if (event.clientX <= 12) {
        snapMode = 'left';
        showSnapPreview('left');
      } else if (event.clientX >= window.innerWidth - 12) {
        snapMode = 'right';
        showSnapPreview('right');
      } else {
        snapMode = null;
        hideSnapPreview();
      }
    });

    document.addEventListener('mouseup', () => {
      if (dragging && snapMode) {
        applySnap(windowEl, snapMode);
      }
      hideSnapPreview();
      dragging = false;
      snapMode = null;
    });
  }

  function registerWindowControls(windowEl) {
    windowEl.querySelectorAll('.term-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        if (btn.classList.contains('close')) {
          closeWindow(windowEl);
        } else if (btn.classList.contains('minimize')) {
          minimizeWindow(windowEl);
        } else if (btn.classList.contains('maximize')) {
          maximizeWindow(windowEl);
        }
      });
    });
  }

  function setupStartMenu() {
    if (!startMenu || !startMenuToggle || !startMenuSearch || !startMenuList) return;

    startMenuList.querySelectorAll('.start-item').forEach(item => {
      item.dataset.searchText = (item.textContent || '').trim().toLowerCase();
    });

    sharedProjects.forEach((project, index) => {
      const projectItem = document.createElement('button');
      projectItem.type = 'button';
      projectItem.className = 'start-item start-item-project';
      projectItem.dataset.searchText = `${project.name || ''} ${project.description || ''} ${project.category || ''} ${(project.tech || []).join(' ')}`.toLowerCase();
      projectItem.textContent = `Project: ${project.name || `#${index + 1}`}`;
      projectItem.addEventListener('click', () => {
        if (project.link) {
          window.open(project.link, '_blank', 'noopener,noreferrer');
        }
        startMenu.classList.add('window-hidden');
      });
      startMenuList.appendChild(projectItem);
    });

    startMenuToggle.addEventListener('click', () => {
      startMenu.classList.toggle('window-hidden');
      if (!startMenu.classList.contains('window-hidden')) {
        startMenuSearch.value = '';
        startMenuList.querySelectorAll('.start-item').forEach(item => {
          item.style.display = 'block';
        });
        startMenuSearch.focus();
      }
    });

    startMenuSearch.addEventListener('input', () => {
      const query = startMenuSearch.value.trim().toLowerCase();
      startMenuList.querySelectorAll('.start-item').forEach(item => {
        const haystack = item.dataset.searchText || item.textContent.toLowerCase();
        const visible = haystack.includes(query);
        item.style.display = visible ? 'block' : 'none';
      });
    });

    document.addEventListener('click', event => {
      if (event.target.closest('#startMenu') || event.target.closest('#startMenuToggle')) return;
      startMenu.classList.add('window-hidden');
    });
  }

  function renderDesktopProjects() {
    const list = document.getElementById('desktopProjectsList');
    if (!list) return;
    list.innerHTML = '';
    sharedProjects.forEach((project, index) => {
      const row = document.createElement('div');
      row.className = 'desktop-project-item';
      row.innerHTML = `<a href="${project.link}" target="_blank">${index + 1}. ${project.name}</a><span>${project.category}</span><button class="btn project-preview-btn" data-preview-index="${index}" type="button">Preview</button>`;
      list.appendChild(row);
    });
  }

  const browserState = {
    index: 0
  };

  function updateProjectBrowser() {
    const frame = document.getElementById('projectBrowserFrame');
    const title = document.getElementById('projectBrowserTitle');
    const openLink = document.getElementById('projectOpenNewPage');
    if (!frame || !title || !openLink || !sharedProjects.length) return;

    const project = sharedProjects[browserState.index];
    frame.src = project.link;
    title.textContent = `${browserState.index + 1}/${sharedProjects.length} - ${project.name}`;
    openLink.href = project.link;
  }

  function openProjectBrowser(startIndex = 0) {
    if (!sharedProjects.length) return;
    browserState.index = Math.max(0, Math.min(sharedProjects.length - 1, startIndex));
    openWindow('window-project-browser');
    updateProjectBrowser();
  }

  function launchModernInNewWindow() {
    window.open('index.html', '_blank', 'noopener,noreferrer');
  }

  function setupProjectBrowserControls() {
    const prev = document.getElementById('projectPrev');
    const next = document.getElementById('projectNext');
    const openAllWindowBtn = document.getElementById('openAllProjectsWindow');
    const openAllTabsBtn = document.getElementById('openAllProjectsTabs');
    const list = document.getElementById('desktopProjectsList');

    if (prev) {
      prev.addEventListener('click', () => {
        if (!sharedProjects.length) return;
        browserState.index = (browserState.index - 1 + sharedProjects.length) % sharedProjects.length;
        updateProjectBrowser();
      });
    }

    if (next) {
      next.addEventListener('click', () => {
        if (!sharedProjects.length) return;
        browserState.index = (browserState.index + 1) % sharedProjects.length;
        updateProjectBrowser();
      });
    }

    if (openAllWindowBtn) {
      openAllWindowBtn.addEventListener('click', () => {
        openProjectBrowser(0);
      });
    }

    if (openAllTabsBtn) {
      openAllTabsBtn.addEventListener('click', () => {
        sharedProjects.forEach(project => {
          window.open(project.link, '_blank');
        });
      });
    }

    if (openModernNewWindowBtn) {
      openModernNewWindowBtn.addEventListener('click', launchModernInNewWindow);
    }

    if (list) {
      list.addEventListener('click', event => {
        const btn = event.target.closest('.project-preview-btn');
        if (!btn) return;
        const idx = Number(btn.getAttribute('data-preview-index'));
        if (Number.isNaN(idx)) return;
        openProjectBrowser(idx);
      });
    }
  }

  async function renderDesktopResume() {
    if (!window.resumeCommon || typeof window.resumeCommon.loadResumeData !== 'function') return;
    const summaryNode = document.getElementById('desktopResumeSummary');
    const skillsNode = document.getElementById('desktopResumeSkills');
    const highlightsNode = document.getElementById('desktopResumeHighlights');
    if (!summaryNode || !skillsNode || !highlightsNode) return;

    try {
      const resumeData = await window.resumeCommon.loadResumeData('resource/RESUME.md');
      const summary = window.resumeCommon.findSection(resumeData, ['summary']);
      const skills = window.resumeCommon.findSection(resumeData, ['core skills', 'skills']);
      const highlights = window.resumeCommon.findSection(resumeData, ['impact highlights']);

      summaryNode.textContent = summary && summary.paragraphs.length ? summary.paragraphs.join(' ') : 'Summary unavailable.';
      skillsNode.innerHTML = '';
      (skills && skills.bullets.length ? skills.bullets : ['Skills unavailable']).forEach(item => {
        const chip = document.createElement('span');
        chip.className = 'tag';
        chip.textContent = item;
        skillsNode.appendChild(chip);
      });

      highlightsNode.innerHTML = '';
      (highlights && highlights.bullets.length ? highlights.bullets : ['Highlights unavailable']).forEach(item => {
        const li = document.createElement('li');
        li.textContent = item;
        highlightsNode.appendChild(li);
      });
    } catch (error) {
      summaryNode.textContent = 'Unable to load resume data.';
    }
  }

  windows.forEach((windowEl, index) => {
    windowEl.style.zIndex = String(zCounter + index);
    windowEl.addEventListener('mousedown', () => bringToFront(windowEl));
    createResizeHandles(windowEl);
    registerDragging(windowEl);
    registerResize(windowEl);
    registerWindowControls(windowEl);
  });

  openers.forEach(opener => {
    opener.addEventListener('click', () => {
      const targetId = opener.getAttribute('data-open-window');
      if (!targetId) return;
      openWindow(targetId);
      if (startMenu) startMenu.classList.add('window-hidden');
    });
  });

  setupStartMenu();

  renderDesktopProjects();
  renderDesktopResume();
  setupProjectBrowserControls();

  if (terminalWindow) {
    bringToFront(terminalWindow);
  }

  window.desktopOS = {
    openApp(name) {
      const mappedId = aliasToWindowId[String(name || '').toLowerCase()];
      if (!mappedId) return false;
      return openWindow(mappedId);
    },
    listApps() {
      return ['terminal', 'resume', 'projects', 'browser', 'aimtrainer', 'music', 'portfolio'];
    },
    getProcessLines() {
      return Object.keys(processByPid).map(pid => {
        const win = document.getElementById(processByPid[pid]);
        const running = win && !win.classList.contains('window-hidden') ? 'running' : 'sleep';
        const appName = win ? (win.getAttribute('data-app') || 'app') : 'unknown';
        return `${pid} ${appName} [${running}]`;
      });
    },
    killProcess(pid) {
      const windowId = processByPid[String(pid)];
      if (!windowId) return false;
      const win = document.getElementById(windowId);
      if (!win) return false;
      closeWindow(win);
      return true;
    },
    controlService(action, service) {
      const appKey = serviceMap[service];
      if (!appKey) return null;
      const config = APP_CONFIG[appKey];
      const win = document.getElementById(config.windowId);
      if (!win) return null;

      if (action === 'status') {
        const state = win.classList.contains('window-hidden') ? 'inactive' : 'active';
        return `${service}.service - ${state}`;
      }
      if (action === 'start') {
        openWindow(config.windowId);
        return `${service}.service started`;
      }
      if (action === 'stop') {
        closeWindow(win);
        return `${service}.service stopped`;
      }
      return null;
    },
    getServiceStatusLines() {
      return Object.keys(serviceMap).map(service => {
        return this.controlService('status', service) || `${service}.service - unknown`;
      });
    },
    openAllProjectsInWindow() {
      openProjectBrowser(0);
    },
    openAllProjectsInTabs() {
      sharedProjects.forEach(project => {
        window.open(project.link, '_blank');
      });
    },
    openModernInNewWindow() {
      launchModernInNewWindow();
    }
  };
}

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

// Function to populate projects on page load
function populateProjects() {
  const projectsGrid = document.querySelector('.projects-grid');
  
  // Clear any placeholder projects
  projectsGrid.innerHTML = '';
  
  // Generate HTML for each project
  sharedProjects.forEach(project => {
    const projectCard = document.createElement('div');
    projectCard.className = 'project-card';
    projectCard.setAttribute('data-category', project.category);
    
    // Create project tags from tech array
    const techTags = project.tech.map(tech => `<span class="tag">${tech}</span>`).join('');
    
    projectCard.innerHTML = `
      <div class="project-header">
        <h3>Project_${sharedProjects.indexOf(project) + 1}: ${project.name}</h3>
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
  
  const categories = ['all', ...new Set(sharedProjects.map(p => p.category))];
  
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