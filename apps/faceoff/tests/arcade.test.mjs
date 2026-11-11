'use strict';

import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import test from 'node:test';

const require = createRequire(import.meta.url);
const rules = require('../js/arcade-rules.js');
const course = {
	width: 1000,
	height: 600,
	start: { x: 140, y: 300 },
	hole: { x: 860, y: 300 },
	obstacles: [{ x: 450, y: 80, w: 100, h: 320 }],
};
const ball = (x = 140, y = 300) => ({
	x,
	y,
	vx: 0,
	vy: 0,
	holed: false,
	shotTime: 0,
});

test('Stack trims either overhang, treats touching blocks as a miss and never widens', () => {
	assert.equal(typeof rules.stackOverlap, 'function');
	assert.deepEqual(
		rules.stackOverlap({ x: 0.3, width: 0.4 }, { x: 0.2, width: 0.4 }),
		{ x: 0.3, width: 0.3 },
	);
	assert.deepEqual(
		rules.stackOverlap({ x: 0.3, width: 0.4 }, { x: 0.4, width: 0.4 }),
		{ x: 0.4, width: 0.3 },
	);
	assert.equal(
		rules.stackOverlap({ x: 0.25, width: 0.25 }, { x: 0.5, width: 0.25 }),
		null,
	);
});

test('Stack movement is bounded and repeatable; layers outrank retained width', () => {
	assert.equal(typeof rules.stackPosition, 'function');
	const cfg = { speed: 0.4, phase: 0 };
	assert.equal(rules.stackPosition(0, 0.4, cfg, 0), 0);
	assert.equal(rules.stackPosition(1500, 0.4, cfg, 0), 0.6);
	assert.equal(rules.stackPosition(3000, 0.4, cfg, 0), 0);
	for (let ms = 0; ms < 30000; ms += 137) {
		const x = rules.stackPosition(ms, 0.05, cfg, 9);
		assert(x >= 0 && x <= 0.95);
	}
	assert(rules.stackScore(3, 0.001) > rules.stackScore(2, 1));
	assert(rules.stackScore(3, 0.3) > rules.stackScore(3, 0.2));
	assert.equal(rules.stackScore(0, 0.44), 0);
});

test('Golf rejects zero/invalid and in-flight shots, and clamps oversize power', () => {
	assert.equal(typeof rules.golfShot, 'function');
	for (const power of [0, -1, NaN, Infinity])
		assert.equal(rules.golfShot(ball(), 0, power), null);
	assert.equal(rules.golfShot(ball(), NaN, 50), null);
	assert.equal(rules.golfShot({ ...ball(), vx: 20 }, 0, 50), null);
	assert.equal(rules.golfShot({ ...ball(), holed: true }, 0, 50), null);
	const shot = rules.golfShot(ball(), -90, 200);
	assert(Math.abs(shot.vx) < 0.001);
	assert.equal(shot.vy, -1000);
	assert.equal(ball().vx, 0);
});

test('Golf rebounds from walls and obstacle faces without tunnelling through a thin wall', () => {
	assert.equal(typeof rules.golfStep, 'function');
	const wall = rules.golfStep({ ...ball(985, 500), vx: 500 }, course, 0.1);
	assert(wall.x < 985 && wall.vx < 0);
	const obstacle = rules.golfStep({ ...ball(425, 300), vx: 1000 }, course, 0.1);
	assert(obstacle.x < 438 && obstacle.vx < 0);
	const thinCourse = {
		...course,
		obstacles: [{ x: 450, y: 80, w: 2, h: 320 }],
	};
	const thin = rules.golfStep({ ...ball(425, 300), vx: 1000 }, thinCourse, 0.1);
	assert(thin.x < 438 && thin.vx < 0);
});

test('Golf friction and shot deadline settle every shot; slow hole entry sinks, fast passage does not', () => {
	assert.equal(typeof rules.golfStep, 'function');
	let moving = rules.golfShot(ball(140, 500), 0, 100);
	const again = rules.golfStep(moving, course, 0.5);
	assert(again.vx > 0 && again.vx < 1000);
	for (let i = 0; i < 50; i++) moving = rules.golfStep(moving, course, 0.1);
	assert.equal(moving.vx, 0);
	assert.equal(moving.vy, 0);
	assert.equal(
		rules.golfStep({ ...ball(846, 300), vx: 50 }, course, 0.02).holed,
		true,
	);
	assert.equal(
		rules.golfStep({ ...ball(846, 300), vx: 900 }, course, 0.02).holed,
		false,
	);
});

test('Golf holes rank by strokes ahead of every miss; misses rank by distance then strokes and invalid state loses', () => {
	assert.equal(typeof rules.golfScore, 'function');
	assert(
		rules.golfScore({ ...ball(), holed: true }, course, 2) <
			rules.golfScore({ ...ball(), holed: true }, course, 3),
	);
	assert(
		rules.golfScore({ ...ball(), holed: true }, course, 5) <
			rules.golfScore(ball(859, 300), course, 1),
	);
	assert(
		rules.golfScore(ball(800, 300), course, 5) <
			rules.golfScore(ball(140, 300), course, 0),
	);
	assert(
		rules.golfScore(ball(800, 300), course, 2) <
			rules.golfScore(ball(800, 300), course, 3),
	);
	assert(Number.isFinite(rules.golfScore({ ...ball(), x: NaN }, course, 2)));
	assert(
		rules.golfScore({ ...ball(), x: NaN }, course, 2) >
			rules.golfScore(ball(), course, 0),
	);
});
