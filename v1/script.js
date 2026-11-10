'use strict';

const loomProjects = typeof projects === 'undefined' ? [] : projects;
const loomCategories = { games: 'Game', personal: 'Independent build', fcc: 'Interactive study' };

document.addEventListener('DOMContentLoaded', () => {
	renderLoomProjects();
	setupLoomStats();
	setupLoomNavigation();
	setupLoomContact();
	document.getElementById('loom-year').textContent = new Date().getFullYear();
});

function setupLoomStats() {
	const counts = { all: loomProjects.length };
	document.querySelectorAll('[data-stat]').forEach((item) => { if (counts[item.dataset.stat]) item.textContent = counts[item.dataset.stat]; });
}

function setupLoomNavigation() {
	const header = document.querySelector('[data-site-header]');
	if (!header) return;
	const links = [...document.querySelectorAll('[data-nav-link]')];
	const sections = links.map((link) => document.querySelector(link.getAttribute('href'))).filter(Boolean);
	const updateHeader = () => header.classList.toggle('is-scrolled', window.scrollY > 24);
	updateHeader();
	window.addEventListener('scroll', updateHeader, { passive: true });
	const observer = new IntersectionObserver((entries) => entries.forEach((entry) => {
		if (entry.isIntersecting) links.forEach((link) => link.classList.toggle('is-active', link.getAttribute('href') === `#${entry.target.id}`));
	}), { rootMargin: '-40% 0px -55% 0px' });
	sections.forEach((section) => observer.observe(section));
}

function setupLoomContact() {
	const contact = document.getElementById('contact');
	if (!contact) return;
	const times = document.querySelectorAll('[data-time]');
	const formatter = new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', hour12: false });
	const tick = () => { const now = formatter.format(new Date()); times.forEach((time) => { time.textContent = now; }); };
	tick();
	window.setInterval(tick, 30000);

	const copy = contact.querySelector('.loom-copy');
	copy.addEventListener('click', async () => {
		try {
			await navigator.clipboard.writeText(copy.dataset.copy);
			copy.textContent = 'Copied ✓';
		} catch {
			const range = document.createRange();
			range.selectNodeContents(contact.querySelector('.loom-mail-link'));
			window.getSelection().removeAllRanges();
			window.getSelection().addRange(range);
			copy.textContent = 'Selected';
		}
		copy.classList.add('is-done');
		window.setTimeout(() => { copy.textContent = 'Copy'; copy.classList.remove('is-done'); }, 1800);
	});
}

// Projects with a `story` become the large featured cards; the rest fill the filterable playground grid.
function renderLoomProjects() {
	const featured = document.getElementById('loom-featured');
	const grid = document.getElementById('loom-grid');
	const filters = document.getElementById('loom-filters');
	if (!featured || !grid || !filters) return;
	const archive = loomProjects.filter((project) => !project.story);
	featured.replaceChildren(...loomProjects.filter((project) => project.story).map((project) => createProjectCard(project, true)));
	grid.replaceChildren(...archive.map((project) => createProjectCard(project, false)));
	const categoryLabels = { games: 'Games', personal: 'Independent builds', fcc: 'Interactive studies' };
	const preferredOrder = ['games', 'personal', 'fcc'];
	const presentCategories = [...new Set(archive.map((project) => project.category))];
	const orderedCategories = [
		...preferredOrder.filter((category) => presentCategories.includes(category)),
		...presentCategories.filter((category) => !preferredOrder.includes(category))
	];
	const options = [['all', 'All'], ...orderedCategories.map((category) => [category, categoryLabels[category] || category.toUpperCase()])];
	filters.replaceChildren(...options.map(([value, label]) => {
		const count = value === 'all' ? archive.length : archive.filter((project) => project.category === value).length;
		const button = document.createElement('button');
		button.type = 'button';
		button.className = 'loom-filter';
		button.setAttribute('aria-pressed', String(value === 'all'));
		button.innerHTML = `${label} <span>${String(count).padStart(2, '0')}</span>`;
		button.addEventListener('click', () => {
			const cards = [...grid.querySelectorAll('.loom-card')];
			const apply = () => {
				filters.querySelectorAll('.loom-filter').forEach((item) => item.setAttribute('aria-pressed', String(item === button)));
				cards.forEach((card) => { card.hidden = value !== 'all' && card.dataset.category !== value; });
			};
			if (!document.startViewTransition || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return apply();
			// Name the cards only for the length of the transition so they can glide to their new slots.
			cards.forEach((card, index) => { card.style.viewTransitionName = `card-${index}`; });
			const clearNames = () => cards.forEach((card) => { card.style.viewTransitionName = ''; });
			const transition = document.startViewTransition(apply);
			transition.ready.catch(() => {});
			transition.finished.then(clearNames, clearNames);
		});
		return button;
	}));
}

function createProjectCard(project, spotlight) {
	const external = /^https?:\/\//.test(project.link);
	const card = document.createElement('a');
	card.className = spotlight ? 'loom-card is-spotlight' : 'loom-card';
	card.href = project.link;
	card.dataset.category = project.category;
	if (external) { card.target = '_blank'; card.rel = 'noopener noreferrer'; }
	const visual = document.createElement('div');
	visual.className = 'loom-card-visual';
	if (project.shot) {
		const shot = document.createElement('img');
		// loading must be set before src, or the browser starts the fetch eagerly.
		shot.loading = 'lazy';
		shot.decoding = 'async';
		shot.alt = '';
		shot.width = spotlight ? 960 : 640;
		shot.height = spotlight ? 600 : 400;
		shot.src = project.shot;
		visual.append(shot);
	} else visual.innerHTML = projectIcon(project.icon);
	const body = document.createElement('div');
	body.className = 'loom-card-body';
	const category = document.createElement('p');
	category.className = 'loom-project-category';
	category.textContent = project.featured ? 'Live product' : (loomCategories[project.category] || 'Project');
	const title = document.createElement('h3');
	title.textContent = project.name;
	const description = document.createElement('p');
	description.className = 'loom-card-description';
	description.textContent = project.story || project.blurb || project.description;
	const tech = document.createElement('ul');
	tech.className = 'loom-project-tech';
	tech.append(...project.tech.slice(0, spotlight ? 5 : 3).map((label) => { const item = document.createElement('li'); item.textContent = label; return item; }));
	const cta = document.createElement('span');
	cta.className = 'loom-card-cta';
	cta.textContent = external ? 'Visit live' : 'Open project';
	body.append(category, title, description, tech, cta);
	card.append(visual, body);
	return card;
}
