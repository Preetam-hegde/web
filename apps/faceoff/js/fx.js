'use strict';

/* Menu background: a slow aurora in the two player colours plus drifting stars, like Keystorm's.
   It only runs while the hub is showing, so matches don't pay for it. */
const fx = (() => {
	const cv = $('#fx');
	const g = cv.getContext('2d');
	const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
	const HUES = [14, 174, 285]; // player 1 orange, player 2 teal, and a violet to blend them
	const stars = Array.from({ length: 60 }, (_, i) => ({ x: Math.random(), y: Math.random(), z: 0.2 + Math.random() * 0.8, h: HUES[i % 2] }));
	let W = 0, H = 0, last = 0, running = false;

	function resize() {
		const dpr = Math.min(devicePixelRatio || 1, 2);
		W = innerWidth;
		H = innerHeight;
		cv.width = W * dpr;
		cv.height = H * dpr;
		g.setTransform(dpr, 0, 0, dpr, 0, 0);
	}

	function draw(now, dt) {
		const t = now / 1000;
		g.clearRect(0, 0, W, H);
		g.globalCompositeOperation = 'lighter';
		HUES.forEach((h, i) => {
			const x = W * (0.5 + 0.38 * Math.sin(t * 0.13 + i * 2.1));
			const y = H * (0.45 + 0.3 * Math.cos(t * 0.11 + i * 1.7));
			const gr = g.createRadialGradient(x, y, 0, x, y, Math.max(W, H) * 0.4);
			gr.addColorStop(0, `hsla(${h},90%,55%,0.14)`);
			gr.addColorStop(1, 'hsla(0,0%,0%,0)');
			g.fillStyle = gr;
			g.fillRect(0, 0, W, H);
		});
		stars.forEach((s) => {
			s.y += dt * 0.02 * s.z;
			if (s.y > 1) s.y -= 1;
			g.fillStyle = `hsla(${s.h},80%,82%,${0.15 + 0.4 * s.z})`;
			g.fillRect(s.x * W, s.y * H, 1 + s.z * 1.5, 1 + s.z * 1.5);
		});
		g.globalCompositeOperation = 'source-over';
	}

	function frame(now) {
		if (document.body.dataset.screen !== 'hub') { running = false; return; } // a match started: stop until the hub is back
		const dt = Math.min(0.05, (now - last) / 1000);
		last = now;
		draw(now, dt);
		requestAnimationFrame(frame);
	}

	addEventListener('resize', () => {
		if (document.body.dataset.screen !== 'hub') return;
		resize();
		if (reduce) draw(0, 0);
	});

	return {
		start() {
			if (running) return;
			resize();
			if (reduce) return draw(0, 0); // one still frame, no animation
			running = true;
			last = performance.now();
			requestAnimationFrame(frame);
		},
	};
})();
