'use strict';

GAMES.push({
	id: 'green', name: 'Green Light', icon: '🚦', group: 'Timing', lowerIsBetter: true,
	blurb: 'Wait for green, tap first. Jump the light and you lose the round.',
	config: () => ({ delay: rand(1500, 4500) }),
	intro: () => 'Wait for <b>green</b>, then tap!<br><small>Tap early and you lose the round.</small>',
	play(ctx) {
		const { stage, cfg } = ctx;
		stage.className = 'stage wait';
		stage.innerHTML = '<div class="readout">Wait…</div>';
		let t0 = 0;
		ctx.after(cfg.delay, () => requestAnimationFrame(() => {
			if (!ctx.alive()) return;
			stage.className = 'stage go';
			stage.innerHTML = '<div class="readout">TAP!</div>';
			t0 = performance.now();
		}));
		ctx.after(cfg.delay + 2500, () => ctx.fail('Too slow'));
		stage.onpointerdown = (e) => {
			if (!t0) return ctx.fail('False start');
			const ms = Math.max(0, tsOf(e) - t0);
			ctx.done(ms, `${Math.round(ms)} ms`);
		};
	},
});
