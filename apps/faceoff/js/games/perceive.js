'use strict';

/* Perception duels, after Perceptle's five tests: Count, Track, Angle, Tempo and Split.
   Every score is an error, so lower wins. Both players get the same dots, arc, angle, beat and fraction each round.
   pick() comes from timer.js. */

const PERC_MS = 12000; // time to answer once the question is on screen

const ink = (stage) => getComputedStyle(stage).getPropertyValue('--c').trim() || '#fff';
const flippedStage = (stage) => getComputedStyle(stage.parentElement).transform !== 'none'; // the top player's half is turned 180°

/* Pointer position inside el as 0..1 on each axis, mirrored on the flipped half. */
function unitIn(el, e, flipped) {
	const r = el.getBoundingClientRect();
	return [(flipped ? r.right - e.clientX : e.clientX - r.left) / r.width, (flipped ? r.bottom - e.clientY : e.clientY - r.top) / r.height];
}

/* Canvas size that fits the pane: [width, height, dpr]. reserve = room left for the text and buttons around it. */
function sized(stage, aspect, maxW, reserve = 100) {
	const w = Math.max(120, Math.round(Math.min(stage.clientWidth - 24, maxW, (stage.clientHeight - reserve) / aspect)));
	return [w, Math.round(w * aspect), Math.min(devicePixelRatio || 1, 2)];
}
const canvasHtml = (w, h, dpr) => `<canvas width="${w * dpr}" height="${h * dpr}" style="width:${w}px;height:${h}px"></canvas>`;

/* Drains the .bar in the stage over ms, then calls onEnd. */
function limit(ctx, ms, onEnd) {
	const fill = $('.bar i', ctx.stage), t0 = performance.now();
	ctx.loop(() => {
		const k = (performance.now() - t0) / ms;
		fill.style.width = `${Math.max(0, 1 - k) * 100}%`;
		if (k >= 1) { onEnd(); return false; }
	});
}

const angleErr = (a, b) => { const d = Math.abs(a - b) % 360; return Math.min(d, 360 - d); }; // 359° and 1° are 2° apart

/* Mean ms between each tap and where beat k+1 after t4 should fall; a tap that never came counts as TEMPO_MISS_MS. */
const TEMPO_TAPS = 8;
const TEMPO_MISS_MS = 400;
const tempoErr = (taps, t4, gap) => Array.from({ length: TEMPO_TAPS }, (_, k) => (k < taps.length ? Math.abs(taps[k] - (t4 + (k + 1) * gap)) : TEMPO_MISS_MS)).reduce((a, b) => a + b) / TEMPO_TAPS;

GAME_ICONS.count = '<line x1="4" x2="20" y1="9" y2="9"/><line x1="4" x2="20" y1="15" y2="15"/><line x1="10" x2="8" y1="3" y2="21"/><line x1="16" x2="14" y1="3" y2="21"/>';
GAME_ICONS.track = '<circle cx="12" cy="12" r="10"/><line x1="22" x2="18" y1="12" y2="12"/><line x1="6" x2="2" y1="12" y2="12"/><line x1="12" x2="12" y1="6" y2="2"/><line x1="12" x2="12" y1="22" y2="18"/>';
GAME_ICONS.angle = '<path d="M3 21h18"/><path d="M3 21 17 7"/><path d="M11 21a8 8 0 0 0-2.34-5.66"/>';
GAME_ICONS.tempo = '<path d="M22 12h-2.48a2 2 0 0 0-1.93 1.46l-2.35 8.36a.25.25 0 0 1-.48 0L9.24 2.18a.25.25 0 0 0-.48 0l-2.35 8.36A2 2 0 0 1 4.49 12H2"/>';
GAME_ICONS.split = '<path d="M3 12h18"/><path d="M3 8v8"/><path d="M21 8v8"/><path d="M9 6v12"/>';

/* ── Count: dots flash, then type how many ──────────── */
GAMES.push({
	id: 'count', name: 'Count', icon: '🔢', group: 'perception', lowerIsBetter: true,
	blurb: 'Dots flash for two seconds. How many were there?',
	config() {
		const n = Math.round(rand(45, 85)), dots = [];
		while (dots.length < n) { // keep dots apart so none hide behind another
			const d = [rand(0.04, 0.96), rand(0.04, 0.96)];
			if (dots.every((q) => Math.hypot(q[0] - d[0], q[1] - d[1]) > 0.055)) dots.push(d);
		}
		return { n, dots };
	},
	intro: () => 'Dots flash for <b>2 seconds</b>. Then say how many.<br><small>Estimate, no time to count them all.</small>',
	play(ctx) {
		const { stage, cfg } = ctx;
		const [S, , dpr] = sized(stage, 1, 360);
		stage.innerHTML = `${canvasHtml(S, S, dpr)}<div class="hint">Count them…</div>`;
		const g = $('canvas', stage).getContext('2d');
		g.scale(dpr, dpr);
		g.fillStyle = ink(stage);
		cfg.dots.forEach(([x, y]) => { g.beginPath(); g.arc(x * S, y * S, S * 0.017, 0, 6.2832); g.fill(); });

		ctx.after(2000, () => {
			let s = '';
			stage.innerHTML = `<div class="lbl">How many dots?</div><div class="numout">–</div><div class="pad">${[1, 2, 3, 4, 5, 6, 7, 8, 9, '⌫', 0, '✓'].map((k) => `<button type="button">${k}</button>`).join('')}</div><div class="bar"><i></i></div>`;
			const out = $('.numout', stage);
			const submit = () => {
				if (!s) return ctx.fail('No answer');
				const err = (Math.abs(+s - cfg.n) / cfg.n) * 100;
				ctx.done(err, `${+s} <small>of ${cfg.n} · ${err.toFixed(0)}% off</small>`);
			};
			$('.pad', stage).onclick = (e) => {
				const k = e.target.closest('button')?.textContent;
				if (!k) return;
				sfx.key();
				if (k === '✓') return s && submit();
				s = k === '⌫' ? s.slice(0, -1) : (s + k).slice(0, 3);
				out.textContent = s || '–';
			};
			limit(ctx, PERC_MS, submit);
		});
	},
});

/* ── Track: a ball flies, vanishes, tap where it lands ─ */
GAMES.push({
	id: 'track', name: 'Track', icon: '🏀', group: 'perception', lowerIsBetter: true,
	blurb: 'A ball flies, then vanishes mid-air. Tap where it lands.',
	config(i) {
		const dir = Math.random() < 0.5 ? 1 : -1;
		const from = dir > 0 ? rand(0.08, 0.3) : rand(0.7, 0.92);
		// seen = how much of the flight you get to watch; it shrinks each round
		return { from, land: from + dir * rand(0.35, 0.62), lift: rand(0.4, 0.75), ms: rand(1100, 1600), seen: pick([0.62, 0.56, 0.5, 0.45, 0.4], i) };
	},
	intro: () => 'Watch the ball, it <b>vanishes</b> mid-air.<br><small>Then tap the spot on the ground where it lands.</small>',
	play(ctx) {
		const { stage, cfg } = ctx;
		const [W, H, dpr] = sized(stage, 0.62, 440);
		stage.innerHTML = `${canvasHtml(W, H, dpr)}<div class="hint">Watch the ball…</div>`;
		const cv = $('canvas', stage), g = cv.getContext('2d'), hint = $('.hint', stage), color = ink(stage), flip = flippedStage(stage);
		g.scale(dpr, dpr);
		const G = H * 0.86; // ground
		const at = (s) => [(cfg.from + (cfg.land - cfg.from) * s) * W, G * (1 - cfg.lift * 4 * s * (1 - s))];
		const dot = (x, y, r) => { g.beginPath(); g.arc(x, y, r, 0, 6.2832); g.fill(); };
		const t0 = performance.now();
		let armed = false;
		ctx.loop(() => {
			const s = Math.min((performance.now() - t0) / cfg.ms, cfg.seen), gone = s >= cfg.seen;
			g.clearRect(0, 0, W, H);
			g.fillStyle = '#3b3659';
			g.fillRect(0, G, W, 2);
			g.fillStyle = color;
			g.globalAlpha = 0.45;
			for (let k = 0; k < s; k += 0.025) dot(...at(k), 2.5); // the path so far
			g.globalAlpha = 1;
			if (!gone) return dot(...at(s), 8);
			armed = true;
			hint.textContent = 'Tap where it lands';
			return false;
		});
		cv.onpointerdown = (e) => {
			if (!armed) return;
			const err = Math.abs(unitIn(cv, e, flip)[0] - cfg.land) * 100; // % of the width
			ctx.done(err, `${err.toFixed(1)}% off`);
		};
		ctx.after(cfg.ms * cfg.seen + 8000, () => ctx.fail('No tap'));
	},
});

/* ── Angle: swing a line round to the angle shown ───── */
GAMES.push({
	id: 'angle', name: 'Angle', icon: '📐', group: 'perception', lowerIsBetter: true,
	blurb: 'Swing a line round to the angle on screen. No protractor.',
	config: () => ({ deg: Math.round(rand(10, 350)) }),
	intro: (c) => `Turn the line to <b>${c.deg}°</b><br><small>Counter-clockwise from the dashed line. ${PERC_MS / 1000}s.</small>`,
	play(ctx) {
		const { stage, cfg } = ctx;
		const [S, , dpr] = sized(stage, 1, 340, 130);
		stage.innerHTML = `<div class="lbl"><b>${cfg.deg}°</b> from the dashed line</div>${canvasHtml(S, S, dpr)}<div class="bar"><i></i></div><button class="btn" type="button" disabled>Lock</button>`;
		const cv = $('canvas', stage), g = cv.getContext('2d'), btn = $('button', stage), color = ink(stage), flip = flippedStage(stage);
		g.scale(dpr, dpr);
		const c = S / 2, R = S * 0.42;
		let deg = null;
		const draw = () => {
			g.clearRect(0, 0, S, S);
			g.lineWidth = 3;
			g.strokeStyle = '#5b5580';
			g.setLineDash([6, 6]);
			g.beginPath(); g.moveTo(c, c); g.lineTo(c + R, c); g.stroke();
			g.setLineDash([]);
			if (deg !== null) {
				g.strokeStyle = color;
				g.beginPath(); g.moveTo(c, c); g.lineTo(c + R * Math.cos((deg * Math.PI) / 180), c - R * Math.sin((deg * Math.PI) / 180)); g.stroke();
			}
			g.fillStyle = '#fff';
			g.beginPath(); g.arc(c, c, 5, 0, 6.2832); g.fill();
		};
		draw();
		const aim = (e) => {
			const [x, y] = unitIn(cv, e, flip);
			if (Math.hypot(x - 0.5, y - 0.5) < 0.06) return; // too close to the pivot to point anywhere
			deg = ((Math.atan2(0.5 - y, x - 0.5) * 180) / Math.PI + 360) % 360;
			btn.disabled = false;
			draw();
		};
		cv.onpointerdown = (e) => { cv.setPointerCapture?.(e.pointerId); aim(e); };
		cv.onpointermove = (e) => e.buttons && aim(e);
		const submit = () => {
			if (deg === null) return ctx.fail('No answer');
			const err = angleErr(deg, cfg.deg);
			ctx.done(err, `${err.toFixed(1)}° off`);
		};
		btn.onclick = submit;
		limit(ctx, PERC_MS, submit);
	},
});

/* ── Tempo: hear four beats, keep the rhythm in silence ─ */
GAMES.push({
	id: 'tempo', name: 'Tempo', icon: '🥁', group: 'perception', lowerIsBetter: true,
	blurb: 'Hear four beats, then keep the rhythm going in silence.',
	config: (i) => ({ gap: 60000 / pick([100, 80, 120, 90, 140, 110], i) }),
	intro: () => `Listen to <b>four beats</b>, then tap ${TEMPO_TAPS} more in the same rhythm<br><small>The sound stops. Keep the tempo. Sound on helps.</small>`,
	play(ctx) {
		const { stage, cfg } = ctx;
		const T = cfg.gap, LEAD = 900;
		stage.innerHTML = '<div class="beat"></div><div class="lbl">Listen…</div>';
		const light = $('.beat', stage), lbl = $('.lbl', stage);
		const flash = () => { light.classList.add('on'); setTimeout(() => light.classList.remove('on'), 120); };
		const taps = [];
		let t4 = 0; // when the last guide beat sounded; the silent beats are measured from here
		for (let k = 0; k < 4; k++) {
			ctx.after(LEAD + k * T, () => {
				flash();
				if (net || m.pass || ctx.p === 0) sfx.tick(); // one phone in split screen shares a speaker, so only one pane makes the sound
				if (k === 3) { t4 = performance.now(); lbl.innerHTML = `Keep it going <b>0/${TEMPO_TAPS}</b>`; }
			});
		}
		const finish = () => {
			if (!taps.length) return ctx.fail('No taps');
			const err = tempoErr(taps, t4, T);
			ctx.done(err, `±${Math.round(err)} ms`);
		};
		stage.onpointerdown = (e) => {
			const t = tsOf(e);
			if (!t4 || t < t4 + T / 2 || taps.length >= TEMPO_TAPS) return; // taps on the guide beats don't count
			taps.push(t);
			flash();
			lbl.innerHTML = `Keep it going <b>${taps.length}/${TEMPO_TAPS}</b>`;
			if (taps.length === TEMPO_TAPS) finish();
		};
		ctx.after(LEAD + (3 + TEMPO_TAPS) * T + 2500, finish);
	},
});

/* ── Split: drag a marker to a fraction of a bare line ─ */
const SPLITS = [
	() => { const p = Math.round(rand(8, 92)); return [`${p}%`, p / 100]; },
	() => { const d = Math.floor(rand(3, 11)), n = 1 + Math.floor(rand(0, d - 1)); return [`${n}/${d}`, n / d]; },
];

GAMES.push({
	id: 'split', name: 'Split', icon: '↔️', group: 'perception', lowerIsBetter: true,
	blurb: 'Mark 37%, or 3/8, of the way along a bare line.',
	config(i) {
		const [text, at] = SPLITS[i % SPLITS.length]();
		return { text, at };
	},
	intro: (c) => `Mark <b>${c.text}</b> of the way along the line<br><small>Drag the marker, then lock it in. ${PERC_MS / 1000}s.</small>`,
	play(ctx) {
		const { stage, cfg } = ctx;
		stage.innerHTML = `<div class="lbl">Mark <b>${cfg.text}</b></div><div class="track"><i class="dot" hidden></i></div><div class="bar"><i></i></div><button class="btn" type="button" disabled>Lock</button>`;
		const line = $('.track', stage), dot = $('.dot', stage), btn = $('button', stage), flip = flippedStage(stage);
		let pos = null;
		const aim = (e) => {
			pos = Math.min(1, Math.max(0, unitIn(line, e, flip)[0]));
			dot.hidden = false;
			dot.style.left = `${pos * 100}%`;
			btn.disabled = false;
		};
		// The whole pane is the touch area (the line itself is thin); the Lock button keeps its own taps.
		stage.onpointerdown = (e) => {
			if (e.target.closest('button')) return;
			stage.setPointerCapture?.(e.pointerId);
			aim(e);
		};
		stage.onpointermove = (e) => e.buttons && !e.target.closest('button') && aim(e);
		const submit = () => {
			if (pos === null) return ctx.fail('No answer');
			const err = Math.abs(pos - cfg.at) * 100; // % of the line's length
			ctx.done(err, `${err.toFixed(1)}% off`);
		};
		btn.onclick = submit;
		limit(ctx, PERC_MS, submit);
	},
});
