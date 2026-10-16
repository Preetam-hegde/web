'use strict';

/* Hub: names, options, series tally and the game list. */

const MODE_NOTES = {
	split: 'Both of you play at the same time, each on your own half of the screen.',
	pass: 'One player at a time on the full screen. Play, then pass the phone.',
};
const SEAT_NOTES = {
	true: 'Phone flat between you: the top player\'s half is turned to face them.',
	false: 'Everyone reads the screen the same way up.',
};

function seg(el, options, current, onPick) {
	$$('button', el).forEach((b) => b.remove());
	options.forEach(([value, label]) => {
		const b = document.createElement('button');
		b.type = 'button';
		b.textContent = label;
		b.setAttribute('aria-pressed', String(value === current));
		b.onclick = () => { onPick(value); save(); renderHub(); };
		el.append(b);
	});
}

const ON_OFF = [[true, 'On'], [false, 'Off']];

function renderHub() {
	document.body.dataset.flip = store.flip ? '1' : '0';
	document.body.dataset.mode = store.mode;
	[0, 1].forEach((p) => { $(`#n${p}`).value = store.names[p]; });

	seg($('#modeSeg'), [['split', 'Split screen'], ['pass', 'Pass & play']], store.mode, (v) => (store.mode = v));
	seg($('#seatSeg'), [[true, 'Face to face'], [false, 'Side by side']], store.flip, (v) => (store.flip = v));
	seg($('#roundsSeg'), [[3, '3'], [5, '5'], [7, '7']], store.rounds, (v) => (store.rounds = v));
	seg($('#soundSeg'), ON_OFF, store.sound, (v) => (store.sound = v));
	seg($('#dareSeg'), ON_OFF, store.dares, (v) => (store.dares = v));
	$('#seatSeg').hidden = store.mode === 'pass'; // seating only matters when two halves share the screen
	$('#seatNote').textContent = `${MODE_NOTES[store.mode]} ${store.mode === 'split' ? SEAT_NOTES[store.flip] : ''}`.trim();

	const [a, b] = store.series;
	const series = $('#series');
	series.hidden = !(a + b);
	series.innerHTML = `<span style="color:var(--p0)"><b>${esc(nameOf(0))} ${a}</b></span> – <span style="color:var(--p1)"><b>${b} ${esc(nameOf(1))}</b></span><button type="button">reset</button>`;
	$('button', series).onclick = () => { store.series = [0, 0]; save(); renderHub(); };

	// The text boxes are only rewritten when not being typed in, so the cursor never jumps.
	[['cDares', 'dares'], ['cTruths', 'truths']].forEach(([id, key]) => {
		if (document.activeElement !== $(`#${id}`)) $(`#${id}`).value = store.custom[key].join('\n');
	});

	renderGames(); // refreshes each card's played count after a match
	fx.start();
}

function renderGames() {
	const groups = {};
	GAMES.forEach((g) => (groups[g.group] ||= []).push(g));
	const played = (g) => (store.plays[g.id] ? `played <b>${store.plays[g.id]}</b>×` : 'not played yet');
	$('#games').innerHTML = Object.entries(groups)
		.map(([name, list]) => `<h2>${name}</h2><div class="grid">${list.map((g) => `<button class="card" type="button" data-game="${g.id}"><span class="ic">${gameIcon(g.id)}</span><h3>${g.name}</h3><p>${g.blurb}</p><span class="best">${played(g)}</span></button>`).join('')}</div>`)
		.join('');
}

$('#games').onclick = (e) => {
	const card = e.target.closest('[data-game]');
	if (card) startMatch(GAMES.find((g) => g.id === card.dataset.game));
};

/* Cards tilt toward the pointer and a soft spotlight follows it, as on Keystorm's menu. */
const calm = matchMedia('(prefers-reduced-motion: reduce)').matches;
$('#games').addEventListener('pointermove', (e) => {
	const c = e.target.closest('.card');
	if (!c) return;
	const r = c.getBoundingClientRect();
	const x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
	c.style.setProperty('--mx', `${x * 100}%`);
	c.style.setProperty('--my', `${y * 100}%`);
	if (!calm) {
		c.style.setProperty('--rx', `${(0.5 - y) * 10}deg`);
		c.style.setProperty('--ry', `${(x - 0.5) * 12}deg`);
	}
});
$('#games').addEventListener('pointerout', (e) => {
	const c = e.target.closest('.card');
	if (c && !c.contains(e.relatedTarget)) {
		c.style.setProperty('--rx', '0deg');
		c.style.setProperty('--ry', '0deg');
	}
});

[0, 1].forEach((p) => {
	$(`#n${p}`).oninput = (e) => { store.names[p] = e.target.value; save(); };
});

/* Quit needs two taps so a stray thumb can't end the match. */
let quitTimer = 0;
$('#quit').onclick = (e) => {
	const btn = e.currentTarget;
	if (btn.classList.contains('sure')) { clearTimeout(quitTimer); btn.classList.remove('sure'); btn.textContent = 'Quit'; return quit(); }
	btn.classList.add('sure');
	btn.textContent = 'Sure?';
	quitTimer = setTimeout(() => { btn.classList.remove('sure'); btn.textContent = 'Quit'; }, 2000);
};

/* Stats: totals, a row per game, and the last matches, all from this device's history. */
function renderStats() {
	const h = store.history;
	const wins = [0, 1].map((p) => h.filter((x) => x.c === p).length);
	const tile = (n, label, c = '') => `<div class="tile"${c ? ` style="--c:${c}"` : ''}><b>${n}</b><small>${label}</small></div>`;
	const byGame = GAMES.map((g) => {
		const mine = h.filter((x) => x.g === g.id);
		return `<div class="srow"><b>${gameIcon(g.id)} ${g.name}</b><span>${store.plays[g.id] || 0}×</span><span>${[0, 1].map((p) => mine.filter((x) => x.c === p).length).join(' – ')}</span></div>`;
	}).join('');
	const recent = h.slice(-8).reverse().map((x) => {
		const g = GAMES.find((y) => y.id === x.g);
		const when = new Date(x.t).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
		return `<div class="srow"><b>${g ? gameIcon(g.id) : ''} ${x.c === -2 ? `${esc(x.n[0])} &amp; ${esc(x.n[1])}` : `${esc(x.n[0])} ${x.p[0]} – ${x.p[1]} ${esc(x.n[1])}`}</b><span>${x.c === -2 ? esc(x.s || 'together') : x.c === -1 ? 'draw' : `${esc(x.n[x.c])} won`}</span><span>${when}</span></div>`;
	}).join('');
	$('#statsBody').innerHTML = h.length || Object.keys(store.plays).length
		? `<div class="tiles">${tile(h.length, 'matches')}${tile(wins[0], `${esc(nameOf(0))} wins`, 'var(--p0)')}${tile(wins[1], `${esc(nameOf(1))} wins`, 'var(--p1)')}${tile(h.filter((x) => x.c === -1).length, 'draws')}</div>
			<div class="stat-list"><h3>By game · played · wins (${esc(nameOf(0))} – ${esc(nameOf(1))})</h3>${byGame}</div>
			${recent ? `<div class="stat-list"><h3>Recent matches</h3>${recent}</div>` : ''}`
		: '<p class="empty">No matches yet. Play one and it shows up here.</p>';
}
$('#statsBtn').onclick = () => { document.body.dataset.screen = 'stats'; window.scrollTo(0, 0); renderStats(); };
$('#statsBack').onclick = quit;
$('#statsReset').onclick = () => {
	if (!confirm('Clear all match history and played counts on this device?')) return;
	store.history = [];
	store.plays = {};
	store.series = [0, 0];
	save();
	renderStats();
};

/* One line per entry, trimmed and capped, so a pasted essay can't bloat storage. */
const toLines = (text) => text.split('\n').map((l) => l.trim().slice(0, 140)).filter(Boolean).slice(0, 30);
[['cDares', 'dares'], ['cTruths', 'truths']].forEach(([id, key]) => {
	$(`#${id}`).oninput = (e) => { store.custom[key] = toLines(e.target.value); save(); };
});

$('#share').onclick = shareResult;

/* Offline and repeat visits: the service worker keeps the app and word lists cached. */
if ('serviceWorker' in navigator) addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => { /* private mode or http: it just loads from the network */ }));

document.addEventListener('contextmenu', (e) => e.preventDefault()); // long-press must not open menus mid-game

renderHub();
