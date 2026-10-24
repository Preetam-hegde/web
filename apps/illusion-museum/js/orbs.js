'use strict';

window.Museum = window.Museum || {
	exhibits: [],
	register(exhibit) {
		this.exhibits.push(exhibit);
	}
};

(() => {
	const BASE_RADIUS = 10;
	const MAX_ORBS = 900;
	const LINK_DIST = 120;
	const TAU = Math.PI * 2;

	let orbs = [];
	let founding = 0;

	class Orb {
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

		update(M, v, dt) {
			const sp = M.speed * dt;
			const p = M.pointer;

			// Subtle warp keeps the paths from ever being straight lines
			this.x += this.vx * sp + Math.sin(M.time * 0.02 * M.speed + this.y * 0.01) * 0.5 * sp;
			this.y += this.vy * sp + Math.cos(M.time * 0.03 * M.speed + this.x * 0.01) * 0.5 * sp;

			if (v.mode === 'gravity') {
				const tx = p.active ? p.x : M.W / 2;
				const ty = p.active ? p.y : M.H / 2;
				const dx = tx - this.x;
				const dy = ty - this.y;
				const d = Math.hypot(dx, dy) || 1;
				const pull = (p.down ? 0.05 : 0.014) * sp;
				const swirl = 0.006 * sp;
				this.vx += (dx / d) * pull - (dy / d) * swirl;
				this.vy += (dy / d) * pull + (dx / d) * swirl;
			} else if (p.active) {
				const dx = this.x - p.x;
				const dy = this.y - p.y;
				const d = Math.hypot(dx, dy) || 1;
				if (p.down) {
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
			} else if (this.x > M.W - this.r) {
				this.x = M.W - this.r;
				this.vx = -Math.abs(this.vx);
				hit = true;
			}
			if (this.y < this.r) {
				this.y = this.r;
				this.vy = Math.abs(this.vy);
				hit = true;
			} else if (this.y > M.H - this.r) {
				this.y = M.H - this.r;
				this.vy = -Math.abs(this.vy);
				hit = true;
			}

			const speed = Math.hypot(this.vx, this.vy);
			if (speed > v.maxSpeed) {
				const k = v.maxSpeed / speed;
				this.vx *= k;
				this.vy *= k;
			}

			if (v.mode === 'divide' && !this.terminal) {
				this.life -= dt;
				if (this.life <= 0) {
					if (this.r > 3.2 && orbs.length < MAX_ORBS) this.split(0.6, 1, 2, true);
					this.life = 100;
				}
				if (this.r <= 3.2) this.retire();
			} else if (v.mode === 'shatter' && hit && !this.terminal) {
				if (this.r > 3.5 && orbs.length < MAX_ORBS) {
					this.split(0.72, 2, 5, false);
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

		// Spawn two children; "inherit" keeps the parent's momentum (cell division)
		split(scale, minSpeed, maxSpeed, inherit) {
			for (let i = 0; i < 2; i++) {
				const angle = Math.random() * TAU;
				const speed = minSpeed + Math.random() * (maxSpeed - minSpeed);
				const kid = new Orb(
					this.x,
					this.y,
					this.r * scale,
					(inherit ? this.vx : 0) + Math.cos(angle) * speed,
					(inherit ? this.vy : 0) + Math.sin(angle) * speed,
					this.gen + 1
				);
				if (kid.r <= 3.5) kid.retire();
				orbs.push(kid);
			}
			if (inherit) this.r *= 0.7;
		}

		draw(M) {
			const ctx = M.ctx;
			ctx.fillStyle = M.color(this.seed, 0.13);
			ctx.beginPath();
			ctx.arc(this.x, this.y, this.r * 2.4, 0, TAU);
			ctx.fill();
			ctx.fillStyle = M.color(this.seed, 1);
			ctx.beginPath();
			ctx.arc(this.x, this.y, this.r, 0, TAU);
			ctx.fill();
		}
	}

	function spawn(M) {
		const r = BASE_RADIUS * (Math.random() * 0.5 + 0.7);
		const x = Math.random() * (M.W - r * 2) + r;
		const y = Math.random() * (M.H - r * 2) + r;
		orbs.push(new Orb(x, y, r, (Math.random() - 0.5) * 2, (Math.random() - 0.5) * 2, 0));
	}

	function drawLinks(M) {
		const ctx = M.ctx;
		ctx.lineWidth = 1;
		for (let i = 0; i < orbs.length; i++) {
			const a = orbs[i];
			for (let j = i + 1; j < orbs.length; j++) {
				const b = orbs[j];
				const dx = a.x - b.x;
				const dy = a.y - b.y;
				if (dx > LINK_DIST || dx < -LINK_DIST || dy > LINK_DIST || dy < -LINK_DIST) continue;
				const d = Math.hypot(dx, dy);
				if (d >= LINK_DIST) continue;
				ctx.strokeStyle = M.color((a.seed + b.seed) / 2, (1 - d / LINK_DIST) * 0.4);
				ctx.beginPath();
				ctx.moveTo(a.x, a.y);
				ctx.lineTo(b.x, b.y);
				ctx.stroke();
			}
		}
	}

	Museum.register({
		order: 0,
		name: 'Living Orbs',
		blurb: 'One colony, four behaviours: bouncing, dividing like cells, shattering on impact, or spiralling into a gravity well. Linked orbs weave shifting webs.',
		hint: 'Move to push the orbs away · hold to pull them in · try each behaviour.',
		controls: [
			{
				id: 'mode',
				label: 'Behaviour',
				type: 'select',
				value: 'bounce',
				rebuild: true,
				options: [['bounce', 'Bounce'], ['divide', 'Divide (cells)'], ['shatter', 'Shatter on hit'], ['gravity', 'Gravity well']]
			},
			{ id: 'count', label: 'Colony size', min: 10, max: 200, step: 10, value: 60, rebuild: true },
			{ id: 'maxSpeed', label: 'Max speed', min: 1, max: 10, step: 0.5, value: 5 },
			{ id: 'trail', label: 'Trail length', min: 1, max: 10, step: 1, value: 8 },
			{ id: 'links', label: 'Connect nearby orbs', type: 'checkbox', value: true }
		],

		init(M, v) {
			// Dividing and shattering colonies multiply, so they start smaller
			const scale = v.mode === 'divide' ? 0.35 : v.mode === 'shatter' ? 0.5 : 1;
			founding = Math.max(5, Math.round(v.count * scale));
			orbs = [];
			for (let i = 0; i < founding; i++) spawn(M);
		},

		resize() {},

		step(M, dt, v) {
			M.fill([0, 0, 0], 0.32 - v.trail * 0.03);

			const refill = v.mode === 'divide' ? founding : v.mode === 'shatter' ? founding * 3 : 0;
			if (orbs.length < refill && Math.random() < 0.15 * dt) spawn(M);

			const n = orbs.length;
			for (let i = 0; i < n; i++) orbs[i].update(M, v, dt);
			orbs = orbs.filter((o) => !o.dead);

			if (v.links && orbs.length <= 260) drawLinks(M);
			orbs.forEach((o) => o.draw(M));
		}
	});
})();
