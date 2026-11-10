'use strict';

/* More duels: Whack, Colour Clash, Shade, Colour Match, Math Sprint, Simon, Number Rush, Copy the Rhythm and Dots & Boxes.
   All but Dots & Boxes are plain games: both players get the same setup and play it at once, each on their own clock, so they
   work in split screen, pass-and-play and on two phones. Needs helpers from timer.js and perceive.js (pick, ink, limit, orbHtml). */

const rint = (a, b) => Math.floor(rand(a, b + 1));
const padHtml = () => `<div class="pad">${[1, 2, 3, 4, 5, 6, 7, 8, 9, '⌫', 0, '✓'].map((k) => `<button type="button">${k}</button>`).join('')}</div>`;
const audible = (ctx) => net || m.pass || ctx.p === 0; // one phone in split screen shares a speaker, so only one pane plays shared sounds

Object.assign(GAME_ICONS, {
	whack: '<path d="M12 2v4"/><path d="m4.9 4.9 2.8 2.8"/><path d="M2 12h4"/><circle cx="14" cy="14" r="6"/>',
	clash: '<circle cx="13.5" cy="6.5" r=".5"/><circle cx="17.5" cy="10.5" r=".5"/><circle cx="8.5" cy="7.5" r=".5"/><circle cx="6.5" cy="12.5" r=".5"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"/>',
	shade: '<circle cx="12" cy="12" r="10"/><path d="M12 18a6 6 0 0 0 0-12v12z"/>',
	hue: '<path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z"/>',
	sprint: '<rect width="16" height="20" x="4" y="2" rx="2"/><line x1="8" x2="16" y1="6" y2="6"/><line x1="16" x2="16" y1="14" y2="18"/><path d="M16 10h.01"/><path d="M12 10h.01"/><path d="M8 10h.01"/><path d="M12 14h.01"/><path d="M8 14h.01"/><path d="M12 18h.01"/><path d="M8 18h.01"/>',
	simon: '<path d="M12 12V3a9 9 0 0 1 9 9z"/><path d="M12 12h9a9 9 0 0 1-9 9z"/><path d="M12 12v9a9 9 0 0 1-9-9z"/><path d="M12 12H3a9 9 0 0 1 9-9z"/>',
	order: '<line x1="10" x2="21" y1="6" y2="6"/><line x1="10" x2="21" y1="12" y2="12"/><line x1="10" x2="21" y1="18" y2="18"/><path d="M4 6h1v4"/><path d="M4 10h2"/><path d="M6 18H4c0-1 2-2 2-3s-1-1.5-2-1"/>',
	boxes: '<rect x="4" y="4" width="16" height="16" rx="1"/><path d="M12 4v16"/><path d="M4 12h16"/>',
	rhythm: '<path d="M2 10v3"/><path d="M6 6v11"/><path d="M10 3v18"/><path d="M14 8v7"/><path d="M18 5v13"/><path d="M22 10v3"/>',
});

/* ── Whack: targets pop up and shrink away ─────────────── */
const WHACK_MS = 15000;
const WHACK_LIFE = 900;

GAMES.push({
	id: 'whack', name: 'Whack', icon: '🔨', group: 'reflex', lowerIsBetter: false,
	blurb: 'Targets pop up and shrink away. Hit as many as you can.',
	config() {
		const seq = [];
		for (let at = 700; at < WHACK_MS - WHACK_LIFE; at += rand(420, 760)) seq.push({ x: rand(0.1, 0.9), y: rand(0.1, 0.9), at: Math.round(at) });
		return { seq };
	},
	intro: () => `Tap each target before it shrinks away<br><small>${WHACK_MS / 1000} seconds. You both get the same targets.</small>`,
	play(ctx) {
		const { stage, cfg } = ctx;
		const H = Math.max(140, Math.min(stage.clientHeight - 90, 380));
		stage.innerHTML = `<div class="readout">0</div><div class="arena" style="height:${H}px"></div><div class="bar"><i></i></div>`;
		const ro = $('.readout', stage), arena = $('.arena', stage);
		let hits = 0;
		cfg.seq.forEach((t) => ctx.after(t.at, () => {
			const el = document.createElement('i');
			el.className = 'tgt';
			el.style.cssText = `left:${t.x * 100}%;top:${t.y * 100}%`;
			arena.append(el);
			setTimeout(() => el.remove(), WHACK_LIFE);
		}));
		arena.onpointerdown = (e) => {
			const el = e.target.closest('.tgt');
			if (!el || el.dataset.hit) return;
			el.dataset.hit = 1;
			el.classList.add('pop');
			ro.textContent = ++hits;
			buzz(10);
			sfx.key();
		};
		limit(ctx, WHACK_MS, () => ctx.done(hits, `${hits} hits`));
	},
});

/* ── Colour Clash: the ink, not the word ──────────────── */
const CLASH = [['RED', '#ff4d5e'], ['BLUE', '#4da3ff'], ['GREEN', '#3ddc84'], ['YELLOW', '#ffd24d']];
const CLASH_MS = 15000;

GAMES.push({
	id: 'clash', name: 'Colour Clash', icon: '🎨', group: 'reflex', lowerIsBetter: false,
	blurb: 'Tap the colour a word is printed in, not the colour it spells.',
	config: () => ({ seq: Array.from({ length: 80 }, () => { const w = rint(0, 3); return [w, Math.random() < 0.75 ? (w + rint(1, 3)) % 4 : w]; }) }),
	intro: () => `Tap the <b>ink colour</b>, not what the word says<br><small>${CLASH_MS / 1000} seconds. Right scores 1, wrong costs 1.</small>`,
	play(ctx) {
		const { stage, cfg } = ctx;
		stage.innerHTML = `<div class="readout">0</div><div class="clashword">&nbsp;</div><div class="clashgrid">${CLASH.map(([n], i) => `<button class="choice" type="button" data-i="${i}">${n}</button>`).join('')}</div><div class="bar"><i></i></div>`;
		const ro = $('.readout', stage), word = $('.clashword', stage);
		let k = 0, score = 0;
		const show = () => { const [w, c] = cfg.seq[k]; word.textContent = CLASH[w][0]; word.style.color = CLASH[c][1]; };
		show();
		$('.clashgrid', stage).onpointerdown = (e) => {
			const b = e.target.closest('button');
			if (!b || k >= cfg.seq.length - 1) return;
			const ok = +b.dataset.i === cfg.seq[k][1];
			score += ok ? 1 : -1;
			ro.textContent = score;
			ok ? sfx.key() : sfx.bad();
			buzz(ok ? 8 : 30);
			word.animate(ok ? [{ transform: 'scale(1.2)' }, { transform: 'scale(1)' }] : [{ transform: 'translateX(-8px)' }, { transform: 'translateX(8px)' }, { transform: 'translateX(0)' }], 160);
			k++;
			show();
		};
		limit(ctx, CLASH_MS, () => ctx.done(score, `${score} pts`));
	},
});

/* ── Shade: find the tile that is a touch off ──────────── */
const SHADE_PENALTY_MS = 1500;

GAMES.push({
	id: 'shade', name: 'Shade', icon: '🌗', group: 'perception', lowerIsBetter: true,
	blurb: 'One tile is a shade off. Find it five times, fast.',
	config: (i) => ({ trials: Array.from({ length: 5 }, (_, t) => { const n = [3, 3, 4, 4, 5][t]; return { n, h: rint(0, 359), odd: rint(0, n * n - 1), d: Math.max(3, 17 - t * 3 - i) * (Math.random() < 0.5 ? 1 : -1) }; }) }),
	intro: () => `Tap the tile with a <b>different shade</b><br><small>Five boards, harder each time. A wrong tap adds ${SHADE_PENALTY_MS / 1000} seconds.</small>`,
	play(ctx) {
		const { stage, cfg } = ctx;
		const side = Math.max(120, Math.min(stage.clientWidth - 28, stage.clientHeight - 80, 320));
		stage.innerHTML = '<div class="lbl"></div><div class="shades"></div>';
		const lbl = $('.lbl', stage), board = $('.shades', stage);
		const t0 = performance.now();
		let t = 0, wrong = 0;
		const show = () => {
			const { n, h, odd, d } = cfg.trials[t];
			lbl.innerHTML = `Find the odd shade <b>${t + 1}/${cfg.trials.length}</b>`;
			board.style.cssText = `width:${side}px;height:${side}px;grid-template-columns:repeat(${n},1fr)`;
			board.innerHTML = Array.from({ length: n * n }, (_, i) => `<button type="button" data-i="${i}" style="background:hsl(${h} 62% ${i === odd ? 56 + d : 56}%)"></button>`).join('');
		};
		show();
		board.onpointerdown = (e) => {
			const b = e.target.closest('button');
			if (!b) return;
			if (+b.dataset.i !== cfg.trials[t].odd) {
				wrong++;
				b.classList.add('bad');
				sfx.bad();
				buzz(30);
				return;
			}
			sfx.key();
			if (++t < cfg.trials.length) return show();
			const ms = performance.now() - t0 + wrong * SHADE_PENALTY_MS;
			ctx.done(ms, `${secs(ms, 1)}s <small>${wrong} wrong</small>`);
		};
		ctx.after(45000, () => ctx.fail('Too slow'));
	},
});

/* ── Colour Match: mix the colour you are shown ────────── */
const hslToRgb = (h, s, l) => {
	s /= 100;
	l /= 100;
	const k = (n) => (n + h / 30) % 12, a = s * Math.min(l, 1 - l);
	return [0, 8, 4].map((n) => Math.round(255 * (l - a * Math.max(-1, Math.min(k(n) - 3, 9 - k(n), 1)))));
};
const rgbDist = (a, b) => (Math.hypot(...a.map((v, i) => v - b[i])) / 441.67) * 100; // 0 identical, 100 black against white

GAMES.push({
	id: 'hue', name: 'Colour Match', icon: '💧', group: 'perception', lowerIsBetter: true,
	blurb: 'Mix the colour on screen with three sliders. How close can you get?',
	config: () => ({ h: rint(0, 359), s: rint(45, 90), l: rint(35, 70) }),
	intro: () => `Match the colour with the <b>hue, saturation and lightness</b> sliders<br><small>${PERC_MS / 1000} seconds. Closest wins.</small>`,
	play(ctx) {
		const { stage, cfg } = ctx;
		const slider = (k, max, v) => `<label class="sl"><b>${k}</b><input type="range" min="0" max="${max}" value="${v}" data-k="${k}"></label>`;
		stage.innerHTML = `<div class="swatch"><i style="background:hsl(${cfg.h} ${cfg.s}% ${cfg.l}%)"></i><i class="mine"></i></div><div class="sliders">${slider('H', 359, 180)}${slider('S', 100, 50)}${slider('L', 100, 50)}</div><div class="bar"><i></i></div><button class="btn" type="button">Lock</button>`;
		const mine = $('.mine', stage), v = { H: 180, S: 50, L: 50 };
		const paintMine = () => { mine.style.background = `hsl(${v.H} ${v.S}% ${v.L}%)`; };
		paintMine();
		$('.sliders', stage).oninput = (e) => { v[e.target.dataset.k] = +e.target.value; paintMine(); };
		const submit = () => {
			const err = rgbDist(hslToRgb(cfg.h, cfg.s, cfg.l), hslToRgb(v.H, v.S, v.L));
			ctx.done(err, `${err.toFixed(1)}% off`);
		};
		$('button', stage).onclick = submit;
		limit(ctx, PERC_MS, submit);
	},
});

/* ── Math Sprint: six sums, fastest wins ───────────────── */
const SPRINT_PENALTY_MS = 3000;

GAMES.push({
	id: 'sprint', name: 'Math Sprint', icon: '🧮', group: 'brain', lowerIsBetter: true,
	blurb: 'Six quick sums on a keypad. A wrong answer costs 3 seconds.',
	config(i) {
		const hi = 9 + i * 3;
		return { qs: Array.from({ length: 6 }, () => {
			const op = choice(['+', '−', '×']);
			let a = rint(2, hi + 3), b = rint(2, op === '×' ? Math.min(hi, 12) : hi + 3);
			if (op === '−' && b > a) [a, b] = [b, a];
			return { q: `${a} ${op} ${b}`, a: op === '+' ? a + b : op === '−' ? a - b : a * b };
		}) };
	},
	intro: () => `Answer six sums as fast as you can<br><small>It checks when you have typed enough digits. Wrong adds ${SPRINT_PENALTY_MS / 1000}s.</small>`,
	play(ctx) {
		const { stage, cfg } = ctx;
		stage.innerHTML = `<div class="lbl"></div><div class="sum"></div><div class="numout">–</div>${padHtml()}`;
		const lbl = $('.lbl', stage), sum = $('.sum', stage), out = $('.numout', stage);
		const t0 = performance.now();
		let i = 0, s = '', wrong = 0, busy = false;
		const show = () => { lbl.innerHTML = `Sum <b>${i + 1}/${cfg.qs.length}</b>`; sum.textContent = cfg.qs[i].q; s = ''; busy = false; out.textContent = '–'; };
		const check = () => {
			const ok = +s === cfg.qs[i].a;
			if (!ok) { wrong++; sfx.bad(); buzz(30); sum.animate([{ transform: 'translateX(-8px)' }, { transform: 'translateX(8px)' }, { transform: 'translateX(0)' }], 200); } else sfx.key();
			if (++i < cfg.qs.length) return show();
			const ms = performance.now() - t0 + wrong * SPRINT_PENALTY_MS;
			ctx.done(ms, `${secs(ms, 1)}s <small>${wrong} wrong</small>`);
		};
		show();
		$('.pad', stage).onclick = (e) => {
			const k = e.target.closest('button')?.textContent;
			if (!k || busy) return;
			if (k === '✓') return s && check();
			s = k === '⌫' ? s.slice(0, -1) : (s + k).slice(0, 4);
			out.textContent = s || '–';
			if (s.length === String(cfg.qs[i].a).length) { busy = true; ctx.after(120, check); } // long enough: check it, after a beat so the last digit shows
		};
		ctx.after(70000, () => ctx.fail('Too slow'));
	},
});

/* ── Simon: repeat the growing pattern ────────────────── */
const SIMON = [['#ff4d5e', 262], ['#4da3ff', 330], ['#3ddc84', 392], ['#ffd24d', 523]];

GAMES.push({
	id: 'simon', name: 'Simon', icon: '🔴', group: 'brain', lowerIsBetter: false,
	blurb: 'Watch the pads light up, then repeat the pattern. It grows each time.',
	config: () => ({ seq: Array.from({ length: 30 }, () => rint(0, 3)) }),
	intro: () => 'Watch the pattern, then <b>tap it back</b><br><small>One more step each time. First slip ends your run. Longest wins.</small>',
	play(ctx) {
		const { stage, cfg } = ctx;
		stage.innerHTML = `<div class="lbl">Watch…</div><div class="simon">${SIMON.map(([c], i) => `<button type="button" data-i="${i}" style="--k:${c}"></button>`).join('')}</div><div class="hint">Steps <b>0</b></div>`;
		const lbl = $('.lbl', stage), hint = $('.hint b', stage), pads = $$('.simon button', stage);
		let n = 1, pos = 0, done = 0, listening = false, idle = 0;
		const light = (i, loud) => {
			pads[i].classList.add('lit');
			if (loud) beep(SIMON[i][1], 240, { type: 'triangle', gain: 0.08 });
			setTimeout(() => pads[i].classList.remove('lit'), 260);
		};
		const end = () => ctx.done(done, `${done} ${done === 1 ? 'step' : 'steps'}`);
		const level = () => {
			listening = false;
			lbl.textContent = 'Watch…';
			for (let j = 0; j < n; j++) ctx.after(600 + j * 600, () => light(cfg.seq[j], audible(ctx)));
			ctx.after(600 + n * 600, () => {
				listening = true;
				pos = 0;
				lbl.innerHTML = 'Your turn';
				idle = setTimeout(() => ctx.alive() && end(), 8000);
			});
		};
		$('.simon', stage).onpointerdown = (e) => {
			const b = e.target.closest('button');
			if (!b || !listening) return;
			const i = +b.dataset.i;
			light(i, true);
			buzz(8);
			if (i !== cfg.seq[pos]) { clearTimeout(idle); sfx.bad(); return end(); }
			clearTimeout(idle);
			idle = setTimeout(() => ctx.alive() && end(), 8000);
			if (++pos < n) return;
			listening = false;
			done = n;
			hint.textContent = done;
			if (++n > cfg.seq.length) return end();
			ctx.after(700, level);
		};
		level();
	},
});

/* ── Number Rush: tap 1 to 16 in order ────────────────── */
const ORDER_PENALTY_MS = 1000;

GAMES.push({
	id: 'order', name: 'Number Rush', icon: '🔢', group: 'brain', lowerIsBetter: true,
	blurb: 'Sixteen scattered numbers. Tap them 1 to 16 in order.',
	config: () => ({ layout: shuffle(Array.from({ length: 16 }, (_, i) => i + 1)) }),
	intro: () => `Tap <b>1 to 16</b> in order, as fast as you can<br><small>A wrong tap adds ${ORDER_PENALTY_MS / 1000} second.</small>`,
	play(ctx) {
		const { stage, cfg } = ctx;
		const side = Math.max(120, Math.min(stage.clientWidth - 28, stage.clientHeight - 80, 320));
		stage.innerHTML = `<div class="lbl">Find <b>1</b></div><div class="rush" style="width:${side}px;height:${side}px">${cfg.layout.map((v) => `<button type="button" data-v="${v}">${v}</button>`).join('')}</div>`;
		const lbl = $('.lbl b', stage);
		const t0 = performance.now();
		let next = 1, wrong = 0;
		$('.rush', stage).onpointerdown = (e) => {
			const b = e.target.closest('button');
			if (!b || b.classList.contains('got')) return;
			if (+b.dataset.v !== next) { wrong++; b.classList.add('bad'); setTimeout(() => b.classList.remove('bad'), 250); sfx.bad(); buzz(30); return; }
			b.classList.add('got');
			sfx.key();
			if (++next <= 16) { lbl.textContent = next; return; }
			const ms = performance.now() - t0 + wrong * ORDER_PENALTY_MS;
			ctx.done(ms, `${secs(ms, 1)}s <small>${wrong} wrong</small>`);
		};
		ctx.after(60000, () => ctx.fail('Too slow'));
	},
});

/* ── Copy the Rhythm: hear it once, tap it back ────────── */
const RHYTHMS = [[1, 1, 2], [1, 0.5, 0.5, 1], [2, 1, 1], [0.5, 0.5, 1, 0.5, 0.5], [1, 1, 0.5, 0.5, 1]]; // gaps between notes, in beats
/* Mean ms between how far apart each pair of taps was and how far apart the pair of notes was; a tap that never came counts as TEMPO_MISS_MS. */
const rhythmErr = (taps, gaps, beat) => gaps.reduce((sum, g, k) => sum + (taps[k + 1] === undefined ? TEMPO_MISS_MS : Math.abs(taps[k + 1] - taps[k] - g * beat)), 0) / gaps.length;

GAMES.push({
	id: 'rhythm', name: 'Copy the Rhythm', icon: '🎶', group: 'rhythm', lowerIsBetter: true,
	blurb: 'Hear a short rhythm once, then tap it back. Only the spacing counts.',
	config: (i) => ({ gaps: RHYTHMS[i % RHYTHMS.length], beat: 60000 / pick([100, 90, 110, 100, 120], i) }),
	intro: () => 'Hear the rhythm once, then <b>tap it back</b><br><small>Start whenever you like. How the taps are spaced is what counts.</small>',
	play(ctx) {
		const { stage, cfg } = ctx;
		const { gaps, beat } = cfg, LEAD = 900;
		const at = gaps.reduce((a, g) => [...a, a[a.length - 1] + g * beat], [0]); // when each note sounds
		const total = at[at.length - 1];
		stage.innerHTML = `${orbHtml(at.length)}<div class="tl">${at.map((t) => `<i style="left:${(t / total) * 100}%"></i>`).join('')}</div><div class="lbl">Listen…</div>`;
		const ui = orbUi(stage), dots = $$('.tl i', stage), lbl = $('.lbl', stage);
		const taps = [];
		let listening = false;
		const finish = () => {
			if (taps.length < 2) return ctx.fail('No taps');
			const err = rhythmErr(taps, gaps, beat);
			ctx.done(err, `±${Math.round(err)} ms`);
		};
		at.forEach((t, k) => ctx.after(LEAD + t, () => {
			ui.ring();
			dots[k].classList.add('on');
			if (audible(ctx)) beep(740, 110, { type: 'triangle', gain: 0.08 });
		}));
		ctx.after(LEAD + total + 500, () => {
			listening = true;
			dots.forEach((d) => d.classList.remove('on'));
			lbl.innerHTML = `Your turn · <b>0/${at.length}</b>`;
		});
		stage.onpointerdown = (e) => {
			if (!listening || taps.length >= at.length) return;
			const t = tsOf(e), k = taps.length;
			taps.push(t);
			ui.ring();
			k ? ui.pip(k, t - taps[k - 1] - gaps[k - 1] * beat) : ui.say('first tap · go on');
			buzz(8);
			sfx.key();
			lbl.innerHTML = `Your turn · <b>${taps.length}/${at.length}</b>`;
			if (taps.length === at.length) ctx.after(500, finish);
		};
		ctx.after(LEAD + total + 500 + total * 3 + 5000, finish);
	},
});

/* ── Dots & Boxes: close a box, go again ──────────────── */
const BOXES = 4; // boxes along each side

GAMES.push({
	id: 'boxes', name: 'Dots & Boxes', icon: '▦', group: 'brain', lowerIsBetter: false, duel: true,
	blurb: 'Draw lines between dots. Close a box to claim it and go again.',
	config: (i) => ({ first: i % 2 }),
	intro: (c) => `Take turns drawing a line between two dots<br><small>Close the fourth side of a box to claim it and draw again. Most boxes wins. ${esc(nameOf(c.first))} starts.</small>`,
	play(c0, c1) {
		const cs = [c0, c1];
		const size = 2 * BOXES + 1;
		const edge = {}; // "row,col" of a line, with the player who drew it
		const own = {}; // "row,col" of a box, with the player who closed it
		const score = [0, 0];
		let turn = c0.cfg.first, left = 2 * BOXES * (BOXES + 1), over = false;
		const taken = (r, c) => edge[`${r},${c}`] !== undefined;
		const closed = (r, c) => taken(r - 1, c) && taken(r + 1, c) && taken(r, c - 1) && taken(r, c + 1);

		function render() {
			cs.forEach((c) => {
				const status = over ? (score[0] === score[1] ? 'A draw' : `<b>${esc(nameOf(score[0] > score[1] ? 0 : 1))}</b> wins!`) : turn === c.p ? `<b>${esc(nameOf(c.p))}</b>, your line` : `${esc(nameOf(turn))} is drawing…`;
				let cells = '';
				for (let r = 0; r < size; r++) {
					for (let col = 0; col < size; col++) {
						const key = `${r},${col}`;
						if (r % 2 === 0 && col % 2 === 0) cells += '<i class="pt"></i>';
						else if (r % 2 !== col % 2) cells += `<button class="edge ${r % 2 ? 'v' : 'h'}${taken(r, col) ? ' on' : ''}" type="button" data-e="${key}" style="--c:var(--p${edge[key] ?? 0})" aria-label="line"></button>`;
						else cells += `<i class="box${own[key] === undefined ? '' : ' own'}" style="--c:var(--p${own[key] ?? 0})">${own[key] === undefined ? '' : initialOf(own[key])}</i>`;
					}
				}
				c.stage.innerHTML = `<div class="dhead">${status} · <b>${score[c.p]}</b> – <b>${score[1 - c.p]}</b></div><div class="dab" style="--n:${BOXES}">${cells}</div>`;
				c.stage.onclick = (e) => {
					const b = e.target.closest('.edge');
					if (b) draw(c.p, b.dataset.e);
				};
			});
		}

		function draw(p, key) {
			if (over || p !== turn || edge[key] !== undefined) return;
			edge[key] = p;
			left--;
			const [r, c] = key.split(',').map(Number);
			const next = r % 2 === 0 ? [[r - 1, c], [r + 1, c]] : [[r, c - 1], [r, c + 1]]; // the one or two boxes this line touches
			let got = 0;
			next.forEach(([br, bc]) => {
				if (br < 1 || bc < 1 || br > size - 2 || bc > size - 2 || own[`${br},${bc}`] !== undefined || !closed(br, bc)) return;
				own[`${br},${bc}`] = p;
				score[p]++;
				got++;
			});
			got ? sfx.lock() : sfx.key();
			if (!left) {
				over = true;
				render();
				cs[0].after(1200, () => cs.forEach((x) => x.done(score[x.p], `${score[x.p]} boxes`)));
				return;
			}
			if (!got) turn = 1 - p; // closing a box earns another line
			render();
			focus(turn);
		}

		render();
		focus(turn);
	},
});
