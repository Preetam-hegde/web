'use strict';

/* Arcade geometry and scoring also run directly in Node. Golf uses a 1000 × 600 course. */
const ArcadeRules = (() => {
	const STACK_MS = 24000,
		STACK_LAYERS = 12,
		GOLF_MS = 35000,
		GOLF_STROKES = 5,
		BALL_RADIUS = 12,
		SHOT_SECONDS = 3.5;
	const clamp = (n, a, b) => Math.max(a, Math.min(b, n));
	const rounded = (n) => Math.round(n * 1e9) / 1e9;
	function stackOverlap(base, block) {
		const x = Math.max(base.x, block.x),
			width = rounded(Math.min(base.x + base.width, block.x + block.width) - x);
		return width > 0 ? { x, width } : null;
	}
	function stackPosition(ms, width, cfg, layer) {
		const span = 1 - width;
		if (span <= 0) return 0;
		const travel =
			((ms / 1000) * (cfg.speed + layer * 0.022) +
				cfg.phase * span +
				layer * span) %
			(2 * span);
		return rounded(span - Math.abs(span - travel));
	}
	const stackScore = (layers, width) =>
		layers ? layers * 1000 + Math.min(999, Math.round(width * 1000)) : 0;

	function golfShot(ball, angle, power) {
		if (
			!Number.isFinite(angle) ||
			!Number.isFinite(power) ||
			power <= 0 ||
			ball.holed ||
			ball.vx ||
			ball.vy
		)
			return null;
		const radians = (angle * Math.PI) / 180,
			speed = clamp(power, 1, 100) * 10;
		return {
			...ball,
			vx: Math.cos(radians) * speed,
			vy: Math.sin(radians) * speed,
			shotTime: 0,
		};
	}
	function golfStep(ball, course, seconds) {
		const b = { ...ball },
			r = BALL_RADIUS;
		if (b.holed || !Number.isFinite(seconds) || seconds <= 0) return b;
		const steps = Math.ceil(Math.min(seconds, SHOT_SECONDS) * 240),
			dt = Math.min(seconds, SHOT_SECONDS) / steps;
		for (let i = 0; i < steps && (b.vx || b.vy); i++) {
			b.shotTime += dt;
			b.x += b.vx * dt;
			if (b.x < r || b.x > course.width - r) {
				b.x = clamp(b.x, r, course.width - r);
				b.vx *= -0.78;
			}
			for (const o of course.obstacles) {
				if (
					b.y > o.y - r &&
					b.y < o.y + o.h + r &&
					b.x > o.x - r &&
					b.x < o.x + o.w + r
				) {
					b.x = b.vx > 0 ? o.x - r : o.x + o.w + r;
					b.vx *= -0.78;
				}
			}
			b.y += b.vy * dt;
			if (b.y < r || b.y > course.height - r) {
				b.y = clamp(b.y, r, course.height - r);
				b.vy *= -0.78;
			}
			for (const o of course.obstacles) {
				if (
					b.x > o.x - r &&
					b.x < o.x + o.w + r &&
					b.y > o.y - r &&
					b.y < o.y + o.h + r
				) {
					b.y = b.vy > 0 ? o.y - r : o.y + o.h + r;
					b.vy *= -0.78;
				}
			}
			const friction = Math.exp(-1.8 * dt);
			b.vx *= friction;
			b.vy *= friction;
			const speed = Math.hypot(b.vx, b.vy);
			if (
				speed < 180 &&
				Math.hypot(b.x - course.hole.x, b.y - course.hole.y) <= 22
			) {
				b.holed = true;
				b.x = course.hole.x;
				b.y = course.hole.y;
				b.vx = b.vy = 0;
			} else if (speed < 8 || b.shotTime >= SHOT_SECONDS) b.vx = b.vy = 0;
		}
		return b;
	}
	function golfScore(ball, course, strokes) {
		const distance = Math.hypot(ball.x - course.hole.x, ball.y - course.hole.y);
		if (!Number.isFinite(distance) || !Number.isFinite(strokes)) return 1000000;
		return ball.holed
			? Math.max(1, strokes)
			: 1000 + Math.round(distance) * 10 + clamp(strokes, 0, GOLF_STROKES);
	}
	return {
		STACK_MS,
		STACK_LAYERS,
		GOLF_MS,
		GOLF_STROKES,
		BALL_RADIUS,
		SHOT_SECONDS,
		stackOverlap,
		stackPosition,
		stackScore,
		golfShot,
		golfStep,
		golfScore,
	};
})();

if (typeof module !== 'undefined' && module.exports)
	module.exports = ArcadeRules;
