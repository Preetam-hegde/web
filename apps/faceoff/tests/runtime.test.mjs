'use strict';
import assert from 'node:assert/strict';
import test from 'node:test';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { createRoundScope } = require('../js/runtime.js');

function clock() {
	let id = 0;
	const tasks = new Map();
	return {
		tasks,
		setTimeout(fn) {
			tasks.set(++id, fn);
			return id;
		},
		clearTimeout(n) {
			tasks.delete(n);
		},
		requestAnimationFrame(fn) {
			tasks.set(++id, fn);
			return id;
		},
		cancelAnimationFrame(n) {
			tasks.delete(n);
		},
		step() {
			for (const [n, fn] of [...tasks]) {
				tasks.delete(n);
				fn();
			}
		},
	};
}

test('dispose cancels pending timers, animation frames and event listeners', () => {
	const c = clock(),
		target = new EventTarget(),
		scope = createRoundScope(() => true, c);
	let called = 0,
		cleaned = 0;
	scope.after(10, () => called++);
	scope.loop(() => called++);
	scope.on(target, 'tap', () => called++);
	scope.cleanup(() => cleaned++);
	scope.dispose();
	scope.dispose();
	c.step();
	target.dispatchEvent(new Event('tap'));
	assert.equal(called, 0);
	assert.equal(cleaned, 1);
	assert.equal(c.tasks.size, 0);
});

test('a dead turn never runs work, even if its callback was already queued', () => {
	const c = clock();
	let alive = true,
		called = 0;
	const scope = createRoundScope(() => alive, c);
	scope.after(10, () => called++);
	const queued = [...c.tasks.values()][0];
	alive = false;
	queued();
	assert.equal(called, 0);
});

test('loops stop on false, and finished timers are released', () => {
	const c = clock(),
		scope = createRoundScope(() => true, c);
	let frames = 0,
		timers = 0;
	scope.loop(() => ++frames < 2);
	scope.after(10, () => timers++);
	c.step();
	c.step();
	c.step();
	assert.equal(frames, 2);
	assert.equal(timers, 1);
	assert.equal(c.tasks.size, 0);
});

test('disposed scopes cannot register new work or listeners', () => {
	const c = clock(),
		target = new EventTarget(),
		scope = createRoundScope(() => true, c);
	let called = 0;
	scope.dispose();
	scope.after(1, () => called++);
	scope.loop(() => called++);
	scope.on(target, 'tap', () => called++);
	target.dispatchEvent(new Event('tap'));
	c.step();
	assert.equal(called, 0);
	assert.equal(c.tasks.size, 0);
});
