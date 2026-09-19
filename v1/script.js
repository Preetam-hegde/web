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
	setupContact();
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
	const letters = [...title.querySelectorAll('.loom-letter')];
	window.setTimeout(() => hero.classList.add('is-settled'), 300 + letters.length * 60 + 1100);

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

	const magic = setupMagic(hero);
	hero.addEventListener('click', (event) => {
		if (event.target.closest('a, button')) return;
		const rect = hero.getBoundingClientRect();
		magic.cast(event.clientX - rect.left, event.clientY - rect.top);
	});

	if (!fineHover) return;
	let centers = [];
	const measureLetters = () => {
		const origin = hero.getBoundingClientRect();
		centers = letters.map((letter) => { const rect = letter.getBoundingClientRect(); return [rect.left - origin.left + rect.width / 2, rect.top - origin.top + rect.height / 2]; });
	};
	window.setTimeout(measureLetters, 300 + letters.length * 60 + 1200);
	new ResizeObserver(() => { if (hero.classList.contains('is-settled') && !hero.classList.contains('is-lit')) measureLetters(); }).observe(hero);
	const reach = parseFloat(getComputedStyle(title).fontSize) * .85;
	const heatLetters = (x, y) => {
		if (!hero.classList.contains('is-settled')) return;
		letters.forEach((letter, index) => {
			const heat = Math.max(0, 1 - Math.hypot(x - centers[index][0], y - centers[index][1]) / reach);
			letter.style.setProperty('--f', (heat * heat * (3 - 2 * heat)).toFixed(3));
		});
	};
	const light = hero.querySelector('.loom-hero-light');
	let targetX = 0, targetY = 0, currentX = 0, currentY = 0, pointerX = 0, pointerY = 0, running = false;
	const glide = () => {
		currentX += (targetX - currentX) * .08;
		currentY += (targetY - currentY) * .08;
		if (hero.classList.contains('is-lit')) {
			light.style.setProperty('--lx', `${pointerX}px`);
			light.style.setProperty('--ly', `${pointerY}px`);
			heatLetters(pointerX, pointerY);
		}
		scene.style.transform = `translate3d(${currentX.toFixed(2)}px, ${currentY.toFixed(2)}px, 0)`;
		running = Math.abs(targetX - currentX) > .05 || Math.abs(targetY - currentY) > .05;
		if (running) requestAnimationFrame(glide);
	};
	hero.addEventListener('pointermove', (event) => {
		const rect = hero.getBoundingClientRect();
		pointerX = event.clientX - rect.left;
		pointerY = event.clientY - rect.top;
		targetX = -(pointerX / rect.width - .5) * 30;
		targetY = -(pointerY / rect.height - .5) * 18;
		hero.classList.add('is-lit');
		magic.trail(pointerX, pointerY);
		if (!running) { running = true; requestAnimationFrame(glide); }
	}, { passive: true });
	hero.addEventListener('pointerleave', () => { hero.classList.remove('is-lit'); letters.forEach((letter) => letter.style.removeProperty('--f')); targetX = 0; targetY = 0; if (!running) { running = true; requestAnimationFrame(glide); } });

	hero.querySelectorAll('.loom-button').forEach((button) => {
		button.addEventListener('pointermove', (event) => {
			const rect = button.getBoundingClientRect();
			button.style.setProperty('--tx', `${(event.clientX - rect.left - rect.width / 2) * .22}px`);
			button.style.setProperty('--ty', `${(event.clientY - rect.top - rect.height / 2) * .32}px`);
		});
		button.addEventListener('pointerleave', () => { button.style.removeProperty('--tx'); button.style.removeProperty('--ty'); });
	});
}

function setupMagic(hero) {
	const canvas = hero.querySelector('.loom-magic');
	const context = canvas.getContext('2d');
	const TAU = Math.PI * 2;
	const sparks = [];
	const sigils = [];
	const trail = [];
	let width = 0;
	let height = 0;
	let running = false;
	let lastTime = 0;
	const resize = () => {
		const ratio = Math.min(window.devicePixelRatio || 1, 2);
		width = canvas.clientWidth;
		height = canvas.clientHeight;
		canvas.width = width * ratio;
		canvas.height = height * ratio;
		context.setTransform(ratio, 0, 0, ratio, 0, 0);
	};
	resize();
	new ResizeObserver(resize).observe(hero);

	const spark = (x, y, speed = 40, spread = TAU) => {
		const angle = Math.random() * spread;
		const velocity = speed * (.3 + Math.random());
		sparks.push({ x, y, vx: Math.cos(angle) * velocity, vy: Math.sin(angle) * velocity - 20, age: 0, life: .5 + Math.random() * .8, size: .7 + Math.random() * 1.7, tone: 170 + Math.random() * 60 });
	};
	const wake = () => { if (!running) { running = true; lastTime = performance.now(); requestAnimationFrame(frame); } };
	const ease = (value) => 1 - (1 - value) ** 3;
	const clamp = (value) => Math.min(1, Math.max(0, value));

	// Doctor-Strange style sling-ring sigil: rings and a hexagram draw themselves in, spin, then burst into sparks.
	const drawSigil = (sigil) => {
		const { r, rot, age, life } = sigil;
		const progress = ease(clamp(age / 1.2));
		const star = clamp((age - .5) / 1.1);
		const alpha = age > life - .7 ? Math.max(0, (life - age) / .7) : 1;
		const gold = (a) => `rgba(255, 178, 72, ${(a * alpha).toFixed(3)})`;
		context.save();
		context.translate(sigil.x, sigil.y);
		context.shadowColor = `rgba(255, 130, 20, ${alpha})`;
		context.shadowBlur = 14;
		context.lineCap = 'round';
		context.strokeStyle = gold(.95);
		context.lineWidth = 2;
		context.beginPath(); context.arc(0, 0, r, rot, rot + TAU * progress); context.stroke();
		context.strokeStyle = gold(.7); context.lineWidth = 1.2;
		context.setLineDash([2, 7]); context.lineDashOffset = -age * 22;
		context.beginPath(); context.arc(0, 0, r * .9, -rot, -rot + TAU * progress); context.stroke();
		context.setLineDash([]);
		context.lineWidth = 1.4;
		context.beginPath(); context.arc(0, 0, r * .7, rot * 2, rot * 2 - TAU * progress, true); context.stroke();
		context.lineWidth = 1;
		for (let tick = 0; tick < 48; tick += 1) {
			if (tick / 48 > progress) break;
			const angle = rot + tick / 48 * TAU + age * .35;
			const inner = tick % 4 === 0 ? r * 1.03 : r * 1.06;
			context.beginPath(); context.moveTo(Math.cos(angle) * r * 1.12, Math.sin(angle) * r * 1.12); context.lineTo(Math.cos(angle) * inner, Math.sin(angle) * inner); context.stroke();
		}
		context.lineWidth = 1.5;
		const spin = rot + age * .45;
		for (let edge = 0; edge < 6; edge += 1) {
			const done = clamp(star * 6 - edge);
			if (!done) continue;
			const set = edge < 3 ? 0 : 1;
			const a = spin + (set * 60 + (edge % 3) * 120) * Math.PI / 180;
			const b = a + 2 * Math.PI / 3;
			const ax = Math.cos(a) * r * .68, ay = Math.sin(a) * r * .68;
			context.beginPath(); context.moveTo(ax, ay); context.lineTo(ax + (Math.cos(b) * r * .68 - ax) * done, ay + (Math.sin(b) * r * .68 - ay) * done); context.stroke();
		}
		context.beginPath(); context.arc(0, 0, r * .28, 0, TAU * star); context.stroke();
		for (let rune = 0; rune < 8; rune += 1) {
			if (rune / 8 > star) break;
			const angle = -spin * 1.4 + rune * TAU / 8;
			context.save(); context.translate(Math.cos(angle) * r * .8, Math.sin(angle) * r * .8); context.rotate(angle + Math.PI / 4);
			context.strokeRect(-2.5, -2.5, 5, 5); context.restore();
		}
		const core = context.createRadialGradient(0, 0, 0, 0, 0, r * .3);
		core.addColorStop(0, gold(.45 * star)); core.addColorStop(1, gold(0));
		context.fillStyle = core; context.fillRect(-r, -r, r * 2, r * 2);
		context.restore();
		const orbit = rot + age * 2.6;
		if (Math.random() < .7 && alpha > .3) spark(sigil.x + Math.cos(orbit) * r, sigil.y + Math.sin(orbit) * r, 45);
	};

	function frame(now) {
		const delta = Math.min((now - lastTime) / 1000 || 0, .05);
		lastTime = now;
		context.clearRect(0, 0, width, height);
		context.globalCompositeOperation = 'lighter';
		while (trail.length && now - trail[0].time > 900) trail.shift();
		context.lineCap = 'round';
		context.shadowColor = 'rgba(255, 130, 20, .9)';
		context.shadowBlur = 10;
		for (let index = 1; index < trail.length; index += 1) {
			const fade = 1 - (now - trail[index].time) / 900;
			context.strokeStyle = `rgba(255, 176, 70, ${(fade * .9).toFixed(3)})`;
			context.lineWidth = .8 + fade * 2.2;
			context.beginPath(); context.moveTo(trail[index - 1].x, trail[index - 1].y); context.lineTo(trail[index].x, trail[index].y); context.stroke();
		}
		context.shadowBlur = 0;
		for (let index = sparks.length - 1; index >= 0; index -= 1) {
			const item = sparks[index];
			item.age += delta;
			if (item.age >= item.life) { sparks.splice(index, 1); continue; }
			item.x += item.vx * delta; item.y += item.vy * delta; item.vy += 55 * delta; item.vx *= .985;
			context.fillStyle = `rgba(255, ${item.tone}, 90, ${(1 - item.age / item.life).toFixed(3)})`;
			context.beginPath(); context.arc(item.x, item.y, item.size, 0, TAU); context.fill();
		}
		for (let index = sigils.length - 1; index >= 0; index -= 1) {
			const sigil = sigils[index];
			sigil.age += delta;
			if (sigil.age >= sigil.life) {
				for (let burst = 0; burst < 46; burst += 1) { const angle = Math.random() * TAU; spark(sigil.x + Math.cos(angle) * sigil.r, sigil.y + Math.sin(angle) * sigil.r, 90); }
				sigils.splice(index, 1);
				continue;
			}
			drawSigil(sigil);
		}
		context.globalCompositeOperation = 'source-over';
		running = trail.length || sparks.length || sigils.length;
		if (running) requestAnimationFrame(frame); else context.clearRect(0, 0, width, height);
	}

	return {
		cast(x, y) {
			sigils.push({ x, y, r: Math.min(Math.max(width * .09, 62), 118), rot: Math.random() * TAU, age: 0, life: 3.6 });
			if (sigils.length > 4) sigils.shift();
			wake();
		},
		trail(x, y) {
			const last = trail[trail.length - 1];
			const distance = last ? Math.hypot(x - last.x, y - last.y) : 0;
			trail.push({ x, y, time: performance.now() });
			for (let count = 0; count < Math.min(3, 1 + distance / 24); count += 1) spark(x, y, 35);
			wake();
		}
	};
}

// Types a short shell session into the terminal teaser; the last command flips the window to the "matrix" theme.
function typeTerminal(animate) {
	const code = document.getElementById('loom-term-code');
	const window_ = code?.closest('.loom-term-window');
	if (!code) return;
	const escape = (text) => text.replace(/&/g, '&amp;').replace(/</g, '&lt;');
	const names = loomProjects.slice(0, 5).map((project) => `${project.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}/`).join('  ');
	const script = [
		{ cmd: 'ssh guest@preetamhegde.in' },
		{ out: 'Welcome to Portfolio Linux Shell v2.0', cls: 't-dim' },
		{ cmd: 'ls projects/' },
		{ out: names },
		{ cmd: 'theme matrix' },
		{ out: '[ok] theme switched: matrix', cls: 't-ok', done: () => window_.classList.add('is-matrix') },
		{ cmd: 'help' },
		{ out: 'help · ls · projects · resume · neofetch · theme', cls: 't-dim' }
	];
	const wait = (ms) => new Promise((resolve) => window.setTimeout(resolve, ms));
	const prompt = '<span class="t-prompt">$ </span>';
	(async () => {
		let html = '';
		for (const step of script) {
			if (step.cmd) {
				html += prompt;
				if (animate) { for (const char of step.cmd) { html += escape(char); code.innerHTML = html; await wait(34 + Math.random() * 40); } await wait(280); } else html += escape(step.cmd);
				html += '\n';
			} else {
				html += `<span class="${step.cls || ''}">${escape(step.out)}</span>\n`;
				if (animate) await wait(320);
				step.done?.();
			}
			code.innerHTML = html;
		}
		code.innerHTML = html + prompt;
	})();
}

function setupContact() {
	const contact = document.getElementById('contact');
	if (!contact) return;
	const time = document.getElementById('loom-time');
	const formatter = new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', hour12: false });
	const tick = () => { time.textContent = formatter.format(new Date()); };
	tick();
	window.setInterval(tick, 30000);

	const copy = contact.querySelector('.loom-copy');
	copy?.addEventListener('click', async () => {
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

	if (!allowsMotion()) return;
	const magic = setupMagic(contact);
	const local = (event) => { const rect = contact.getBoundingClientRect(); return [event.clientX - rect.left, event.clientY - rect.top]; };
	contact.addEventListener('click', (event) => { if (!event.target.closest('a, button, .loom-contact-card')) magic.cast(...local(event)); });
	if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) contact.addEventListener('pointermove', (event) => { if (!event.target.closest('.loom-contact-card')) magic.trail(...local(event)); }, { passive: true });
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
	let visible = true;
	let looping = false;

	const resize = () => {
		const ratio = Math.min(window.devicePixelRatio || 1, 1.5);
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
				bucket: Math.min(4, Math.floor(depth * 5))
			});
		}
	};
	const draw = () => {
		context.clearRect(0, 0, width, height);
		// one path + one stroke per depth bucket instead of one per drop
		for (let bucket = 0; bucket < 5; bucket += 1) {
			const depth = (bucket + .5) / 5;
			context.beginPath();
			drops.forEach((drop) => {
				if (drop.bucket !== bucket) return;
				context.moveTo(drop.x, drop.y);
				context.lineTo(drop.x + drop.wind * .12, drop.y + drop.length);
			});
			context.strokeStyle = `rgba(213, 226, 246, ${((bucket < 2 ? .045 : .08) + depth * .24).toFixed(3)})`;
			context.lineWidth = bucket < 2 ? .35 : .55 + depth * .7;
			context.stroke();
		}
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
		looping = visible && !reducedMotion.matches;
		if (looping) requestAnimationFrame(animateRain);
	};
	resize();
	draw();
	window.addEventListener('resize', resize, { passive: true });
	if (reducedMotion.matches) return;
	new IntersectionObserver(([entry]) => {
		visible = entry.isIntersecting;
		if (visible && !looping) { looping = true; lastTime = performance.now(); requestAnimationFrame(animateRain); }
	}).observe(canvas);
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
			[...grid.querySelectorAll('.loom-card:not([hidden])')].forEach((card, position) => {
				card.style.setProperty('--d', `${position % 3 * 90}ms`);
				card.classList.remove('in');
				window.requestAnimationFrame(() => window.requestAnimationFrame(() => card.classList.add('in')));
			});
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
	visual.querySelectorAll('.project-icon > *').forEach((shape) => shape.setAttribute('pathLength', '1'));
	card.style.setProperty('--d', `${(index % 3) * 90}ms`);
	card.addEventListener('pointermove', (event) => { const rect = card.getBoundingClientRect(); card.style.setProperty('--mx', `${event.clientX - rect.left}px`); card.style.setProperty('--my', `${event.clientY - rect.top}px`); });
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
	tech.append(...project.tech.slice(0, 3).map((label) => { const item = document.createElement('li'); item.textContent = label; return item; }));
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
	const target = (link) => link.dataset.target || link.getAttribute('href');
	const sections = links.map((link) => document.querySelector(target(link))).filter(Boolean);
	const updateHeader = () => header?.classList.toggle('is-scrolled', window.scrollY > 24);
	updateHeader();
	window.addEventListener('scroll', updateHeader, { passive: true });
	if (!('IntersectionObserver' in window)) return;
	const observer = new IntersectionObserver((entries) => {
		const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
		if (!visible) return;
		links.forEach((link) => link.classList.toggle('is-active', target(link) === `#${visible.target.id}`));
	}, { rootMargin: '-34% 0px -52% 0px', threshold: [0.05, 0.3, 0.6] });
	sections.forEach((section) => observer.observe(section));
}

function setupLoomMotion() {
	const hero = document.getElementById('about');
	const heroMedia = document.querySelector('.loom-hero-media');
	const contact = document.getElementById('contact');
	prepareSigils();
	window.requestAnimationFrame(() => hero?.classList.add('is-visible'));
	splitWords();
	const reveals = [...document.querySelectorAll('[data-reveal], [data-split], .loom-card')];
	const scrollItems = [...document.querySelectorAll('[data-scroll]')];
	if (!allowsMotion() || !('IntersectionObserver' in window)) { reveals.forEach(markIn); drawSigil(contact); typeTerminal(false); return; }
	const observer = new IntersectionObserver((entries) => entries.forEach((entry) => {
		if (!entry.isIntersecting) return;
		markIn(entry.target);
		observer.unobserve(entry.target);
	}), { rootMargin: '0px 0px -8% 0px', threshold: 0.01 });
	reveals.forEach((item) => observer.observe(item));
	const terminalWatch = new IntersectionObserver(([entry], self) => { if (entry.isIntersecting) { typeTerminal(true); self.disconnect(); } }, { threshold: 0.35 });
	terminalWatch.observe(document.getElementById('loom-term-code').closest('.loom-term-window'));
	new IntersectionObserver((entries, self) => { if (entries[0].isIntersecting) { drawSigil(contact); self.disconnect(); } }, { threshold: 0.25 }).observe(contact);
	const sleeper = new IntersectionObserver((entries) => entries.forEach((entry) => entry.target.classList.toggle('is-off', !entry.isIntersecting)), { rootMargin: '120px 0px' });
	document.querySelectorAll('.loom-hero, .loom-marquee, .loom-craft, .loom-experience, .loom-work, .loom-terminal, .loom-contact').forEach((section) => sleeper.observe(section));
	const clamp = (value) => Math.min(1, Math.max(0, value));
	let frame;
	const update = () => {
		frame = undefined;
		const viewport = window.innerHeight;
		const heroTop = hero ? hero.getBoundingClientRect().top : 0;
		const heroHeight = hero ? hero.offsetHeight : 1;
		const rects = scrollItems.map((item) => item.getBoundingClientRect());
		const scrollable = Math.max(document.documentElement.scrollHeight - viewport, 1);
		if (heroMedia && heroTop > -heroHeight) heroMedia.style.transform = `translate3d(0, ${clamp(-heroTop / Math.max(heroHeight, 1)) * 11}%, 0)`;
		document.documentElement.style.setProperty('--sp', clamp(window.scrollY / scrollable).toFixed(4));
		scrollItems.forEach((item, index) => {
			const rect = rects[index];
			if (rect.bottom < -viewport * .3 || rect.top > viewport * 1.3) return;
			item.style.setProperty('--p', clamp((viewport * .72 - rect.top) / Math.max(rect.height, 1)).toFixed(3));
			item.style.setProperty('--py', ((rect.top + rect.height / 2 - viewport / 2) / viewport).toFixed(3));
		});
	};
	const requestUpdate = () => { if (!frame) frame = window.requestAnimationFrame(update); };
	requestUpdate();
	window.addEventListener('scroll', requestUpdate, { passive: true });
	window.addEventListener('resize', requestUpdate, { passive: true });
}

function markIn(item) {
	item.classList.add('in');
	item.querySelectorAll('[data-count]').forEach(countUp);
}

function countUp(item) {
	const total = Number(item.dataset.count);
	const suffix = item.dataset.suffix || '';
	if (!allowsMotion()) return;
	const start = performance.now() + 250;
	item.textContent = `0${suffix}`;
	const tick = (now) => {
		const progress = Math.min(1, Math.max(0, (now - start) / 1600));
		item.textContent = `${Math.round(total * (1 - (1 - progress) ** 3))}${suffix}`;
		if (progress < 1) requestAnimationFrame(tick);
	};
	requestAnimationFrame(tick);
}

// Wrap each word of [data-split] headings in a masked span so it can rise into place.
function splitWords() {
	document.querySelectorAll('[data-split]').forEach((heading) => {
		heading.setAttribute('aria-label', heading.innerText.replace(/\s+/g, ' ').trim());
		let index = 0;
		const walk = (node) => [...node.childNodes].forEach((child) => {
			if (child.nodeType === Node.TEXT_NODE) {
				const parts = child.textContent.split(/(\s+)/).filter(Boolean).map((part) => {
					if (/^\s+$/.test(part)) return document.createTextNode(' ');
					const word = document.createElement('span');
					const inner = document.createElement('span');
					word.className = 'w';
					word.setAttribute('aria-hidden', 'true');
					inner.style.setProperty('--i', index++);
					inner.textContent = part;
					word.appendChild(inner);
					return word;
				});
				child.replaceWith(...parts);
			} else if (child.nodeName !== 'BR') walk(child);
		});
		walk(heading);
	});
}

function prepareSigils() {
	document.querySelectorAll('.loom-sigil-path').forEach((path) => { const length = path.getTotalLength(); path.style.strokeDasharray = String(length); path.style.strokeDashoffset = String(length); });
	window.requestAnimationFrame(() => drawSigil(document.getElementById('about')));
}

function drawSigil(section) { section?.querySelectorAll('.loom-sigil-path').forEach((path) => { path.style.strokeDashoffset = '0'; }); }
