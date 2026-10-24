'use strict';

(() => {
	const TAU = Math.PI * 2;
	const clamp = (x, lo, hi) => Math.min(hi, Math.max(lo, x));

	// ── 03 · Hypno Spiral ───────────────────────────────────────────────
	let spiralRot = 0;

	Museum.register({
		order: 2,
		name: 'Hypno Spiral',
		blurb: 'A breathing spiral that seems to pour into the screen. Stare at the centre for half a minute, then look at your hand: it will appear to swell.',
		hint: 'Reverse the spin with the slider · the spiral leans toward your cursor.',
		controls: [
			{ id: 'arms', label: 'Arms', min: 2, max: 12, step: 1, value: 6 },
			{ id: 'twist', label: 'Twist (turns)', min: 0.2, max: 3, step: 0.1, value: 1.2 },
			{ id: 'spin', label: 'Spin', min: -3, max: 3, step: 0.1, value: 1 }
		],

		init() {
			spiralRot = 0;
		},

		step(M, dt, v) {
			const ctx = M.ctx;
			spiralRot += v.spin * 0.02 * M.speed * dt;
			M.fill([6, 5, 12], 1);

			const cx = M.W / 2 + (M.focus.x - M.W / 2) * 0.12;
			const cy = M.H / 2 + (M.focus.y - M.H / 2) * 0.12;
			const R = Math.hypot(M.W, M.H) / 2 + 40;
			const twist = v.twist * (1 + 0.18 * Math.sin(M.time * 0.02));
			const span = TAU / v.arms;
			const steps = 70;

			ctx.save();
			ctx.translate(cx, cy);
			for (let k = 0; k < v.arms; k++) {
				ctx.fillStyle = M.color(k / v.arms, 1);
				ctx.beginPath();
				for (let s = 0; s <= steps; s++) {
					const r = (R * s) / steps;
					const th = spiralRot + k * span + twist * TAU * (r / R);
					if (s === 0) ctx.moveTo(0, 0);
					else ctx.lineTo(Math.cos(th) * r, Math.sin(th) * r);
				}
				for (let s = steps; s >= 0; s--) {
					const r = (R * s) / steps;
					const th = spiralRot + k * span + span * 0.5 + twist * TAU * (r / R);
					ctx.lineTo(Math.cos(th) * r, Math.sin(th) * r);
				}
				ctx.fill();
			}
			const vig = ctx.createRadialGradient(0, 0, R * 0.15, 0, 0, R);
			vig.addColorStop(0, 'rgba(0,0,0,0)');
			vig.addColorStop(1, 'rgba(0,0,0,0.7)');
			ctx.fillStyle = vig;
			ctx.fillRect(-R, -R, R * 2, R * 2);
			ctx.fillStyle = '#fff';
			ctx.beginPath();
			ctx.arc(0, 0, 4, 0, TAU);
			ctx.fill();
			ctx.restore();
		}
	});

	// ── 04 · Chaser ─────────────────────────────────────────────────────
	let chasePhase = 0;

	Museum.register({
		order: 3,
		name: 'Phantom Chaser',
		blurb: 'A ring of dots with one missing. Fix your eyes on the cross: a ghost-coloured dot races around the circle, then the real dots seem to disappear.',
		hint: 'Do not follow the gap with your eyes · pick any dimension tone for the dots.',
		controls: [
			{ id: 'dots', label: 'Dots', min: 6, max: 24, step: 1, value: 12 },
			{ id: 'size', label: 'Dot size', min: 20, max: 90, step: 2, value: 46 },
			{ id: 'tone', label: 'Dot tone (1–9)', min: 1, max: 9, step: 1, value: 8 },
			{ id: 'spin', label: 'Chase speed', min: -3, max: 3, step: 0.1, value: 1 }
		],

		init() {
			chasePhase = 0;
		},

		step(M, dt, v) {
			const ctx = M.ctx;
			const { W, H } = M;
			const bg = ctx.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, Math.hypot(W, H) / 2);
			bg.addColorStop(0, '#9b9ba3');
			bg.addColorStop(1, '#5d5d68');
			ctx.fillStyle = bg;
			ctx.fillRect(0, 0, W, H);

			chasePhase += v.spin * 0.11 * M.speed * dt;
			const n = v.dots;
			const R = Math.min(W, H) * 0.3;
			const size = (v.size * Math.min(W, H)) / 800;
			const rgb = M.toneRgb(v.tone - 1);
			const p = ((chasePhase % n) + n) % n;

			for (let i = 0; i < n; i++) {
				const ang = (i / n) * TAU - Math.PI / 2;
				let d = Math.abs(i - p);
				d = Math.min(d, n - d);
				const t = clamp((d - 0.3) / 1.3, 0, 1);
				const a = t * t * (3 - 2 * t);
				const x = W / 2 + Math.cos(ang) * R;
				const y = H / 2 + Math.sin(ang) * R;
				const g = ctx.createRadialGradient(x, y, 0, x, y, size);
				g.addColorStop(0, M.css(rgb, a));
				g.addColorStop(0.72, M.css(rgb, a));
				g.addColorStop(1, M.css(rgb, 0));
				ctx.fillStyle = g;
				ctx.beginPath();
				ctx.arc(x, y, size, 0, TAU);
				ctx.fill();
			}

			ctx.strokeStyle = '#fff';
			ctx.lineWidth = 3;
			ctx.lineCap = 'round';
			ctx.beginPath();
			ctx.moveTo(W / 2 - 11, H / 2);
			ctx.lineTo(W / 2 + 11, H / 2);
			ctx.moveTo(W / 2, H / 2 - 11);
			ctx.lineTo(W / 2, H / 2 + 11);
			ctx.stroke();
		}
	});

	// ── 05 · Café Wall ──────────────────────────────────────────────────
	Museum.register({
		order: 4,
		name: 'Café Wall',
		blurb: 'Every grey line is perfectly straight and parallel, yet the rows lean like a collapsing wall. Change the stagger and the tilt flips with it.',
		hint: 'Move left and right to change the stagger · rulers do not lie.',
		controls: [
			{ id: 'tile', label: 'Tile size', min: 24, max: 120, step: 4, value: 56 },
			{ id: 'mortar', label: 'Mortar thickness', min: 1, max: 8, step: 1, value: 3 },
			{ id: 'shift', label: 'Stagger', min: 0, max: 1, step: 0.05, value: 0.5 },
			{ id: 'breathe', label: 'Breathing stagger', type: 'checkbox', value: true }
		],

		init() {},

		step(M, dt, v) {
			const ctx = M.ctx;
			const { W, H } = M;
			const light = [242, 238, 228];
			const dark = [18, 16, 28];
			const mortar = M.mix(M.toneRgb(4), [128, 128, 132], 0.8);
			M.fill(mortar, 1);

			const tile = v.tile;
			const row = tile + v.mortar;
			let stagger = v.shift * tile;
			if (M.pointer.active) stagger = (M.pointer.x / W) * tile;
			else if (v.breathe) stagger *= 0.65 + 0.35 * Math.sin(M.time * 0.015 * M.speed);

			const rows = Math.ceil(H / row) + 1;
			const top = (H - rows * row) / 2;
			const period = tile * 2;

			for (let i = 0; i < rows; i++) {
				const y = top + i * row;
				const off = Math.sin((i * Math.PI) / 2) * stagger;
				ctx.fillStyle = M.css(light);
				ctx.fillRect(0, y, W, tile);
				ctx.fillStyle = M.css(dark);
				const start = -period + ((((off % period) + period) % period));
				for (let x = start; x < W; x += period) ctx.fillRect(x, y, tile, tile);
			}
		}
	});

	// ── 06 · Moiré Loom ─────────────────────────────────────────────────
	let moireX = 0;
	let moireY = 0;

	function strokeRings(ctx, cx, cy, maxR, spacing) {
		ctx.beginPath();
		for (let r = spacing; r < maxR; r += spacing) {
			ctx.moveTo(cx + r, cy);
			ctx.arc(cx, cy, r, 0, TAU);
		}
		ctx.stroke();
	}

	function strokeGrating(ctx, cx, cy, angle, extent, spacing) {
		ctx.save();
		ctx.translate(cx, cy);
		ctx.rotate(angle);
		ctx.beginPath();
		for (let x = -extent; x <= extent; x += spacing) {
			ctx.moveTo(x, -extent);
			ctx.lineTo(x, extent);
		}
		ctx.stroke();
		ctx.restore();
	}

	function strokeSpokes(ctx, cx, cy, angle, length, count) {
		ctx.beginPath();
		for (let k = 0; k < count; k++) {
			const a = angle + (k / count) * TAU;
			ctx.moveTo(cx, cy);
			ctx.lineTo(cx + Math.cos(a) * length, cy + Math.sin(a) * length);
		}
		ctx.stroke();
	}

	Museum.register({
		order: 5,
		name: 'Moiré Loom',
		blurb: 'Two simple patterns, one hidden third. Where they overlap, interference fringes bloom and sweep across the screen even though nothing in either pattern moves that way.',
		hint: 'Drag the second pattern with your cursor · switch between rings, lines and spokes.',
		controls: [
			{ id: 'mode', label: 'Pattern', type: 'select', value: 'rings', options: [['rings', 'Rings'], ['lines', 'Lines'], ['spokes', 'Spokes']] },
			{ id: 'spacing', label: 'Spacing', min: 6, max: 30, step: 1, value: 12 },
			{ id: 'thick', label: 'Line weight', min: 0.2, max: 0.8, step: 0.05, value: 0.45 }
		],

		init(M) {
			moireX = M.W / 2;
			moireY = M.H / 2;
		},

		step(M, dt, v) {
			const ctx = M.ctx;
			const { W, H } = M;
			const cx = W / 2;
			const cy = H / 2;
			const t = M.time * M.speed;
			M.fill([4, 3, 10], 1);

			const tx = M.pointer.active ? M.pointer.x : cx + Math.cos(t * 0.012) * W * 0.16;
			const ty = M.pointer.active ? M.pointer.y : cy + Math.sin(t * 0.017) * H * 0.16;
			const k = Math.min(1, 0.08 * dt);
			moireX += (tx - moireX) * k;
			moireY += (ty - moireY) * k;

			const maxR = Math.hypot(W, H) / 2 + v.spacing * 2;
			ctx.globalCompositeOperation = 'lighter';
			ctx.lineWidth = Math.max(1, v.spacing * v.thick);
			const colA = M.color(0.05, 0.85);
			const colB = M.color(0.55, 0.85);

			if (v.mode === 'rings') {
				ctx.strokeStyle = colA;
				strokeRings(ctx, cx, cy, maxR, v.spacing);
				ctx.strokeStyle = colB;
				strokeRings(ctx, moireX, moireY, maxR, v.spacing);
			} else if (v.mode === 'lines') {
				const angle = ((moireX - cx) / W) * 0.5 + Math.sin(t * 0.01) * 0.08;
				ctx.strokeStyle = colA;
				strokeGrating(ctx, cx, cy, 0, maxR, v.spacing);
				ctx.strokeStyle = colB;
				strokeGrating(ctx, cx, cy, angle, maxR, v.spacing);
			} else {
				const count = Math.floor(720 / v.spacing);
				ctx.lineWidth = Math.max(1, v.thick * 3);
				ctx.strokeStyle = colA;
				strokeSpokes(ctx, cx, cy, 0, maxR, count);
				ctx.strokeStyle = colB;
				strokeSpokes(ctx, moireX, moireY, t * 0.003, maxR, count);
			}
			ctx.globalCompositeOperation = 'source-over';
		}
	});

	// ── 07 · Infinity Tunnel ────────────────────────────────────────────
	let tunnel = 0;

	Museum.register({
		order: 6,
		name: 'Infinity Tunnel',
		blurb: 'Concentric polygons rush toward you and twist into a corridor that never ends. Flat shapes on a flat screen, convincingly bottomless.',
		hint: 'Steer the vanishing point with your cursor · change the sides for a new geometry.',
		controls: [
			{ id: 'sides', label: 'Sides', min: 3, max: 12, step: 1, value: 6 },
			{ id: 'rings', label: 'Depth rings', min: 8, max: 40, step: 1, value: 22 },
			{ id: 'twist', label: 'Twist', min: -2, max: 2, step: 0.1, value: 0.6 },
			{ id: 'rush', label: 'Rush', min: 0.2, max: 3, step: 0.1, value: 1 }
		],

		init() {
			tunnel = 0;
		},

		step(M, dt, v) {
			const ctx = M.ctx;
			const { W, H } = M;
			tunnel += 0.012 * v.rush * M.speed * dt;
			M.fill([3, 2, 8], 1);

			const N = v.rings;
			const f = 1 - (tunnel % 1);
			const base = Math.floor(tunnel);
			const cx = W / 2;
			const cy = H / 2;
			const Rmax = Math.hypot(W, H) * 0.75;

			for (let i = 0; i < N; i++) {
				const d = (i + f) / N;
				const r = Rmax * Math.pow(1 - d, 2.4) + 3;
				const x = cx + (M.focus.x - cx) * Math.pow(d, 0.75);
				const y = cy + (M.focus.y - cy) * Math.pow(d, 0.75);
				const rot = v.twist * d * Math.PI + tunnel * 0.15;
				const idx = i + base;

				ctx.beginPath();
				for (let s = 0; s < v.sides; s++) {
					const a = rot + (s / v.sides) * TAU;
					const px = x + Math.cos(a) * r;
					const py = y + Math.sin(a) * r;
					if (s === 0) ctx.moveTo(px, py);
					else ctx.lineTo(px, py);
				}
				ctx.closePath();
				ctx.fillStyle = idx % 2 === 0 ? M.color((idx * 0.06) % 1, 1 - d * 0.55) : 'rgb(9,7,20)';
				ctx.fill();
				ctx.strokeStyle = M.color((idx * 0.06 + 0.4) % 1, 0.9);
				ctx.lineWidth = 1 + (1 - d) * 5;
				ctx.stroke();
			}

			const fog = ctx.createRadialGradient(M.focus.x, M.focus.y, 0, M.focus.x, M.focus.y, Math.min(W, H) * 0.3);
			fog.addColorStop(0, 'rgba(0,0,0,0.95)');
			fog.addColorStop(1, 'rgba(0,0,0,0)');
			ctx.fillStyle = fog;
			ctx.fillRect(0, 0, W, H);
		}
	});

	// ── 08 · Rotating Snakes ────────────────────────────────────────────
	let snakeBuf = null;
	let snakeKey = '';

	function paintSnakes(M, v) {
		const { W, H } = M;
		if (!snakeBuf) snakeBuf = document.createElement('canvas');
		snakeBuf.width = Math.round(W * M.dpr);
		snakeBuf.height = Math.round(H * M.dpr);
		const b = snakeBuf.getContext('2d');
		b.setTransform(M.dpr, 0, 0, M.dpr, 0, 0);
		b.fillStyle = '#2a2833';
		b.fillRect(0, 0, W, H);

		const dark = M.mix(M.toneRgb(6), [0, 0, 0], 0.35);
		const light = M.toneRgb(2);
		const cols4 = [[0, 0, 0], dark, [255, 255, 255], light].map((c) => M.css(c));

		const R = clamp(Math.min(W, H) * 0.17, 40, 150);
		const gap = R * 2.3;
		let cols = Math.max(1, Math.floor(W / gap));
		let rows = Math.max(1, Math.floor((H - 120) / gap));
		while (cols * rows > 12) {
			if (cols > rows) cols--;
			else rows--;
		}
		const x0 = (W - (cols - 1) * gap) / 2;
		const y0 = H / 2 + 24 - ((rows - 1) * gap) / 2;
		const seg = v.segments;
		const wedge = TAU / seg;

		for (let cy = 0; cy < rows; cy++) {
			for (let cx = 0; cx < cols; cx++) {
				b.save();
				b.translate(x0 + cx * gap, y0 + cy * gap);
				const flip = (cx + cy) % 2;
				for (let k = 0; k < v.rings; k++) {
					const r0 = R * (0.12 + (0.88 * k) / v.rings);
					const r1 = R * (0.12 + (0.88 * (k + 1)) / v.rings);
					const reversed = (k + flip) % 2 === 1;
					for (let j = 0; j < seg; j++) {
						for (let q = 0; q < 4; q++) {
							const a0 = j * wedge + (q * wedge) / 4;
							const a1 = a0 + wedge / 4 + 0.004;
							b.fillStyle = cols4[reversed ? 3 - q : q];
							b.beginPath();
							b.arc(0, 0, r1, a0, a1);
							b.arc(0, 0, r0, a1, a0, true);
							b.closePath();
							b.fill();
						}
					}
				}
				b.fillStyle = '#000';
				b.beginPath();
				b.arc(0, 0, R * 0.12, 0, TAU);
				b.fill();
				b.restore();
			}
		}
	}

	Museum.register({
		order: 7,
		name: 'Rotating Snakes',
		blurb: 'Nothing here is moving. The discs are a static image, yet the rings creep around out of the corner of your eye. Look straight at one and it halts.',
		hint: 'Let your eyes wander across the screen · blinking makes the drift stronger.',
		controls: [
			{ id: 'rings', label: 'Rings', min: 2, max: 5, step: 1, value: 3 },
			{ id: 'segments', label: 'Segments', min: 12, max: 48, step: 2, value: 28 },
			{ id: 'blink', label: 'Pulse brightness', type: 'checkbox', value: true }
		],

		init() {
			snakeKey = '';
		},

		onPalette() {
			snakeKey = '';
		},

		onChange() {
			snakeKey = '';
		},

		step(M, dt, v) {
			const key = [M.W, M.H, M.palette, v.rings, v.segments].join('|');
			if (key !== snakeKey) {
				snakeKey = key;
				paintSnakes(M, v);
			}
			const ctx = M.ctx;
			ctx.drawImage(snakeBuf, 0, 0, M.W, M.H);
			if (v.blink) {
				const pulse = Math.max(0, Math.sin(M.time * 0.07 * M.speed));
				ctx.fillStyle = `rgba(42,40,51,${Math.pow(pulse, 6) * 0.55})`;
				ctx.fillRect(0, 0, M.W, M.H);
			}
		}
	});

	// ── 09 · Op-Art Current ─────────────────────────────────────────────
	let waveBulge = 0;

	Museum.register({
		order: 8,
		name: 'Op-Art Current',
		blurb: 'Rippling ribbons in the spirit of 1960s op art. The bands are flat colour on black, yet the surface seems to fold, swell and flow like cloth in a current.',
		hint: 'Your cursor pushes a swell through the ribbons · more bands means more depth.',
		controls: [
			{ id: 'bands', label: 'Bands', min: 12, max: 70, step: 2, value: 34 },
			{ id: 'amp', label: 'Wave height', min: 0, max: 80, step: 2, value: 26 },
			{ id: 'freq', label: 'Wave count', min: 1, max: 12, step: 0.5, value: 4 },
			{ id: 'warp', label: 'Fold', min: 0, max: 2, step: 0.1, value: 0.8 }
		],

		init(M) {
			waveBulge = M.W / 2;
		},

		step(M, dt, v) {
			const ctx = M.ctx;
			const { W, H } = M;
			const phase = M.time * 0.02 * M.speed;
			const target = M.pointer.active ? M.pointer.x : W * (0.5 + 0.32 * Math.sin(M.time * 0.008));
			waveBulge += (target - waveBulge) * Math.min(1, 0.08 * dt);
			M.fill([8, 7, 14], 1);

			const bandH = (H + v.amp * 4) / v.bands;
			const step = 6;
			const yAt = (i, x) => {
				const bulge = 1 + 1.8 * Math.exp(-(((x - waveBulge) / (W * 0.14)) ** 2));
				return i * bandH - v.amp * 2 + v.amp * bulge * Math.sin((x / W) * v.freq * TAU + phase + i * v.warp * 0.12);
			};

			for (let i = 1; i < v.bands; i += 2) {
				ctx.fillStyle = M.color(i / v.bands, 1);
				ctx.beginPath();
				for (let x = 0; x <= W + step; x += step) {
					if (x === 0) ctx.moveTo(x, yAt(i, x));
					else ctx.lineTo(x, yAt(i, x));
				}
				for (let x = W + step; x >= 0; x -= step) ctx.lineTo(x, yAt(i + 1, x));
				ctx.closePath();
				ctx.fill();
			}
		}
	});
})();
