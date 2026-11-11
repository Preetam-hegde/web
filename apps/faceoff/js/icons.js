'use strict';

/* ── game icons: Lucide line icons (ISC, https://lucide.dev), drawn in currentColor ── */
const GAME_ICONS = {
	cup: '<path d="M8 3h8v5a4 4 0 0 1-8 0z"/><path d="M8 5H4v2a4 4 0 0 0 4 4M16 5h4v2a4 4 0 0 1-4 4M12 12v6M8 21h8M9 18h6"/>',
	stack: '<path d="M5 19h14v3H5zM7 13h12v4H7zM5 7h10v4H5zM9 1h8v4H9z"/>',
	golf: '<path d="M15 16V3l6 3-6 3M15 16c4 0 7 1 7 3s-3 3-7 3-7-1-7-3"/><circle cx="4" cy="17" r="2"/>',
	likely:
		'<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
	never: '<path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/>',
	compat:
		'<line x1="19" x2="5" y1="5" y2="19"/><circle cx="6.5" cy="6.5" r="2.5"/><circle cx="17.5" cy="17.5" r="2.5"/>',
	rather:
		'<circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><path d="M12 17h.01"/>',
	roulette:
		'<rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><path d="M16 8h.01"/><path d="M8 8h.01"/><path d="M8 16h.01"/><path d="M16 16h.01"/><path d="M12 12h.01"/>',
	connect4:
		'<rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="8.5" cy="8.5" r="1.5"/><circle cx="15.5" cy="8.5" r="1.5"/><circle cx="8.5" cy="15.5" r="1.5"/><circle cx="15.5" cy="15.5" r="1.5"/>',
	sync: '<path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>',
	stop: '<line x1="10" x2="14" y1="2" y2="2"/><line x1="12" x2="15" y1="14" y2="11"/><circle cx="12" cy="14" r="8"/>',
	liar: '<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>',
	feel: '<path d="M10.733 5.076a10.744 10.744 0 0 1 11.205 6.575 1 1 0 0 1 0 .696 10.747 10.747 0 0 1-1.444 2.49"/><path d="M14.084 14.158a3 3 0 0 1-4.242-4.242"/><path d="M17.479 17.499a10.75 10.75 0 0 1-15.417-5.151 1 1 0 0 1 0-.696 10.75 10.75 0 0 1 4.446-5.143"/><path d="m2 2 20 20"/>',
	hold: '<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="1"/>',
	centre:
		'<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>',
	frenzy: '<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>',
	green:
		'<rect x="7" y="2" width="10" height="20" rx="3"/><circle cx="12" cy="7" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="12" cy="17" r="1.5"/>',
	cut: '<circle cx="6" cy="6" r="3"/><path d="M8.12 8.12 12 12"/><path d="M20 4 8.12 15.88"/><circle cx="6" cy="18" r="3"/><path d="M14.8 14.8 20 20"/>',
	know: '<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>',
	hangman:
		'<polyline points="4 7 4 4 20 4 20 7"/><line x1="9" x2="15" y1="20" y2="20"/><line x1="12" x2="12" y1="4" y2="20"/>',
	ttt: '<path d="M8 3v18"/><path d="M16 3v18"/><path d="M3 8h18"/><path d="M3 16h18"/>',
	'ttt-x': '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
	'ttt-o': '<circle cx="12" cy="12" r="8"/>',
	memory:
		'<rect width="8" height="8" x="3" y="3" rx="1.5"/><rect width="8" height="8" x="13" y="13" rx="1.5"/><path d="M17 3v4"/><path d="M15 5h4"/><path d="M5 17v4"/><path d="M3 19h4"/>',
	tropes:
		'<rect width="20" height="15" x="2" y="7" rx="2" ry="2"/><polyline points="17 2 12 7 7 2"/>',
	answers:
		'<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>',
	poker:
		'<circle cx="12" cy="12" r="10"/><line x1="8" x2="16" y1="15" y2="15"/><line x1="9" x2="9.01" y1="9" y2="9"/><line x1="15" x2="15.01" y1="9" y2="9"/>',
	mix: '<polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/>',
	flags:
		'<path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" x2="4" y1="22" y2="15"/>',
};
const gameIcon = (id) =>
	GAME_ICONS[id]
		? `<svg class="gi" viewBox="0 0 24 24" aria-hidden="true">${GAME_ICONS[id]}</svg>`
		: `<span class="game-glyph" aria-hidden="true">${esc([...GAMES, ...PARTY].find((g) => g.id === id)?.icon || '↗')}</span>`;
