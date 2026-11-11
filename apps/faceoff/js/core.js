'use strict';

/* Faceoff core: helpers, saved settings and the two-pane match engine.

   A game is { id, name, icon, group, blurb, lowerIsBetter, config(round), intro(cfg), play(ctx) }.
   Both players get the same cfg each round. play(ctx) draws into ctx.stage and reports one number via
   ctx.done(score, label) or ctx.fail(label); the engine handles ready-up, countdown, reveal, points and the match result.

   Two ways to play, chosen on the hub (store.mode):
   - split: both players play at once, each on their own half of the screen.
   - pass:  one player at a time on a full screen, with a "pass the phone" screen in between.
   Plain games need no changes for either mode. Turn-taking games use turns() / focus() / handoff() below.

   Two optional game flags:
   - duel: true   play(ctx0, ctx1) is called once, for games where the halves talk to each other (turns, secrets).
   - words: true  the word lists are loaded before round 1, so config() and play() can use WORDS.

   Two phones (net.js): the host runs this engine exactly as in split screen. The second half is shown on the other phone, which
   mirrors it and sends its taps back. Plain games (not duel) are different: the other phone plays its own turn locally, so
   its timing is its own, and only the result travels back. */

const STRAGGLE_MS = 20000; // Timing on, two phones: this long for the second player once the first has locked in

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const rand = (a, b) => a + Math.random() * (b - a);
const choice = (list, r = Math.random) => list[Math.floor(r() * list.length)];
const shuffle = (list, r = Math.random) => {
	const a = [...list];
	for (let i = a.length - 1; i > 0; i--) {
		const j = Math.floor(r() * (i + 1));
		[a[i], a[j]] = [a[j], a[i]];
	}
	return a;
};
/* A seedable stand-in for Math.random: the same text gives the same sequence on every device (FNV-1a hash into mulberry32).
   The own-phone spy games deal from it, so each phone can work out the whole table without a server. */
const seeded = (s) => {
	let h = 2166136261;
	for (let i = 0; i < s.length; i++)
		h = Math.imul(h ^ s.charCodeAt(i), 16777619);
	return () => {
		h = (h + 0x6d2b79f5) | 0;
		let t = Math.imul(h ^ (h >>> 15), 1 | h);
		t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
		return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
	};
};
const secs = (ms, d = 2) => (ms / 1000).toFixed(d);
const buzz = (ms = 15) => {
	if (navigator.userActivation?.isActive) navigator.vibrate?.(ms);
}; // browsers block vibrate without a recent tap
const esc = (s) =>
	s.replace(
		/[&<>"']/g,
		(c) =>
			({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[
				c
			],
	);

/* Pointer events carry their own hardware timestamp; it beats reading the clock after the event queue.
   ponytail: falls back to now() if a browser reports a different timebase. */
const tsOf = (e) =>
	Math.abs(e.timeStamp - performance.now()) < 1000
		? e.timeStamp
		: performance.now();

/* ── settings ────────────────────────────────────────── */
const STORE_KEY = 'faceoff:v1';
const store = (() => {
	const d = {
		names: ['', ''],
		rounds: 5,
		mode: 'split',
		flip: true,
		series: [0, 0],
		sound: true,
		dares: true,
		plays: {},
		history: [],
		custom: { dares: [], truths: [] },
		best: {},
		big: true,
		groupRounds: 3,
		timed: true,
	};
	try {
		return { ...d, ...JSON.parse(localStorage.getItem(STORE_KEY)) };
	} catch {
		return d;
	}
})();
const save = () => {
	try {
		localStorage.setItem(STORE_KEY, JSON.stringify(store));
	} catch {
		/* private mode: play works, settings just won't persist */
	}
};
let net = null; // the live link to the other phone (net.js), or null when both play on this one
const rawName = (p) => (net ? net.names[p] : store.names[p]) || ''; // online, the names come from the two phones, never from this phone's saved ones
const nameOf = (p) => rawName(p).trim() || `Player ${p + 1}`;
const initialOf = (p) => (rawName(p).trim()[0] || String(p + 1)).toUpperCase();

const logHistory = (e) => {
	store.history = [...store.history.slice(-299), { t: Date.now(), ...e }];
}; // last 300 plays, for the History screen
const plainText = (html) => html.replace(/<[^>]*>/g, '');

/* ── match engine ────────────────────────────────────── */
let m = null; // the match in progress, or null on the hub

/* Every round, reveal and quit takes a fresh global token, so timers left over from an earlier
   round or match can never mistake themselves for the current one. */
let epoch = 0;
const bump = () => {
	m.scopes?.forEach((scope) => scope.dispose());
	m.deadlines?.forEach(clearTimeout);
	m.scopes = [];
	m.deadlines = [];
	return (m.token = ++epoch);
};

const pane = (p) => $(`#pane${p}`);
const stageOf = (p) => $('.stage', pane(p));
const both = (fn) => [0, 1].forEach(fn);

function paint(p, html, cls = '', phase = 'playing') {
	const s = stageOf(p);
	s.onpointerdown =
		s.onpointerup =
		s.onpointermove =
		s.onpointercancel =
		s.onclick =
		s.oninput =
		s.onkeydown =
			null;
	s.className = `stage ${cls}`.trim();
	s.dataset.phase = phase;
	if (phase !== 'playing') delete pane(p).dataset.turn;
	s.innerHTML = html;
	return s;
}

/* Pass-and-play shows one pane at a time; in split mode every pane is always visible, so this does nothing. */
function focus(p) {
	if (m?.pass) both((q) => pane(q).classList.toggle('on', q === p));
	both((q) => {
		pane(q).dataset.turn = m?.game.turnBased ? String(q === p) : '';
	});
}

function head(p) {
	const el = pane(p);
	$('.pname', el).textContent = nameOf(p);
	$('.av', el).textContent = initialOf(p);
	const points = $('.ppts', el),
		score = String(
			m.game.headScore ? m.game.headScore(m.pts[p], m.round) : m.pts[p],
		);
	if (
		points.textContent !== score &&
		!matchMedia('(prefers-reduced-motion: reduce)').matches
	)
		points.animate([{ transform: 'scale(1.22)' }, { transform: 'scale(1)' }], {
			duration: 240,
			easing: 'ease-out',
		});
	points.textContent = score;
	$('.prnd', el).textContent =
		m.cupId && cup?.id === m.cupId
			? `Cup game ${cup.index + 1}/5`
			: `Round ${m.round + 1}/${m.rounds}${m.pass && !m.solo ? ` · ${nameOf(1 - p)}: ${m.pts[1 - p]}` : ''}`;
}

const introHtml = () =>
	`<div class="hero">${gameIcon(m.game.id)}</div><div class="gtitle">${m.game.name}</div><div class="lbl">${m.game.intro(m.cfg)}</div>`;

function startMatch(game, rounds = store.rounds, solo = false, cupId = null) {
	if (!cupId) cancelCup();
	if (m) bump();
	rounds = game.rounds || rounds; // some games fix their own length
	const mine = (m = {
		game,
		rounds,
		round: 0,
		pts: cupId ? [cup.points[0], cup.points[1] || 0] : [0, 0],
		cupId,
		token: ++epoch,
		cfg: null,
		res: [null, null],
		ready: [false, false],
		final: null,
		solo,
		run: [],
		pass:
			solo ||
			(!net && !game.splitOnly && (store.mode === 'pass' || !!game.passOnly)),
	});
	document.body.dataset.screen = 'match';
	document.body.dataset.mode = net ? 'online' : mine.pass ? 'pass' : 'split'; // phone-keyboard games are always pass-and-play, sync games always split. Two phones: split rules, one half each
	document.body.dataset.seat = 0;
	$('#match').dataset.cat = game.group;
	net?.send({ t: 'match', cat: game.group, cupId });
	$('#share').hidden = true;
	window.scrollTo(0, 0);
	focus(0);
	both(head);
	const go = () => {
		mine.cfg = game.config(0);
		showReady(introHtml, 'Ready', startRound);
	};
	if (!game.words || WORDS.ready) return go();
	both((p) => paint(p, '<div class="lbl">Loading the word list…</div>'));
	loadWords().then(
		() => m === mine && go(),
		() => {
			if (m !== mine) return;
			both((p) => {
				const s = paint(
					p,
					'<div class="lbl">Couldn’t load the word list.<br><small>Check your connection and try again.</small></div><button class="btn ghost" type="button">Hub</button>',
				);
				$('button', s).onclick = quit;
			});
		},
	);
}

function toHub() {
	cancelCup();
	if (document.fullscreenElement) document.exitFullscreen?.().catch(() => {});
	if (m) bump();
	m = null;
	document.body.dataset.screen = 'hub';
	renderHub();
}

/* The guest can't end the match itself: it asks the host, who sends both phones back to the menu. */
function quit() {
	if (typeof grp !== 'undefined' && grp) return grQuit();
	if (net?.role === 'guest') return net.send({ t: 'quit' });
	toHub();
	net?.send({ t: 'hub' });
}

/* Split: each player taps Ready on their own half and the round starts when both have. Pass: one Ready. */
function showReady(body, label, onBoth) {
	m.ready = [false, false];
	const seats = m.pass ? [0] : [0, 1];
	focus(0);
	seats.forEach((p) => {
		const s = paint(
			p,
			`${body(p)}<button class="btn" type="button">${label}</button>`,
			'scroll',
			'ready',
		);
		const b = $('button', s);
		b.onclick = () => {
			if (m.ready[p]) return;
			sfx.unlock();
			m.ready[p] = true;
			if (m.pass) return onBoth();
			b.disabled = true;
			b.textContent = `Waiting for ${nameOf(1 - p)}…`;
			if (m.ready[1 - p]) onBoth();
		};
	});
}

/* 3-2-1 on the given panes, then go(). */
function countdown(go, panes = [0, 1]) {
	const tok = bump();
	let n = 3;
	const tick = () => {
		if (!m || m.token !== tok) return;
		if (!n) {
			sfx.go();
			return go();
		}
		panes.forEach((p) =>
			paint(
				p,
				`<div class="count" data-key="${n}">${n}</div>`,
				'',
				'countdown',
			),
		);
		sfx.tick();
		n--;
		(m.deadlines ||= []).push(setTimeout(tick, 700));
	};
	tick();
}

function startRound() {
	m.res = [null, null];
	if (m.game.duel) {
		focus(0);
		return begin();
	} // turn-based games start at once; the countdown is for reflex games
	if (!m.pass) return countdown(begin);
	seatPlay(0);
}

/* Pass-and-play, plain games: one player's turn on the full screen. */
function seatPlay(p) {
	focus(p);
	countdown(() => {
		paint(p, '');
		m.game.play(makeCtx(p));
	}, [p]);
}

function begin() {
	both((p) => paint(p, ''));
	if (m.game.duel) m.game.play(makeCtx(0), makeCtx(1));
	else both((p) => (net && p === 1 ? netPlay() : m.game.play(makeCtx(p)))); // two phones: the guest plays seat 1 on its own phone
}

/* "Pass the phone to ..." screen; then() runs when that player taps in. */
function handoff(q, then, extra = '') {
	const mine = m;
	focus(q);
	const s = paint(
		q,
		`<div class="gname">Pass the phone</div><div class="lbl">to <b>${esc(nameOf(q))}</b></div>${extra}<button class="btn" type="button">I’m ${esc(nameOf(q))}</button>`,
	);
	$('button', s).onclick = () => {
		if (m !== mine) return;
		sfx.unlock();
		then();
	};
}

/* For duel games. Runs step(p, next) for both players: at once in split mode, one after the other in pass-and-play
   (with a handoff screen between them). then() fires when both are finished.
   gate = also show a handoff before the first player, for a later phase of the same round. */
function turns(step, then, gate = false) {
	const mine = m;
	const live = () => m === mine;
	if (!m.pass) {
		let left = 2;
		both((p) => step(p, () => live() && !--left && then()));
		return;
	}
	const run = (p, last) => {
		focus(p);
		step(
			p,
			() => live() && (last ? then() : handoff(1 - p, () => run(1 - p, true))),
		);
	};
	if (gate) handoff(0, () => run(0, false));
	else run(0, false);
}

/* Everything a game needs. Timers and loops die on their own once this player has finished or the round moved on. */
function makeCtx(p) {
	const tok = m.token;
	const mine = m;
	const alive = () => m === mine && m.token === tok && !m.res[p];
	const scope = createRoundScope(alive);
	(m.scopes ||= []).push(scope);
	const finish = (score, label) => {
		if (!alive()) return;
		m.res[p] = { score, label };
		scope.dispose();
		if (m.onDone) return m.onDone(score, label); // 3+ room: group.js takes it from here
		buzz(20);
		sfx.lock();
		if (m.solo) return soloReveal();
		const lockRow = store.timed
			? ''
			: `<div class="locks">${[p, 1 - p].map((q) => `<span class="${m.res[q] ? 'on' : ''}">${m.res[q] ? '✓' : '…'} ${q === p ? 'You' : esc(nameOf(q))}</span>`).join('')}</div>`;
		paint(
			p,
			`<div class="res tie">Locked in ✓</div><div class="hint">Waiting for ${esc(nameOf(1 - p))}…${store.timed ? '' : ' (no time limit)'}</div>${lockRow}`,
			'',
			'locked',
		);
		if (net?.role === 'host' && store.timed && !m.res[1 - p]) {
			// Timing on: the other phone gets a few seconds once one has locked in
			const mine = m,
				other = 1 - p;
			(m.deadlines ||= []).push(
				setTimeout(() => {
					if (m !== mine || mine.token !== tok || mine.res[other]) return;
					if (other === 0) makeCtx(0).fail('Timed out');
					else net.send({ t: 'timeout' });
				}, STRAGGLE_MS),
			);
		}
		if (net?.role === 'guest') netReport(score, label); // the host owns the scoreboard
		if (m.res[1 - p]) reveal();
		else if (m.pass && !m.game.duel)
			handoff(
				1 - p,
				() => seatPlay(1 - p),
				`<div class="hint">✓ ${esc(nameOf(p))} is locked in. Result stays hidden.</div>${introHtml()}`,
			);
	};
	return {
		p,
		cfg: m.cfg,
		stage: stageOf(p),
		alive,
		done: finish,
		fail: (label) => finish(m.game.lowerIsBetter ? Infinity : -Infinity, label),
		after: scope.after,
		loop: scope.loop,
		on: scope.on,
		onCleanup: scope.cleanup,
	};
}
