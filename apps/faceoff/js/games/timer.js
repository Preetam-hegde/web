'use strict';

/* Timing duels. Each stage is its own little game; the closest to the target (or the most taps) wins. */

const signed = (ms) => `${ms < 0 ? '−' : '+'}${secs(Math.abs(ms), 3)}s`;

/* Score = how far from the target you stopped. */
function stopAt(ctx, ms) {
	const off = ms - ctx.cfg.target;
	ctx.done(Math.abs(off), `${secs(ms, 3)}s <small>${signed(off)}</small>`);
}

const pick = (list, i) => list[i % list.length];

GAMES.push({
	id: 'stop', name: 'Stop the Timer', icon: '⏱️', group: 'Timing', lowerIsBetter: true,
	blurb: 'Stop it on target. The digits vanish after 2s.',
	config: (i) => ({ target: pick([10, 7, 12, 5, 15, 9, 6], i) * 1000, hideAt: 2000 }),
	intro: (c) => `Stop the timer at <b>${secs(c.target)}</b><br><small>Digits vanish after ${c.hideAt / 1000}s. Tap anywhere.</small>`,
	play(ctx) {
		const { stage, cfg } = ctx;
		stage.innerHTML = '<div class="readout">0.00</div><div class="hint">tap to stop</div>';
		const ro = $('.readout', stage);
		const t0 = performance.now();
		ctx.loop(() => {
			const e = performance.now() - t0;
			ro.textContent = e < cfg.hideAt ? secs(e) : '· · ·';
			if (e > cfg.target * 2) ctx.fail('Timed out');
		});
		stage.onpointerdown = (e) => stopAt(ctx, tsOf(e) - t0);
	},
});

GAMES.push({
	id: 'liar', name: 'Liar Clock', icon: '🤥', group: 'Timing', lowerIsBetter: true,
	blurb: 'The clock runs at the wrong speed. Trust your gut, not the screen.',
	config: (i) => ({ target: pick([8, 6, 10, 5, 12], i) * 1000, speed: pick([1.7, 0.6, 1.4, 0.7, 1.9], i) }),
	intro: (c) => `Stop at <b>${secs(c.target)}</b> real seconds<br><small>The clock is lying about its speed.</small>`,
	play(ctx) {
		const { stage, cfg } = ctx;
		stage.innerHTML = '<div class="readout">0.00</div><div class="hint">tap to stop</div>';
		const ro = $('.readout', stage);
		const t0 = performance.now();
		ctx.loop(() => {
			const e = performance.now() - t0;
			ro.textContent = secs(e * cfg.speed);
			if (e > cfg.target * 2) ctx.fail('Timed out');
		});
		stage.onpointerdown = (e) => stopAt(ctx, tsOf(e) - t0);
	},
});

GAMES.push({
	id: 'feel', name: 'Feel the Time', icon: '🙈', group: 'Timing', lowerIsBetter: true,
	blurb: 'Start your own clock, then stop it by feel. The screen goes dark.',
	config: (i) => ({ target: pick([10, 15, 7, 20, 12], i) * 1000 }),
	intro: (c) => `Tap to start, tap again at <b>${secs(c.target)}</b><br><small>No clock. Close your eyes if you dare.</small>`,
	play(ctx) {
		const { stage, cfg } = ctx;
		stage.innerHTML = '<div class="lbl">Tap to <b>start</b></div>';
		let t0 = 0;
		ctx.after(15000, () => !t0 && ctx.fail('Never started'));
		stage.onpointerdown = (e) => {
			if (t0) return stopAt(ctx, tsOf(e) - t0);
			t0 = tsOf(e);
			stage.classList.add('dark');
			stage.innerHTML = '<div class="faint">· · ·</div>'; // static on purpose: any animation would leak the rhythm
			ctx.after(cfg.target * 2, () => ctx.fail('Timed out'));
		};
	},
});

GAMES.push({
	id: 'hold', name: 'Hold It', icon: '✊', group: 'Timing', lowerIsBetter: true,
	blurb: 'Press and hold for exactly the right time, then let go.',
	config: (i) => ({ target: pick([5, 3, 7, 10, 4], i) * 1000, hideAt: 1000 }),
	intro: (c) => `Press and hold for <b>${secs(c.target)}</b>, then let go<br><small>The clock hides after ${c.hideAt / 1000}s.</small>`,
	play(ctx) {
		const { stage, cfg } = ctx;
		stage.innerHTML = '<div class="lbl">Press &amp; <b>hold</b></div>';
		let t0 = 0;
		ctx.after(15000, () => !t0 && ctx.fail('Never pressed'));
		stage.onpointerdown = (e) => {
			if (t0) return;
			t0 = tsOf(e);
			stage.setPointerCapture?.(e.pointerId);
			stage.innerHTML = '<div class="readout">0.00</div>';
			const ro = $('.readout', stage);
			ctx.loop(() => {
				const held = performance.now() - t0;
				ro.textContent = held < cfg.hideAt ? secs(held) : '· · ·';
				if (held > cfg.target * 2) ctx.fail('Held too long');
			});
		};
		stage.onpointerup = stage.onpointercancel = (e) => t0 && stopAt(ctx, tsOf(e) - t0);
	},
});

GAMES.push({
	id: 'centre', name: 'Dead Centre', icon: '🎯', group: 'Timing', lowerIsBetter: true,
	blurb: 'A dot sweeps the bar. Freeze it in the middle.',
	config: (i) => ({ period: pick([1600, 1300, 1000, 800, 650], i) }),
	intro: () => 'Tap to freeze the dot on the <b>centre</b><br><small>It gets faster every round.</small>',
	play(ctx) {
		const { stage, cfg } = ctx;
		stage.innerHTML = '<div class="track"><i class="zone"></i><i class="dot"></i></div><div class="hint">tap to freeze</div>';
		const dot = $('.dot', stage);
		const t0 = performance.now();
		const at = (t) => { const k = ((t - t0) / cfg.period) % 1; return k < 0.5 ? k * 2 : 2 - k * 2; }; // 0 → 1 → 0
		ctx.loop(() => {
			dot.style.left = `${at(performance.now()) * 100}%`;
			if (performance.now() - t0 > 12000) ctx.fail('Too slow');
		});
		stage.onpointerdown = (e) => {
			const off = Math.abs(at(tsOf(e)) - 0.5) * 200;
			ctx.done(off, `${off.toFixed(1)}% off`);
		};
	},
});

GAMES.push({
	id: 'frenzy', name: 'Tap Frenzy', icon: '👆', group: 'Timing', lowerIsBetter: false,
	blurb: 'Most taps before time runs out wins.',
	config: (i) => ({ secs: pick([8, 10, 6, 10, 8], i) }),
	intro: (c) => `Tap as fast as you can for <b>${c.secs}s</b><br><small>Any finger counts.</small>`,
	play(ctx) {
		const { stage, cfg } = ctx;
		stage.innerHTML = '<div class="readout">0</div><div class="bar"><i></i></div><div class="hint">TAP!</div>';
		const ro = $('.readout', stage);
		const fill = $('.bar i', stage);
		const t0 = performance.now();
		let n = 0;
		stage.onpointerdown = () => {
			ro.textContent = ++n;
			ro.animate([{ transform: 'scale(1.18)' }, { transform: 'scale(1)' }], 90);
		};
		ctx.loop(() => {
			const k = (performance.now() - t0) / (cfg.secs * 1000);
			fill.style.width = `${Math.max(0, 1 - k) * 100}%`;
			if (k >= 1) { ctx.done(n, `${n} taps`); return false; }
		});
	},
});
