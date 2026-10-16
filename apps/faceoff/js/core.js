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
   - words: true  the word lists are loaded before round 1, so config() and play() can use WORDS. */

const GAMES = [];

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const rand = (a, b) => a + Math.random() * (b - a);
const choice = (list) => list[Math.floor(Math.random() * list.length)];
const shuffle = (list) => {
	const a = [...list];
	for (let i = a.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[a[i], a[j]] = [a[j], a[i]];
	}
	return a;
};
const secs = (ms, d = 2) => (ms / 1000).toFixed(d);
const buzz = (ms = 15) => { if (navigator.userActivation?.isActive) navigator.vibrate?.(ms); }; // browsers block vibrate without a recent tap
const esc = (s) => s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

/* Pointer events carry their own hardware timestamp; it beats reading the clock after the event queue.
   ponytail: falls back to now() if a browser reports a different timebase. */
const tsOf = (e) => (Math.abs(e.timeStamp - performance.now()) < 1000 ? e.timeStamp : performance.now());

/* ── settings ────────────────────────────────────────── */
const STORE_KEY = 'faceoff:v1';
const store = (() => {
	const d = { names: ['', ''], rounds: 5, mode: 'split', flip: true, series: [0, 0], sound: true, dares: true, plays: {}, history: [], custom: { dares: [], truths: [] } };
	try { return { ...d, ...JSON.parse(localStorage.getItem(STORE_KEY)) }; } catch { return d; }
})();
const save = () => { try { localStorage.setItem(STORE_KEY, JSON.stringify(store)); } catch { /* private mode: play works, settings just won't persist */ } };
const nameOf = (p) => (store.names[p] || '').trim() || `Player ${p + 1}`;

/* 0 or 1 = index of the winner, -1 = tie. Failed attempts score +-Infinity so they lose to any real score. */
function judge(a, b, lowerIsBetter) {
	if (a === b) return -1;
	return (lowerIsBetter ? a < b : a > b) ? 0 : 1;
}

/* ── match engine ────────────────────────────────────── */
let m = null; // the match in progress, or null on the hub

/* Every round, reveal and quit takes a fresh global token, so timers left over from an earlier
   round or match can never mistake themselves for the current one. */
let epoch = 0;
const bump = () => (m.token = ++epoch);

const pane = (p) => $(`#pane${p}`);
const stageOf = (p) => $('.stage', pane(p));
const both = (fn) => [0, 1].forEach(fn);

function paint(p, html, cls = '') {
	const s = stageOf(p);
	s.onpointerdown = s.onpointerup = s.onpointercancel = s.onclick = null;
	s.className = `stage ${cls}`.trim();
	s.innerHTML = html;
	return s;
}

/* Pass-and-play shows one pane at a time; in split mode every pane is always visible, so this does nothing. */
function focus(p) {
	if (m?.pass) both((q) => pane(q).classList.toggle('on', q === p));
}

function head(p) {
	const el = pane(p);
	$('.pname', el).textContent = nameOf(p);
	$('.ppts', el).textContent = m.game.headScore ? m.game.headScore(m.pts[p], m.round) : m.pts[p];
	$('.prnd', el).textContent = `Round ${m.round + 1}/${m.rounds}${m.pass ? ` · ${nameOf(1 - p)}: ${m.pts[1 - p]}` : ''}`;
}

const introHtml = () => `<div class="gname">${gameIcon(m.game.id)} ${m.game.name}</div><div class="lbl">${m.game.intro(m.cfg)}</div>`;

function startMatch(game, rounds = store.rounds) {
	rounds = game.rounds || rounds; // some games fix their own length
	const mine = (m = { game, rounds, round: 0, pts: [0, 0], token: ++epoch, cfg: null, res: [null, null], ready: [false, false], final: null, pass: !game.splitOnly && (store.mode === 'pass' || !!game.passOnly) });
	document.body.dataset.screen = 'match';
	document.body.dataset.mode = mine.pass ? 'pass' : 'split'; // phone-keyboard games are always pass-and-play, sync games always split
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
				const s = paint(p, '<div class="lbl">Couldn’t load the word list.<br><small>Check your connection and try again.</small></div><button class="btn ghost" type="button">Hub</button>');
				$('button', s).onclick = quit;
			});
		},
	);
}

function quit() {
	if (m) bump();
	m = null;
	document.body.dataset.screen = 'hub';
	renderHub();
}

/* Split: each player taps Ready on their own half and the round starts when both have. Pass: one Ready. */
function showReady(body, label, onBoth) {
	m.ready = [false, false];
	const seats = m.pass ? [0] : [0, 1];
	focus(0);
	seats.forEach((p) => {
		const s = paint(p, `${body(p)}<button class="btn" type="button">${label}</button>`);
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
		if (!n) { sfx.go(); return go(); }
		panes.forEach((p) => paint(p, `<div class="count">${n}</div>`));
		sfx.tick();
		n--;
		setTimeout(tick, 700);
	};
	tick();
}

function startRound() {
	m.res = [null, null];
	if (m.game.duel) { focus(0); return begin(); } // turn-based games start at once; the countdown is for reflex games
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
	else both((p) => m.game.play(makeCtx(p)));
}

/* "Pass the phone to ..." screen; then() runs when that player taps in. */
function handoff(q, then, extra = '') {
	const mine = m;
	focus(q);
	const s = paint(q, `<div class="gname">Pass the phone</div><div class="lbl">to <b>${esc(nameOf(q))}</b></div>${extra}<button class="btn" type="button">I’m ${esc(nameOf(q))}</button>`);
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
		step(p, () => live() && (last ? then() : handoff(1 - p, () => run(1 - p, true))));
	};
	if (gate) handoff(0, () => run(0, false));
	else run(0, false);
}

/* Everything a game needs. Timers and loops die on their own once this player has finished or the round moved on. */
function makeCtx(p) {
	const tok = m.token;
	const alive = () => !!m && m.token === tok && !m.res[p];
	const finish = (score, label) => {
		if (!alive()) return;
		m.res[p] = { score, label };
		buzz(20);
		sfx.lock();
		paint(p, `<div class="res tie">Locked in ✓</div><div class="hint">Waiting for ${esc(nameOf(1 - p))}…</div>`);
		if (m.res[1 - p]) reveal();
		else if (m.pass && !m.game.duel) handoff(1 - p, () => seatPlay(1 - p), `<div class="hint">✓ ${esc(nameOf(p))} is locked in. Result stays hidden.</div>${introHtml()}`);
	};
	return {
		p,
		cfg: m.cfg,
		stage: stageOf(p),
		alive,
		done: finish,
		fail: (label) => finish(m.game.lowerIsBetter ? Infinity : -Infinity, label),
		after: (ms, fn) => setTimeout(() => alive() && fn(), ms),
		loop(fn) {
			const tick = () => { if (alive() && fn() !== false) requestAnimationFrame(tick); };
			requestAnimationFrame(tick);
		},
	};
}

function reveal() {
	bump();
	// "Together" games (coop: true) score the pair as a team: both players get the same score and nobody loses.
	const coop = !!m.game.coop;
	const w = coop ? -1 : judge(m.res[0].score, m.res[1].score, m.game.lowerIsBetter);
	if (coop) {
		m.pts[0] += m.res[0].score;
		m.pts[1] = m.pts[0];
		if (m.res[0].score) sfx.win();
	} else if (w >= 0) { m.pts[w]++; sfx.win(); }
	const pass = m.pass;
	// Split screen speaks to each player ("You win"); a shared screen names people instead.
	const verdict = (p) => (coop ? m.game.verdict(m.res[0].score) : w < 0 ? ['tie', 'Draw'] : pass ? ['win', `${esc(nameOf(w))} takes it`] : w === p ? ['win', 'You win the round'] : ['lose', `${esc(nameOf(w))} takes it`]);
	const rows = (p) => (pass
		? [0, 1].map((q) => `<div class="row"><span>${esc(nameOf(q))}</span><b style="color:var(--p${q})">${m.res[q].label}</b></div>`).join('')
		: `<div class="row me"><span>You</span><b>${m.res[p].label}</b></div><div class="row"><span>${esc(nameOf(1 - p))}</span><b>${m.res[1 - p].label}</b></div>`);
	const result = (p) => `<div class="res ${verdict(p)[0]}">${verdict(p)[1]}</div><div class="rows">${rows(p)}</div>`;

	if (m.round < m.rounds - 1) {
		m.round++;
		m.cfg = m.game.config(m.round);
		both(head);
		const next = m.game.quickNext ? `<div class="gname">${gameIcon(m.game.id)} ${m.game.name}</div><div class="lbl">Round <b>${m.round + 1}</b> of ${m.rounds}</div>` : introHtml();
		showReady((p) => `${result(p)}<hr>${next}`, 'Next', startRound);
		return;
	}

	both(head);
	const champ = coop ? -2 : m.pts[0] === m.pts[1] ? -1 : m.pts[0] > m.pts[1] ? 0 : 1; // -1 draw, -2 together
	const sum = coop ? m.game.summary(m.pts[0], m.rounds) : null;
	if (champ >= 0) store.series[champ]++;
	store.plays[m.game.id] = (store.plays[m.game.id] || 0) + 1;
	store.history = [...store.history.slice(-99), { g: m.game.id, t: Date.now(), n: [nameOf(0), nameOf(1)], p: [...m.pts], c: champ, s: sum ? sum.title : '' }]; // last 100 matches, for the stats screen
	save();
	const dare = champ >= 0 && store.dares ? choice(allDares()).replace('{w}', nameOf(champ)) : '';
	m.final = { champ, dare, coop: sum };
	m.final.card = renderCard(); // built now so the Share tap can hand it straight to the share sheet
	$('#share').hidden = false;
	focus(0);
	(pass ? [0] : [0, 1]).forEach((p) => {
		const title = coop ? `💞 ${esc(sum.title)}` : champ < 0 ? 'Match drawn' : pass ? `🏆 ${esc(nameOf(champ))} wins the match` : champ === p ? '🏆 You win the match' : `${esc(nameOf(champ))} wins the match`;
		const score = coop ? esc(sum.sub) : pass ? `${esc(nameOf(0))} · ${m.pts[0]} – ${m.pts[1]} · ${esc(nameOf(1))}` : `${m.pts[p]} – ${m.pts[1 - p]}`;
		const again = champ === -1 ? 'sudden' : 'again';
		const s = paint(p, `<div class="hint">${verdict(p)[1]}</div>
			<div class="res ${champ === p || (pass && champ >= 0) || coop ? 'win' : 'tie'}">${title}</div><div class="hint">${score}</div>
			${dare ? `<div class="dare"><b>Dare</b> ${esc(dare)}</div>` : ''}
			<div class="btns"><button class="btn" type="button" data-act="${again}">${champ === -1 ? 'Sudden death' : 'Rematch'}</button><button class="btn ghost" type="button" data-act="hub">Hub</button></div>`);
		$$('button', s).forEach((b) => (b.onclick = () => FINAL[b.dataset.act]()));
	});
}

const FINAL = {
	again: () => startMatch(m.game, m.rounds),
	hub: quit,
	sudden() {
		m.rounds++;
		m.round++;
		m.cfg = m.game.config(m.round);
		m.final = null;
		$('#share').hidden = true;
		both(head);
		showReady(introHtml, 'Ready', startRound);
	},
};
