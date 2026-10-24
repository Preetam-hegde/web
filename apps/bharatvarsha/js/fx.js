// Visual flourishes: theme toggle, ambient embers, click feedback, scene parallax and value-change pulses.
// Purely cosmetic and independent of game state, so game.js / ui.js stay untouched.
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const THEME_KEY = 'bharatvarsha-theme';
const PALETTES = {
	light: ['#f2b93b', '#ee7f3a', '#f97316', '#fde047', '#e11d48'],
	dark: ['#ffd34d', '#ff9f1c', '#fde68a', '#fb7185', '#a78bfa']
};

const ACTION_BURSTS = {
	build: { count: 22, flash: 'rgba(255, 214, 120, 0.55)' },
	ritual: { count: 30, flash: 'rgba(255, 140, 40, 0.6)' },
	upgrade: { count: 22, flash: 'rgba(255, 240, 180, 0.55)' },
	recruit: { count: 16, flash: 'rgba(130, 230, 160, 0.45)' },
	choice: { count: 26, flash: 'rgba(255, 214, 120, 0.5)' },
	manual: { count: 12 },
	assign: { count: 8 },
	remove: { count: 6 }
};

function currentTheme() {
	return document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light';
}

function applyTheme(theme, { persist = true } = {}) {
	document.documentElement.dataset.theme = theme;
	document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'dark' ? '#1a0a07' : '#4a140e');
	const button = document.getElementById('btn-theme');
	if (button) {
		button.innerHTML = theme === 'dark' ? '<i class="fas fa-sun"></i> Day' : '<i class="fas fa-moon"></i> Night';
		button.setAttribute('aria-pressed', String(theme === 'dark'));
	}
	if (!persist) return;
	try { localStorage.setItem(THEME_KEY, theme); } catch { /* storage may be blocked */ }
}

function initTheme() {
	let saved = null;
	try { saved = localStorage.getItem(THEME_KEY); } catch { /* ignore */ }
	const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
	applyTheme(saved || (prefersDark ? 'dark' : 'light'), { persist: false });
}

function burst(x, y, count = 12, spread = 70) {
	if (reduceMotion) return;
	const colors = PALETTES[currentTheme()];
	for (let i = 0; i < count; i++) {
		const dot = document.createElement('span');
		dot.className = 'fx-spark';
		const size = 4 + Math.random() * 5;
		dot.style.cssText = `left:${x}px;top:${y}px;width:${size}px;height:${size}px;background:${colors[i % colors.length]}`;
		document.body.append(dot);
		const angle = (Math.PI * 2 * i) / count + Math.random() * 0.6;
		const dist = spread * (0.45 + Math.random() * 0.75);
		const anim = dot.animate([
			{ transform: 'translate(-50%, -50%) scale(1)', opacity: 1 },
			{ transform: `translate(calc(-50% + ${Math.cos(angle) * dist}px), calc(-50% + ${Math.sin(angle) * dist + 18}px)) scale(0)`, opacity: 0 }
		], { duration: 550 + Math.random() * 350, easing: 'cubic-bezier(0.15, 0.7, 0.3, 1)' });
		anim.onfinish = () => dot.remove();
	}
}

function ring(x, y) {
	if (reduceMotion) return;
	const el = document.createElement('span');
	el.className = 'fx-ring';
	el.style.left = `${x}px`;
	el.style.top = `${y}px`;
	document.body.append(el);
	el.animate([
		{ transform: 'translate(-50%, -50%) scale(0.2)', opacity: 0.9 },
		{ transform: 'translate(-50%, -50%) scale(1)', opacity: 0 }
	], { duration: 620, easing: 'ease-out' }).onfinish = () => el.remove();
}

function ripple(target, x, y) {
	if (reduceMotion) return;
	const rect = target.getBoundingClientRect();
	const size = Math.max(rect.width, rect.height) * 2;
	const el = document.createElement('span');
	el.className = 'fx-ripple';
	el.style.cssText = `left:${x - rect.left}px;top:${y - rect.top}px;width:${size}px;height:${size}px`;
	target.append(el);
	el.animate([
		{ transform: 'translate(-50%, -50%) scale(0)', opacity: 0.55 },
		{ transform: 'translate(-50%, -50%) scale(1)', opacity: 0 }
	], { duration: 600, easing: 'ease-out' }).onfinish = () => el.remove();
}

function flashScene(color) {
	if (reduceMotion) return;
	const scene = document.getElementById('scene');
	if (!scene) return;
	const el = document.createElement('div');
	el.className = 'scene-flash';
	el.style.background = `radial-gradient(circle at 50% 70%, ${color}, transparent 70%)`;
	scene.append(el);
	el.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 750, easing: 'ease-out' }).onfinish = () => el.remove();
	scene.animate([
		{ transform: 'scale(1)' },
		{ transform: 'scale(1.012)', offset: 0.25 },
		{ transform: 'scale(1)' }
	], { duration: 450, easing: 'ease-out' });
}

function nudge(el, className = 'fx-pop') {
	el.classList.remove(className);
	void el.offsetWidth;
	el.classList.add(className);
	el.addEventListener('animationend', () => el.classList.remove(className), { once: true });
}

function initEmbers() {
	if (reduceMotion) return;
	const layer = document.createElement('div');
	layer.className = 'embers';
	layer.setAttribute('aria-hidden', 'true');
	for (let i = 0; i < 22; i++) {
		const ember = document.createElement('i');
		const size = 3 + Math.random() * 4;
		ember.style.cssText = `left:${Math.random() * 100}%;width:${size}px;height:${size}px;animation-duration:${9 + Math.random() * 12}s;animation-delay:-${Math.random() * 20}s;--sway:${(Math.random() - 0.5) * 120}px`;
		layer.append(ember);
	}
	document.body.append(layer);
}

function initParallax() {
	const scene = document.getElementById('scene');
	if (!scene || reduceMotion) return;
	scene.addEventListener('pointermove', (event) => {
		const rect = scene.getBoundingClientRect();
		scene.style.setProperty('--px', ((event.clientX - rect.left) / rect.width - 0.5).toFixed(3));
		scene.style.setProperty('--py', ((event.clientY - rect.top) / rect.height - 0.5).toFixed(3));
	});
	scene.addEventListener('pointerleave', () => {
		scene.style.setProperty('--px', 0);
		scene.style.setProperty('--py', 0);
	});
}

// The HUD text and resource cards are rewritten by ui.js; compare against the last seen values to pulse only what changed.
function initChangePulses() {
	const last = new Map();
	const pulse = (el, key) => {
		const text = el.textContent;
		if (last.has(key) && last.get(key) !== text) nudge(el, 'fx-tick');
		last.set(key, text);
	};

	const hud = document.querySelectorAll('.hud-chip strong');
	hud.forEach((el, i) => {
		new MutationObserver(() => pulse(el, `hud${i}`)).observe(el, { childList: true, characterData: true, subtree: true });
		last.set(`hud${i}`, el.textContent);
	});

	const grid = document.getElementById('resource-grid');
	if (grid) {
		new MutationObserver(() => {
			grid.querySelectorAll('.resource-head strong').forEach((el, i) => pulse(el, `res${i}`));
		}).observe(grid, { childList: true });
	}

	const objective = document.getElementById('objective-count');
	if (objective) new MutationObserver(() => pulse(objective, 'obj')).observe(objective, { childList: true, characterData: true, subtree: true });
}

function initClicks() {
	document.addEventListener('pointerdown', (event) => {
		if (event.button !== 0) return;
		const { clientX: x, clientY: y } = event;
		ring(x, y);

		const control = event.target.closest('button:not(:disabled), .game-card, .worker-card, .resource-card, .hud-chip, .scene-chip, .objective-box, .log-entry');
		if (control) {
			if (control.matches('button')) ripple(control, x, y);
			else nudge(control, 'fx-press');
		}

		const sprite = event.target.closest('.sprite:not(.plot), .vill');
		if (sprite) {
			nudge(sprite, 'fx-hop');
			burst(x, y, 10, 50);
		}
	});

	document.addEventListener('click', (event) => {
		const trigger = event.target.closest('[data-action]');
		const { clientX: x, clientY: y } = event;
		if (!trigger || trigger.disabled) {
			if (!event.target.closest('button, select')) burst(x, y, 6, 36);
			return;
		}
		const { action } = trigger.dataset;
		if (action === 'theme') {
			applyTheme(currentTheme() === 'dark' ? 'light' : 'dark');
			burst(x, y, 14, 60);
			return;
		}
		const effect = ACTION_BURSTS[action];
		const rect = trigger.getBoundingClientRect();
		burst(rect.left + rect.width / 2, rect.top + rect.height / 2, effect?.count ?? 8, 60);
		if (effect?.flash) flashScene(effect.flash);
		if (['build', 'ritual', 'upgrade', 'recruit'].includes(action)) {
			nudge(document.querySelector('.scene-card'), 'fx-shake');
			nudge(document.querySelector('.objective-box'), 'fx-tick');
		}
		if (action === 'pause' || action === 'save') nudge(trigger, 'fx-pop');
	});
}

export function initFx() {
	initTheme();
	initEmbers();
	initParallax();
	initChangePulses();
	initClicks();
}
