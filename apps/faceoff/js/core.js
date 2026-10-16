'use strict';

/* Faceoff core: helpers, saved settings and the two-pane match engine.

   A game is { id, name, icon, group, blurb, lowerIsBetter, config(round), intro(cfg), play(ctx) }.
   Both players get the same cfg each round and play at the same moment on their own half of the screen.
   play(ctx) draws into ctx.stage and reports one number via ctx.done(score, label) or ctx.fail(label);
   the engine handles ready-up, countdown, reveal, points and the match result. */

const GAMES = [];

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const rand = (a, b) => a + Math.random() * (b - a);
const secs = (ms, d = 2) => (ms / 1000).toFixed(d);
const buzz = (ms = 15) => { if (navigator.userActivation?.isActive) navigator.vibrate?.(ms); }; // browsers block vibrate without a recent tap
const esc = (s) => s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

/* Pointer events carry their own hardware timestamp; it beats reading the clock after the event queue.
   ponytail: falls back to now() if a browser reports a different timebase. */
const tsOf = (e) => (Math.abs(e.timeStamp - performance.now()) < 1000 ? e.timeStamp : performance.now());

/* ── settings ────────────────────────────────────────── */
const STORE_KEY = 'faceoff:v1';
const store = (() => {
	const d = { names: ['', ''], rounds: 5, flip: true, series: [0, 0] };
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
	s.onpointerdown = s.onpointerup = s.onpointercancel = null;
	s.className = `stage ${cls}`.trim();
	s.innerHTML = html;
	return s;
}

function head(p) {
	const el = pane(p);
	$('.pname', el).textContent = nameOf(p);
	$('.ppts', el).textContent = m.pts[p];
	$('.prnd', el).textContent = `Round ${m.round + 1}/${m.rounds}`;
}

const introHtml = () => `<div class="gname">${m.game.icon} ${m.game.name}</div><div class="lbl">${m.game.intro(m.cfg)}</div>`;

function startMatch(game, rounds = store.rounds) {
	m = { game, rounds, round: 0, pts: [0, 0], token: ++epoch, cfg: game.config(0), res: [null, null], ready: [false, false] };
	document.body.dataset.screen = 'match';
	window.scrollTo(0, 0);
	both(head);
	showReady(introHtml, 'Ready', countdown);
}

function quit() {
	if (m) bump();
	m = null;
	document.body.dataset.screen = 'hub';
	renderHub();
}

/* Each player taps Ready on their own half; the round starts when both have. */
function showReady(body, label, onBoth) {
	m.ready = [false, false];
	both((p) => {
		const s = paint(p, `${body(p)}<button class="btn" type="button">${label}</button>`);
		const b = $('button', s);
		b.onclick = () => {
			if (m.ready[p]) return;
			m.ready[p] = true;
			b.disabled = true;
			b.textContent = `Waiting for ${nameOf(1 - p)}…`;
			if (m.ready[1 - p]) onBoth();
		};
	});
}

function countdown() {
	const tok = bump();
	let n = 3;
	const tick = () => {
		if (!m || m.token !== tok) return;
		if (!n) return begin();
		both((p) => paint(p, `<div class="count">${n}</div>`));
		n--;
		setTimeout(tick, 700);
	};
	tick();
}

function begin() {
	m.res = [null, null];
	both((p) => paint(p, ''));
	both((p) => m.game.play(makeCtx(p)));
}

/* Everything a game needs. Timers and loops die on their own once this player has finished or the round moved on. */
function makeCtx(p) {
	const tok = m.token;
	const alive = () => !!m && m.token === tok && !m.res[p];
	const finish = (score, label) => {
		if (!alive()) return;
		m.res[p] = { score, label };
		buzz(20);
		paint(p, `<div class="res tie">Locked in ✓</div><div class="hint">Waiting for ${esc(nameOf(1 - p))}…</div>`);
		if (m.res[1 - p]) reveal();
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
	const w = judge(m.res[0].score, m.res[1].score, m.game.lowerIsBetter);
	if (w >= 0) m.pts[w]++;
	const result = (p) => {
		const [cls, text] = w < 0 ? ['tie', 'Draw'] : w === p ? ['win', 'You win the round'] : ['lose', `${esc(nameOf(w))} takes it`];
		return `<div class="res ${cls}">${text}</div>
			<div class="rows"><div class="row me"><span>You</span><b>${m.res[p].label}</b></div><div class="row"><span>${esc(nameOf(1 - p))}</span><b>${m.res[1 - p].label}</b></div></div>`;
	};

	if (m.round < m.rounds - 1) {
		m.round++;
		m.cfg = m.game.config(m.round);
		both(head);
		showReady((p) => `${result(p)}<hr>${introHtml()}`, 'Ready', countdown);
		return;
	}

	both(head);
	const champ = m.pts[0] === m.pts[1] ? -1 : m.pts[0] > m.pts[1] ? 0 : 1;
	if (champ >= 0) { store.series[champ]++; save(); }
	both((p) => {
		const title = champ < 0 ? 'Match drawn' : champ === p ? '🏆 You win the match' : `${esc(nameOf(champ))} wins the match`;
		const s = paint(p, `${result(p)}<hr><div class="res ${champ === p ? 'win' : 'tie'}">${title}</div><div class="hint">${m.pts[p]} – ${m.pts[1 - p]}</div>
			<div class="btns"><button class="btn" type="button" data-act="${champ < 0 ? 'sudden' : 'again'}">${champ < 0 ? 'Sudden death' : 'Rematch'}</button><button class="btn ghost" type="button" data-act="hub">Hub</button></div>`);
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
		both(head);
		showReady(introHtml, 'Ready', countdown);
	},
};
