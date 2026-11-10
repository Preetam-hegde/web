'use strict';

/*
 * Reading preferences shared by the DSA and AI/ML guides:
 * light/dark theme (follows the system until you choose), text size, focus mode,
 * and collapsible lesson sections. Everything degrades to defaults if storage is blocked.
 */
(() => {
	const KEY = 'study-prefs-v1';
	const ZOOMS = [0.9, 1, 1.15, 1.3, 1.5];
	const root = document.documentElement;
	const dark = matchMedia('(prefers-color-scheme: dark)');
	let prefs = { theme: '', zoom: 1, focus: false };
	try {
		prefs = { ...prefs, ...JSON.parse(localStorage.getItem(KEY) || '{}') };
	} catch {
		/* storage blocked: keep defaults */
	}
	const save = () => {
		try {
			localStorage.setItem(KEY, JSON.stringify(prefs));
		} catch {
			/* ignore */
		}
	};
	const theme = () => prefs.theme || (dark.matches ? 'dark' : 'light');
	function apply() {
		root.dataset.theme = theme();
		root.style.setProperty('--read-zoom', ZOOMS.includes(prefs.zoom) ? prefs.zoom : 1);
		document.body && document.body.classList.toggle('focus-mode', !!prefs.focus);
	}
	apply(); // early, so the first paint already has the right theme
	dark.addEventListener('change', apply);

	function foldAll() {
		const sections = [...document.querySelectorAll('#study-content .lesson-section[data-folds]')];
		const collapse = sections.some((s) => !s.classList.contains('folded'));
		sections.forEach((s) => setFold(s, collapse));
	}
	function setFold(section, folded) {
		section.classList.toggle('folded', folded);
		const h = section.querySelector(':scope > h3[data-fold]');
		if (h) h.setAttribute('aria-expanded', String(!folded));
	}
	function enhance() {
		document.querySelectorAll('#study-content .lesson-section').forEach((section) => {
			const h = section.querySelector(':scope > h3');
			if (!h || h.dataset.fold !== undefined) return;
			h.dataset.fold = '';
			section.dataset.folds = '';
			h.tabIndex = 0;
			h.setAttribute('role', 'button');
			h.setAttribute('aria-expanded', 'true');
		});
	}

	function init() {
		const bar = document.createElement('div');
		bar.className = 'prefs';
		bar.setAttribute('role', 'toolbar');
		bar.setAttribute('aria-label', 'Reading preferences');
		const btn = (label, text, onClick, pressed) => {
			const b = document.createElement('button');
			b.type = 'button';
			b.textContent = text;
			b.title = label;
			b.setAttribute('aria-label', label);
			if (pressed !== undefined) b.setAttribute('aria-pressed', String(pressed()));
			b.addEventListener('click', () => {
				onClick();
				apply();
				save();
				if (pressed) b.setAttribute('aria-pressed', String(pressed()));
			});
			return b;
		};
		const step = (d) => () => {
			const now = ZOOMS.indexOf(prefs.zoom);
			prefs.zoom = ZOOMS[Math.max(0, Math.min(ZOOMS.length - 1, (now < 0 ? 1 : now) + d))];
		};
		bar.append(
			btn('Switch light / dark theme', '◐', () => (prefs.theme = theme() === 'dark' ? 'light' : 'dark')),
			btn('Smaller text', 'A−', step(-1)),
			btn('Larger text', 'A+', step(1)),
			btn('Focus mode: hide the sidebar', '⛶', () => (prefs.focus = !prefs.focus), () => prefs.focus),
			btn('Collapse or expand all sections', '⇕', foldAll),
		);
		document.body.append(bar);
		apply();

		const content = document.getElementById('study-content');
		if (content) {
			new MutationObserver(enhance).observe(content, { childList: true });
			enhance();
			const toggle = (e) => {
				const h = e.target.closest && e.target.closest('h3[data-fold]');
				if (!h) return;
				if (e.type === 'keydown' && e.key !== 'Enter' && e.key !== ' ') return;
				e.preventDefault();
				const s = h.parentElement;
				setFold(s, !s.classList.contains('folded'));
			};
			content.addEventListener('click', toggle);
			content.addEventListener('keydown', toggle);
		}
	}
	if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
	else init();
})();
