'use strict';

const loomProjects = typeof projects === 'undefined' ? [] : projects;
const loomCategories = { personal: 'Independent build', fcc: 'Interactive study' };

document.addEventListener('DOMContentLoaded', () => {
	document.documentElement.classList.add('js');
	renderLoomProjects();
	setupLoomNavigation();
	setupLoomMotion();
	setupRain();
	setupHero();
	document.getElementById('loom-year').textContent = new Date().getFullYear();
});

function setupHero() {
	const hero = document.getElementById('about');
	if (!hero) return;
	const scene = hero.querySelector('.loom-hero-scene');
	const flash = hero.querySelector('.loom-flash');
	const title = document.getElementById('hero-title');
	const motion = allowsMotion();
	const fineHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

	title.setAttribute('aria-label', title.innerText.replace(/\s+/g, ' ').trim());
	let letter = 0;
	const splitLetters = (node) => [...node.childNodes].forEach((child) => {
		if (child.nodeType === Node.TEXT_NODE) {
			child.replaceWith(...[...child.textContent].map((char) => {
				const span = document.createElement('span');
				span.className = 'loom-letter';
				span.setAttribute('aria-hidden', 'true');
				span.style.setProperty('--i', letter++);
				span.textContent = char;
				return span;
			}));
		} else if (child.nodeName !== 'BR') splitLetters(child);
	});
	splitLetters(title);

	// Size the scene like object-fit: cover (image is 1672x941) so glow layers stay pinned to the painting.
	const fitScene = () => {
		const width = hero.clientWidth;
		const height = hero.clientHeight;
		const scale = Math.max(width / 1672, height / 941) * 1.05;
		const focusX = width < 621 ? .59 : .5;
		Object.assign(scene.style, { width: `${1672 * scale}px`, height: `${941 * scale}px`, left: `${(width - 1672 * scale) * focusX}px`, top: `${(height - 941 * scale) / 2}px` });
	};
	fitScene();
	new ResizeObserver(fitScene).observe(hero);

	hero.querySelectorAll('[data-stat]').forEach((item) => {
		const stat = item.dataset.stat;
		const total = stat === 'all' ? loomProjects.length : stat === 'featured' ? loomProjects.filter((project) => project.featured).length : loomProjects.filter((project) => project.category === 'fcc').length;
		if (!total || !motion) { if (total) item.textContent = total; return; }
		item.textContent = '0';
		const start = performance.now() + 900;
		const tick = (now) => {
			const progress = Math.min(1, Math.max(0, (now - start) / 1400));
			item.textContent = Math.round(total * (1 - (1 - progress) ** 3));
			if (progress < 1) requestAnimationFrame(tick);
		};
		requestAnimationFrame(tick);
	});

	if (!motion) return;
	const strike = () => {
		flash.classList.remove('is-striking');
		void flash.offsetWidth;
		flash.classList.add('is-striking');
		window.setTimeout(strike, 7000 + Math.random() * 9000);
	};
	window.setTimeout(strike, 3500);

	if (!fineHover) return;
	let targetX = 0, targetY = 0, currentX = 0, currentY = 0, running = false;
	const glide = () => {
		currentX += (targetX - currentX) * .08;
		currentY += (targetY - currentY) * .08;
		scene.style.transform = `translate3d(${currentX.toFixed(2)}px, ${currentY.toFixed(2)}px, 0)`;
		running = Math.abs(targetX - currentX) > .05 || Math.abs(targetY - currentY) > .05;
		if (running) requestAnimationFrame(glide);
	};
	hero.addEventListener('pointermove', (event) => {
		const rect = hero.getBoundingClientRect();
		targetX = -((event.clientX - rect.left) / rect.width - .5) * 30;
		targetY = -((event.clientY - rect.top) / rect.height - .5) * 18;
		hero.style.setProperty('--lx', `${event.clientX - rect.left}px`);
		hero.style.setProperty('--ly', `${event.clientY - rect.top}px`);
		hero.classList.add('is-lit');
		if (!running) { running = true; requestAnimationFrame(glide); }
	}, { passive: true });
	hero.addEventListener('pointerleave', () => { hero.classList.remove('is-lit'); targetX = 0; targetY = 0; if (!running) { running = true; requestAnimationFrame(glide); } });

	hero.querySelectorAll('.loom-button').forEach((button) => {
		button.addEventListener('pointermove', (event) => {
			const rect = button.getBoundingClientRect();
			button.style.setProperty('--tx', `${(event.clientX - rect.left - rect.width / 2) * .22}px`);
			button.style.setProperty('--ty', `${(event.clientY - rect.top - rect.height / 2) * .32}px`);
		});
		button.addEventListener('pointerleave', () => { button.style.removeProperty('--tx'); button.style.removeProperty('--ty'); });
	});
}

function setupRain() {
	const canvas = document.querySelector('.loom-rain-canvas');
	if (!canvas) return;
	const context = canvas.getContext('2d');
	const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
	const drops = [];
	const splats = [];
	let width = 0;
	let height = 0;
	let lastTime = 0;

	const resize = () => {
		const ratio = Math.min(window.devicePixelRatio || 1, 2);
		width = canvas.clientWidth;
		height = canvas.clientHeight;
		canvas.width = width * ratio;
		canvas.height = height * ratio;
		context.setTransform(ratio, 0, 0, ratio, 0, 0);
		drops.length = 0;
		splats.length = 0;
		const count = Math.min(220, Math.max(100, Math.floor(width / 6)));
		for (let index = 0; index < count; index += 1) {
			const depth = Math.random();
			drops.push({
				x: Math.random() * width,
				y: Math.random() * height,
				row: depth < .42 ? 'back' : 'front',
				depth,
				length: 5 + depth * 30,
				speed: 100 + depth * 225,
				wind: 34 + depth * 68,
				alpha: (depth < .42 ? .045 : .08) + depth * .24,
				width: depth < .42 ? .35 : .55 + depth * .7
			});
		}
	};
	const draw = () => {
		context.clearRect(0, 0, width, height);
		drops.forEach((drop) => {
			context.beginPath();
			context.moveTo(drop.x, drop.y);
			context.lineTo(drop.x + drop.wind * .12, drop.y + drop.length);
			context.strokeStyle = `rgba(213, 226, 246, ${drop.alpha})`;
			context.lineWidth = drop.width;
			context.stroke();
		});
		splats.forEach((splat) => {
			context.beginPath();
			context.ellipse(splat.x, splat.y, splat.size, splat.size * .35, 0, 0, Math.PI * 2);
			context.strokeStyle = `rgba(224, 235, 255, ${splat.alpha})`;
			context.lineWidth = .8;
			context.stroke();
			for (let ray = 0; ray < 5; ray += 1) {
				const angle = ray * 1.45 - .35;
				context.beginPath();
				context.moveTo(splat.x, splat.y);
				context.lineTo(splat.x + Math.cos(angle) * splat.size * 2.25, splat.y + Math.sin(angle) * splat.size * .85);
				context.stroke();
			}
			context.beginPath();
			context.moveTo(splat.x - splat.size * .45, splat.y);
			context.lineTo(splat.x - splat.size * .65, splat.y - splat.rise);
			context.moveTo(splat.x + splat.size * .3, splat.y);
			context.lineTo(splat.x + splat.size * .5, splat.y - splat.rise * .7);
			context.stroke();
		});
	};
	const animateRain = (time) => {
		const delta = Math.min((time - lastTime) / 1000 || 0, .05);
		lastTime = time;
		drops.forEach((drop) => {
			drop.x += drop.wind * delta;
			drop.y += drop.speed * delta;
			if (drop.y > height + drop.length || drop.x > width + 40) {
				if (drop.row === 'front' && Math.random() < .72) splats.push({ x: Math.min(width, Math.max(0, drop.x)), y: height - 18, size: 3.5 + Math.random() * 4.5, rise: 3 + Math.random() * 5, alpha: .72 + Math.random() * .18 });
				drop.x = Math.random() * (width + 40) - 40;
				drop.y = -drop.length - Math.random() * height * .2;
			}
		});
		splats.forEach((splat) => { splat.size += delta * 10; splat.rise += delta * 2; splat.alpha -= delta * 1.1; });
		while (splats.length && splats[0].alpha <= 0) splats.shift();
		draw();
		if (!reducedMotion.matches) requestAnimationFrame(animateRain);
	};
	resize();
	draw();
	window.addEventListener('resize', resize, { passive: true });
	if (!reducedMotion.matches) requestAnimationFrame(animateRain);
}

function renderLoomProjects() {
	const grid = document.getElementById('loom-grid');
	const filters = document.getElementById('loom-filters');
	if (!grid || !filters) return;
	grid.replaceChildren(...loomProjects.map(createProjectCard));
	const options = [['all', 'All'], ['personal', 'Independent builds'], ['fcc', 'Interactive studies']];
	filters.replaceChildren(...options.map(([value, label]) => {
		const count = value === 'all' ? loomProjects.length : loomProjects.filter((project) => project.category === value).length;
		const button = document.createElement('button');
		button.type = 'button';
		button.className = 'loom-filter';
		button.dataset.filter = value;
		button.setAttribute('aria-pressed', String(value === 'all'));
		button.innerHTML = `${label} <span>${String(count).padStart(2, '0')}</span>`;
		button.addEventListener('click', () => {
			filters.querySelectorAll('.loom-filter').forEach((item) => item.setAttribute('aria-pressed', String(item === button)));
			grid.querySelectorAll('.loom-card').forEach((card) => { card.hidden = value !== 'all' && card.dataset.category !== value; });
		});
		return button;
	}));
}

function createProjectCard(project, index) {
	const external = /^https?:\/\//.test(project.link);
	const card = document.createElement('a');
	card.className = 'loom-card';
	card.href = project.link;
	card.dataset.category = project.category;
	if (project.featured) card.classList.add('is-featured');
	if (external) { card.target = '_blank'; card.rel = 'noopener noreferrer'; }
	const visual = document.createElement('div');
	visual.className = 'loom-card-visual';
	visual.innerHTML = projectIcon(project.icon);
	const number = document.createElement('span');
	number.className = 'loom-card-number';
	number.textContent = String(index + 1).padStart(2, '0');
	visual.append(number);
	const body = document.createElement('div');
	body.className = 'loom-card-body';
	const category = document.createElement('p');
	category.className = 'loom-project-category';
	category.textContent = (project.featured ? 'Featured · ' : '') + (loomCategories[project.category] || 'Project');
	const title = document.createElement('h3');
	title.textContent = project.name;
	const description = document.createElement('p');
	description.className = 'loom-card-description';
	description.textContent = project.description;
	const tech = document.createElement('ul');
	tech.className = 'loom-project-tech';
	tech.append(...project.tech.slice(0, 4).map((label) => { const item = document.createElement('li'); item.textContent = label; return item; }));
	const cta = document.createElement('span');
	cta.className = 'loom-card-cta';
	cta.innerHTML = `${external ? 'Visit live' : 'Open project'} <span aria-hidden="true">↗</span>`;
	body.append(category, title, description, tech, cta);
	card.append(visual, body);
	return card;
}

function allowsMotion() { return !window.matchMedia('(prefers-reduced-motion: reduce)').matches; }

function setupLoomNavigation() {
	const header = document.querySelector('[data-site-header]');
	const links = [...document.querySelectorAll('[data-nav-link]')];
	const sections = links.map((link) => document.querySelector(link.getAttribute('href'))).filter(Boolean);
	const updateHeader = () => header?.classList.toggle('is-scrolled', window.scrollY > 24);
	updateHeader();
	window.addEventListener('scroll', updateHeader, { passive: true });
	if (!('IntersectionObserver' in window)) return;
	const observer = new IntersectionObserver((entries) => {
		const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
		if (!visible) return;
		links.forEach((link) => link.classList.toggle('is-active', link.getAttribute('href') === `#${visible.target.id}`));
	}, { rootMargin: '-34% 0px -52% 0px', threshold: [0.05, 0.3, 0.6] });
	sections.forEach((section) => observer.observe(section));
}

function setupLoomMotion() {
	const hero = document.getElementById('about');
	const heroMedia = document.querySelector('.loom-hero-media');
	const capabilityList = document.querySelector('.loom-capability-list');
	const experienceBody = document.querySelector('.loom-experience-body');
	const workshopImage = document.querySelector('.loom-workshop-image');
	const contact = document.getElementById('contact');
	const contactContent = document.querySelector('.loom-contact-content');
	prepareSigils();
	window.requestAnimationFrame(() => hero?.classList.add('is-visible'));
	if (!allowsMotion() || !('IntersectionObserver' in window)) { [capabilityList, experienceBody, workshopImage, contactContent, contact].filter(Boolean).forEach((item) => item.classList.add('is-visible')); drawSigil(contact); return; }
	const revealObserver = new IntersectionObserver((entries) => entries.forEach((entry) => { if (!entry.isIntersecting) return; entry.target.classList.add('is-visible'); if (entry.target === contact) drawSigil(contact); revealObserver.unobserve(entry.target); }), { rootMargin: '0px 0px -12% 0px', threshold: 0.15 });
	[capabilityList, experienceBody, workshopImage, contactContent, contact].filter(Boolean).forEach((item) => revealObserver.observe(item));
	let frame;
	const update = () => {
		frame = undefined;
		if (hero && heroMedia) { const progress = Math.min(1, Math.max(0, -hero.getBoundingClientRect().top / Math.max(hero.offsetHeight, 1))); heroMedia.style.transform = `translate3d(0, ${progress * 11}%, 0)`; }
	};
	const requestUpdate = () => { if (!frame) frame = window.requestAnimationFrame(update); };
	requestUpdate();
	window.addEventListener('scroll', requestUpdate, { passive: true });
}

function prepareSigils() {
	document.querySelectorAll('.loom-sigil-path').forEach((path) => { const length = path.getTotalLength(); path.style.strokeDasharray = String(length); path.style.strokeDashoffset = String(length); });
	window.requestAnimationFrame(() => drawSigil(document.getElementById('about')));
}

function drawSigil(section) { section?.querySelectorAll('.loom-sigil-path').forEach((path) => { path.style.strokeDashoffset = '0'; }); }
