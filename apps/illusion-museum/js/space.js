'use strict';

(() => {
	const TAU = Math.PI * 2;

	let stars = [];
	let planets = [];
	let comets = [];
	let clouds = [];
	let warp = 0;

	// Stars fly toward the viewer: (x, y) is fixed, z shrinks from 1 (far) to 0 (passing the camera)
	class Star {
		constructor(M, scatter) {
			this.reset(M, scatter);
		}

		reset(M, scatter) {
			this.x = Math.random() * 2 - 1;
			this.y = Math.random() * 2 - 1;
			this.z = scatter ? Math.random() * 0.98 + 0.02 : 1;
			this.v = 0.002 + Math.random() * 0.004;
			this.seed = Math.random();
			this.bright = Math.random() * 0.6 + 0.4;
			this.phase = Math.random() * TAU;
			this.px = null;
			this.py = null;
		}

		update(M, dt, v) {
			const dz = this.v * M.speed * dt * (1 + warp * 9);
			const scale = Math.max(M.W, M.H) * 0.25;
			const prevZ = this.z + dz * (1.5 + warp * 12);
			this.z -= dz;
			if (this.z < 0.02) return this.reset(M, false);

			const sx = M.focus.x + (this.x / this.z) * scale;
			const sy = M.focus.y + (this.y / this.z) * scale;
			if (sx < -60 || sx > M.W + 60 || sy < -60 || sy > M.H + 60) return this.reset(M, false);

			const pz = Math.min(prevZ, 1.2);
			const ox = M.focus.x + (this.x / pz) * scale;
			const oy = M.focus.y + (this.y / pz) * scale;

			const depth = 1 - this.z;
			const twinkle = 1 + Math.sin(M.time * 0.1 + this.phase) * v.twinkle * 0.35;
			const alpha = Math.min(1, depth * 1.8) * this.bright * twinkle;
			if (alpha < 0.02) return;

			const size = depth * 2.4 + 0.4;
			const ctx = M.ctx;
			if (size > 2) {
				ctx.fillStyle = M.color(this.seed, Math.min(1, alpha) * 0.14);
				ctx.beginPath();
				ctx.arc(sx, sy, size * 3.4, 0, TAU);
				ctx.fill();
			}
			ctx.strokeStyle = M.color(this.seed, Math.min(1, alpha));
			ctx.lineWidth = size;
			ctx.lineCap = 'round';
			ctx.beginPath();
			ctx.moveTo(ox, oy);
			ctx.lineTo(sx, sy);
			ctx.stroke();
		}
	}

	class Planet {
		constructor(M) {
			this.angle = Math.random() * TAU;
			this.orbit = 100 + Math.random() * 200;
			this.seed = Math.random();
			this.phase = Math.random() * TAU;
			this.ring = Math.random() > 0.55;
			this.tilt = Math.random() * Math.PI;
			this.flatten = 0.25 + Math.random() * 0.5;
			this.x = M.focus.x;
			this.y = M.focus.y;
		}

		update(M, dt, v) {
			const sc = Math.min(1.3, Math.min(M.W, M.H) / 700);
			this.angle += v.orbit * 0.02 * dt * M.speed;
			// Tilted orbits read as 3D discs around the focus point
			const ox = Math.cos(this.angle) * this.orbit * sc;
			const oy = Math.sin(this.angle) * this.orbit * sc * this.flatten * 2;
			this.x = M.focus.x + ox * Math.cos(this.tilt) - oy * Math.sin(this.tilt);
			this.y = M.focus.y + ox * Math.sin(this.tilt) + oy * Math.cos(this.tilt);
		}

		draw(M, v) {
			const ctx = M.ctx;
			const size = v.planetSize;
			const b = 0.8 + Math.sin(M.time * 0.005 + this.phase) * 0.2;
			const color = M.color(this.seed, b);
			ctx.save();
			ctx.shadowColor = color;
			ctx.shadowBlur = size * 6;
			const g = ctx.createRadialGradient(this.x - size, this.y - size, size * 0.4, this.x, this.y, size * 3);
			g.addColorStop(0, M.color(this.seed, 1));
			g.addColorStop(1, M.color(this.seed, 0.55));
			ctx.fillStyle = g;
			ctx.beginPath();
			ctx.arc(this.x, this.y, size * 3, 0, TAU);
			ctx.fill();
			if (this.ring) {
				ctx.shadowBlur = 0;
				ctx.strokeStyle = M.color((this.seed + 0.15) % 1, b * 0.8);
				ctx.lineWidth = 1.4;
				ctx.beginPath();
				ctx.ellipse(this.x, this.y, size * 5.4, size * 1.7, this.tilt, 0, TAU);
				ctx.stroke();
			}
			ctx.restore();
		}
	}

	class Comet {
		constructor(M) {
			this.x = Math.random() * M.W * 0.8;
			this.y = Math.random() * M.H * 0.5;
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

		draw(M) {
			const ctx = M.ctx;
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

	function buildPlanets(M, v) {
		planets = [];
		for (let i = 0; i < v.planets; i++) planets.push(new Planet(M));
	}

	Museum.register({
		order: 1,
		name: 'Nine Dimensions',
		blurb: 'A flight through a starfield painted in nine-tone palettes. Planets orbit wherever you point, nebulae drift behind, and holding the mouse punches into hyperspace.',
		hint: 'Steer with your cursor · hold to engage warp · switch the Dimension to repaint the sky.',
		controls: [
			{ id: 'stars', label: 'Stars', min: 100, max: 1500, step: 50, value: 500, rebuild: true },
			{ id: 'cruise', label: 'Warp drive', min: 0, max: 1, step: 0.05, value: 0.1 },
			{ id: 'twinkle', label: 'Twinkle', min: 0, max: 1, step: 0.1, value: 0.5 },
			{ id: 'planets', label: 'Planets', min: 0, max: 20, step: 1, value: 5 },
			{ id: 'orbit', label: 'Orbit speed', min: 0.1, max: 1, step: 0.1, value: 0.3 },
			{ id: 'planetSize', label: 'Planet size', min: 1, max: 5, step: 0.5, value: 2.5 },
			{ id: 'nebula', label: 'Nebula density', min: 0, max: 0.5, step: 0.05, value: 0.2 },
			{ id: 'shooting', label: 'Shooting stars', type: 'checkbox', value: true }
		],

		init(M, v) {
			stars = [];
			for (let i = 0; i < v.stars; i++) stars.push(new Star(M, true));
			buildPlanets(M, v);
			comets = [];
			warp = 0;
			clouds = [];
			for (let i = 0; i < 6; i++) {
				clouds.push({
					x: Math.random() * M.W,
					y: Math.random() * M.H,
					r: (0.18 + Math.random() * 0.18) * Math.max(M.W, M.H),
					vx: (Math.random() - 0.5) * 0.12,
					vy: (Math.random() - 0.5) * 0.12,
					seed: Math.random(),
					phase: Math.random() * TAU
				});
			}
		},

		onChange(id, M, v) {
			if (id === 'planets') buildPlanets(M, v);
		},

		step(M, dt, v) {
			const ctx = M.ctx;
			M.fill([2, 3, 18], 0.2);

			const target = Math.max(v.cruise, M.pointer.down ? 1 : 0);
			warp += (target - warp) * Math.min(1, 0.06 * dt);

			if (v.nebula > 0) {
				clouds.forEach((c) => {
					c.x += c.vx * M.speed * dt;
					c.y += c.vy * M.speed * dt;
					if (c.x < -c.r) c.x = M.W + c.r;
					else if (c.x > M.W + c.r) c.x = -c.r;
					if (c.y < -c.r) c.y = M.H + c.r;
					else if (c.y > M.H + c.r) c.y = -c.r;
					const r = c.r * (1 + Math.sin(M.time * 0.004 + c.phase) * 0.12);
					const g = ctx.createRadialGradient(c.x, c.y, 0, c.x, c.y, r);
					g.addColorStop(0, M.color(c.seed, v.nebula * 0.25));
					g.addColorStop(1, M.color(c.seed, 0));
					ctx.fillStyle = g;
					ctx.fillRect(c.x - r, c.y - r, r * 2, r * 2);
				});
			}

			stars.forEach((s) => s.update(M, dt, v));
			planets.forEach((p) => {
				p.update(M, dt, v);
				p.draw(M, v);
			});

			if (v.shooting && comets.length < 4 && Math.random() < 0.012 * dt) comets.push(new Comet(M));
			comets.forEach((c) => {
				c.update(dt);
				c.draw(M);
			});
			comets = comets.filter((c) => c.life > 0 && c.x < M.W + 200 && c.y < M.H + 200);
		}
	});
})();
