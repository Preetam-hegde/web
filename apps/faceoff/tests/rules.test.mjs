'use strict';

import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import test from 'node:test';

const require = createRequire(import.meta.url);
const {
	judge,
	tttWinner,
	c4Winner,
	polyArea,
	clipHalf,
	cutSplit,
	angleErr,
	tempoErr,
	rhythmErr,
	hslToRgb,
	rgbDist,
	TTT_LINES,
	C4_COLS,
	C4_ROWS,
	TEMPO_TAPS,
	TEMPO_MISS_MS,
} = require('../js/rules.js');

const near = (got, want) =>
	assert.ok(Math.abs(got - want) < 1e-8, `${got} != ${want}`);

test('scores use the game direction and failed attempts tie or lose', () => {
	assert.equal(judge(100, 200, true), 0);
	assert.equal(judge(200, 100, true), 1);
	assert.equal(judge(30, 20, false), 0);
	assert.equal(judge(0, 0, false), -1);
	assert.equal(judge(Infinity, Infinity, true), -1);
	assert.equal(judge(Infinity, 3, true), 1);
	assert.equal(judge(-Infinity, 3, false), 1);
});

test('tic-tac-toe finds every line for either player and leaves draws alone', () => {
	assert.equal(tttWinner(Array(9).fill(null)), null);
	for (const p of [0, 1])
		for (const line of TTT_LINES) {
			const board = Array(9).fill(null);
			line.forEach((i) => {
				board[i] = p;
			});
			assert.deepEqual(tttWinner(board), { p, line });
		}
	assert.equal(tttWinner([0, 1, 0, 1, 0, 1, 1, 0, 1]), null);
});

test('connect four checks all directions without wrapping rows or crossing an opponent', () => {
	assert.equal(c4Winner(Array(C4_ROWS * C4_COLS).fill(null)), null);
	for (const p of [0, 1])
		for (const cells of [
			[35, 36, 37, 38],
			[18, 25, 32, 39],
			[35, 29, 23, 17],
			[14, 22, 30, 38],
		]) {
			const board = Array(C4_ROWS * C4_COLS).fill(null);
			cells.forEach((i) => {
				board[i] = p;
			});
			const win = c4Winner(board);
			assert.equal(win.p, p);
			assert.deepEqual(
				[...win.cells].sort((a, b) => a - b),
				[...cells].sort((a, b) => a - b),
			);
		}
	for (const cells of [
		[5, 6, 7, 8],
		[35, 36, 37],
	]) {
		const board = Array(42).fill(null);
		cells.forEach((i) => {
			board[i] = 0;
		});
		assert.equal(c4Winner(board), null);
	}
	const board = Array(42).fill(null);
	[35, 36, 37].forEach((i) => {
		board[i] = 0;
	});
	board[38] = 1;
	assert.equal(c4Winner(board), null);
});

test('polygon cuts conserve area for convex and concave shapes, in either orientation', () => {
	const square = [
		[0, 0],
		[1, 0],
		[1, 1],
		[0, 1],
	];
	const lShape = [
		[0.2, 0.2],
		[0.5, 0.2],
		[0.5, 0.55],
		[0.8, 0.55],
		[0.8, 0.8],
		[0.2, 0.8],
	];
	near(polyArea(square), 1);
	near(polyArea([...square].reverse()), 1);
	assert.equal(polyArea([]), 0);
	for (const poly of [square, [...square].reverse(), lShape]) {
		const a = [0.4, -1],
			b = [0.4, 2];
		near(
			polyArea(clipHalf(poly, a, b)) + polyArea(clipHalf(poly, b, a)),
			polyArea(poly),
		);
		near(
			cutSplit(poly, a, b).share.reduce((a, b) => a + b),
			100,
		);
	}
	assert.deepEqual(cutSplit(square, [0.5, -1], [0.5, 2]), {
		err: 0,
		share: [50, 50],
	});
	assert.deepEqual(cutSplit(square, [0.25, -1], [0.25, 2]), {
		err: 50,
		share: [25, 75],
	});
	assert.deepEqual(cutSplit(square, [2, -1], [2, 2]), {
		err: 100,
		share: [0, 100],
	});
	near(cutSplit(square, [0, 0], [1, 1]).err, 0);
	near(cutSplit(lShape, [0, 0.55], [1, 0.55]).err, (0.045 / 0.255) * 100);
});

test('angular distance wraps at zero and is symmetric', () => {
	assert.equal(angleErr(359, 1), 2);
	assert.equal(angleErr(90, 270), 180);
	assert.equal(angleErr(-1, 721), 2);
	assert.equal(angleErr(721, -1), 2);
});

test('tempo counts missing beats and rhythm measures gaps independent of start time', () => {
	const taps = Array.from({ length: TEMPO_TAPS }, (_, i) => (i + 1) * 600);
	assert.equal(tempoErr(taps, 0, 600), 0);
	assert.equal(
		tempoErr(
			taps.map((t) => t + 50),
			0,
			600,
		),
		50,
	);
	assert.equal(tempoErr(taps.slice(0, 4), 0, 600), TEMPO_MISS_MS / 2);
	assert.equal(tempoErr([], 0, 600), TEMPO_MISS_MS);
	assert.equal(rhythmErr([0, 500, 1000, 2000], [1, 1, 2], 500), 0);
	assert.equal(rhythmErr([777, 1277, 1777, 2777], [1, 1, 2], 500), 0);
	assert.equal(rhythmErr([0, 540, 1080, 2120], [1, 1, 2], 500), 40);
	assert.equal(rhythmErr([0, 500], [1, 1], 500), TEMPO_MISS_MS / 2);
});

test('HSL conversion and RGB distance keep colour-match scores consistent', () => {
	assert.deepEqual(hslToRgb(0, 100, 50), [255, 0, 0]);
	assert.deepEqual(hslToRgb(120, 100, 50), [0, 255, 0]);
	assert.deepEqual(hslToRgb(240, 100, 50), [0, 0, 255]);
	assert.deepEqual(hslToRgb(200, 0, 50), [128, 128, 128]);
	assert.deepEqual(hslToRgb(30, 100, 0), [0, 0, 0]);
	assert.deepEqual(hslToRgb(30, 100, 100), [255, 255, 255]);
	assert.equal(rgbDist([10, 20, 30], [10, 20, 30]), 0);
	assert.equal(Math.round(rgbDist([0, 0, 0], [255, 255, 255])), 100);
	assert.equal(rgbDist([2, 3, 4], [5, 6, 7]), rgbDist([5, 6, 7], [2, 3, 4]));
});
