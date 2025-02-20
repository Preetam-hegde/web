// Particle.js configuration
particlesJS('particles-js', {
	particles: {
		number: { value: 80 },
		color: { value: '#2ecc71' },
		shape: { type: 'circle' },
		opacity: { value: 0.5 },
		size: { value: 3 },
		move: {
			enable: true,
			speed: 2,
			direction: 'none',
			random: true
		}
	}
});

// Theme toggle
const themeToggle = document.querySelector('.theme-toggle');
// Set initial icon for dark theme
themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
document.body.classList.add('dark-theme');

themeToggle.addEventListener('click', () => {
	document.body.classList.toggle('dark-theme');
	themeToggle.innerHTML = document.body.classList.contains('dark-theme') 
		? '<i class="fas fa-sun"></i>' 
		: '<i class="fas fa-moon"></i>';
});

// Render projects with modern styling
function generateModernProjectHTML(project) {
	return `
		<div class="project-card" data-category="${project.category}">
			<img src="${project.image}" alt="${project.name}">
			<h3>${project.name}</h3>
			<p>${project.description}</p>
			<div class="skills">
				${project.tech.map(tech => `<span class="skill-tag">${tech}</span>`).join('')}
			</div>
			<a href="${project.link}" class="btn" target="_blank">View Project</a>
		</div>
	`;
}

function renderModernProjects() {
    const projectContainer = document.getElementById('projectContainer');
    projectContainer.innerHTML = projects.map(generateModernProjectHTML).join('');

    // Apply staggered animation delays to project cards after rendering
    const projectCards = document.querySelectorAll('.project-card');
    projectCards.forEach((card, index) => {
        card.style.setProperty('--card-animation-delay', `${index * 0.15}s`); // 0.15s delay between each card
    });
}


document.addEventListener('DOMContentLoaded', renderModernProjects);

// Smooth scroll
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
	anchor.addEventListener('click', function (e) {
		e.preventDefault();
		document.querySelector(this.getAttribute('href')).scrollIntoView({
			behavior: 'smooth'
		});
	});
});

const hamburger = document.querySelector('.hamburger');
const mobileNav = document.querySelector('.mobile-nav');

hamburger.addEventListener('click', () => {
    mobileNav.classList.toggle('active');
});

particlesJS('particles-js', {
    particles: {
        number: { value: 80 },
        color: { value: '#00ff95' }, /* Changed particle color to match dark-theme primary */
        shape: { type: 'circle' },
        opacity: { value: 0.5 },
        size: { value: 3 },
        move: {
            enable: true,
            speed: 2,
            direction: 'none',
            random: true
        }
    }
});