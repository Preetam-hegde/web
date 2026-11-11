'use strict';

import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import test from 'node:test';

const require = createRequire(import.meta.url);
const {
	CUP_PRESETS,
	chooseCupGames,
	createCupState,
	recordCupLeg,
	advanceCupLeg,
	cupPlacements,
	isCupState,
} = require('../js/cup-rules.js');
const catalog = [
	'stack',
	'golf',
	'green',
	'whack',
	'clash',
	'order',
	'centre',
	'stop',
	'shade',
	'size',
	'hue',
	'angle',
	'split',
	'count',
	'cut',
].map((id) => ({ id }));
const run = (solo = false) =>
	createCupState(
		'run-1',
		'mixed',
		['stack', 'golf', 'green', 'stop', 'shade'],
		solo ? ['Solo'] : ['A', 'B'],
		solo,
	);

test('every Cup preset selects five distinct compatible games without changing the catalog', () => {
	for (const preset of CUP_PRESETS) {
		const selected = chooseCupGames(catalog, preset.id, () => 0.5);
		assert.equal(selected.length, 5);
		assert.equal(new Set(selected.map((game) => game.id)).size, 5);
		assert(selected.every((game) => catalog.includes(game)));
	}
	assert.equal(catalog[0].id, 'stack');
	assert.throws(() => chooseCupGames(catalog.slice(0, 2), 'mixed'), /five/i);
	assert.throws(() => chooseCupGames(catalog, 'missing'), /preset/i);
	const restricted = catalog.map((game) => ({ ...game, duel: true }));
	assert.throws(() => chooseCupGames(restricted, 'mixed'), /five/i);
});

test('Cup scoring awards wins and valid ties, never failed results', () => {
	const cup = run();
	assert(recordCupLeg(cup, 'stack', [120, 80], ['120', '80'], false));
	assert.deepEqual(cup.points, [3, 0]);
	assert(!recordCupLeg(cup, 'stack', [120, 80], ['120', '80'], false));
	assert(!recordCupLeg(cup, 'golf', [2, 2], ['2', '2'], true));
	assert(advanceCupLeg(cup));
	assert(recordCupLeg(cup, 'golf', [2, 2], ['2', '2'], true));
	assert.deepEqual(cup.points, [4, 1]);
	assert(advanceCupLeg(cup));
	recordCupLeg(cup, 'green', [Infinity, Infinity], ['Miss', 'Miss'], true);
	assert.deepEqual(cup.points, [4, 1]);
});

test('five games finish once, retain per-game results and cannot advance past the final', () => {
	const cup = run();
	for (const [i, gid] of cup.games.entries()) {
		assert(recordCupLeg(cup, gid, [1, 2], ['1 ms', '2 ms'], true));
		assert.equal(cup.phase, i === 4 ? 'complete' : 'break');
		assert.equal(advanceCupLeg(cup), i < 4);
	}
	assert.equal(cup.legs.length, 5);
	assert.deepEqual(cup.points, [15, 0]);
	assert.deepEqual(cupPlacements(cup.points, cup.gone), [1, 2]);
	assert.deepEqual(cupPlacements([3, 3, 0], [false, false, true]), [
		1,
		1,
		null,
	]);
});

test('solo Cups count personal bests and group failures never earn points', () => {
	const solo = run(true);
	recordCupLeg(solo, 'stack', [25], ['25'], false, true);
	assert.deepEqual(solo.points, [1]);
	advanceCupLeg(solo);
	recordCupLeg(solo, 'golf', [1], ['Hole'], true, false);
	assert.deepEqual(solo.points, [1]);
	const group = createCupState(
		'group',
		'mixed',
		run().games,
		['A', 'B', 'C'],
		false,
	);
	group.gone[2] = true;
	recordCupLeg(
		group,
		'stack',
		[10, 10, -Infinity],
		['10', '10', 'left'],
		false,
	);
	assert.deepEqual(group.points, [1, 1, 0]);
	assert.throws(
		() => recordCupLeg(run(), 'stack', [1], ['1'], false),
		/players/i,
	);
});

test('received Cup state rejects malformed phases, standings and markup in numeric fields', () => {
	const cup = run();
	assert(
		isCupState(
			cup,
			catalog.map((game) => game.id),
		),
	);
	recordCupLeg(cup, 'stack', [1, 2], ['One', 'Two'], false);
	assert(
		isCupState(
			cup,
			catalog.map((game) => game.id),
		),
	);
	for (const change of [
		(state) => {
			state.points[0] = Infinity;
		},
		(state) => {
			state.legs[0].earned[0] = '<img src=x onerror=alert(1)>';
		},
		(state) => {
			state.games[1] = state.games[0];
		},
		(state) => {
			state.phase = 'complete';
		},
		(state) => {
			state.index = 4;
		},
		(state) => {
			state.gone[0] = 'false';
		},
		(state) => {
			state.seats[0] = -1;
		},
		(state) => {
			state.seats[1] = state.seats[0];
		},
	]) {
		const state = structuredClone(cup);
		change(state);
		assert(
			!isCupState(
				state,
				catalog.map((game) => game.id),
			),
		);
	}
});
