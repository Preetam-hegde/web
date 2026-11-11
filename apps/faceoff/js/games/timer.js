(() => {
	'use strict';

	/* Timing duels. Each stage is its own little game; the closest to the target (or the most taps) wins. */

	const signed = (ms) => `${ms < 0 ? '−' : '+'}${secs(Math.abs(ms), 3)}s`;
	const timerInstrument = (target, value, caption, action) =>
		`<div class="timer-instrument"><div class="instrument-meta"><span class="instrument-label">Target interval</span><span class="instrument-target">${secs(target)} <span class="instrument-unit">s</span></span></div><div class="timer-face"><div class="readout">${value}</div><span class="readout-unit">s</span></div><div class="timer-scale" aria-hidden="true">${'<i></i>'.repeat(21)}</div><div class="instrument-caption">${caption}</div><div class="instrument-action">${action}</div></div>`;

	/* Score = how far from the target you stopped. */
	function stopAt(ctx, ms) {
		const off = ms - ctx.cfg.target;
		ctx.done(Math.abs(off), `${secs(ms, 3)}s <small>${signed(off)}</small>`);
	}

	registerGame({
		id: 'stop',
		name: 'Stop the Timer',
		icon: '⏱️',
		group: 'timing',
		lowerIsBetter: true,
		blurb: 'Stop it on target. The digits vanish after 2s.',
		config: (i) => ({
			target: pick([10, 7, 12, 5, 15, 9, 6], i) * 1000,
			hideAt: 2000,
		}),
		intro: (c) =>
			`Stop the timer at <b>${secs(c.target)}</b><br><small>Digits vanish after ${c.hideAt / 1000}s. Tap anywhere.</small>`,
		play(ctx) {
			const { stage, cfg } = ctx;
			stage.innerHTML = timerInstrument(
				cfg.target,
				'0.00',
				`Digits hide after ${cfg.hideAt / 1000} seconds`,
				'Tap anywhere to stop',
			);
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

	registerGame({
		id: 'liar',
		name: 'Liar Clock',
		icon: '🤥',
		group: 'timing',
		lowerIsBetter: true,
		blurb: 'The clock runs at the wrong speed. Trust your gut, not the screen.',
		config: (i) => ({
			target: pick([8, 6, 10, 5, 12], i) * 1000,
			speed: pick([1.7, 0.6, 1.4, 0.7, 1.9], i),
		}),
		intro: (c) =>
			`Stop at <b>${secs(c.target)}</b> real seconds<br><small>The clock is lying about its speed.</small>`,
		play(ctx) {
			const { stage, cfg } = ctx;
			stage.innerHTML = timerInstrument(
				cfg.target,
				'0.00',
				'This clock runs at an altered speed',
				'Tap anywhere to stop',
			);
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

	registerGame({
		id: 'feel',
		name: 'Feel the Time',
		icon: '🙈',
		group: 'timing',
		lowerIsBetter: true,
		blurb: 'Start your own clock, then stop it by feel. The screen goes dark.',
		config: (i) => ({ target: pick([10, 15, 7, 20, 12], i) * 1000 }),
		intro: (c) =>
			`Tap to start, tap again at <b>${secs(c.target)}</b><br><small>No clock. Close your eyes if you dare.</small>`,
		play(ctx) {
			const { stage, cfg } = ctx;
			stage.innerHTML = timerInstrument(
				cfg.target,
				'—',
				'Keep the interval in your head',
				'Tap to start',
			);
			let t0 = 0;
			ctx.after(15000, () => !t0 && ctx.fail('Never started'));
			stage.onpointerdown = (e) => {
				if (t0) return stopAt(ctx, tsOf(e) - t0);
				t0 = tsOf(e);
				stage.classList.add('dark');
				stage.innerHTML = timerInstrument(
					cfg.target,
					'· · ·',
					'Clock hidden · trust your timing',
					'Tap to stop',
				);
				$('.timer-instrument', stage).classList.add('timer-hidden'); // no animation or progress: either would leak the interval
				ctx.after(cfg.target * 2, () => ctx.fail('Timed out'));
			};
		},
	});

	registerGame({
		id: 'hold',
		name: 'Hold It',
		icon: '✊',
		group: 'timing',
		lowerIsBetter: true,
		blurb: 'Press and hold for exactly the right time, then let go.',
		config: (i) => ({ target: pick([5, 3, 7, 10, 4], i) * 1000, hideAt: 1000 }),
		intro: (c) =>
			`Press and hold for <b>${secs(c.target)}</b>, then let go<br><small>The clock hides after ${c.hideAt / 1000}s.</small>`,
		play(ctx) {
			const { stage, cfg } = ctx;
			stage.innerHTML = timerInstrument(
				cfg.target,
				'—',
				`Digits hide after ${cfg.hideAt / 1000} second`,
				'Press and hold',
			);
			let t0 = 0;
			ctx.after(15000, () => !t0 && ctx.fail('Never pressed'));
			stage.onpointerdown = (e) => {
				if (t0) return;
				t0 = tsOf(e);
				stage.setPointerCapture?.(e.pointerId);
				stage.innerHTML = timerInstrument(
					cfg.target,
					'0.00',
					'Keep holding · trust your timing',
					'Release to stop',
				);
				const ro = $('.readout', stage);
				ctx.loop(() => {
					const held = performance.now() - t0;
					ro.textContent = held < cfg.hideAt ? secs(held) : '· · ·';
					if (held > cfg.target * 2) ctx.fail('Held too long');
				});
			};
			stage.onpointerup = stage.onpointercancel = (e) =>
				t0 && stopAt(ctx, tsOf(e) - t0);
		},
	});

	registerGame({
		id: 'centre',
		name: 'Dead Centre',
		icon: '🎯',
		group: 'reflex',
		lowerIsBetter: true,
		blurb: 'A dot sweeps the bar. Freeze it in the middle.',
		config: (i) => ({ period: pick([1600, 1300, 1000, 800, 650], i) }),
		intro: () =>
			'Tap to freeze the dot on the <b>centre</b><br><small>It gets faster every round.</small>',
		play(ctx) {
			const { stage, cfg } = ctx;
			stage.innerHTML =
				'<div class="centre-instrument"><div class="instrument-meta"><span class="instrument-label">Target position</span><span class="instrument-target">50 <span class="instrument-unit">%</span></span></div><div class="track"><i class="zone"></i><i class="dot"></i></div><div class="scale-labels" aria-hidden="true"><span>0</span><span>50</span><span>100</span></div><div class="instrument-caption">Freeze the marker on the centre line</div><div class="instrument-action">Tap anywhere to freeze</div></div>';
			const dot = $('.dot', stage);
			const t0 = performance.now();
			const at = (t) => {
				const k = ((t - t0) / cfg.period) % 1;
				return k < 0.5 ? k * 2 : 2 - k * 2;
			}; // 0 → 1 → 0
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

	registerGame({
		id: 'frenzy',
		name: 'Tap Frenzy',
		icon: '👆',
		group: 'reflex',
		lowerIsBetter: false,
		blurb: 'Most taps before time runs out wins.',
		config: (i) => ({ secs: pick([8, 10, 6, 10, 8], i) }),
		intro: (c) =>
			`Tap as fast as you can for <b>${c.secs}s</b><br><small>Any finger counts.</small>`,
		play(ctx) {
			const { stage, cfg } = ctx;
			stage.innerHTML = `<div class="timer-instrument frenzy-instrument"><div class="instrument-meta"><span class="instrument-label">Time limit</span><span class="instrument-target">${cfg.secs} <span class="instrument-unit">s</span></span></div><div class="timer-face"><div class="readout">0</div><span class="readout-unit">taps</span></div><div class="instrument-foot"><span>Time remaining</span><div class="bar"><i></i></div></div><div class="instrument-action">Tap anywhere · keep going</div></div>`;
			const ro = $('.readout', stage);
			const fill = $('.bar i', stage);
			const t0 = performance.now();
			let n = 0;
			stage.onpointerdown = () => {
				ro.textContent = ++n;
			};
			ctx.loop(() => {
				const k = (performance.now() - t0) / (cfg.secs * 1000);
				fill.style.width = `${Math.max(0, 1 - k) * 100}%`;
				if (k >= 1) {
					ctx.done(n, `${n} taps`);
					return false;
				}
			});
		},
	});
})();
