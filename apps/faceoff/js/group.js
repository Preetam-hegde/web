'use strict';

/* 3 to 10 players, each on their own phone, live. The host picks the game; every phone plays it at once on its own clock and
   sends back one score. The host ranks the round, sends the table to everyone and keeps the room scoreboard.
   Same PeerJS trick as net.js (a public broker only introduces the phones), one connection per guest, host in the middle.
   Only plain games work here (one score each): the games in the 2-player list that have no turns or secrets.
   The player side reuses core.js: a local match object `m` and makeCtx(0), so every game runs exactly as it does on one phone. */

const GR_STRAGGLE_MS = 20000; // with Timing on, this long for the others once the first player has locked in
const groupOk = (g) => canSolo(g) && !g.duel && !g.passOnly && !g.splitOnly && !g.words;
const grRoomId = (code) => `faceoff-grp-${code}`;
const gl = { state: 'idle', code: '', msg: '', note: '', peer: null, invite: '' }; // what the menu shows while a room is set up
let grp = null; // the live room: { role, peer, conn, code, me, names, gone, board, r (host: the game in progress), opened }
const glSet = (state, extra = {}) => { Object.assign(gl, { state, msg: '' }, extra); renderHub(); };
const grSecs = GR_STRAGGLE_MS / 1000;

/* ── joining and leaving ─────────────────────────────── */
function grCancel() {
	gl.peer?.destroy();
	Object.assign(gl, { peer: null, code: '' });
}

async function grHost() {
	grCancel();
	glSet('starting');
	try { await loadPeer(); } catch { return glSet('error', { msg: 'Couldn’t reach the connection service. Check your internet and try again.' }); }
	const open = () => {
		const code = Array.from({ length: 4 }, () => choice([...ROOM_ALPHA])).join('');
		const peer = new Peer(grRoomId(code));
		gl.peer = peer;
		peer.on('open', () => {
			grp = { role: 'host', peer, code, me: 0, players: [{ name: myName() || 'Host', conn: null, gone: false }], names: [], gone: [], board: { rows: [] }, r: null, opened: false };
			grRoster();
			glSet('live', { code });
		});
		peer.on('connection', (conn) => {
			conn.on('data', (msg) => grHostMsg(conn, msg));
			conn.on('close', () => grGone(conn));
			conn.on('error', () => grGone(conn));
		});
		// The broker link drops when the host switches apps to share the code; without it nobody new can find the room.
		peer.on('disconnected', () => { if (!peer.destroyed) peer.reconnect(); });
		peer.on('error', (e) => {
			if (grp) { if (peer.disconnected && !peer.destroyed) setTimeout(() => peer.reconnect(), 2000); return; } // the room carries on peer to peer
			peer.destroy();
			if (e.type === 'unavailable-id') open();
			else glSet('error', { msg: 'Couldn’t open a room. Check your internet and try again.' });
		});
	};
	open();
}

async function grJoin(raw) {
	const code = String(raw).toUpperCase().replace(/[^A-Z0-9]/g, '');
	grCancel();
	if (code.length !== 4) return glSet('error', { msg: 'The room code has 4 letters or digits.' });
	glSet('joining', { code });
	try { await loadPeer(); } catch { return glSet('error', { msg: 'Couldn’t reach the connection service. Check your internet and try again.' }); }
	const peer = new Peer();
	gl.peer = peer;
	let timer = 0;
	const bail = (msg) => { clearTimeout(timer); peer.destroy(); grp = null; glSet('error', { msg }); };
	timer = setTimeout(() => bail('Couldn’t reach that room. Check the code and your connection.'), 20000);
	let tries = 0, conn = null;
	const dial = () => {
		conn = peer.connect(grRoomId(code), { reliable: true, serialization: 'json' });
		conn.on('open', () => {
			clearTimeout(timer);
			grp = { role: 'guest', peer, conn, code, me: -1, names: [], gone: [], board: { rows: [] }, opened: false };
			conn.send({ t: 'hello', name: myName() });
		});
		conn.on('data', (msg) => grGuestMsg(msg, bail));
		conn.on('close', () => (grp ? grDrop('The host left the room.') : bail('Couldn’t connect. Try again.')));
		conn.on('error', () => (grp ? grDrop('The connection dropped.') : bail('Couldn’t connect. Try again.')));
	};
	// "No such room" can be the host a moment away from reconnecting, so ask a few times before giving up.
	peer.on('error', (e) => {
		if (e.type === 'peer-unavailable' && !grp && ++tries < 4) return void setTimeout(dial, 2500);
		bail(e.type === 'peer-unavailable' ? 'No room with that code. Check it, and that the host still has the room screen open.' : `Couldn’t connect (${e.type}). Try again.`);
	});
	peer.on('open', dial);
}

function grDrop(why) {
	const was = grp;
	grp = null;
	grCancel();
	if (was && document.body.dataset.screen === 'match') toHub();
	glSet('idle', { note: why });
}

function grLeave() {
	if (grp?.role === 'guest') { try { grp.conn.send({ t: 'leave' }); } catch { /* already gone */ } }
	if (grp?.role === 'host') grSend({ t: 'g-bye' });
	grp?.peer?.destroy();
	grp = null;
	grCancel();
	if (document.body.dataset.screen === 'match') toHub();
	glSet('idle', { note: '' });
}
addEventListener('pagehide', () => grp && grLeave());

/* Called when the host quits a match from the pill: everyone goes back to the menu. A guest's Quit leaves the room. */
function grQuit() {
	if (grp.role === 'guest') return grLeave();
	clearTimeout(grp.strag);
	grp.r = null;
	grAll({ t: 'g-hub' });
}

/* ── host: players, messages, rounds ─────────────────── */
const grActive = () => grp.players.filter((p) => !p.gone);
const grSend = (msg) => grp.players.forEach((p) => p.conn && !p.gone && p.conn.open && p.conn.send(msg));
const grAll = (msg) => { grSend(msg); grPlayer(msg); }; // everyone, the host's own phone included

function grRoster() {
	const names = grp.players.map((p) => p.name), gone = grp.players.map((p) => p.gone);
	grp.players.forEach((p, i) => p.conn && !p.gone && p.conn.open && p.conn.send({ t: 'roster', names, gone, you: i, opened: grp.opened }));
	Object.assign(grp, { names, gone });
	renderHub();
}

function grHostMsg(conn, msg) {
	const i = grp.players.findIndex((p) => p.conn === conn);
	switch (msg.t) {
		case 'hello': {
			if (i >= 0) break;
			if (grp.r || grActive().length >= MAX_P) { conn.send({ t: 'full' }); setTimeout(() => conn.close(), 300); break; }
			let name = String(msg.name || '').slice(0, 14) || `Player ${grp.players.length + 1}`;
			for (let k = 2; grp.players.some((p) => !p.gone && p.name === name); k++) name = `${String(msg.name || 'Player').slice(0, 11)} ${k}`;
			grp.players.push({ name, conn, gone: false });
			grRoster();
			break;
		}
		case 'ready': if (i >= 0 && grp.r?.phase === 'ready') { grp.r.ready[i] = true; grCheck(); } break;
		case 'res': if (i >= 0 && grp.r?.phase === 'play' && msg.tok === grp.r.tok) grResult(i, msg.score === 'inf' ? Infinity : msg.score === '-inf' ? -Infinity : Number(msg.score), String(msg.label)); break;
		case 'leave': grGone(conn); break;
	}
}

function grGone(conn) {
	const p = grp?.players.find((x) => x.conn === conn);
	if (!p || p.gone) return;
	p.gone = true;
	grRoster();
	if (grp.r) grCheck();
}

function grStart(game) {
	if (!grp || grp.role !== 'host' || grp.r) return;
	grp.r = { game, rounds: store.groupRounds, round: 0, pts: grp.players.map(() => 0), log: [], tok: 0 };
	grNext();
}

function grNext() {
	const r = grp.r;
	r.cfg = r.game.config(r.round);
	r.tok = ++epoch;
	r.phase = 'ready';
	r.ready = grp.players.map((p) => p.gone);
	r.res = grp.players.map(() => null);
	r.opened = r.ready.map(() => false);
	grAll({ t: 'g-intro', gid: r.game.id, cfg: r.cfg, round: r.round, rounds: r.rounds, tok: r.tok, pts: r.pts, names: grp.names, you: 0 });
	grLocks();
}

/* Who is ready (before the round) or locked in (after it): sent to everyone, drawn as a row of chips. */
function grLocks() {
	const r = grp.r, flags = r.phase === 'ready' ? r.ready : r.res.map((x, i) => !!x || grp.players[i].gone);
	grAll({ t: 'g-lock', tok: r.tok, flags, kind: r.phase });
}

function grCheck() {
	const r = grp.r;
	if (!r) return;
	if (r.phase === 'ready') {
		r.ready = r.ready.map((x, i) => x || grp.players[i].gone);
		grLocks();
		if (r.ready.every(Boolean)) { r.phase = 'play'; grAll({ t: 'g-count', tok: r.tok }); }
	} else if (r.phase === 'play') {
		grp.players.forEach((p, i) => { if (p.gone && !r.res[i]) r.res[i] = { score: r.game.lowerIsBetter ? Infinity : -Infinity, label: 'left' }; });
		grLocks();
		if (r.res.every(Boolean)) grReveal();
	}
}

function grResult(i, score, label) {
	const r = grp.r;
	if (r.res[i]) return;
	r.res[i] = { score, label };
	if (store.timed && !grp.strag) grp.strag = setTimeout(() => grAll({ t: 'g-timeout', tok: r.tok }), GR_STRAGGLE_MS); // the stragglers' phones fail their own turn
	grCheck();
}

function grReveal() {
	clearTimeout(grp.strag);
	grp.strag = 0;
	const r = grp.r, sc = r.res.map((x) => x.score);
	r.phase = 'reveal';
	const rank = sc.map((s) => 1 + sc.filter((o) => (r.game.lowerIsBetter ? o < s : o > s)).length);
	const winners = rank.map((k, i) => (k === 1 && Number.isFinite(sc[i]) ? i : -1)).filter((i) => i >= 0);
	winners.forEach((i) => r.pts[i]++);
	r.log.push({ w: winners, l: r.res.map((x) => x.label) });
	const last = r.round >= r.rounds - 1;
	const msg = { t: 'g-reveal', tok: r.tok, round: r.round, rounds: r.rounds, rank, labels: r.res.map((x) => x.label), pts: [...r.pts], winners, names: grp.names, gone: grp.gone, last, gid: r.game.id };
	if (last) {
		const place = r.pts.map((p) => 1 + r.pts.filter((o) => o > p).length);
		msg.place = place;
		msg.log = r.log;
		grp.board.rows.push({ g: r.game.id, n: r.game.name, names: [...grp.names], pts: [...r.pts], place });
		grp.lastGame = r.game;
	}
	grAll(msg);
	if (last) grAll({ t: 'board', b: grp.board });
}

/* ── guest: messages from the host ───────────────────── */
function grGuestMsg(msg, bail) {
	switch (msg.t) {
		case 'full': bail('That room is full or already playing.'); break;
		case 'roster': {
			const first = grp.me < 0;
			Object.assign(grp, { me: msg.you, names: msg.names, gone: msg.gone });
			if (first) glSet('live', { code: grp.code });
			if (msg.opened && !grp.opened) { grp.opened = true; go('cats', { mode: 'group' }); }
			renderHub();
			break;
		}
		case 'g-bye': grDrop('The host closed the room.'); break;
		default: grPlayer(msg);
	}
}

/* ── every phone: what the player sees ───────────────── */
const grMe = () => grp.me;
const grNames = (msg) => msg.names || grp.names;
const grOrdinal = (n) => `${n}${['th', 'st', 'nd', 'rd'][n % 100 > 10 && n % 100 < 14 ? 0 : n % 10 < 4 ? n % 10 : 0]}`;
const locksHtml = (flags, names, kind) => `<div class="locks" id="locks" data-kind="${kind}">${names.map((n, i) => (grp.gone[i] ? '' : `<span class="${flags[i] ? 'on' : ''}">${flags[i] ? '✓' : '…'} ${esc(n)}</span>`)).join('')}</div>`;

function grHead(msg, pts) {
	const el = pane(0), me = grMe();
	$('.pname', el).textContent = grp.names[me] || nameOf(0);
	$('.av', el).textContent = (grp.names[me] || '?')[0].toUpperCase();
	$('.ppts', el).textContent = pts;
	$('.prnd', el).textContent = `Round ${msg.round + 1}/${msg.rounds} · ${grp.names.filter((_, i) => !grp.gone[i]).length} players`;
}

function grEnterMatch(game) {
	Object.assign(document.body.dataset, { screen: 'match', mode: 'online', seat: 0 });
	$('#match').dataset.cat = game.group;
	$('#share').hidden = true;
	window.scrollTo(0, 0);
}

function grPlayer(msg) {
	if (!grp) return;
	switch (msg.t) {
		case 'g-open': break;
		case 'g-intro': {
			const game = GAMES.find((g) => g.id === msg.gid);
			if (!game) break;
			m = { game, rounds: msg.rounds, round: msg.round, pts: [msg.pts[grMe()] || 0, 0], token: ++epoch, cfg: msg.cfg, res: [null, null], ready: [true, true], final: null, pass: false, group: true, solo: false, tok: msg.tok };
			m.onDone = (score, label) => grDone(score, label);
			grEnterMatch(game);
			grHead(msg, m.pts[0]);
			const s = paint(0, `${introHtml()}<button class="btn" type="button">Ready</button><div class="locks" id="locks"></div>`, 'scroll');
			const b = $('button', s);
			b.onclick = () => {
				sfx.unlock();
				grFullscreen();
				b.disabled = true;
				b.textContent = 'Waiting for the others…';
				if (grp.role === 'host') { grp.r.ready[0] = true; grCheck(); } else grp.conn.send({ t: 'ready' });
			};
			break;
		}
		case 'g-lock': {
			if (!m?.group || msg.tok !== m.tok) break;
			const box = $('#locks', stageOf(0));
			if (box) box.outerHTML = locksHtml(msg.flags, grp.names, msg.kind);
			break;
		}
		case 'g-count': {
			if (!m?.group || msg.tok !== m.tok) break;
			countdown(() => { paint(0, ''); m.game.play(makeCtx(0)); }, [0]);
			break;
		}
		case 'g-timeout': if (m?.group && msg.tok === m.tok && !m.res[0]) makeCtx(0).fail('Timed out'); break;
		case 'g-reveal': grShow(msg); break;
		case 'board': grp.board = msg.b; if (document.body.dataset.screen === 'hub') renderHub(); break;
		case 'g-hub': if (m) bump(); m = null; toHub(); break;
	}
}

/* This player finished their turn: lock it in and tell the host. */
function grDone(score, label) {
	paint(0, `<div class="res tie">Locked in ✓</div><div class="hint">${store.timed ? `Others have ${grSecs}s once the first one finishes.` : 'No time limit: waiting for everyone.'}</div><div class="locks" id="locks"></div>`, 'scroll');
	if (grp.role === 'host') grResult(0, score, label);
	else grp.conn.send({ t: 'res', tok: m.tok, score: score === Infinity ? 'inf' : score === -Infinity ? '-inf' : score, label });
}

function grShow(msg) {
	if (!m?.group || msg.tok !== m.tok) return;
	const me = grMe(), names = msg.names, host = grp.role === 'host';
	m.pts[0] = msg.pts[me];
	grHead(msg, msg.pts[me]);
	bump();
	const order = names.map((_, i) => i).filter((i) => !msg.gone[i] || msg.labels[i] !== 'left').sort((a, b) => msg.rank[a] - msg.rank[b] || msg.pts[b] - msg.pts[a]);
	const table = (rows) => `<div class="rows grt">${rows.join('')}</div>`;
	const row = (i, right, left) => `<div class="row${i === me ? ' me' : ''}"><span>${left}</span><b>${right}</b></div>`;
	const plural = (id, w) => (id === me ? 'You' : esc(names[w]));
	if (!msg.last) {
		const won = msg.winners.includes(me);
		sfx[won ? 'win' : 'lock']?.();
		const head = msg.winners.length ? (won ? ['win', 'You win the round'] : ['lose', `${esc(names[msg.winners[0]])} takes it`]) : ['tie', 'Nobody scored'];
		const next = host ? '<button class="btn" type="button">Next round</button>' : '<div class="hint">Waiting for the host…</div>';
		const s = paint(0, `<div class="res ${head[0]}">${head[1]}</div>${table(order.map((i) => row(i, esc(plainText(msg.labels[i])), `${msg.rank[i]}. ${esc(names[i])}${msg.winners.includes(i) ? ' ★' : ''}`)))}<div class="hint">Round points: ${order.map((i) => `${esc(names[i])} ${msg.pts[i]}`).join(' · ')}</div>${next}`, 'scroll');
		if (host) $('button', s).onclick = () => { grp.r.round++; grNext(); };
		return;
	}
	const place = msg.place, mine = place[me], top = place.filter((p) => p === 1).length;
	const state = mine === 1 ? (top > 1 ? 'draw' : 'win') : 'lose';
	const word = { win: 'YOU WIN', lose: 'YOU LOSE', draw: 'DRAW' }[state];
	const sub = state === 'win' ? '🏆 You win the match' : state === 'draw' ? `Shared first with ${top - 1} more` : `You finished ${grOrdinal(mine)} of ${place.filter((_, i) => !msg.gone[i] || msg.pts[i]).length}`;
	if (state === 'win') { sfx.win(); confetti(['#35d6c8', '#ffd24d', '#fff']); }
	const standings = [...names.keys()].sort((a, b) => place[a] - place[b]).map((i) => row(i, `${msg.pts[i]} pts`, `${place[i]}. ${esc(names[i])}`));
	const rounds = msg.log.map((rd, k) => `<div class="irow"><span>R${k + 1}</span><span>${rd.w.length ? esc(rd.w.map((i) => names[i]).join(', ')) : '—'}</span><i class="rd" style="background:var(--win)"></i><span>${rd.l.map((l, i) => `${esc(names[i][0])} ${esc(plainText(l))}`).join(' · ')}</span></div>`).join('');
	const champs = place.map((p, i) => (p === 1 ? names[i] : '')).filter(Boolean);
	logHistory({ g: msg.gid, n: [...names], p: [...msg.pts], c: -4, s: `${champs.join(' & ')} won · ${names.length} phones` });
	store.plays[msg.gid] = (store.plays[msg.gid] || 0) + 1;
	save();
	const btns = host ? '<div class="btns"><button class="btn" type="button" data-act="again">Rematch</button><button class="btn ghost" type="button" data-act="hub">Hub</button></div>' : '<div class="hint">Waiting for the host…</div>';
	const s = paint(0, `<div class="res ${state === 'win' ? 'win' : 'lose'}"><span class="bigv ${state}">${word}</span><small>${sub}</small></div>${table(standings)}<div class="insight"><div class="irows">${rounds}</div></div>${btns}`, 'scroll');
	if (host) $$('button', s).forEach((b) => (b.onclick = () => (b.dataset.act === 'again' ? (grp.r = null, grStart(grp.lastGame)) : grQuit())));
}

/* A phone that pressed Ready asks for the whole screen once; the match then uses every pixel (not every browser allows it). */
function grFullscreen() {
	if (!document.fullscreenElement) document.documentElement.requestFullscreen?.({ navigationUI: 'hide' }).catch(() => { /* iOS Safari: no fullscreen, the page is already edge to edge */ });
}

/* ── the menu side: room screen and scoreboard ───────── */
function grBoardHtml() {
	const rows = grp.board.rows, me = grp.me, names = grp.names;
	const wins = names.map((_, i) => rows.filter((r) => r.place[i] === 1 && r.place.filter((p) => p === 1).length === 1).length);
	const tot = [...names.keys()].filter((i) => !grp.gone[i]).sort((a, b) => wins[b] - wins[a]);
	const players = `<div class="rb-who">${tot.map((i) => `<span${i === me ? ' class="me"' : ''}>${esc(names[i])} <b>${wins[i]}</b></span>`).join('')}</div>`;
	if (!rows.length) return `${players}<div class="rb-empty">No games played in this room yet</div>`;
	const line = (r) => {
		const p = r.place[me], tied = r.place.filter((x) => x === 1).length > 1;
		const res = p === undefined ? '' : p === 1 ? (tied ? '<b>DRAW</b>' : '<b class="win">WIN</b>') : `<b class="lose">${grOrdinal(p)}</b>`;
		return `<div class="rb-row"><span>${gameIcon(r.g)}${esc(r.n)}</span><span>${r.pts[me] ?? ''} pts</span>${res}</div>`;
	};
	return `<div class="rb-tot"><span>Wins in this room</span><small>${rows.length} played</small></div>${players}<div class="rb-rows">${[...rows].reverse().map(line).join('')}</div>`;
}

function renderGroupRoom() {
	const room = $('#room'), L = gl;
	const key = `${L.state}|${L.code}|${L.msg}|${L.invite}|${grp ? grp.names.join(',') + grp.opened : ''}`;
	if (room.dataset.key === key) return;
	room.dataset.key = key;
	const name = `<label class="who" style="--c: var(--p0)"><i></i><input id="myName" maxlength="14" placeholder="Your name" autocomplete="off" value="${esc(store.names[0])}" aria-label="Your name"></label>`;
	const err = L.state === 'error' ? `<p class="oops">${esc(L.msg)}</p>` : '';
	const wait = (txt) => `<h2 class="stepttl">${txt}</h2><button class="btn ghost" type="button" data-a="gcancel">Cancel</button>`;
	const list = () => `<div class="plist seats">${grp.names.map((n, i) => (grp.gone[i] ? '' : `<span class="gpill${i === grp.me ? ' me' : ''}">${esc(n)}${i === 0 ? ' · host' : ''}</span>`)).join('')}</div>`;
	if (grp?.role === 'host') {
		const n = grp.names.filter((_, i) => !grp.gone[i]).length;
		room.innerHTML = `<h2 class="stepttl">Your room</h2><p class="stepsub">Friends scan this, or open Faceoff, pick <b>3 + players → Own phones</b> and type the code.</p><div class="qr" id="qr"></div><div class="tcode">${grp.code}</div><button class="btn ghost" type="button" data-a="gshare">Share invite link</button><h3 class="stepttl">${n} in the room</h3>${list()}<button class="btn" type="button" data-a="gstart"${n < 3 ? ' disabled' : ''}>${n < 3 ? 'Need 3 or more players' : 'Start'}</button><button class="btn ghost" type="button" data-a="gcancel">Close room</button>`;
		loadQr().then(() => { if (grp?.role === 'host' && $('#qr')) $('#qr').innerHTML = qrSvg(`${inviteUrl('').replace('?join=', '?room=')}${grp.code}`); }).catch(() => { /* the code still works */ });
	} else if (grp) {
		room.innerHTML = `<h2 class="stepttl">Joined ${grp.code}</h2><p class="stepsub">Waiting for the host to start. The host picks the games.</p>${list()}<button class="btn ghost" type="button" data-a="gcancel">Leave</button>`;
	} else if (L.state === 'starting') room.innerHTML = wait('Opening a room…');
	else if (L.state === 'joining') room.innerHTML = wait(`Joining ${L.code}…`);
	else if (L.invite) room.innerHTML = `<h2 class="stepttl">Join room ${esc(L.invite)}</h2><p class="stepsub">What should everyone call you?</p>${err}${name}<button class="btn" type="button" data-a="gaccept">Join</button><button class="btn ghost" type="button" data-a="gdecline">Not now</button>`;
	else room.innerHTML = `<h2 class="stepttl">Own phones, 3 +</h2><p class="stepsub">One of you makes a room, the rest join it with the code. Everyone plays on their own phone at the same time.</p>${err}${name}<button class="btn" type="button" data-a="gcreate">Create a room</button><div class="or">or join a friend</div><input class="tinput" id="joinCode" maxlength="4" placeholder="CODE" autocapitalize="characters" autocomplete="off" spellcheck="false" aria-label="Room code"><button class="btn ghost" type="button" data-a="gjoin">Join</button></div>`;
}

$('#room').addEventListener('click', async (e) => {
	const act = e.target.closest('[data-a]')?.dataset.a;
	if (!act || act[0] !== 'g') return;
	const named = () => {
		if ((store.names[0] || '').trim()) return true;
		const box = $('#myName');
		box.focus();
		box.placeholder = 'Type your name first';
		sfx.bad();
		return false;
	};
	if (act === 'gcreate' && named()) grHost();
	if (act === 'gjoin' && named()) grJoin($('#joinCode').value);
	if (act === 'gaccept' && named()) { const c = gl.invite; gl.invite = ''; grJoin(c); }
	if (act === 'gdecline') { gl.invite = ''; glSet('idle'); }
	if (act === 'gcancel') { grp ? grLeave() : grCancel(); glSet('idle'); go('three'); }
	if (act === 'gstart') { grp.opened = true; grRoster(); go('cats', { mode: 'group' }); }
	if (act === 'gshare') {
		const url = `${inviteUrl('').replace('?join=', '?room=')}${grp.code}`;
		try { await navigator.share({ title: 'Faceoff', text: `Join my Faceoff room: ${grp.code}`, url }); } catch { navigator.clipboard?.writeText(url); e.target.textContent = 'Link copied ✓'; }
	}
});

addEventListener('visibilitychange', () => { if (!document.hidden && gl.peer?.disconnected && !gl.peer.destroyed) gl.peer.reconnect(); }); // back from sharing the code
