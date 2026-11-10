'use strict';

/* Two phones, no server of our own.

   The phones talk directly (WebRTC) through PeerJS; its free public broker only introduces them with a 4-letter room code.
   Nothing is stored. PeerJS is loaded the first time someone opens Two phones, so the rest of the app never waits for it.

   One phone hosts. It runs the match engine (core.js) exactly as in split screen, including a hidden copy of the guest's half.
   - Menus and turn-based games: the guest's half is mirrored onto the guest's phone (the host's DOM for it, sent as HTML, at
     most every MIRROR_MS) and every tap, keystroke and field value on it is sent back and replayed on the hidden copy.
   - Plain games (everything with play(ctx) and one score): the guest plays its own turn on its own phone, with its own
     clock, and sends back only the result. Reaction times never include the network.
   Sync Tap is the one game that compares taps across phones, so a tap carries its real time, converted to the host's clock. */

const PEER_SRC = 'https://unpkg.com/peerjs@1.5.4/dist/peerjs.min.js';
const PEER_SRI = 'sha384-nlUQ8ZqCbvStErob+biJNzSgltf6urV3VGqhfIfzhmg9RXmpeRm76ELw0pYnKlTR';
const ROOM_ALPHA = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // no 0 O 1 I
const roomPeer = (code) => `faceoff-ptwo-${code}`;
const MIRROR_MS = 110;
const SILENT_MS = 9000; // this long without a word from the other phone and it is treated as gone

/* What the menu shows while a room is set up: idle, starting, hosting, joining or error. */
const lobby = { state: 'idle', code: '', msg: '', note: '', peer: null, conn: null, onchange: () => {} };
const lobbySet = (state, extra = {}) => { Object.assign(lobby, { state, msg: '' }, extra); lobby.onchange(); };

function loadPeer() {
	if (window.Peer) return Promise.resolve();
	return new Promise((ok, fail) => {
		const s = document.createElement('script');
		s.src = PEER_SRC;
		s.integrity = PEER_SRI;
		s.crossOrigin = 'anonymous';
		s.onload = ok;
		s.onerror = () => { s.remove(); fail(new Error('peerjs')); };
		document.head.append(s);
	});
}

function netCancel() {
	lobby.peer?.destroy();
	Object.assign(lobby, { peer: null, conn: null, code: '' });
}

async function netHost() {
	netCancel();
	lobbySet('starting');
	try { await loadPeer(); } catch { return lobbySet('error', { msg: 'Couldn’t reach the connection service. Check your internet and try again.' }); }
	const open = () => {
		const code = Array.from({ length: 4 }, () => choice([...ROOM_ALPHA])).join('');
		const peer = new Peer(roomPeer(code));
		lobby.peer = peer;
		peer.on('open', () => lobbySet('hosting', { code }));
		peer.on('connection', (conn) => {
			if (lobby.conn || net) return conn.close(); // one friend per room
			lobby.conn = conn;
			conn.on('open', () => startLink('host', conn, peer));
		});
		peer.on('error', (e) => {
			if (net) return; // the match carries on peer to peer; only the introductions stopped
			peer.destroy();
			if (e.type === 'unavailable-id') open(); // that code is taken: roll another
			else lobbySet('error', { msg: 'Couldn’t open a room. Check your internet and try again.' });
		});
	};
	open();
}

async function netJoin(raw) {
	const code = String(raw).toUpperCase().replace(/[^A-Z0-9]/g, '');
	netCancel();
	if (code.length !== 4) return lobbySet('error', { msg: 'The room code has 4 letters or digits.' });
	lobbySet('joining', { code });
	try { await loadPeer(); } catch { return lobbySet('error', { msg: 'Couldn’t reach the connection service. Check your internet and try again.' }); }
	const peer = new Peer();
	lobby.peer = peer;
	let timer = 0;
	const bail = (msg) => { clearTimeout(timer); peer.destroy(); lobbySet('error', { msg }); };
	timer = setTimeout(() => bail('Couldn’t reach that room. Check the code and your connection.'), 15000);
	peer.on('error', (e) => bail(e.type === 'peer-unavailable' ? 'No room with that code. Check it and try again.' : 'Couldn’t connect. Try again.'));
	peer.on('open', () => {
		const conn = peer.connect(roomPeer(code), { reliable: true, serialization: 'json' }); // plain JSON: nothing we send needs binary
		lobby.conn = conn;
		conn.on('open', () => { clearTimeout(timer); startLink('guest', conn, peer); });
		conn.on('error', () => bail('Couldn’t connect. Try again.'));
	});
}

/* ── the link ────────────────────────────────────────── */
const myName = () => (store.names[0] || '').trim().slice(0, 14);

function startLink(role, conn, peer) {
	const link = {
		role, conn, peer, me: role === 'host' ? 0 : 1, names: ['', ''],
		board: { rows: [] }, local: false, remote: false, tok: 0, offset: undefined, lat: 0, rtt: Infinity, seen: performance.now(), dead: false, timers: [],
		send: (msg) => { if (conn.open) conn.send(msg); },
	};
	conn.on('data', (msg) => { link.seen = performance.now(); handle(link, msg); });
	conn.on('close', () => drop(link, 'Your friend left.'));
	conn.on('error', () => drop(link, 'The connection dropped.'));
	link.timers.push(setInterval(() => { if (performance.now() - link.seen > SILENT_MS) drop(link, 'The connection dropped.'); }, 2000));
	link.names[link.me] = myName();
	link.send({ t: 'hello', name: myName() });
	if (role === 'guest') { // a few quick pings to learn the host's clock, then one every 2 s so the host can tell we are alive
		let n = 0;
		const ping = () => {
			if (link.dead) return;
			link.send({ t: 'ping', c: performance.now() });
			link.timers.push(setTimeout(ping, n++ < 6 ? 300 : 2000));
		};
		ping();
	}
}

function drop(link, why) {
	if (link.dead) return;
	link.dead = true;
	link.timers.forEach((t) => { clearInterval(t); clearTimeout(t); });
	observer?.disconnect();
	clearTimeout(mirrorTimer);
	mirrorTimer = 0;
	try { link.conn.close(); link.peer?.destroy(); } catch { /* already closed */ }
	const wasLive = net === link;
	if (wasLive) net = null;
	Object.assign(lobby, { peer: null, conn: null, code: '' });
	if (wasLive) toHub();
	lobbySet('idle', { note: why });
}

const netLeave = () => net && drop(net, '');
addEventListener('pagehide', netLeave);

function handle(link, msg) {
	switch (msg.t) {
		case 'hello': {
			link.names[1 - link.me] = String(msg.name || '').slice(0, 14);
			if (!link.greeted) { link.greeted = true; link.send({ t: 'hello', name: myName() }); } // answered once, so a greeting sent before the other side was listening still lands
			if (link.names[0] && link.names[0] === link.names[1]) link.names[1] += ' 2';
			if (net !== link) {
				net = link;
				lobby.conn = null;
				if (link.role === 'host') watchMirror();
				lobbySet('live', { note: '' });
			}
			break;
		}
		case 'ping': link.send({ t: 'pong', c: msg.c, h: performance.now() }); break;
		case 'pong': { // NTP in miniature: the quickest round trip gives the best estimate of the host's clock
			const rtt = performance.now() - msg.c;
			if (rtt < link.rtt) Object.assign(link, { rtt, lat: rtt / 2, offset: msg.h - (msg.c + rtt / 2) });
			break;
		}
		default: (link.role === 'host' ? hostHandle : guestHandle)(link, msg);
	}
}

/* ── host ────────────────────────────────────────────── */
function hostHandle(link, msg) {
	switch (msg.t) {
		case 'ev': replay(msg); break;
		case 'res': // the guest finished its own turn of a plain game
			if (!m || !link.remote || msg.tok !== m.token) break;
			link.remote = false;
			makeCtx(1).done(msg.score === 'inf' ? Infinity : msg.score === '-inf' ? -Infinity : msg.score, String(msg.label));
			break;
		case 'quit': quit(); break;
	}
}

/* The hidden copy of the guest's half is watched; whenever it changes, the guest gets a fresh copy (at most every MIRROR_MS). */
let observer = null, mirrorTimer = 0, mirrorAt = 0;
const seat1 = () => $('#pane1');

function mirrorNow() {
	clearTimeout(mirrorTimer);
	mirrorTimer = 0;
	if (net?.role !== 'host' || net.remote) return;
	$$('input', seat1()).forEach((i) => { if (i.getAttribute('value') !== i.value) i.setAttribute('value', i.value); }); // so typed text travels with the HTML
	observer.takeRecords();
	mirrorAt = performance.now();
	net.send({ t: 'ui', html: seat1().innerHTML, cat: $('#match').dataset.cat });
}
const mirrorSoon = () => { mirrorTimer ||= setTimeout(mirrorNow, Math.max(0, MIRROR_MS - (performance.now() - mirrorAt))); };
const watchMirror = () => {
	observer = new MutationObserver(mirrorSoon);
	observer.observe(seat1(), { subtree: true, childList: true, attributes: true, characterData: true });
};

/* Called by core.js when the guest's half of a plain game should start: the guest runs it and reports back. */
function netPlay() {
	mirrorNow();
	net.remote = true;
	net.send({ t: 'play', gid: m.game.id, cfg: m.cfg, round: m.round, tok: m.token });
}

/* Play a tap, key or typed value from the guest on the hidden copy as if it happened there. */
function replay(msg) {
	let el = seat1();
	for (const i of msg.path) el = el?.children[i];
	if (!el) return; // the half changed since that tap was made
	let ev;
	if (msg.type === 'input') { el.value = msg.value ?? ''; ev = new Event('input', { bubbles: true }); }
	else if (msg.type === 'keydown') ev = new KeyboardEvent('keydown', { key: msg.key, bubbles: true });
	else {
		const o = { bubbles: true, pointerId: 1, isPrimary: true };
		ev = msg.type === 'click' ? new MouseEvent('click', o) : new PointerEvent(msg.type, o);
	}
	if (msg.ts) Object.defineProperty(ev, 'timeStamp', { value: msg.ts }); // when the tap really happened, on the host's clock
	el.dispatchEvent(ev);
}

/* ── guest ───────────────────────────────────────────── */
function guestHandle(link, msg) {
	switch (msg.t) {
		case 'match': link.celebrated = false; enterMatch(msg.cat); break;
		case 'ui': {
			if (document.body.dataset.screen !== 'match') enterMatch(msg.cat);
			const tpl = document.createElement('template');
			tpl.innerHTML = msg.html;
			morph(seat1(), tpl.content);
			if (!link.celebrated && msg.html.includes('You win the match')) { link.celebrated = true; confetti(['#35d6c8', '#ffd24d', '#fff']); }
			const box = $('input', seat1());
			if (box && !document.activeElement?.matches('input')) box.focus({ preventScroll: true }); // opens the keyboard where a tap isn't needed first
			break;
		}
		case 'play': {
			const game = GAMES.find((g) => g.id === msg.gid);
			if (!game) break;
			link.local = true;
			link.tok = msg.tok;
			m = { game, rounds: 0, round: msg.round, pts: [0, 0], token: ++epoch, cfg: msg.cfg, res: [null, null], ready: [true, true], final: null, pass: false };
			paint(1, '');
			game.play(makeCtx(1));
			break;
		}
		case 'board': {
			link.board = msg.b;
			const rows = msg.b.rows;
			for (; (link.logged ||= 0) < rows.length; link.logged++) { // the guest's own History screen keeps the room's matches too
				const r = rows[link.logged];
				logHistory({ g: r.g, n: [link.names[0] || 'Player 1', link.names[1] || 'Player 2'], p: r.p, c: r.c, s: r.s });
				store.plays[r.g] = (store.plays[r.g] || 0) + 1;
			}
			save();
			if (document.body.dataset.screen === 'hub') renderHub();
			break;
		}
		case 'timeout': if (link.local && m) makeCtx(1).fail('Timed out'); break;
		case 'hub': link.local = false; toHub(); break;
	}
}

function enterMatch(cat) {
	Object.assign(document.body.dataset, { screen: 'match', mode: 'online', seat: 1 });
	$('#match').dataset.cat = cat;
	$('#share').hidden = true;
	window.scrollTo(0, 0);
}

/* The guest finished its own turn: send the result, and the host's copy of this half takes over again. */
function netReport(score, label) {
	net.local = false;
	net.send({ t: 'res', tok: net.tok, score: score === Infinity ? 'inf' : score === -Infinity ? '-inf' : score, label });
}

/* Make dst's children match src's, reusing nodes of the same shape so a focused <input> keeps its keyboard.
   A different data-key means a different thing (a new countdown number), so the node is replaced and its animation replays. */
function morph(dst, src) {
	const have = [...dst.childNodes], want = [...src.childNodes];
	want.forEach((n, i) => {
		const o = have[i];
		if (!o) return void dst.append(n);
		if (o.nodeType !== n.nodeType || o.nodeName !== n.nodeName || o.dataset?.key !== n.dataset?.key) return void dst.replaceChild(n, o);
		if (n.nodeType === 3) { if (o.data !== n.data) o.data = n.data; return; }
		[...o.attributes].forEach((a) => { if (!n.hasAttribute(a.name)) o.removeAttribute(a.name); });
		[...n.attributes].forEach((a) => { if (o.getAttribute(a.name) !== a.value) o.setAttribute(a.name, a.value); });
		if (o.nodeName === 'INPUT') { const v = n.getAttribute('value') ?? ''; if (o.value !== v) o.value = v; }
		morph(o, n);
	});
	have.slice(want.length).forEach((o) => o.remove());
}

/* Taps on the mirrored half go to the host, addressed by position in the half (the mirror has the same shape as the original). */
const pathOf = (el) => {
	const path = [];
	for (; el && el !== seat1(); el = el.parentElement) path.unshift([...el.parentElement.children].indexOf(el));
	return el ? path : null;
};
['pointerdown', 'pointerup', 'click', 'input', 'keydown'].forEach((type) => seat1().addEventListener(type, (e) => {
	if (net?.role !== 'guest' || net.local) return; // while the guest plays a plain game, the game's own handlers are in charge
	const path = pathOf(e.target);
	if (!path) return;
	const r = e.target.getBoundingClientRect();
	net.send({
		t: 'ev', type, path, value: e.target.value, key: e.key,
		x: r.width ? (e.clientX - r.left) / r.width : 0, y: r.height ? (e.clientY - r.top) / r.height : 0,
		ts: net.offset === undefined ? 0 : tsOf(e) + net.offset - net.lat, // minus the delay the beat took to get here
	});
}, true));
