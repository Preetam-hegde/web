'use strict';

/* Hub: names, options, series tally and the game list. */

/* Same-device sessions can start from home; rooms always ask before connecting. */
const CATS = gameCatalog.categories;
const PARTY_GROUPS = [
	{
		id: 'party',
		name: 'Party cards',
		sub: 'One shared screen, passed round the group.',
		pick: (g) => !SPYDEF[g.id],
	},
	{
		id: 'spy',
		name: 'Spy & secrets',
		sub: 'Hidden roles and words. Also playable on everyone’s own phone.',
		pick: (g) => !!SPYDEF[g.id],
	},
];
Object.assign(GAME_ICONS, {
	phone:
		'<rect width="14" height="20" x="5" y="2" rx="2" ry="2"/><path d="M12 18h.01"/>',
	online:
		'<path d="M12 20h.01"/><path d="M2 8.82a15 15 0 0 1 20 0"/><path d="M5 12.859a10 10 0 0 1 14 0"/><path d="M8.5 16.429a5 5 0 0 1 7 0"/>',
});
GAME_ICONS.party = GAME_ICONS.three = GAME_ICONS.likely;
GAME_ICONS.group = GAME_ICONS.online;
Object.assign(GAME_ICONS, {
	solo: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
	two: '<circle cx="9" cy="8" r="3.5"/><path d="M2 21a7 7 0 0 1 14 0"/><circle cx="17" cy="9" r="3"/><path d="M17 14a6 6 0 0 1 5 7"/>',
});
const MODES3 = [
	{
		id: 'party',
		name: 'One phone',
		blurb: 'Pass it round: party and spy games for the whole table.',
	},
	{
		id: 'group',
		name: 'Own phones',
		blurb:
			'Live room for up to 10. The host picks reflex, timing and brain games; everyone plays at once.',
	},
];
const MODES2 = [
	{
		id: 'phone',
		name: 'One phone',
		blurb: 'Split screen or pass and play. Two players, one device.',
	},
	{
		id: 'online',
		name: 'Two phones',
		blurb: 'Each of you on your own phone. Share a 4-letter room code.',
	},
];

let mode = store.lobbyMode === 'solo' ? 'solo' : 'phone';
let step = 'home'; // home, session, two, three, room, cats, list or party
const solo = () => mode === 'solo';
const gamesIn = (id) =>
	GAMES.filter(
		(g) =>
			g.group === id &&
			(!solo() || canSolo(g)) &&
			(mode !== 'group' || groupOk(g)),
	);
const isGuest = () => net?.role === 'guest' || grp?.role === 'guest';
const isRoom = () => mode === 'online' || mode === 'group';
const bestOf = (g) => store.best[g.id]?.l;
let catId = 'reflex';

function go(next, opts = {}) {
	step = next;
	if (opts.mode) mode = opts.mode;
	if (next === 'home' && !opts.mode)
		mode = store.lobbyMode === 'solo' ? 'solo' : 'phone';
	if (opts.mode === 'solo' || opts.mode === 'phone') {
		store.lobbyMode = opts.mode;
		save();
	}
	if (opts.cat) catId = opts.cat;
	renderHub();
	window.scrollTo(0, 0);
}

const card = (g, attr, cat, extra, ic = g.id) => {
	const kind =
		attr === 'data-game'
			? g.coop
				? 'PLAY TOGETHER'
				: g.passOnly
					? 'PASS & PLAY'
					: g.duel
						? 'TWO PLAYERS'
						: 'QUICK PLAY'
			: '';
	return `<button class="card" type="button" ${attr}="${g.id}"${cat ? ` data-cat="${cat}"` : ''}><span class="card-top"><span class="ic">${gameIcon(ic)}</span><span class="card-arrow" aria-hidden="true">↗</span></span>${kind ? `<span class="game-kind">${kind}</span>` : ''}<h3>${g.name}</h3><p>${g.blurb}</p>${extra}</button>`;
};

function renderHub() {
	if (document.body.dataset.screen !== 'match')
		document.body.dataset.mode = store.mode;
	document.body.dataset.flip = store.flip ? '1' : '0';
	document.body.dataset.big = store.big ? '1' : '0';
	if (net && step === 'room') step = 'session'; // the other phone just joined
	if (mode === 'online' && !net && ['session', 'cats', 'list'].includes(step))
		step = 'two'; // the link dropped
	if (mode === 'group' && !grp && ['session', 'cats', 'list'].includes(step))
		step = 'three';
	$('#hub').dataset.step = step;
	$$('[data-for]').forEach((el) => {
		el.hidden = !el.dataset.for.split(' ').includes(step);
	});
	$('#hubBack').hidden = step === 'home';
	[0, 1].forEach((p) => {
		$(`#n${p}`).value = store.names[p];
	});

	renderSettings();

	if (step === 'home') renderHome();
	if (step === 'two') renderTwo();
	if (step === 'room') mode === 'group' ? renderGroupRoom() : renderRoom();
	if (step === 'three') renderThree();
	if (['session', 'cats', 'list'].includes(step)) renderSetup();
	if (['home', 'session', 'cats'].includes(step)) renderSession();
	if (step === 'cats') renderCats();
	if (step === 'list') renderList();
	if (step === 'party') renderParty();
}

const modeCard = (o) => {
	const label = {
		solo: `${GAMES.filter(canSolo).length} games`,
		two: 'One phone or two',
		three: 'Party games & hidden roles',
		phone: 'Split screen or pass & play',
		online: 'One screen each',
		party: `${PARTY.length} party games`,
		group: 'A room for the table',
	}[o.id];
	return `<button class="mode" type="button" data-mode="${o.id}" data-cat="${o.cat || o.id}"><span class="mode-icon">${gameIcon(o.id)}</span><span class="mode-content"><span class="mode-count">${label}</span><b>${o.name}</b><small>${o.blurb}</small></span><span class="mode-arrow" aria-hidden="true">↗</span></button>`;
};
function renderHome() {
	$('#modes').innerHTML =
		(lobby.note ? `<p class="oops">${esc(lobby.note)}</p>` : '') +
		`<div class="player-choice" role="group" aria-label="Players"><button type="button" data-mode="solo" aria-pressed="${solo()}">${gameIcon('solo')}<span>Solo</span></button><button type="button" data-mode="two" aria-pressed="${mode === 'phone'}">${gameIcon('two')}<span>2 players</span></button><button type="button" data-mode="three" aria-pressed="false">${gameIcon('three')}<span>3 + players</span></button></div><div class="device-choice"><span>${solo() ? 'Your own personal bests' : 'One phone · split screen or pass & play'}</span><button type="button" data-room-setup="online">Two phones ↗</button></div>`;
}

function quickGames() {
	// Tempo and rhythm show their beats visually; pitch matching still needs sound.
	return GAMES.filter(
		(g) =>
			!g.duel &&
			!g.coop &&
			!g.words &&
			g.group !== 'couple' &&
			(!solo() || canSolo(g)) &&
			(mode !== 'group' || groupOk(g)) &&
			(store.sound || (!g.requiresSound && g.id !== 'pitch')),
	);
}

function startQuickMatch() {
	if (isGuest()) return;
	const games = quickGames();
	if (!games.length) return;
	const fresh = games.filter((g) => g.id !== store.lastQuick);
	const game = choice(fresh.length ? fresh : games);
	store.lastQuick = game.id;
	save();
	launchGame(game);
}

function renderSession() {
	const room = isRoom(),
		guest = isGuest(),
		available = GAMES.filter(
			(g) => (!solo() || canSolo(g)) && (mode !== 'group' || groupOk(g)),
		),
		featured = ['stack', 'golf']
			.map((id) => available.find((g) => g.id === id))
			.filter(Boolean),
		recent = [...new Set([...store.history].reverse().map((entry) => entry.g))]
			.map((id) => available.find((g) => g.id === id))
			.filter((g) => g && !featured.includes(g))
			.slice(0, 3),
		presets = typeof CUP_PRESETS === 'undefined' ? [] : CUP_PRESETS,
		title = solo()
			? 'Your solo session'
			: mode === 'group'
				? 'The room is ready'
				: room
					? 'Two phones. One faceoff.'
					: 'Your next faceoff';
	$('#session').innerHTML =
		`<div class="session-heading"><h2>${title}</h2>${step === 'home' ? '<button class="text-action" type="button" data-session-setup>Names & options</button>' : ''}</div><div class="session-actions"><button class="session-quick" type="button" data-quick${guest || !quickGames().length ? ' disabled' : ''}><span class="session-action-title">Quick Match <span aria-hidden="true">↗</span></span><small>A game picked for you. Rules before play.</small></button><section class="session-cup" aria-label="Faceoff Cup"><div class="cup-heading"><h3>Faceoff Cup</h3><small>5 games · ${solo() ? 'personal bests' : 'one winner'}</small></div><div class="cup-presets">${presets.map((preset) => `<button type="button" data-cup="${preset.id}" title="${esc(preset.blurb)}"${guest ? ' disabled' : ''}>${esc(preset.name.replace(/ Cup$/, ''))}<span aria-hidden="true">↗</span></button>`).join('')}</div></section></div><button class="session-browse" type="button" data-browse><span>Browse games</span><small>${available.length} games, your choice</small><span aria-hidden="true">→</span></button>${guest ? '<p class="session-note">Your host starts the games and Cups. Browse to read the rules.</p>' : ''}${featured.length ? `<div class="session-discovery"><div class="discovery-heading"><h3>New to the room</h3><span>Tap a game to start</span></div><div class="featured-games">${featured.map((g) => `<button type="button" class="fast-game" data-launch="${g.id}"><span class="fast-game-art" aria-hidden="true">${gameIcon(g.id)}</span><span><small>NEW GAME</small><b>${esc(g.name)}</b><span>${esc(g.blurb)}</span></span><span class="fast-game-arrow" aria-hidden="true">↗</span></button>`).join('')}</div></div>` : ''}${recent.length ? `<div class="recent-games"><h3>Play again</h3><div>${recent.map((g) => `<button type="button" data-launch="${g.id}">${gameIcon(g.id)}${esc(g.name)}<span aria-hidden="true">↗</span></button>`).join('')}</div></div>` : ''}`;
}

function launchGame(g) {
	if (!g) return;
	if (isGuest()) return showGameRules(g);
	if (mode === 'group') return grStart(g);
	startMatch(g, undefined, solo());
}

function renderThree() {
	$('#modes3').innerHTML =
		`<h2 class="stepttl">3 + players</h2><p class="stepsub">How are you playing?</p>${MODES3.map(modeCard).join('')}`;
}
function renderTwo() {
	$('#modes2').innerHTML =
		`<h2 class="stepttl">2 players</h2><p class="stepsub">How are you playing?</p>${MODES2.map(modeCard).join('')}`;
}

/* Two phones: every match played in this room, and the running win count. Seat 0 is the host. */
function roomBoard() {
	const rows = net.board.rows,
		w = [0, 1].map((p) => rows.filter((r) => r.c === p).length);
	if (!rows.length)
		return '<div class="rb-empty">No games played in this room yet</div>';
	const me = net.me,
		you = 1 - me;
	const line = (r) => {
		const res =
			r.c === me
				? '<b class="win">WIN</b>'
				: r.c === you
					? '<b class="lose">LOSS</b>'
					: r.c === -2
						? '<b>TEAM</b>'
						: '<b>DRAW</b>';
		return `<div class="rb-row"><span>${gameIcon(r.g)}${esc(r.n)}</span><span>${r.p[me]} – ${r.p[you]}</span>${res}</div>`;
	};
	return `<div class="rb-tot"><span style="color:var(--p${me})">You <b>${w[me]}</b></span><small>wins · ${rows.length} played</small><span style="color:var(--p${you})"><b>${w[you]}</b> ${esc(nameOf(you))}</span></div><div class="rb-rows">${[...rows].reverse().map(line).join('')}</div>`;
}

/* Names and tally for one phone; who you are playing for two phones. */
function renderSetup() {
	const online = isRoom();
	$('#names').hidden = online;
	$('#n1').closest('label').hidden = solo();
	$('#n0').placeholder = solo() ? 'Your name' : 'Player 1';
	$('#onbar').hidden = !online;
	if (online) {
		const who =
			mode === 'group'
				? (grp?.names || [])
						.filter((_, i) => !grp.gone[i])
						.map(esc)
						.join(' · ')
				: `<span style="color:var(--p0)">${esc(nameOf(0))}</span> vs <span style="color:var(--p1)">${esc(nameOf(1))}</span>`;
		$('#onbar').innerHTML =
			`<i class="live"></i><span>${who}</span><button type="button">leave</button>${isGuest() ? '<small class="guestnote">Only the host picks games. Tap a game to read its rules.</small>' : ''}`;
	}
	$('#roomboard').innerHTML =
		mode === 'group' && grp ? grBoardHtml() : online && net ? roomBoard() : '';
	const [a, b] = store.series;
	const series = $('#series');
	series.hidden = online || solo() || !(a + b);
	series.innerHTML = `<span style="color:var(--p0)"><b>${esc(nameOf(0))} ${a}</b></span> – <span style="color:var(--p1)"><b>${b} ${esc(nameOf(1))}</b></span><button type="button">reset</button>`;
	$('button', series).onclick = () => {
		store.series = [0, 0];
		save();
		renderHub();
	};
	const chip = $('#settingsChip');
	chip.hidden = online && isGuest(); // the host sets the rounds and timing
	chip.textContent = solo()
		? `${store.rounds} rounds · Settings ⚙`
		: mode === 'group'
			? `${store.groupRounds} rounds · ${store.timed ? 'Timed' : 'No timer'} · Settings ⚙`
			: online
				? `${store.rounds} rounds · Settings ⚙`
				: `${store.mode === 'pass' ? 'Pass & play' : 'Split screen'} · ${store.rounds} rounds · Settings ⚙`;
}

function renderCats() {
	const n = (id) => gamesIn(id).length;
	$('#cats').innerHTML = `<div class="grid">${CATS.filter((c) => n(c.id))
		.map((c) =>
			card(
				c,
				'data-go',
				c.id,
				`<span class="count-pill"><b>${n(c.id)}</b> games</span>`,
				c.icon,
			),
		)
		.join('')}</div>`;
}

function renderList() {
	const c = CATS.find((x) => x.id === catId);
	const played = (g) =>
		mode === 'group'
			? '&nbsp;'
			: solo()
				? bestOf(g)
					? `best <b>${bestOf(g)}</b>`
					: 'no score yet'
				: store.plays[g.id] && mode !== 'online'
					? `played <b>${store.plays[g.id]}</b>×`
					: 'not played yet';
	$('#listTtl').dataset.cat = c.id;
	$('#listTtl').innerHTML = `${gameIcon(c.icon)} ${c.name}`;
	$('#listSub').textContent = c.blurb;
	$('#games').dataset.cat = c.id;
	$('#games').innerHTML = `<div class="grid">${gamesIn(c.id)
		.map((g) =>
			card(
				g,
				'data-game',
				'',
				`<span class="best">${mode === 'online' ? '&nbsp;' : played(g)}</span>`,
			),
		)
		.join('')}</div>`;
}

function renderParty() {
	const played = (g) =>
		store.plays[g.id]
			? `played <b>${store.plays[g.id]}</b>×`
			: 'not played yet';
	$('#partyList').innerHTML = PARTY_GROUPS.map(
		(grp) =>
			`<div data-cat="${grp.id}"><h2 class="stepttl">${grp.name}</h2><p class="stepsub">${grp.sub}</p><div class="grid">${PARTY.filter(
				grp.pick,
			)
				.map((g) =>
					card(g, 'data-party', '', `<span class="best">${played(g)}</span>`),
				)
				.join('')}</div></div>`,
	).join('');
}

/* Two phones: make a room or join one. Everything after that is in net.js. */
function renderRoom() {
	const key = `${lobby.state}|${lobby.code}|${lobby.msg}|${lobby.invite || ''}`;
	const room = $('#room');
	if (room.dataset.key === key) return;
	room.dataset.key = key;
	const L = lobby;
	const name = `<label class="who" style="--c: var(--p0)"><i></i><input id="myName" maxlength="14" placeholder="Your name" autocomplete="off" value="${esc(store.names[0])}" aria-label="Your name"${L.invite ? ' autofocus' : ''}></label>`;
	const wait = (txt) =>
		`<h2 class="stepttl">${txt}</h2><button class="btn ghost" type="button" data-a="cancel">Cancel</button>`;
	room.innerHTML =
		L.state === 'hosting'
			? `<h2 class="stepttl">Your room</h2><p class="stepsub">Your friend scans this with their camera, or opens Faceoff, picks <b>Two phones</b> and types the code.</p><div class="qr" id="qr"></div><div class="tcode">${L.code}</div><button class="btn" type="button" data-a="share">Send invite link</button><p class="stepsub">Waiting for your friend…</p><button class="btn ghost" type="button" data-a="cancel">Cancel</button>`
			: L.state === 'starting'
				? wait('Opening a room…')
				: L.state === 'joining'
					? wait(`Joining ${L.code}…`)
					: L.invite
						? `<h2 class="stepttl">Join room ${esc(L.invite)}</h2><p class="stepsub">Your friend invited you. What should they call you?</p>${L.state === 'error' ? `<p class="oops">${esc(L.msg)}</p>` : ''}${name}<button class="btn" type="button" data-a="accept">Join</button><button class="btn ghost" type="button" data-a="decline">Not now</button>`
						: `<h2 class="stepttl">Two phones</h2><p class="stepsub">One of you makes a room, the other joins it with the code. You each play on your own phone.</p>${L.state === 'error' ? `<p class="oops">${esc(L.msg)}</p>` : ''}${name}<button class="btn" type="button" data-a="create">Make a room</button><div class="or">or join a friend</div><input class="tinput" id="joinCode" maxlength="4" placeholder="CODE" autocapitalize="characters" autocomplete="off" spellcheck="false" aria-label="Room code"><button class="btn ghost" type="button" data-a="join">Join</button>`;
	if (L.state === 'hosting')
		loadQr()
			.then(() => {
				if (lobby.state === 'hosting' && $('#qr'))
					$('#qr').innerHTML = qrSvg(inviteUrl(L.code));
			})
			.catch(() => {
				/* no QR: the code and link still work */
			});
}

/* The link a friend opens to join: this page's own address, so it works wherever Faceoff is hosted. */
const inviteUrl = (code) =>
	`${location.origin}${location.pathname.replace(/index\.html$/, '')}?join=${code}`;
const loadQr = () =>
	window.qrcode
		? Promise.resolve()
		: new Promise((ok, fail) => {
				const s = document.createElement('script');
				s.src = 'js/vendor/qrcode.js?v=17';
				s.onload = ok;
				s.onerror = fail;
				document.head.append(s);
			});
/* A QR code as inline SVG: one square per dark module, on a white card with a quiet border. */
function qrSvg(text) {
	const q = qrcode(0, 'M');
	q.addData(text);
	q.make();
	const n = q.getModuleCount(),
		pad = 3;
	let d = '';
	for (let r = 0; r < n; r++)
		for (let c = 0; c < n; c++) if (q.isDark(r, c)) d += `M${c} ${r}h1v1h-1z`;
	return `<svg viewBox="${-pad} ${-pad} ${n + pad * 2} ${n + pad * 2}" shape-rendering="crispEdges" role="img" aria-label="QR code to join this room"><path d="${d}" fill="#050409"/></svg>`;
}

$('#room').oninput = (e) => {
	if (e.target.id === 'myName') {
		store.names[0] = e.target.value;
		save();
	}
	if (e.target.id === 'joinCode') e.target.value = e.target.value.toUpperCase();
};
$('#room').onclick = async (e) => {
	const act = e.target.closest('[data-a]')?.dataset.a;
	const named = () => {
		if ((store.names[0] || '').trim()) return true;
		const box = $('#myName');
		box.focus();
		box.placeholder = 'Type your name first';
		sfx.bad();
		return false;
	};
	if (act === 'create' && named()) netHost();
	if (act === 'join' && named()) netJoin($('#joinCode').value);
	if (act === 'accept' && named()) {
		const c = lobby.invite;
		lobby.invite = '';
		netJoin(c);
	}
	if (act === 'decline') {
		lobby.invite = '';
		lobbySet('idle');
	}
	if (act === 'cancel') {
		netCancel();
		lobbySet('idle');
	}
	if (act === 'share') {
		const url = inviteUrl(lobby.code);
		try {
			await navigator.share({
				title: 'Faceoff',
				text: `Join my Faceoff room: ${lobby.code}`,
				url,
			});
		} catch {
			navigator.clipboard?.writeText(url);
			e.target.textContent = 'Link copied ✓';
		}
	}
};
lobby.onchange = renderHub;

$('#modes').onclick =
	$('#modes2').onclick =
	$('#modes3').onclick =
		(e) => {
			const pick = e.target.closest('[data-mode], [data-room-setup]');
			const id = pick?.dataset.mode || pick?.dataset.roomSetup;
			if (!id) return;
			lobby.note = '';
			if (id === 'solo') go('session', { mode: 'solo' });
			if (id === 'two') go('two');
			if (id === 'phone') go('session', { mode: 'phone' });
			if (id === 'online') go(net ? 'session' : 'room', { mode: 'online' });
			if (id === 'three') go('three');
			if (id === 'party') go('party', { mode: 'party' });
			if (id === 'group') go(grp ? 'session' : 'room', { mode: 'group' });
		};
$('#session').onclick = (e) => {
	if (e.target.closest('[data-quick]')) return startQuickMatch();
	if (e.target.closest('[data-browse]')) return go('cats');
	if (e.target.closest('[data-session-setup]')) return go('session');
	const preset = e.target.closest('[data-cup]')?.dataset.cup;
	if (preset && !isGuest()) return startCup(preset, solo());
	const id = e.target.closest('[data-launch]')?.dataset.launch;
	if (id) launchGame(GAMES.find((g) => g.id === id));
};
$('#cats').onclick = (e) => {
	const id = e.target.closest('[data-go]')?.dataset.go;
	if (id) go('list', { cat: id });
};
$('#onbar').onclick = (e) => {
	if (!e.target.closest('button')) return;
	if (mode === 'group') {
		grLeave();
		go('three');
	} else {
		netLeave();
		go('two');
	}
};
$('#hubBack').onclick = () => {
	if (step === 'room') {
		if (mode === 'group') {
			grp ? grLeave() : grCancel();
			glSet('idle');
			return go('three');
		}
		netCancel();
		lobbySet('idle');
		return go('two');
	}
	if (step === 'three') return go('home');
	if (step === 'two') return go('home');
	if (step === 'party') return go('three');
	if (step === 'list') return go('cats');
	if (step === 'cats') return go('session');
	if (step === 'session' && grp && !confirm('Leave this room?')) return;
	if (step === 'session' && grp) {
		grLeave();
		return go('three');
	}
	if (step === 'session' && net && !confirm('Leave this room?')) return;
	if (step === 'session' && net) {
		netLeave();
		return go('two');
	}
	go('home');
};

$('#games').onclick = (e) => {
	const id = e.target.closest('[data-game]')?.dataset.game;
	if (!id) return;
	launchGame(GAMES.find((x) => x.id === id));
};
$('#partyList').onclick = (e) => {
	const id = e.target.closest('[data-party]')?.dataset.party;
	if (id) startParty(id);
};

/* Cards tilt toward the pointer and a soft spotlight follows it, as on Keystorm's menu. */
const calm = matchMedia('(prefers-reduced-motion: reduce)').matches;
[$('#games'), $('#cats'), $('#partyList')].forEach((box) =>
	box.addEventListener('pointermove', (e) => {
		const c = e.target.closest('.card');
		if (!c) return;
		const r = c.getBoundingClientRect();
		const x = (e.clientX - r.left) / r.width,
			y = (e.clientY - r.top) / r.height;
		c.style.setProperty('--mx', `${x * 100}%`);
		c.style.setProperty('--my', `${y * 100}%`);
		if (!calm) {
			c.style.setProperty('--rx', `${(0.5 - y) * 4}deg`);
			c.style.setProperty('--ry', `${(x - 0.5) * 4}deg`);
		}
	}),
);
[$('#games'), $('#cats'), $('#partyList')].forEach((box) =>
	box.addEventListener('pointerout', (e) => {
		const c = e.target.closest('.card');
		if (c && !c.contains(e.relatedTarget)) {
			c.style.setProperty('--rx', '0deg');
			c.style.setProperty('--ry', '0deg');
		}
	}),
);

[0, 1].forEach((p) => {
	$(`#n${p}`).oninput = (e) => {
		store.names[p] = e.target.value;
		save();
	};
});

/* Quit needs two taps so a stray thumb can't end the match. */
let quitTimer = 0;
$('#quit').onclick = (e) => {
	const btn = e.currentTarget;
	if (btn.classList.contains('sure')) {
		clearTimeout(quitTimer);
		btn.classList.remove('sure');
		btn.textContent = 'Quit';
		return quit();
	}
	btn.classList.add('sure');
	btn.textContent = 'Sure?';
	quitTimer = setTimeout(() => {
		btn.classList.remove('sure');
		btn.textContent = 'Quit';
	}, 2000);
};

/* Offline and repeat visits: the service worker keeps the app and word lists cached. */
if ('serviceWorker' in navigator) {
	const registerOffline = () =>
		navigator.serviceWorker.register('sw.js').catch(() => {
			/* private mode: load from the network */
		});
	if (document.readyState === 'complete') registerOffline();
	else addEventListener('load', registerOffline, { once: true });
}

document.addEventListener('contextmenu', (e) => e.preventDefault()); // long-press must not open menus mid-game

/* Rules sheet: what a game is and how it is scored. Guests in a room see this instead of starting the game. */
function showGameRules(g) {
	let how = g.blurb;
	try {
		how = g.intro(g.config(0));
	} catch {
		/* a game whose intro needs a live config: the blurb will do */
	}
	const dlg = $('#rules');
	dlg.innerHTML = `<div class="hero">${gameIcon(g.id)}</div><h3>${g.name}</h3><p>${g.blurb}</p><p class="how">${how}</p><p class="how">${g.lowerIsBetter ? 'Lowest score wins the round.' : 'Highest score wins the round.'}</p><button class="btn" type="button">Got it</button>`;
	$('button', dlg).onclick = () => dlg.close();
	dlg.showModal();
}

/* Rooms: the first tap in a match asks for the whole screen (a browser only allows it from a tap). */
let fsTried = false;
document.addEventListener(
	'pointerdown',
	() => {
		if (document.body.dataset.screen !== 'match') {
			fsTried = false;
			return;
		}
		if (
			fsTried ||
			document.body.dataset.mode !== 'online' ||
			document.fullscreenElement
		)
			return;
		fsTried = true;
		document.documentElement
			.requestFullscreen?.({ navigationUI: 'hide' })
			.catch(() => {
				/* iOS Safari has none: the page is already edge to edge */
			});
	},
	true,
);

renderHub();

// A friend's invite link opens straight into joining their room.
const invite = new URLSearchParams(location.search).get('join');
const groupInvite = new URLSearchParams(location.search).get('room');
if (groupInvite) {
	gl.invite = groupInvite.toUpperCase().slice(0, 4);
	go('room', { mode: 'group' });
}
if (invite) {
	lobby.invite = invite.toUpperCase().slice(0, 4);
	go('room', { mode: 'online' });
} // ask for a name before joining
