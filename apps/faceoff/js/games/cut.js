(() => {
	'use strict';

	/* Cut it in half. Shapes are polygons in a unit square; a cut is an infinite line through two points. */

	const ngon = (n, r, rot = 0) =>
		Array.from({ length: n }, (_, i) => [
			0.5 + r * Math.cos(rot + (i / n) * 6.2832),
			0.5 + r * Math.sin(rot + (i / n) * 6.2832),
		]);
	const rectPoly = (w, h) => [
		[0.5 - w / 2, 0.5 - h / 2],
		[0.5 + w / 2, 0.5 - h / 2],
		[0.5 + w / 2, 0.5 + h / 2],
		[0.5 - w / 2, 0.5 + h / 2],
	];
	const rotated = (poly, a) =>
		poly.map(([x, y]) => [
			0.5 + (x - 0.5) * Math.cos(a) - (y - 0.5) * Math.sin(a),
			0.5 + (x - 0.5) * Math.sin(a) + (y - 0.5) * Math.cos(a),
		]);
	const star = () =>
		Array.from({ length: 10 }, (_, i) => {
			const a = -Math.PI / 2 + (i * Math.PI) / 5,
				r = i % 2 ? 0.2 : 0.44;
			return [0.5 + r * Math.cos(a), 0.5 + r * Math.sin(a)];
		});
	const blob = () => {
		const f = [rand(0, 6.28), rand(0, 6.28), rand(0, 6.28)];
		return Array.from({ length: 72 }, (_, i) => {
			const a = (i / 72) * 6.2832,
				r =
					0.3 +
					0.07 * Math.sin(2 * a + f[0]) +
					0.05 * Math.sin(3 * a + f[1]) +
					0.04 * Math.sin(5 * a + f[2]);
			return [0.5 + r * Math.cos(a), 0.5 + r * Math.sin(a)];
		});
	};
	const L_SHAPE = [
		[0.2, 0.2],
		[0.5, 0.2],
		[0.5, 0.55],
		[0.8, 0.55],
		[0.8, 0.8],
		[0.2, 0.8],
	];

	// Easy to hard; the list repeats if you play more rounds than shapes.
	const SHAPES = [
		['stick', () => rotated(rectPoly(0.84, 0.05), rand(0, 3.14))],
		['rectangle', () => rectPoly(0.76, 0.46)],
		['circle', () => ngon(72, 0.4)],
		['triangle', () => ngon(3, 0.44, rand(0, 6.28))],
		['blob', blob],
		['L-shape', () => rotated(L_SHAPE, rand(0, 6.28))],
		['star', star],
	];

	const CUT_MS = 15000;
	const MARGIN = 0.04; // keeps rotated shapes off the canvas edge
	const SCALE = 1 - MARGIN * 2;

	registerGame({
		id: 'cut',
		name: 'Cut in Half',
		icon: '✂️',
		group: 'perception',
		lowerIsBetter: true,
		blurb: 'Draw one straight cut that splits the shape into equal halves.',
		config(i) {
			const [name, make] = SHAPES[i % SHAPES.length];
			return { name, poly: make() };
		},
		intro: (c) =>
			`Cut the <b>${c.name}</b> into two equal halves<br><small>Drag a line across it, then hit Cut. ${CUT_MS / 1000}s.</small>`,
		play(ctx) {
			const { stage, cfg } = ctx;
			const dpr = Math.min(devicePixelRatio || 1, 2);
			const S = Math.max(
				120,
				Math.round(
					Math.min(stage.clientWidth - 24, stage.clientHeight - 100, 480),
				),
			);
			stage.innerHTML = `<canvas width="${S * dpr}" height="${S * dpr}" style="width:${S}px;height:${S}px"></canvas><div class="bar"><i></i></div><button class="btn" type="button" disabled>✂ Cut</button>`;
			const cv = $('canvas', stage),
				btn = $('button', stage),
				fill = $('.bar i', stage);
			const g = cv.getContext('2d');
			const color =
				getComputedStyle(stage).getPropertyValue('--c').trim() || '#fff';
			const flipped =
				getComputedStyle(stage.parentElement).transform !== 'none'; // top player's half is rotated 180°

			let a = null,
				b = null;
			const valid = () => a && b && Math.hypot(b[0] - a[0], b[1] - a[1]) > 0.06;
			const unit = (e) => {
				const r = cv.getBoundingClientRect();
				const x = flipped ? r.right - e.clientX : e.clientX - r.left;
				const y = flipped ? r.bottom - e.clientY : e.clientY - r.top;
				return [
					(x / r.width - MARGIN) / SCALE,
					(y / r.height - MARGIN) / SCALE,
				];
			};

			const draw = () => {
				g.setTransform(
					dpr * S * SCALE,
					0,
					0,
					dpr * S * SCALE,
					dpr * S * MARGIN,
					dpr * S * MARGIN,
				);
				g.clearRect(-MARGIN / SCALE, -MARGIN / SCALE, 1 / SCALE, 1 / SCALE);
				g.beginPath();
				cfg.poly.forEach(([x, y], i) => g[i ? 'lineTo' : 'moveTo'](x, y));
				g.closePath();
				g.globalAlpha = 0.35;
				g.fillStyle = color;
				g.fill();
				g.globalAlpha = 1;
				g.lineWidth = 2.5 / (S * SCALE);
				g.strokeStyle = color;
				g.stroke();
				if (valid()) {
					const dx = b[0] - a[0],
						dy = b[1] - a[1];
					g.beginPath();
					g.moveTo(a[0] - dx * 20, a[1] - dy * 20);
					g.lineTo(a[0] + dx * 20, a[1] + dy * 20);
					g.lineWidth = 3 / (S * SCALE);
					g.strokeStyle = '#fff';
					g.stroke();
				}
			};
			draw();

			const submit = () => {
				if (!valid()) return ctx.fail('No cut');
				const { err, share } = cutSplit(cfg.poly, a, b);
				ctx.done(err, `${share[0].toFixed(1)} : ${share[1].toFixed(1)}`);
			};

			cv.onpointerdown = (e) => {
				cv.setPointerCapture?.(e.pointerId);
				a = unit(e);
				b = null;
				btn.disabled = true;
				draw();
			};
			cv.onpointermove = (e) => {
				if (a && e.buttons) {
					b = unit(e);
					draw();
				}
			};
			cv.onpointerup = () => {
				btn.disabled = !valid();
			};
			btn.onclick = submit;

			const t0 = performance.now();
			ctx.loop(() => {
				const k = (performance.now() - t0) / CUT_MS;
				fill.style.width = `${Math.max(0, 1 - k) * 100}%`;
				if (k >= 1) {
					submit();
					return false;
				}
			});
		},
	});
})();
