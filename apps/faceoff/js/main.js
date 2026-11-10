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

/* The menu is a short walk: home (one phone, two phones or party) → room (two phones only) → categories → games. */
const CATS = [
	{ id: 'reflex', name: 'Reflex', icon: 'frenzy', blurb: 'Fast fingers. Who reacts first?' },
	{ id: 'timing', name: 'Timing', icon: 'stop', blurb: 'Feel the clock and stop it on the mark.' },
	{ id: 'rhythm', name: 'Rhythm', icon: 'tempo', blurb: 'Keep the beat, copy the groove, tap in sync.' },
	{ id: 'perception', name: 'Perception', icon: 'track', blurb: 'Count, track and judge it by eye.' },
	{ id: 'match', name: 'Match', icon: 'pitch', blurb: 'Hear it, see it, size it. Then match it from memory.' },
	{ id: 'brain', name: 'Brain & Board', icon: 'memory', blurb: 'Tic-Tac-Toe, Connect 4, memory and word duels.' },
	{ id: 'couple', name: 'Couple', icon: 'know', blurb: 'Questions, dares and games to share.' },
];
const PARTY_GROUPS = [
	{ id: 'party', name: 'Party cards', sub: 'One shared screen, passed round the group.', pick: (g) => !SPYDEF[g.id] },
	{ id: 'spy', name: 'Spy & secrets', sub: 'Hidden roles and words. Also playable on everyone’s own phone.', pick: (g) => !!SPYDEF[g.id] },
];
Object.assign(GAME_ICONS, {
	phone: '<rect width="14" height="20" x="5" y="2" rx="2" ry="2"/><path d="M12 18h.01"/>',
	online: '<path d="M12 20h.01"/><path d="M2 8.82a15 15 0 0 1 20 0"/><path d="M5 12.859a10 10 0 0 1 14 0"/><path d="M8.5 16.429a5 5 0 0 1 7 0"/>',
});
GAME_ICONS.party = GAME_ICONS.likely;
Object.assign(GAME_ICONS, { solo: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>', two: '<circle cx="9" cy="8" r="3.5"/><path d="M2 21a7 7 0 0 1 14 0"/><circle cx="17" cy="9" r="3"/><path d="M17 14a6 6 0 0 1 5 7"/>' });
const MODES = [
	{ id: 'solo', name: 'Single player', blurb: 'Just you. Beat your own best in timing, reflex, brain and match games.', cat: 'reflex' },
	{ id: 'two', name: '2 players', blurb: 'Face off on one phone, or each on your own phone.', cat: 'phone' },
	{ id: 'party', name: '3 + players', blurb: 'Party and spy games for the whole table.', cat: 'party' },
];
const MODES2 = [
	{ id: 'phone', name: 'One phone', blurb: 'Split screen or pass and play. Two players, one device.' },
	{ id: 'online', name: 'Two phones', blurb: 'Each of you on your own phone. Share a 4-letter room code.' },
];

let mode = 'phone'; // which way of playing was picked: solo, phone, online or party
let step = 'home'; // home, two, room, cats, list or party
const solo = () => mode === 'solo';
const gamesIn = (id) => GAMES.filter((g) => g.group === id && (!solo() || canSolo(g)));
const bestOf = (g) => store.best[g.id]?.l;
let catId = 'reflex';

function go(next, opts = {}) {
	step = next;
	if (opts.mode) mode = opts.mode;
	if (opts.cat) catId = opts.cat;
	renderHub();
	window.scrollTo(0, 0);
}

const card = (g, attr, cat, extra, ic = g.id) => `<button class="card" type="button" ${attr}="${g.id}"${cat ? ` data-cat="${cat}"` : ''}><span class="ic">${gameIcon(ic)}</span><h3>${g.name}</h3><p>${g.blurb}</p>${extra}</button>`;

function renderHub() {
	if (document.body.dataset.screen !== 'match') document.body.dataset.mode = store.mode;
	document.body.dataset.flip = store.flip ? '1' : '0';
	document.body.dataset.big = store.big ? '1' : '0';
	if (net && step === 'room') step = 'cats'; // the other phone just joined
	if (mode === 'online' && !net && (step === 'cats' || step === 'list')) step = 'two'; // the link dropped
	$('#hub').dataset.step = step;
	$$('[data-for]').forEach((el) => { el.hidden = !el.dataset.for.split(' ').includes(step); });
	$('#hubBack').hidden = step === 'home';
	[0, 1].forEach((p) => { $(`#n${p}`).value = store.names[p]; });

	seg($('#modeSeg'), [['split', 'Split screen'], ['pass', 'Pass & play']], store.mode, (v) => (store.mode = v));
	seg($('#seatSeg'), [[true, 'Face to face'], [false, 'Side by side']], store.flip, (v) => (store.flip = v));
	seg($('#roundsSeg'), [[3, '3'], [5, '5'], [7, '7']], store.rounds, (v) => (store.rounds = v));
	seg($('#soundSeg'), ON_OFF, store.sound, (v) => (store.sound = v));
	seg($('#bigSeg'), [[true, 'Large'], [false, 'Normal']], store.big, (v) => (store.big = v));
	seg($('#dareSeg'), ON_OFF, store.dares, (v) => (store.dares = v));
	$('#seatSeg').hidden = store.mode === 'pass'; // seating only matters when two halves share the screen
	$('#seatNote').textContent = `${MODE_NOTES[store.mode]} ${store.mode === 'split' ? SEAT_NOTES[store.flip] : ''}`.trim();

	// The text boxes are only rewritten when not being typed in, so the cursor never jumps.
	[['cDares', 'dares'], ['cTruths', 'truths']].forEach(([id, key]) => {
		if (document.activeElement !== $(`#${id}`)) $(`#${id}`).value = store.custom[key].join('\n');
	});

	if (step === 'home') renderHome();
	if (step === 'two') renderTwo();
	if (step === 'room') renderRoom();
	if (step === 'cats' || step === 'list') renderSetup();
	if (step === 'cats') renderCats();
	if (step === 'list') renderList();
	if (step === 'party') renderParty();
	fx.start();
}

const modeCard = (o) => `<button class="mode" type="button" data-mode="${o.id}" data-cat="${o.cat || o.id}">${gameIcon(o.id)}<span><b>${o.name}</b><small>${o.blurb}</small></span></button>`;
function renderHome() {
	$('#modes').innerHTML = (lobby.note ? `<p class="oops">${esc(lobby.note)}</p>` : '') + MODES.map(modeCard).join('');
}
function renderTwo() {
	$('#modes2').innerHTML = `<h2 class="stepttl">2 players</h2><p class="stepsub">How are you playing?</p>${MODES2.map(modeCard).join('')}`;
}

/* Names and tally for one phone; who you are playing for two phones. */
function renderSetup() {
	const online = mode === 'online';
	$('#names').hidden = online;
	$('#n1').closest('label').hidden = solo();
	$('#n0').placeholder = solo() ? 'Your name' : 'Player 1';
	$('#onbar').hidden = !online;
	if (online) $('#onbar').innerHTML = `<i class="live"></i><span style="color:var(--p0)">${esc(nameOf(0))}</span> vs <span style="color:var(--p1)">${esc(nameOf(1))}</span><button type="button">leave</button>`;
	const [a, b] = store.series;
	const series = $('#series');
	series.hidden = online || solo() || !(a + b);
	series.innerHTML = `<span style="color:var(--p0)"><b>${esc(nameOf(0))} ${a}</b></span> – <span style="color:var(--p1)"><b>${b} ${esc(nameOf(1))}</b></span><button type="button">reset</button>`;
	$('button', series).onclick = () => { store.series = [0, 0]; save(); renderHub(); };
	const chip = $('#settingsChip');
	chip.hidden = online && net?.role === 'guest'; // the host sets the rounds
	chip.textContent = solo() ? `${store.rounds} rounds · Settings ⚙` : online ? `${store.rounds} rounds · Settings ⚙` : `${store.mode === 'pass' ? 'Pass & play' : 'Split screen'} · ${store.rounds} rounds · Settings ⚙`;
}

function renderCats() {
	const n = (id) => gamesIn(id).length;
	$('#cats').innerHTML = `<div class="grid">${CATS.filter((c) => n(c.id)).map((c) => card(c, 'data-go', c.id, `<span class="count-pill"><b>${n(c.id)}</b> games</span>`, c.icon)).join('')}</div>`;
}

function renderList() {
	const c = CATS.find((x) => x.id === catId);
	const played = (g) => (solo() ? (bestOf(g) ? `best <b>${bestOf(g)}</b>` : 'no score yet') : store.plays[g.id] && mode !== 'online' ? `played <b>${store.plays[g.id]}</b>×` : 'not played yet');
	$('#listTtl').dataset.cat = c.id;
	$('#listTtl').innerHTML = `${gameIcon(c.icon)} ${c.name}`;
	$('#listSub').textContent = c.blurb;
	$('#games').dataset.cat = c.id;
	$('#games').innerHTML = `<div class="grid">${gamesIn(c.id).map((g) => card(g, 'data-game', '', `<span class="best">${mode === 'online' ? '&nbsp;' : played(g)}</span>`)).join('')}</div>`;
}

function renderParty() {
	const played = (g) => (store.plays[g.id] ? `played <b>${store.plays[g.id]}</b>×` : 'not played yet');
	$('#partyList').innerHTML = PARTY_GROUPS.map((grp) => `<div data-cat="${grp.id}"><h2 class="stepttl">${grp.name}</h2><p class="stepsub">${grp.sub}</p><div class="grid">${PARTY.filter(grp.pick).map((g) => card(g, 'data-party', '', `<span class="best">${played(g)}</span>`)).join('')}</div></div>`).join('');
}

/* Two phones: make a room or join one. Everything after that is in net.js. */
function renderRoom() {
	const key = `${lobby.state}|${lobby.code}|${lobby.msg}`;
	const room = $('#room');
	if (room.dataset.key === key) return;
	room.dataset.key = key;
	const L = lobby;
	const name = `<label class="who" style="--c: var(--p0)"><i></i><input id="myName" maxlength="14" placeholder="Your name" autocomplete="off" value="${esc(store.names[0])}" aria-label="Your name"></label>`;
	const wait = (txt) => `<h2 class="stepttl">${txt}</h2><button class="btn ghost" type="button" data-a="cancel">Cancel</button>`;
	room.innerHTML = L.state === 'hosting'
		? `<h2 class="stepttl">Your room</h2><p class="stepsub">Your friend scans this with their camera, or opens Faceoff, picks <b>Two phones</b> and types the code.</p><div class="qr" id="qr"></div><div class="tcode">${L.code}</div><button class="btn" type="button" data-a="share">Send invite link</button><p class="stepsub">Waiting for your friend…</p><button class="btn ghost" type="button" data-a="cancel">Cancel</button>`
		: L.state === 'starting' ? wait('Opening a room…')
		: L.state === 'joining' ? wait(`Joining ${L.code}…`)
		: `<h2 class="stepttl">Two phones</h2><p class="stepsub">One of you makes a room, the other joins it with the code. You each play on your own phone.</p>${L.state === 'error' ? `<p class="oops">${esc(L.msg)}</p>` : ''}${name}<button class="btn" type="button" data-a="create">Make a room</button><div class="or">or join a friend</div><input class="tinput" id="joinCode" maxlength="4" placeholder="CODE" autocapitalize="characters" autocomplete="off" spellcheck="false" aria-label="Room code"><button class="btn ghost" type="button" data-a="join">Join</button>`;
	if (L.state === 'hosting') loadQr().then(() => { if (lobby.state === 'hosting' && $('#qr')) $('#qr').innerHTML = qrSvg(inviteUrl(L.code)); }).catch(() => { /* no QR: the code and link still work */ });
}

/* The link a friend opens to join: this page's own address, so it works wherever Faceoff is hosted. */
const inviteUrl = (code) => `${location.origin}${location.pathname.replace(/index\.html$/, '')}?join=${code}`;
const loadQr = () => (window.qrcode ? Promise.resolve() : new Promise((ok, fail) => {
	const s = document.createElement('script');
	s.src = 'js/vendor/qrcode.js?v=17';
	s.onload = ok;
	s.onerror = fail;
	document.head.append(s);
}));
/* A QR code as inline SVG: one square per dark module, on a white card with a quiet border. */
function qrSvg(text) {
	const q = qrcode(0, 'M');
	q.addData(text);
	q.make();
	const n = q.getModuleCount(), pad = 3;
	let d = '';
	for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) if (q.isDark(r, c)) d += `M${c} ${r}h1v1h-1z`;
	return `<svg viewBox="${-pad} ${-pad} ${n + pad * 2} ${n + pad * 2}" shape-rendering="crispEdges" role="img" aria-label="QR code to join this room"><path d="${d}" fill="#050409"/></svg>`;
}

$('#room').oninput = (e) => {
	if (e.target.id === 'myName') { store.names[0] = e.target.value; save(); }
	if (e.target.id === 'joinCode') e.target.value = e.target.value.toUpperCase();
};
$('#room').onclick = async (e) => {
	const act = e.target.closest('[data-a]')?.dataset.a;
	if (act === 'create') netHost();
	if (act === 'join') netJoin($('#joinCode').value);
	if (act === 'cancel') { netCancel(); lobbySet('idle'); }
	if (act === 'share') {
		const url = inviteUrl(lobby.code);
		try { await navigator.share({ title: 'Faceoff', text: `Join my Faceoff room: ${lobby.code}`, url }); } catch { navigator.clipboard?.writeText(url); e.target.textContent = 'Link copied ✓'; }
	}
};
lobby.onchange = renderHub;

$('#modes').onclick = $('#modes2').onclick = (e) => {
	const id = e.target.closest('[data-mode]')?.dataset.mode;
	if (!id) return;
	lobby.note = '';
	if (id === 'solo') go('cats', { mode: 'solo' });
	if (id === 'two') go('two');
	if (id === 'phone') go('cats', { mode: 'phone' });
	if (id === 'online') go(net ? 'cats' : 'room', { mode: 'online' });
	if (id === 'party') go('party', { mode: 'party' });
};
$('#cats').onclick = (e) => {
	const id = e.target.closest('[data-go]')?.dataset.go;
	if (id) go('list', { cat: id });
};
$('#onbar').onclick = (e) => { if (e.target.closest('button')) { netLeave(); go('two'); } };
$('#hubBack').onclick = () => {
	if (step === 'room') { netCancel(); lobbySet('idle'); return go('two'); }
	if (step === 'list') return go('cats');
	if (step === 'cats' && net && !confirm('Leave this room?')) return;
	if (step === 'cats' && net) netLeave();
	go(step === 'cats' && !solo() ? 'two' : 'home');
};

$('#games').onclick = (e) => {
	const id = e.target.closest('[data-game]')?.dataset.game;
	if (!id) return;
	if (net?.role === 'guest') return net.send({ t: 'pick', id }); // the host starts it
	startMatch(GAMES.find((g) => g.id === id), undefined, solo());
};
$('#partyList').onclick = (e) => {
	const id = e.target.closest('[data-party]')?.dataset.party;
	if (id) startParty(id);
};

/* Cards tilt toward the pointer and a soft spotlight follows it, as on Keystorm's menu. */
const calm = matchMedia('(prefers-reduced-motion: reduce)').matches;
[$('#games'), $('#cats'), $('#partyList')].forEach((box) => box.addEventListener('pointermove', (e) => {
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
}));
[$('#games'), $('#cats'), $('#partyList')].forEach((box) => box.addEventListener('pointerout', (e) => {
	const c = e.target.closest('.card');
	if (c && !c.contains(e.relatedTarget)) {
		c.style.setProperty('--rx', '0deg');
		c.style.setProperty('--ry', '0deg');
	}
}));

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

/* History: totals, personal bests, and every match and game played on this device, newest first. */
let histTab = 'all';
const HIST_TABS = [['all', 'All'], ['solo', 'Solo'], ['duo', '2 players'], ['party', 'Party']];
const kindOf = (x) => (x.c === -3 ? 'solo' : x.c === -4 ? 'party' : 'duo');
function renderStats() {
	const h = store.history;
	const duo = h.filter((x) => kindOf(x) === 'duo');
	const wins = [0, 1].map((p) => duo.filter((x) => x.c === p).length);
	const tile = (n, label, c = '') => `<div class="tile"${c ? ` style="--c:${c}"` : ''}><b>${n}</b><small>${label}</small></div>`;
	const gameOf = (id) => GAMES.find((y) => y.id === id) || PARTY.find((y) => y.id === id);
	const bests = GAMES.filter((g) => store.best[g.id]).map((g) => `<div class="srow"><b>${gameIcon(g.id)} ${g.name}</b><span>${esc(store.best[g.id].l)}</span><span>★</span></div>`).join('');
	const day = (t) => new Date(t).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
	const time = (t) => new Date(t).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
	const line = (x) => {
		const k = kindOf(x), g = gameOf(x.g);
		const who = k === 'solo' ? `${esc(x.n[0])} · solo` : k === 'party' ? esc(x.s) : x.c === -2 ? `${esc(x.n[0])} &amp; ${esc(x.n[1])}` : `${esc(x.n[0])} ${x.p[0]} – ${x.p[1]} ${esc(x.n[1])}`;
		const out = k === 'solo' ? `best ${esc(x.s || '–')}` : k === 'party' ? 'played' : x.c === -2 ? esc(x.s || 'together') : x.c === -1 ? 'draw' : `${esc(x.n[x.c])} won`;
		return `<div class="srow hrow"><b>${g ? gameIcon(g.id) : ''} ${g ? g.name : esc(x.g)}</b><span>${out}</span><small>${who} · ${time(x.t)}</small></div>`;
	};
	const shown = h.filter((x) => histTab === 'all' || kindOf(x) === histTab).reverse();
	let last = '';
	const rows = shown.map((x) => {
		const d = day(x.t), head = d === last ? '' : `<h4 class="hday">${d}</h4>`;
		last = d;
		return head + line(x);
	}).join('');
	$('#statsBody').innerHTML = h.length
		? `<div class="tiles">${tile(h.length, 'plays')}${tile(h.filter((x) => kindOf(x) === 'solo').length, 'solo runs', 'var(--win)')}${tile(wins[0], `${esc(nameOf(0))} wins`, 'var(--p0)')}${tile(wins[1], `${esc(nameOf(1))} wins`, 'var(--p1)')}</div>
			${bests ? `<div class="stat-list"><h3>Personal bests</h3>${bests}</div>` : ''}
			<div class="stat-list"><h3>Everything you played</h3><div class="seg htabs" role="group" aria-label="Filter">${HIST_TABS.map(([id, n]) => `<button type="button" data-t="${id}" aria-pressed="${id === histTab}">${n}</button>`).join('')}</div>${rows || '<p class="empty">Nothing here yet.</p>'}</div>`
		: '<p class="empty">Nothing played yet. Finish a game and it shows up here.</p>';
}
$('#statsBody').onclick = (e) => {
	const t = e.target.closest('[data-t]')?.dataset.t;
	if (t) { histTab = t; renderStats(); }
};
$('#statsBtn').onclick = () => { document.body.dataset.screen = 'stats'; window.scrollTo(0, 0); renderStats(); };
$('#statsBack').onclick = toHub;

/* Settings: every option lives on this page; changes save as you tap. */
const openSettings = () => { document.body.dataset.screen = 'settings'; window.scrollTo(0, 0); renderHub(); };
$('#settingsBtn').onclick = openSettings;
$('#settingsChip').onclick = openSettings;
$('#settingsBack').onclick = toHub;
$('#statsReset').onclick = () => {
	if (!confirm('Clear all history, personal bests and played counts on this device?')) return;
	store.history = [];
	store.plays = {};
	store.best = {};
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

// A friend's invite link opens straight into joining their room.
const invite = new URLSearchParams(location.search).get('join');
if (invite) { go('room', { mode: 'online' }); netJoin(invite); }
