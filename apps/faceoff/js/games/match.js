'use strict';

/* Match games: hear it, size it or see it, then reproduce it from memory. Every score is an error, so lower wins.
   Pitch Match is pass-and-play when two share a phone, since two speakers on one device would talk over each other.
   Needs limit() and PERC_MS from perceive.js, rint and ink from more.js. */

Object.assign(GAME_ICONS, {
	pitch: '<path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>',
	size: '<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="4"/>',
	recall: '<path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/><path d="m3 3 18 18"/>',
});

/* ── Pitch Match: hear a tone, then set your own to the same pitch ── */
const PITCH_MS = 25000;
const pitchHz = (v) => 200 * 5 ** (v / 1000); // slider 0..1000 maps to 200..1000 Hz, so equal slider steps sound like equal musical steps

GAMES.push({
	id: 'pitch', name: 'Hz Match', icon: '🎵', group: 'match', lowerIsBetter: true, passOnly: true,
	blurb: 'Hear a tone, then slide to the same pitch by ear. Use sound.',
	config: () => ({ f: rint(260, 880) }),
	intro: () => 'Listen to the <b>target tone</b>, then slide until yours sounds the same<br><small>Sound on. The numbers stay hidden. Closest pitch wins.</small>',
	play(ctx) {
		const { stage, cfg } = ctx;
		stage.innerHTML = `<div class="lbl">Match the pitch</div><button class="btn" type="button" data-a="target">▶ Play target</button><label class="sl big"><b>♪</b><input type="range" min="0" max="1000" value="500" aria-label="Your pitch"></label><div class="bar"><i></i></div><button class="btn" type="button" data-a="lock">Lock</button>`;
		const slider = $('input', stage);
		const tone = (f) => beep(f, 600, { gain: 0.14, force: true });
		const submit = () => {
			const hz = pitchHz(+slider.value), cents = Math.abs(1200 * Math.log2(hz / cfg.f));
			ctx.done(cents, `${cents.toFixed(0)}¢ off <small>${Math.round(cfg.f)} Hz</small>`);
		};
		$('[data-a="target"]', stage).onclick = () => tone(cfg.f);
		$('[data-a="lock"]', stage).onclick = submit;
		slider.oninput = () => tone(pitchHz(+slider.value));
		ctx.after(300, () => tone(cfg.f));
		limit(ctx, PITCH_MS, submit);
	},
});

/* ── Size Match: see a circle for a moment, then rebuild its size from memory ── */
const SIZE_SHOW_MS = 1800;

GAMES.push({
	id: 'size', name: 'Size Match', icon: '⭕', group: 'match', lowerIsBetter: true,
	blurb: 'A circle flashes up and vanishes. Grow yours to the same size.',
	config: () => ({ k: rand(0.2, 0.9) }), // diameter as a share of the play area
	intro: () => `A circle shows for ${SIZE_SHOW_MS / 1000} seconds, then it is gone<br><small>Slide to rebuild the <b>same size</b> from memory. Smallest error wins.</small>`,
	play(ctx) {
		const { stage, cfg } = ctx;
		const box = Math.max(140, Math.min(stage.clientWidth - 28, stage.clientHeight - 150, 340));
		const col = ink(stage);
		stage.innerHTML = `<div class="lbl">Remember this size</div><div class="sizebox" style="width:${box}px;height:${box}px"><i style="width:${cfg.k * box}px;height:${cfg.k * box}px;background:${col}"></i></div><label class="sl big"><b>◯</b><input type="range" min="5" max="100" value="50" aria-label="Your size" disabled></label><button class="btn" type="button" disabled>Lock</button>`;
		const dot = $('.sizebox i', stage), slider = $('input', stage), lock = $('.btn', stage), lbl = $('.lbl', stage);
		ctx.after(SIZE_SHOW_MS, () => {
			lbl.textContent = 'Now make it the same size';
			dot.style.width = dot.style.height = `${0.5 * box}px`;
			dot.style.opacity = 0.55;
			slider.disabled = lock.disabled = false;
			slider.oninput = () => { dot.style.width = dot.style.height = `${(slider.value / 100) * box}px`; };
			lock.onclick = () => {
				const err = (Math.abs(slider.value / 100 - cfg.k) / cfg.k) * 100;
				ctx.done(err, `${err.toFixed(1)}% off`);
			};
		});
		ctx.after(SIZE_SHOW_MS + 20000, () => lock.click());
	},
});

/* ── Colour Recall: Colour Match, but the target is hidden after a peek ── */
const HUE_PEEK_MS = 2500;
const hueGame = GAMES.find((g) => g.id === 'hue');

GAMES.push({
	...hueGame,
	id: 'recall', name: 'Colour Recall', icon: '👁️', group: 'match',
	blurb: 'Peek at a colour, then mix it from memory.',
	intro: () => `The colour shows for ${HUE_PEEK_MS / 1000} seconds, then it hides<br><small>Mix it from memory with the <b>H, S, L sliders</b>. Closest wins.</small>`,
	play(ctx) {
		hueGame.play(ctx);
		ctx.after(HUE_PEEK_MS, () => { $('.swatch i', ctx.stage).style.visibility = 'hidden'; });
	},
});
