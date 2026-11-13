'use strict';
// Background particles: drifting petals and twinkling sparkles. Skipped for reduced motion, paused when the tab is hidden.
(() => {
	if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
	const cv = document.createElement('canvas');
	cv.id = 'fx';
	cv.setAttribute('aria-hidden', 'true');
	document.body.prepend(cv);
	const ctx = cv.getContext('2d');
	let W = 0, H = 0, dpr = 1, ps = [], raf = 0, last = 0;
	const rnd = (a, b) => a + Math.random() * (b - a);
	const make = (init) => {
		const petal = Math.random() < 0.35;
		return { petal, x: rnd(0, W), y: init ? rnd(0, H) : -20, r: petal ? rnd(4, 8) : rnd(1, 2.6), vy: petal ? rnd(14, 30) : rnd(6, 16), vx: rnd(-10, 6), sw: rnd(0.4, 1.4), ph: rnd(0, 6.28), rot: rnd(0, 6.28), vr: rnd(-1, 1), a: petal ? rnd(0.35, 0.7) : rnd(0.3, 0.9), tw: rnd(0.8, 2.4) };
	};
	const resize = () => {
		dpr = Math.min(2, devicePixelRatio || 1);
		W = innerWidth; H = innerHeight;
		cv.width = W * dpr; cv.height = H * dpr;
		ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
		const n = Math.round(Math.min(70, Math.max(26, (W * H) / 26000)));
		ps = Array.from({ length: n }, () => make(true));
	};
	const draw = (t) => {
		const dt = Math.min(0.05, (t - last) / 1000 || 0.016);
		last = t;
		ctx.clearRect(0, 0, W, H);
		for (const p of ps) {
			p.ph += dt * p.sw;
			p.x += (p.vx + Math.sin(p.ph) * 14) * dt;
			p.y += p.vy * dt;
			p.rot += p.vr * dt;
			if (p.y > H + 20 || p.x < -30 || p.x > W + 30) Object.assign(p, make(false));
			ctx.save();
			ctx.translate(p.x, p.y);
			if (p.petal) {
				ctx.rotate(p.rot);
				ctx.globalAlpha = p.a;
				ctx.fillStyle = '#ffb3c1';
				ctx.beginPath();
				ctx.ellipse(0, 0, p.r, p.r * 0.55, 0, 0, 6.28);
				ctx.fill();
			} else {
				const tw = 0.5 + 0.5 * Math.sin(t / 1000 * p.tw + p.ph);
				ctx.globalAlpha = p.a * (0.35 + 0.65 * tw);
				const g = ctx.createRadialGradient(0, 0, 0, 0, 0, p.r * 3.2);
				g.addColorStop(0, '#ffffff');
				g.addColorStop(1, 'rgba(180,215,255,0)');
				ctx.fillStyle = g;
				ctx.beginPath();
				ctx.arc(0, 0, p.r * 3.2, 0, 6.28);
				ctx.fill();
			}
			ctx.restore();
		}
		raf = requestAnimationFrame(draw);
	};
	const start = () => { if (!raf) { last = performance.now(); raf = requestAnimationFrame(draw); } };
	const stop = () => { cancelAnimationFrame(raf); raf = 0; };
	addEventListener('resize', resize);
	document.addEventListener('visibilitychange', () => (document.hidden ? stop() : start()));
	resize();
	start();
})();
