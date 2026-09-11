'use strict';

const loomProjects = typeof projects === 'undefined' ? [] : projects.slice(0, 6);
let activeProjectIndex = -1;
let projectChangeTimer;

document.addEventListener('DOMContentLoaded', () => {
	document.documentElement.classList.add('js');
	renderLoomProjects();
	setupLoomNavigation();
	setupLoomMotion();
	setupRain();
	document.getElementById('loom-year').textContent = new Date().getFullYear();
});

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
	const rail = document.getElementById('loom-project-rail');
	if (!rail) return;
	const fragment = document.createDocumentFragment();
	loomProjects.forEach((project, index) => {
		const button = document.createElement('button');
		button.type = 'button';
		button.className = 'loom-project-tab';
		button.setAttribute('aria-pressed', 'false');
		button.setAttribute('aria-label', `Show ${project.name}`);
		const number = document.createElement('span');
		number.className = 'loom-project-tab-number';
		number.textContent = String(index + 1).padStart(2, '0');
		const name = document.createElement('span');
		name.textContent = project.name;
		button.append(number, name);
		button.addEventListener('click', () => setActiveProject(index, true));
		fragment.appendChild(button);
	});
	rail.replaceChildren(fragment);
	setActiveProject(0, false);
}

function setActiveProject(index, animate) {
	if (!loomProjects[index] || index === activeProjectIndex) return;
	const project = loomProjects[index];
	const image = document.getElementById('loom-project-image');
	const copy = document.getElementById('loom-project-copy');
	if (!image || !copy) return;
	activeProjectIndex = index;
	document.querySelectorAll('.loom-project-tab').forEach((button, buttonIndex) => button.setAttribute('aria-pressed', String(buttonIndex === index)));
	window.clearTimeout(projectChangeTimer);
	if (animate && allowsMotion()) { image.classList.add('is-changing'); copy.classList.add('is-changing'); }
	projectChangeTimer = window.setTimeout(() => {
		image.src = project.image;
		image.alt = `Visual mark for ${project.name}`;
		document.getElementById('loom-project-index').textContent = `${String(index + 1).padStart(2, '0')} / ${String(loomProjects.length).padStart(2, '0')}`;
		document.getElementById('loom-project-category').textContent = project.category === 'fcc' ? 'Interactive study' : 'Independent build';
		document.getElementById('loom-project-title').textContent = project.name;
		document.getElementById('loom-project-description').textContent = project.description;
		document.getElementById('loom-project-tech').replaceChildren(...project.tech.slice(0, 4).map((label) => { const item = document.createElement('li'); item.textContent = label; return item; }));
		const link = document.getElementById('loom-project-link');
		link.href = project.link;
		link.target = /^https?:\/\//.test(project.link) ? '_blank' : '';
		link.rel = /^https?:\/\//.test(project.link) ? 'noopener noreferrer' : '';
		if (animate && allowsMotion()) window.requestAnimationFrame(() => { image.classList.remove('is-changing'); copy.classList.remove('is-changing'); });
	}, animate && allowsMotion() ? 140 : 0);
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
	const heroImage = document.querySelector('.loom-hero-image');
	const work = document.getElementById('projects');
	const capabilityList = document.querySelector('.loom-capability-list');
	const workshopImage = document.querySelector('.loom-workshop-image');
	const contact = document.getElementById('contact');
	const contactContent = document.querySelector('.loom-contact-content');
	prepareSigils();
	window.requestAnimationFrame(() => hero?.classList.add('is-visible'));
	if (!allowsMotion() || !('IntersectionObserver' in window)) { [capabilityList, workshopImage, contactContent, contact].filter(Boolean).forEach((item) => item.classList.add('is-visible')); drawSigil(contact); return; }
	const revealObserver = new IntersectionObserver((entries) => entries.forEach((entry) => { if (!entry.isIntersecting) return; entry.target.classList.add('is-visible'); if (entry.target === contact) drawSigil(contact); revealObserver.unobserve(entry.target); }), { rootMargin: '0px 0px -12% 0px', threshold: 0.15 });
	[capabilityList, workshopImage, contactContent, contact].filter(Boolean).forEach((item) => revealObserver.observe(item));
	let frame;
	const desktop = window.matchMedia('(min-width: 621px)');
	const update = () => {
		frame = undefined;
		if (hero && heroImage) { const progress = Math.min(1, Math.max(0, -hero.getBoundingClientRect().top / Math.max(hero.offsetHeight, 1))); heroImage.style.transform = `translate3d(0, ${progress * 11}%, 0)`; }
		if (work && desktop.matches && loomProjects.length) { const rect = work.getBoundingClientRect(); const travel = Math.max(work.offsetHeight - window.innerHeight, 1); const progress = Math.min(.9999, Math.max(0, -rect.top / travel)); setActiveProject(Math.min(loomProjects.length - 1, Math.floor(progress * loomProjects.length)), true); }
	};
	const requestUpdate = () => { if (!frame) frame = window.requestAnimationFrame(update); };
	const resize = () => { if (work) work.style.minHeight = desktop.matches ? `${window.innerHeight + Math.max(loomProjects.length, 1) * 480}px` : ''; requestUpdate(); };
	resize();
	window.addEventListener('scroll', requestUpdate, { passive: true });
	window.addEventListener('resize', resize, { passive: true });
	desktop.addEventListener('change', resize);
}

function prepareSigils() {
	document.querySelectorAll('.loom-sigil-path').forEach((path) => { const length = path.getTotalLength(); path.style.strokeDasharray = String(length); path.style.strokeDashoffset = String(length); });
	window.requestAnimationFrame(() => drawSigil(document.getElementById('about')));
}

function drawSigil(section) { section?.querySelectorAll('.loom-sigil-path').forEach((path) => { path.style.strokeDashoffset = '0'; }); }
