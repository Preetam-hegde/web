'use strict';

/* Restrained end-of-match feedback; gameplay controls own their pressed states. */
const calmFx = matchMedia('(prefers-reduced-motion: reduce)').matches;

function confetti(colors) {
	if (calmFx) return;
	for (let i = 0; i < 20; i++) {
		const bit = document.createElement('i');
		bit.className = 'conf';
		bit.style.cssText = `left:${rand(2, 98)}vw;background:${choice(colors)}`;
		document.body.append(bit);
		bit.animate(
			[
				{ transform: 'translateY(0) rotate(0)', opacity: 1 },
				{
					transform: `translate(${rand(-60, 60)}px,${innerHeight + 30}px) rotate(${rand(240, 720)}deg)`,
					opacity: 0.9,
				},
			],
			{
				duration: rand(1300, 2300),
				delay: rand(0, 350),
				easing: 'cubic-bezier(0.2,0.6,0.4,1)',
				fill: 'forwards',
			},
		).onfinish = () => bit.remove();
	}
}

/* A short click confirms menu selections; timed game input keeps its own feedback. */
document.addEventListener(
	'pointerdown',
	(e) => {
		if (!['hub', 'settings'].includes(document.body.dataset.screen)) return;
		const button = e.target.closest?.('button');
		if (
			!button ||
			button.disabled ||
			typeof isGuest !== 'function' ||
			isGuest()
		)
			return;
		sfx.key();
		buzz(8);
	},
	true,
);
