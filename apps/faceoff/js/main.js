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
const MODES = [
	{ id: 'phone', name: 'One phone', blurb: 'Split screen or pass and play. Two players, one device.' },
	{ id: 'online', name: 'Two phones', blurb: 'Each of you on your own phone. Share a 4-letter room code.' },
	{ id: 'party', name: 'Party · 3 or more', blurb: 'Group games for the whole table.' },
];

let mode = 'phone'; // which way of playing was picked on the home step: phone, online or party
let step = 'home'; // home, room, cats, list or party
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
	if (net && step === 'room') step = 'cats'; // the other phone just joined
	if (mode === 'online' && !net && (step === 'cats' || step === 'list')) step = 'home'; // the link dropped
	$('#hub').dataset.step = step;
	$$('[data-for]').forEach((el) => { el.hidden = !el.dataset.for.split(' ').includes(step); });
	$('#hubBack').hidden = step === 'home';
	[0, 1].forEach((p) => { $(`#n${p}`).value = store.names[p]; });

	seg($('#modeSeg'), [['split', 'Split screen'], ['pass', 'Pass & play']], store.mode, (v) => (store.mode = v));
	seg($('#seatSeg'), [[true, 'Face to face'], [false, 'Side by side']], store.flip, (v) => (store.flip = v));
	seg($('#roundsSeg'), [[3, '3'], [5, '5'], [7, '7']], store.rounds, (v) => (store.rounds = v));
	seg($('#soundSeg'), ON_OFF, store.sound, (v) => (store.sound = v));
	seg($('#dareSeg'), ON_OFF, store.dares, (v) => (store.dares = v));
	$('#seatSeg').hidden = store.mode === 'pass'; // seating only matters when two halves share the screen
	$('#seatNote').textContent = `${MODE_NOTES[store.mode]} ${store.mode === 'split' ? SEAT_NOTES[store.flip] : ''}`.trim();

	// The text boxes are only rewritten when not being typed in, so the cursor never jumps.
	[['cDares', 'dares'], ['cTruths', 'truths']].forEach(([id, key]) => {
		if (document.activeElement !== $(`#${id}`)) $(`#${id}`).value = store.custom[key].join('\n');
	});

	if (step === 'home') renderHome();
	if (step === 'room') renderRoom();
	if (step === 'cats' || step === 'list') renderSetup();
	if (step === 'cats') renderCats();
	if (step === 'list') renderList();
	if (step === 'party') renderParty();
	fx.start();
}

function renderHome() {
	$('#modes').innerHTML = (lobby.note ? `<p class="oops">${esc(lobby.note)}</p>` : '')
		+ MODES.map((o) => `<button class="mode" type="button" data-mode="${o.id}" data-cat="${o.id}">${gameIcon(o.id)}<span><b>${o.name}</b><small>${o.blurb}</small></span></button>`).join('');
}

/* Names and tally for one phone; who you are playing for two phones. */
function renderSetup() {
	const online = mode === 'online';
	$('#names').hidden = online;
	$('#onbar').hidden = !online;
	if (online) $('#onbar').innerHTML = `<i class="live"></i><span style="color:var(--p0)">${esc(nameOf(0))}</span> vs <span style="color:var(--p1)">${esc(nameOf(1))}</span><button type="button">leave</button>`;
	const [a, b] = store.series;
	const series = $('#series');
	series.hidden = online || !(a + b);
	series.innerHTML = `<span style="color:var(--p0)"><b>${esc(nameOf(0))} ${a}</b></span> – <span style="color:var(--p1)"><b>${b} ${esc(nameOf(1))}</b></span><button type="button">reset</button>`;
	$('button', series).onclick = () => { store.series = [0, 0]; save(); renderHub(); };
	const chip = $('#settingsChip');
	chip.hidden = online && net?.role === 'guest'; // the host sets the rounds
	chip.textContent = online ? `${store.rounds} rounds · Settings ⚙` : `${store.mode === 'pass' ? 'Pass & play' : 'Split screen'} · ${store.rounds} rounds · Settings ⚙`;
}

function renderCats() {
	const n = (id) => GAMES.filter((g) => g.group === id).length;
	$('#cats').innerHTML = `<div class="grid">${CATS.map((c) => card(c, 'data-go', c.id, `<span class="count-pill"><b>${n(c.id)}</b> games</span>`, c.icon)).join('')}</div>`;
}

function renderList() {
	const c = CATS.find((x) => x.id === catId);
	const played = (g) => (store.plays[g.id] && mode !== 'online' ? `played <b>${store.plays[g.id]}</b>×` : 'not played yet');
	$('#listTtl').dataset.cat = c.id;
	$('#listTtl').innerHTML = `${gameIcon(c.icon)} ${c.name}`;
	$('#listSub').textContent = c.blurb;
	$('#games').dataset.cat = c.id;
	$('#games').innerHTML = `<div class="grid">${GAMES.filter((g) => g.group === c.id).map((g) => card(g, 'data-game', '', `<span class="best">${mode === 'online' ? '&nbsp;' : played(g)}</span>`)).join('')}</div>`;
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
	s.src = 'js/vendor/qrcode.js?v=16';
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
	return `<svg viewBox="${-pad} ${-pad} ${n + pad * 2} ${n + pad * 2}" shape-rendering="crispEdges" role="img" aria-label="QR code to join this room"><path d="${d}" fill="#0d0b1a"/></svg>`;
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

$('#modes').onclick = (e) => {
	const id = e.target.closest('[data-mode]')?.dataset.mode;
	if (!id) return;
	lobby.note = '';
	if (id === 'phone') go('cats', { mode: 'phone' });
	if (id === 'online') go(net ? 'cats' : 'room', { mode: 'online' });
	if (id === 'party') go('party', { mode: 'party' });
};
$('#cats').onclick = (e) => {
	const id = e.target.closest('[data-go]')?.dataset.go;
	if (id) go('list', { cat: id });
};
$('#onbar').onclick = (e) => { if (e.target.closest('button')) { netLeave(); go('home'); } };
$('#hubBack').onclick = () => {
	if (step === 'room') { netCancel(); lobbySet('idle'); return go('home'); }
	if (step === 'list') return go('cats');
	if (step === 'cats' && net && !confirm('Leave this room?')) return;
	if (step === 'cats' && net) netLeave();
	go('home');
};

$('#games').onclick = (e) => {
	const id = e.target.closest('[data-game]')?.dataset.game;
	if (!id) return;
	if (net?.role === 'guest') return net.send({ t: 'pick', id }); // the host starts it
	startMatch(GAMES.find((g) => g.id === id));
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
$('#statsBack').onclick = toHub;

/* Settings: every option lives on this page; changes save as you tap. */
const openSettings = () => { document.body.dataset.screen = 'settings'; window.scrollTo(0, 0); renderHub(); };
$('#settingsBtn').onclick = openSettings;
$('#settingsChip').onclick = openSettings;
$('#settingsBack').onclick = toHub;
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

// A friend's invite link opens straight into joining their room.
const invite = new URLSearchParams(location.search).get('join');
if (invite) { go('room', { mode: 'online' }); netJoin(invite); }
