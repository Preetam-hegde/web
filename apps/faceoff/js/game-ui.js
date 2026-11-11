'use strict';

/* Shared controls and canvas helpers; game rules live in rules.js. */
const pick = (list, i) => list[i % list.length];

const rint = (a, b) => Math.floor(rand(a, b + 1));
const padHtml = () =>
	`<div class="pad">${[1, 2, 3, 4, 5, 6, 7, 8, 9, '⌫', 0, '✓'].map((k) => `<button type="button">${k}</button>`).join('')}</div>`;
const audible = (ctx) => net || m.pass || ctx.p === 0; // one phone in split screen shares a speaker, so only one pane plays shared sounds

const PERC_MS = 12000; // time to answer once the question is on screen

const ink = (stage) =>
	getComputedStyle(stage).getPropertyValue('--c').trim() || '#fff';
const flippedStage = (stage) =>
	getComputedStyle(stage.parentElement).transform !== 'none'; // the top player's half is turned 180°

/* Pointer position inside el as 0..1 on each axis, mirrored on the flipped half. */
function unitIn(el, e, flipped) {
	const r = el.getBoundingClientRect();
	return [
		(flipped ? r.right - e.clientX : e.clientX - r.left) / r.width,
		(flipped ? r.bottom - e.clientY : e.clientY - r.top) / r.height,
	];
}

/* Canvas size that fits the pane: [width, height, dpr]. reserve = room left for the text and buttons around it. */
function sized(stage, aspect, maxW, reserve = 100) {
	const w = Math.max(
		120,
		Math.round(
			Math.min(
				stage.clientWidth - 24,
				maxW,
				(stage.clientHeight - reserve) / aspect,
			),
		),
	);
	return [w, Math.round(w * aspect), Math.min(devicePixelRatio || 1, 2)];
}
const canvasHtml = (w, h, dpr) =>
	`<canvas width="${w * dpr}" height="${h * dpr}" style="width:${w}px;height:${h}px"></canvas>`;

/* Drains the .bar in the stage over ms, then calls onEnd. */
function limit(ctx, ms, onEnd) {
	const fill = $('.bar i', ctx.stage),
		t0 = performance.now();
	ctx.loop(() => {
		const k = (performance.now() - t0) / ms;
		fill.style.width = `${Math.max(0, 1 - k) * 100}%`;
		if (k >= 1) {
			onEnd();
			return false;
		}
	});
}

/* A fixed beat marker and numbered tap record. off = tap time minus the beat, in ms. */
const orbHtml = (pips) =>
	`<div class="beat-instrument" data-phase="guide"><div class="beat-head"><span class="beat-mode">Guide beats</span><span class="beat-count">Listen</span></div><div class="orb"><i class="core beat-marker" aria-hidden="true"></i><span class="beat-number" aria-hidden="true">—</span></div><div class="pips" aria-label="Your taps">${Array.from({ length: pips }, (_, i) => `<span aria-label="Tap ${i + 1}: waiting">${i + 1}</span>`).join('')}</div><div class="fb" aria-label="Timing feedback" aria-live="polite">— ms</div></div>`;
function orbUi(stage, ctx) {
	const orb = $('.orb', stage),
		fb = $('.fb', stage),
		pips = $$('.pips span', stage),
		instrument = $('.beat-instrument', stage),
		mode = $('.beat-mode', stage),
		count = $('.beat-count', stage),
		number = $('.beat-number', stage);
	let pulse = 0;
	ctx.onCleanup(() => clearTimeout(pulse));
	return {
		guide(i, total) {
			count.textContent = `${i + 1} / ${total}`;
			number.textContent = String(i + 1).padStart(2, '0');
		},
		input() {
			instrument.dataset.phase = 'input';
			mode.textContent = 'Your turn';
			count.textContent = `0 / ${pips.length}`;
			number.textContent = '—';
			fb.textContent = '— ms';
		},
		ring() {
			clearTimeout(pulse);
			orb.classList.add('on');
			pulse = setTimeout(() => orb.classList.remove('on'), 110);
		},
		pip(i, off) {
			count.textContent = `${i + 1} / ${pips.length}`;
			number.textContent = String(i + 1).padStart(2, '0');
			if (off === undefined) {
				pips[i].className = 'start';
				pips[i].setAttribute('aria-label', `Tap ${i + 1}: start`);
				fb.textContent = 'First tap · keep going';
				return;
			}
			const a = Math.abs(off),
				grade = a < 40 ? 'g' : a < 90 ? 'y' : 'r';
			if (pips[i]) {
				pips[i].className = grade;
				pips[i].setAttribute(
					'aria-label',
					`Tap ${i + 1}: ${Math.round(a)} milliseconds ${off > 0 ? 'late' : 'early'}`,
				);
			}
			fb.textContent =
				a < 40
					? `${off > 0 ? '+' : '−'}${Math.round(a)} ms · perfect`
					: `${off > 0 ? '+' : '−'}${Math.round(a)} ms · ${off > 0 ? 'late' : 'early'}`;
			fb.className = `fb ${grade}`;
		},
		say(text) {
			fb.innerHTML = text;
			fb.className = 'fb';
		},
	};
}
