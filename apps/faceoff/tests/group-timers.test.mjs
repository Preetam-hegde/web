'use strict';

import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';

const source = readFileSync(new URL('../js/group.js', import.meta.url), 'utf8');

function hostRoom() {
	const timers = new Map(),
		messages = [];
	let nextTimer = 0;
	const context = vm.createContext({
		store: { timed: true, groupRounds: 1 },
		epoch: 0,
		m: null,
		GAMES: [],
		document: { body: { dataset: { screen: 'hub' } } },
		$: () => ({ addEventListener() {} }),
		addEventListener() {},
		renderHub() {},
		toHub() {},
		cancelCup() {},
		setTimeout: (fn) => {
			timers.set(++nextTimer, fn);
			return nextTimer;
		},
		clearTimeout: (id) => timers.delete(id),
	});
	vm.runInContext(source, context);
	context.fixture = {
		role: 'host',
		peer: { destroy() {} },
		me: 0,
		players: ['Host', 'Guest 1', 'Guest 2'].map((name, i) => ({
			name,
			gone: false,
			conn: i ? { open: true, send: (msg) => messages.push(msg) } : null,
		})),
		names: ['Host', 'Guest 1', 'Guest 2'],
		gone: [false, false, false],
		board: { rows: [] },
		r: null,
	};
	const room = vm.runInContext('grp = fixture', context);
	return {
		context,
		room,
		messages,
		start() {
			context.grStart({ id: 'test', config: () => ({}) });
			room.r.ready.fill(true);
			context.grCheck();
			context.grResult(0, 10, '10');
		},
		expire() {
			for (const [id, fn] of [...timers]) {
				timers.delete(id);
				fn();
			}
		},
	};
}

test('a host can quit and start another timed game without losing the deadline', () => {
	const h = hostRoom();
	h.start();
	h.context.grQuit();
	h.start();
	h.expire();
	assert.deepEqual(
		h.messages.filter((msg) => msg.t === 'g-timeout').map((msg) => msg.tok),
		[2, 2],
	);
});

test('leaving a host room cancels its pending deadline', () => {
	const h = hostRoom();
	h.start();
	h.context.grLeave();
	assert.doesNotThrow(() => h.expire());
	assert.equal(h.messages.filter((msg) => msg.t === 'g-timeout').length, 0);
});
