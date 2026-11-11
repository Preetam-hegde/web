'use strict';

/* History: totals, personal bests, and every match and game played on this device, newest first. */
let histTab = 'all';
const HIST_TABS = [
	['all', 'All'],
	['solo', 'Solo'],
	['duo', '2 players'],
	['party', 'Party'],
];
const kindOf = (x) => (x.c === -3 ? 'solo' : x.c === -4 ? 'party' : 'duo');
function renderStats() {
	const h = store.history;
	const duo = h.filter((x) => kindOf(x) === 'duo');
	const wins = [0, 1].map((p) => duo.filter((x) => x.c === p).length);
	const tile = (n, label, c = '') =>
		`<div class="tile"${c ? ` style="--c:${c}"` : ''}><b>${n}</b><small>${label}</small></div>`;
	const gameOf = (id) =>
		id === 'cup'
			? { id, name: 'Faceoff Cup' }
			: GAMES.find((y) => y.id === id) || PARTY.find((y) => y.id === id);
	const bests = GAMES.filter((g) => store.best[g.id])
		.map(
			(g) =>
				`<div class="srow"><b>${gameIcon(g.id)} ${g.name}</b><span>${esc(store.best[g.id].l)}</span><span>★</span></div>`,
		)
		.join('');
	const names = [...new Set(duo.flatMap((x) => x.n))];
	const perGame = GAMES.map((g) => {
		const mine = duo.filter((x) => x.g === g.id);
		if (!mine.length) return '';
		const tally = names
			.map((n) => [n, mine.filter((x) => x.c >= 0 && x.n[x.c] === n).length])
			.filter(([, w]) => w)
			.sort((a, b) => b[1] - a[1]);
		const draws = mine.filter((x) => x.c < 0).length;
		return `<div class="srow"><b>${gameIcon(g.id)} ${g.name}</b><span>${mine.length}×</span><small>${tally.map(([n, w]) => `${esc(n)} ${w}`).join(' · ') || 'no wins yet'}${draws ? ` · ${draws} draw${draws > 1 ? 's' : ''}` : ''}</small></div>`;
	}).join('');
	const day = (t) =>
		new Date(t).toLocaleDateString(undefined, {
			weekday: 'short',
			month: 'short',
			day: 'numeric',
		});
	const time = (t) =>
		new Date(t).toLocaleTimeString(undefined, {
			hour: 'numeric',
			minute: '2-digit',
		});
	const line = (x) => {
		const k = kindOf(x),
			g = gameOf(x.g);
		const who =
			k === 'solo'
				? `${esc(x.n[0])} · solo`
				: k === 'party'
					? esc(x.s)
					: x.c === -2
						? `${esc(x.n[0])} &amp; ${esc(x.n[1])}`
						: `${esc(x.n[0])} ${x.p[0]} – ${x.p[1]} ${esc(x.n[1])}`;
		const out =
			k === 'solo'
				? `${x.g === 'cup' ? '' : 'best '}${esc(x.s || '–')}`
				: k === 'party'
					? 'played'
					: x.c === -2
						? esc(x.s || 'together')
						: x.c === -1
							? 'draw'
							: `${esc(x.n[x.c])} won`;
		return `<div class="srow hrow"><b>${g ? gameIcon(g.id) : ''} ${g ? g.name : esc(x.g)}</b><span>${out}</span><small>${who} · ${time(x.t)}</small></div>`;
	};
	const shown = h
		.filter((x) => histTab === 'all' || kindOf(x) === histTab)
		.reverse();
	let last = '';
	const rows = shown
		.map((x) => {
			const d = day(x.t),
				head = d === last ? '' : `<h4 class="hday">${d}</h4>`;
			last = d;
			return head + line(x);
		})
		.join('');
	$('#statsBody').innerHTML = h.length
		? `<div class="tiles">${tile(h.length, 'plays')}${tile(h.filter((x) => kindOf(x) === 'solo').length, 'solo runs', 'var(--win)')}${tile(wins[0], `${esc(nameOf(0))} wins`, 'var(--p0)')}${tile(wins[1], `${esc(nameOf(1))} wins`, 'var(--p1)')}</div>
			${bests ? `<div class="stat-list"><h3>Personal bests</h3>${bests}</div>` : ''}
			${perGame ? `<div class="stat-list"><h3>Wins by game</h3>${perGame}</div>` : ''}
			<div class="stat-list"><h3>Everything you played</h3><div class="seg htabs" role="group" aria-label="Filter">${HIST_TABS.map(([id, n]) => `<button type="button" data-t="${id}" aria-pressed="${id === histTab}">${n}</button>`).join('')}</div>${rows || '<p class="empty">Nothing here yet.</p>'}</div>`
		: '<p class="empty">Nothing played yet. Finish a game and it shows up here.</p>';
}
$('#statsBody').onclick = (e) => {
	const t = e.target.closest('[data-t]')?.dataset.t;
	if (t) {
		histTab = t;
		renderStats();
	}
};
$('#statsBtn').onclick = () => {
	document.body.dataset.screen = 'stats';
	window.scrollTo(0, 0);
	renderStats();
};
$('#statsBack').onclick = toHub;

$('#statsReset').onclick = () => {
	if (
		!confirm(
			'Clear all history, personal bests and played counts on this device?',
		)
	)
		return;
	store.history = [];
	store.plays = {};
	store.best = {};
	store.series = [0, 0];
	save();
	renderStats();
};
