'use strict';

document.addEventListener('DOMContentLoaded', () => {
	const canvas = document.getElementById('museumCanvas');
	const ctx = canvas.getContext('2d');

	const roomsNav = document.getElementById('rooms');
	const paletteSelect = document.getElementById('palette-select');
	const controlsBody = document.getElementById('controls-body');
	const shootingRow = document.getElementById('shooting-row');
	const shootingToggle = document.getElementById('shooting-toggle');
	const panel = document.getElementById('panel');
	const panelBtn = document.getElementById('panel-btn');
	const tourBtn = document.getElementById('tour-btn');
	const pauseBtn = document.getElementById('pause-btn');
	const placard = document.getElementById('placard');

	const NINE = 9;
	const MAX_BALLS = 900;
	const BASE_RADIUS = 10;
	const TOUR_MS = 15000;
	const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX'];

	// ── Nine dimensions: nine colours each ──────────────────────────────
	const PALETTES = {
		rainbow: { label: 'Rainbow', cycle: true, colors: ['#ff3b3b', '#ff9f1c', '#ffe14d', '#7dff4d', '#2dffb0', '#2dd4ff', '#4d79ff', '#a64dff', '#ff4dd2'] },
		fire: { label: 'Fire', colors: ['#ff1e00', '#ff4500', '#ff6a00', '#ff8c00', '#ffa500', '#ffc400', '#ffe066', '#ffd24d', '#fff1a8'] },
		ice: { label: 'Ice', colors: ['#e0fbff', '#b5f0ff', '#8fe3ff', '#62d2ff', '#3bb8ff', '#2f9bff', '#4b7bff', '#7aa2ff', '#bcd0ff'] },
		neon: { label: 'Neon', colors: ['#ff00ff', '#00ffff', '#ffff00', '#00ff66', '#ff2a6d', '#05d9e8', '#d1f7ff', '#ff9100', '#7d2cff'] },
		'deep-space': { label: 'Deep Space', colors: ['#4a4aff', '#5a5aff', '#6a6aff', '#7a7aff', '#8a8aff', '#9a9aff', '#aaaaff', '#c8c8ff', '#ffffff'] },
		aurora: { label: 'Aurora', colors: ['#00ffa3', '#00e5b0', '#00d1c2', '#00b8d4', '#2fa4ff', '#6c7bff', '#9d5cff', '#c44dff', '#7dffcf'] },
		'milky-way': { label: 'Milky Way', colors: ['#8a8a99', '#9e9eac', '#b2b2be', '#c4c4ce', '#d4d4dc', '#e2e2e8', '#eeeef2', '#f8f8fa', '#ffffff'] },
		nebula: { label: 'Nebula', colors: ['#ff4de1', '#e033ff', '#c21fff', '#a020f0', '#8a2be2', '#ff70a6', '#ff9ff3', '#6a5acd', '#f0a6ff'] },
		gilded: { label: 'Gilded', colors: ['#f4b942', '#ffd166', '#ffe29a', '#e09f3e', '#c98a2b', '#fff1c9', '#b8860b', '#ffcf5a', '#fff7e0'] }
	};
	Object.values(PALETTES).forEach((p) => {
		p.rgb = p.colors.map((c) => [parseInt(c.slice(1, 3), 16), parseInt(c.slice(3, 5), 16), parseInt(c.slice(5, 7), 16)]);
	});

	// ── Exhibits ────────────────────────────────────────────────────────
	const ROOMS = [
		{
			name: 'Bouncy Balls',
			blurb: 'Warp-drifting spheres paint glowing trails. Where the trails cross, colour blooms into shapes that were never drawn.',
			hint: 'Move to push the balls away · press and hold to pull them in.',
			fade: [0, 0, 0],
			count: { label: 'Number of balls', min: 10, max: 200, step: 10, value: 60 }
		},
		{
			name: 'Cell Culture',
			blurb: 'Every sphere divides like a living cell, shrinking with each generation until it dissolves. The culture never repeats.',
			hint: 'Your cursor shoves cells around · hold to gather them.',
			fade: [0, 0, 0],
			count: { label: 'Founding cells', min: 5, max: 60, step: 5, value: 20 }
		},
		{
			name: 'Shatter',
			blurb: 'Each wall strike splits a ball in two. Watch one sphere cascade into a shimmering rain of fragments.',
			hint: 'Herd the balls toward the walls to keep the storm going.',
			fade: [0, 0, 0],
			count: { label: 'Number of balls', min: 10, max: 120, step: 5, value: 30 }
		},
		{
			name: 'Gravity Well',
			blurb: 'Everything is pulled toward the centre and swirled into an orbital vortex. Static dots, moving spiral.',
			hint: 'The well follows your cursor · hold to deepen it.',
			fade: [0, 0, 0],
			count: { label: 'Number of balls', min: 10, max: 200, step: 10, value: 80 }
		},
		{
			name: 'Nine Dimensions',
			blurb: 'A starfield painted in nine-tone palettes. Planets orbit wherever you point, and the sky leans away from you.',
			hint: 'Steer with your cursor · switch palettes to change dimension.',
			fade: [2, 3, 18],
			count: { label: 'Stars', min: 100, max: 1000, step: 50, value: 300 }
		}
	];
	const STAR_ROOM = 4;

	const CONTROLS = [
		{ id: 'speed', label: 'Animation speed', min: 0.1, max: 2, step: 0.1, value: 1, fmt: (v) => v.toFixed(1) + 'x' },
		{ id: 'count', label: 'Count' },
		{ id: 'maxSpeed', label: 'Max speed limit', rooms: [0, 1, 2, 3], min: 1, max: 10, step: 0.5, value: 5, fmt: (v) => v.toFixed(1) },
		{ id: 'trail', label: 'Trail length', rooms: [0, 1, 2, 3], min: 1, max: 10, step: 1, value: 9, fmt: (v) => String(v) },
		{ id: 'twinkle', label: 'Twinkle intensity', rooms: [STAR_ROOM], min: 0, max: 1, step: 0.1, value: 0.5, fmt: (v) => v.toFixed(1) },
		{ id: 'planets', label: 'Planet count', rooms: [STAR_ROOM], min: 0, max: 20, step: 1, value: 5, fmt: (v) => String(v) },
		{ id: 'orbit', label: 'Orbit speed', rooms: [STAR_ROOM], min: 0.1, max: 1, step: 0.1, value: 0.3, fmt: (v) => v.toFixed(1) + 'x' },
		{ id: 'planetSize', label: 'Planet size', rooms: [STAR_ROOM], min: 1, max: 5, step: 0.5, value: 2.5, fmt: (v) => v.toFixed(1) },
		{ id: 'nebula', label: 'Nebula density', rooms: [STAR_ROOM], min: 0, max: 0.5, step: 0.05, value: 0.2, fmt: (v) => v.toFixed(2) }
	];

	const state = {
		room: 0,
		palette: 'rainbow',
		paused: false,
		tour: false,
		shooting: true,
		values: {},
		counts: ROOMS.map((r) => r.count.value)
	};
	CONTROLS.forEach((c) => {
		if (c.value !== undefined) state.values[c.id] = c.value;
	});

	let W = 0;
	let H = 0;
	let time = 0;
	let tourTimer = null;

	const pointer = { x: 0, y: 0, active: false, down: false };
	const focus = { x: 0, y: 0 };

	let balls = [];
	let stars = [];
	let planets = [];
	let comets = [];
	let clouds = [];

	// ── Helpers ─────────────────────────────────────────────────────────
	function colorOf(seed, alpha) {
		const p = PALETTES[state.palette];
		if (p.cycle) {
			return `hsla(${(seed * 360 + time * 0.2 * state.values.speed) % 360},100%,58%,${alpha})`;
		}
		const c = p.rgb[Math.floor(seed * NINE) % NINE];
		return `rgba(${c[0]},${c[1]},${c[2]},${alpha})`;
	}

	function fillBackground(alpha) {
		const f = ROOMS[state.room].fade;
		ctx.fillStyle = `rgba(${f[0]},${f[1]},${f[2]},${alpha})`;
		ctx.fillRect(0, 0, W, H);
	}

	function resizeCanvas() {
		const dpr = Math.min(window.devicePixelRatio || 1, 2);
		W = window.innerWidth;
		H = window.innerHeight;
		canvas.width = Math.round(W * dpr);
		canvas.height = Math.round(H * dpr);
		ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
		fillBackground(1);
		if (!pointer.active) {
			focus.x = W / 2;
			focus.y = H / 2;
		}
	}

	// ── Ball rooms ──────────────────────────────────────────────────────
	class Ball {
		constructor(x, y, r, vx, vy, gen) {
			this.x = x;
			this.y = y;
			this.r = r;
			this.vx = vx;
			this.vy = vy;
			this.gen = gen || 0;
			this.seed = Math.random();
			this.life = 100;
			this.terminal = false;
			this.ttl = 0;
			this.dead = false;
		}

		retire() {
			this.terminal = true;
			this.ttl = 300 + Math.random() * 500;
		}

		update(dt) {
			const room = state.room;
			const v = state.values;
			const sp = v.speed * dt;

			// Subtle warp keeps the paths from ever being straight lines
			this.x += this.vx * sp + Math.sin(time * 0.02 * v.speed + this.y * 0.01) * 0.5 * sp;
			this.y += this.vy * sp + Math.cos(time * 0.03 * v.speed + this.x * 0.01) * 0.5 * sp;

			if (room === 3) {
				const tx = pointer.active ? pointer.x : W / 2;
				const ty = pointer.active ? pointer.y : H / 2;
				const dx = tx - this.x;
				const dy = ty - this.y;
				const d = Math.hypot(dx, dy) || 1;
				const pull = (pointer.down ? 0.05 : 0.014) * sp;
				const swirl = 0.006 * sp;
				this.vx += (dx / d) * pull - (dy / d) * swirl;
				this.vy += (dy / d) * pull + (dx / d) * swirl;
			} else if (pointer.active) {
				const dx = this.x - pointer.x;
				const dy = this.y - pointer.y;
				const d = Math.hypot(dx, dy) || 1;
				if (pointer.down) {
					if (d < 320) {
						const f = 0.12 * (1 - d / 320) * sp;
						this.vx -= (dx / d) * f;
						this.vy -= (dy / d) * f;
					}
				} else if (d < 130) {
					const f = 0.45 * (1 - d / 130) * sp;
					this.vx += (dx / d) * f;
					this.vy += (dy / d) * f;
				}
			}

			let hit = false;
			if (this.x < this.r) {
				this.x = this.r;
				this.vx = Math.abs(this.vx);
				hit = true;
			} else if (this.x > W - this.r) {
				this.x = W - this.r;
				this.vx = -Math.abs(this.vx);
				hit = true;
			}
			if (this.y < this.r) {
				this.y = this.r;
				this.vy = Math.abs(this.vy);
				hit = true;
			} else if (this.y > H - this.r) {
				this.y = H - this.r;
				this.vy = -Math.abs(this.vy);
				hit = true;
			}

			const speed = Math.hypot(this.vx, this.vy);
			if (speed > v.maxSpeed) {
				const k = v.maxSpeed / speed;
				this.vx *= k;
				this.vy *= k;
			}

			if (room === 1 && !this.terminal) {
				this.life -= dt;
				if (this.life <= 0) {
					if (this.r > 3.2 && balls.length < MAX_BALLS) this.divide();
					this.life = 100;
				}
				if (this.r <= 3.2) this.retire();
			} else if (room === 2 && hit && !this.terminal) {
				if (this.r > 3.5 && balls.length < MAX_BALLS) {
					this.shatter();
					this.dead = true;
				} else {
					this.retire();
				}
			}

			if (this.terminal) {
				this.ttl -= dt;
				if (this.ttl < 60) this.r *= 0.97;
				if (this.ttl <= 0 || this.r < 0.6) this.dead = true;
			}
		}

		divide() {
			for (let i = 0; i < 2; i++) {
				const angle = Math.random() * Math.PI * 2;
				const speed = Math.random() * 2 + 1;
				const kid = new Ball(this.x, this.y, this.r * 0.6, this.vx + Math.cos(angle) * speed, this.vy + Math.sin(angle) * speed, this.gen + 1);
				if (kid.r <= 3.2) kid.retire();
				balls.push(kid);
			}
			this.r *= 0.7;
		}

		shatter() {
			for (let i = 0; i < 2; i++) {
				const angle = Math.random() * Math.PI * 2;
				const speed = Math.random() * 3 + 2;
				const kid = new Ball(this.x, this.y, this.r * 0.72, Math.cos(angle) * speed, Math.sin(angle) * speed, this.gen + 1);
				if (kid.r <= 3.5) kid.retire();
				balls.push(kid);
			}
		}

		draw() {
			ctx.beginPath();
			ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
			ctx.fillStyle = colorOf(this.seed, 1);
			ctx.fill();
		}
	}

	function spawnBall() {
		const r = BASE_RADIUS * (Math.random() * 0.5 + 0.7);
		const x = Math.random() * (W - r * 2) + r;
		const y = Math.random() * (H - r * 2) + r;
		balls.push(new Ball(x, y, r, (Math.random() - 0.5) * 2, (Math.random() - 0.5) * 2, 0));
	}

	function initBalls() {
		balls = [];
		for (let i = 0; i < state.counts[state.room]; i++) spawnBall();
	}

	function stepBalls(dt) {
		fillBackground(0.32 - state.values.trail * 0.03);

		const room = state.room;
		const target = state.counts[room];
		if (Math.random() < 0.15 * dt) {
			if ((room === 1 && balls.length < target) || (room === 2 && balls.length < target * 3)) spawnBall();
		}

		const n = balls.length;
		for (let i = 0; i < n; i++) balls[i].update(dt);
		balls = balls.filter((b) => !b.dead);
		balls.forEach((b) => b.draw());
	}

	// ── Starfield room ──────────────────────────────────────────────────
	class Star {
		constructor() {
			this.x = Math.random() * W;
			this.y = Math.random() * H;
			this.size = Math.random() * 2 + 0.5;
			this.speed = Math.random() * 0.5 + 0.1;
			this.layer = Math.random();
			this.base = Math.random() * 0.8 + 0.2;
			this.seed = Math.random();
			this.phase = Math.random() * Math.PI * 2;
			this.b = this.base;
		}

		update(dt) {
			const v = state.values;
			const sp = v.speed * dt;
			this.x += this.speed * sp;
			this.y += this.speed * 0.5 * sp;

			// Parallax: the sky leans away from the focus point
			const dx = (focus.x - W / 2) / W;
			const dy = (focus.y - H / 2) / H;
			this.x -= dx * this.layer * 8 * sp;
			this.y -= dy * this.layer * 8 * sp;

			if (this.x > W) this.x -= W;
			else if (this.x < 0) this.x += W;
			if (this.y > H) this.y -= H;
			else if (this.y < 0) this.y += H;

			const b = this.base + Math.sin(time * 0.01 + this.phase) * v.twinkle * 0.3;
			this.b = Math.min(1, Math.max(0.05, b));
		}

		draw() {
			if (this.size > 1.5) {
				ctx.fillStyle = colorOf(this.seed, this.b * 0.16);
				ctx.beginPath();
				ctx.arc(this.x, this.y, this.size * 3.2, 0, Math.PI * 2);
				ctx.fill();
			}
			ctx.fillStyle = colorOf(this.seed, this.b);
			ctx.beginPath();
			ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
			ctx.fill();
		}
	}

	class Planet {
		constructor() {
			this.angle = Math.random() * Math.PI * 2;
			this.orbit = 100 + Math.random() * 200;
			this.seed = Math.random();
			this.phase = Math.random() * Math.PI * 2;
			this.ring = Math.random() > 0.6;
			this.tilt = Math.random() * Math.PI;
			this.x = focus.x;
			this.y = focus.y;
			this.b = 1;
		}

		update(dt) {
			this.angle += state.values.orbit * 0.02 * dt;
			this.x = focus.x + Math.cos(this.angle) * this.orbit;
			this.y = focus.y + Math.sin(this.angle) * this.orbit;
			this.b = 0.8 + Math.sin(time * 0.005 + this.phase) * 0.2;
		}

		draw() {
			const size = state.values.planetSize;
			const color = colorOf(this.seed, this.b);
			ctx.save();
			ctx.shadowColor = color;
			ctx.shadowBlur = size * 5;
			ctx.fillStyle = color;
			ctx.beginPath();
			ctx.arc(this.x, this.y, size * 3, 0, Math.PI * 2);
			ctx.fill();
			if (this.ring) {
				ctx.shadowBlur = 0;
				ctx.strokeStyle = colorOf(this.seed, this.b * 0.7);
				ctx.lineWidth = 1.2;
				ctx.beginPath();
				ctx.ellipse(this.x, this.y, size * 5.2, size * 1.6, this.tilt, 0, Math.PI * 2);
				ctx.stroke();
			}
			ctx.restore();
		}
	}

	class Comet {
		constructor() {
			this.x = Math.random() * W * 0.8;
			this.y = Math.random() * H * 0.5;
			this.vx = 9 + Math.random() * 6;
			this.vy = 3 + Math.random() * 3;
			this.life = 1;
			this.tail = 8 + Math.random() * 6;
		}

		update(dt) {
			this.x += this.vx * dt;
			this.y += this.vy * dt;
			this.life -= 0.012 * dt;
		}

		draw() {
			const tx = this.x - this.vx * this.tail;
			const ty = this.y - this.vy * this.tail;
			const g = ctx.createLinearGradient(this.x, this.y, tx, ty);
			g.addColorStop(0, `rgba(255,255,255,${Math.max(0, this.life)})`);
			g.addColorStop(1, 'rgba(255,255,255,0)');
			ctx.strokeStyle = g;
			ctx.lineWidth = 2;
			ctx.lineCap = 'round';
			ctx.beginPath();
			ctx.moveTo(this.x, this.y);
			ctx.lineTo(tx, ty);
			ctx.stroke();
		}
	}

	function initStars() {
		stars = [];
		for (let i = 0; i < state.counts[STAR_ROOM]; i++) stars.push(new Star());
	}

	function initPlanets() {
		planets = [];
		for (let i = 0; i < state.values.planets; i++) planets.push(new Planet());
	}

	function initClouds() {
		clouds = [];
		for (let i = 0; i < 6; i++) {
			clouds.push({
				x: Math.random() * W,
				y: Math.random() * H,
				r: (0.18 + Math.random() * 0.18) * Math.max(W, H),
				vx: (Math.random() - 0.5) * 0.12,
				vy: (Math.random() - 0.5) * 0.12,
				seed: Math.random(),
				phase: Math.random() * Math.PI * 2
			});
		}
	}

	function stepStars(dt) {
		const v = state.values;
		fillBackground(0.14);

		const tx = pointer.active ? pointer.x : W / 2;
		const ty = pointer.active ? pointer.y : H / 2;
		focus.x += (tx - focus.x) * Math.min(1, 0.06 * dt);
		focus.y += (ty - focus.y) * Math.min(1, 0.06 * dt);

		if (v.nebula > 0) {
			clouds.forEach((c) => {
				c.x += c.vx * v.speed * dt;
				c.y += c.vy * v.speed * dt;
				if (c.x < -c.r) c.x = W + c.r;
				else if (c.x > W + c.r) c.x = -c.r;
				if (c.y < -c.r) c.y = H + c.r;
				else if (c.y > H + c.r) c.y = -c.r;
				const r = c.r * (1 + Math.sin(time * 0.004 + c.phase) * 0.12);
				const g = ctx.createRadialGradient(c.x, c.y, 0, c.x, c.y, r);
				g.addColorStop(0, colorOf(c.seed, v.nebula * 0.25));
				g.addColorStop(1, colorOf(c.seed, 0));
				ctx.fillStyle = g;
				ctx.fillRect(c.x - r, c.y - r, r * 2, r * 2);
			});
		}

		stars.forEach((s) => {
			s.update(dt);
			s.draw();
		});
		planets.forEach((p) => {
			p.update(dt);
			p.draw();
		});

		if (state.shooting) {
			if (comets.length < 4 && Math.random() < 0.012 * dt) comets.push(new Comet());
		}
		comets.forEach((c) => {
			c.update(dt);
			c.draw();
		});
		comets = comets.filter((c) => c.life > 0 && c.x < W + 200 && c.y < H + 200);
	}

	// ── Room management ─────────────────────────────────────────────────
	function rebuildRoom() {
		if (state.room === STAR_ROOM) {
			balls = [];
			comets = [];
			initStars();
			initPlanets();
			initClouds();
		} else {
			stars = [];
			planets = [];
			comets = [];
			clouds = [];
			initBalls();
		}
		fillBackground(1);
	}

	function updatePlacard() {
		const room = ROOMS[state.room];
		document.getElementById('placard-no').textContent = `Exhibit ${String(state.room + 1).padStart(2, '0')} / ${String(ROOMS.length).padStart(2, '0')}`;
		document.getElementById('placard-title').textContent = room.name;
		document.getElementById('placard-blurb').textContent = room.blurb;
		document.getElementById('placard-hint').textContent = room.hint;
		placard.classList.remove('swap');
		void placard.offsetWidth;
		placard.classList.add('swap');
	}

	function syncControls() {
		const room = state.room;
		CONTROLS.forEach((c) => {
			const row = document.querySelector(`[data-control="${c.id}"]`);
			const input = document.getElementById(`ctl-${c.id}`);
			const out = document.getElementById(`out-${c.id}`);
			row.hidden = Boolean(c.rooms) && !c.rooms.includes(room);
			if (c.id === 'count') {
				const cfg = ROOMS[room].count;
				row.querySelector('.lbl').textContent = cfg.label;
				input.min = cfg.min;
				input.max = cfg.max;
				input.step = cfg.step;
				input.value = state.counts[room];
				out.textContent = state.counts[room];
			} else {
				input.value = state.values[c.id];
				out.textContent = c.fmt(state.values[c.id]);
			}
		});
		shootingRow.hidden = room !== STAR_ROOM;
	}

	function restartTour() {
		clearInterval(tourTimer);
		tourTimer = null;
		if (state.tour) tourTimer = setInterval(() => setRoom(state.room + 1), TOUR_MS);
	}

	function setRoom(index) {
		state.room = (index + ROOMS.length) % ROOMS.length;
		rebuildRoom();
		syncControls();
		updatePlacard();
		roomsNav.querySelectorAll('.room-btn').forEach((btn, i) => {
			btn.setAttribute('aria-current', String(i === state.room));
		});
		try {
			history.replaceState(null, '', `#${state.room + 1}`);
		} catch (e) {
			/* replaceState can be blocked in some embeds */
		}
		restartTour();
	}

	function setPaused(paused) {
		state.paused = paused;
		pauseBtn.setAttribute('aria-pressed', String(paused));
		pauseBtn.textContent = paused ? 'Resume' : 'Pause';
	}

	function setTour(on) {
		state.tour = on;
		tourBtn.setAttribute('aria-pressed', String(on));
		restartTour();
	}

	function setPanelOpen(open) {
		panel.hidden = !open;
		panelBtn.setAttribute('aria-expanded', String(open));
	}

	// ── UI wiring ───────────────────────────────────────────────────────
	function buildUI() {
		ROOMS.forEach((room, i) => {
			const btn = document.createElement('button');
			btn.type = 'button';
			btn.className = 'room-btn';
			btn.innerHTML = `<small>${String(i + 1).padStart(2, '0')}</small>${room.name}`;
			btn.addEventListener('click', () => setRoom(i));
			roomsNav.appendChild(btn);
		});

		Object.keys(PALETTES).forEach((key, i) => {
			const opt = document.createElement('option');
			opt.value = key;
			opt.textContent = `${ROMAN[i]} · ${PALETTES[key].label}`;
			paletteSelect.appendChild(opt);
		});
		paletteSelect.addEventListener('change', () => {
			state.palette = paletteSelect.value;
		});

		CONTROLS.forEach((c) => {
			const row = document.createElement('div');
			row.className = 'control-group';
			row.dataset.control = c.id;
			row.innerHTML = `<label for="ctl-${c.id}"><span class="lbl">${c.label}</span><output id="out-${c.id}"></output></label>` +
				`<input type="range" id="ctl-${c.id}" min="${c.min ?? 0}" max="${c.max ?? 1}" step="${c.step ?? 1}" value="${c.value ?? 0}">`;
			controlsBody.appendChild(row);

			row.querySelector('input').addEventListener('input', (e) => {
				const val = parseFloat(e.target.value);
				const out = document.getElementById(`out-${c.id}`);
				if (c.id === 'count') {
					state.counts[state.room] = val;
					out.textContent = val;
					rebuildRoom();
					return;
				}
				state.values[c.id] = val;
				out.textContent = c.fmt(val);
				if (c.id === 'planets') initPlanets();
			});
		});

		shootingToggle.addEventListener('change', () => {
			state.shooting = shootingToggle.checked;
		});

		tourBtn.addEventListener('click', () => setTour(!state.tour));
		pauseBtn.addEventListener('click', () => setPaused(!state.paused));
		panelBtn.addEventListener('click', () => setPanelOpen(panel.hidden));
	}

	canvas.addEventListener('pointermove', (e) => {
		pointer.x = e.clientX;
		pointer.y = e.clientY;
		pointer.active = true;
	});
	canvas.addEventListener('pointerdown', (e) => {
		pointer.x = e.clientX;
		pointer.y = e.clientY;
		pointer.active = true;
		pointer.down = true;
		canvas.setPointerCapture(e.pointerId);
	});
	const releasePointer = (e) => {
		pointer.down = false;
		if (e.pointerType !== 'mouse') pointer.active = false;
	};
	canvas.addEventListener('pointerup', releasePointer);
	canvas.addEventListener('pointercancel', releasePointer);
	canvas.addEventListener('pointerleave', (e) => {
		if (!pointer.down) pointer.active = false;
	});

	window.addEventListener('keydown', (e) => {
		if (e.ctrlKey || e.metaKey || e.altKey) return;
		if (/^(INPUT|SELECT|TEXTAREA|BUTTON)$/.test(e.target.tagName) && e.key === ' ') return;
		const n = parseInt(e.key, 10);
		if (n >= 1 && n <= ROOMS.length) setRoom(n - 1);
		else if (e.key === 'ArrowRight') setRoom(state.room + 1);
		else if (e.key === 'ArrowLeft') setRoom(state.room - 1);
		else if (e.key === ' ') {
			e.preventDefault();
			setPaused(!state.paused);
		} else if (e.key === 't' || e.key === 'T') setTour(!state.tour);
		else if (e.key === 'c' || e.key === 'C') setPanelOpen(panel.hidden);
	});

	window.addEventListener('resize', resizeCanvas);

	// ── Main loop ───────────────────────────────────────────────────────
	let last = performance.now();
	function frame(now) {
		const dt = Math.min((now - last) / 16.667, 3);
		last = now;
		if (!state.paused) {
			time += dt;
			if (state.room === STAR_ROOM) stepStars(dt);
			else stepBalls(dt);
		}
		requestAnimationFrame(frame);
	}

	buildUI();
	resizeCanvas();
	setPanelOpen(window.innerWidth > 760);
	const fromHash = parseInt(window.location.hash.slice(1), 10);
	setRoom(fromHash >= 1 && fromHash <= ROOMS.length ? fromHash - 1 : 0);
	requestAnimationFrame(frame);
});
