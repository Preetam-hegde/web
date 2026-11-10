import test from "node:test";
import assert from "node:assert/strict";
import { createBoard, play, allRules, packState } from "../js/engine.js";
import {
	replayOutcome,
	solveGreedy,
	filterEvidence,
	snapshotsFromFragments,
} from "../js/solver.js";

test("observable outcomes reproduce the next state for every mechanic", () => {
	for (const board of [createBoard("ur"), createBoard("senet")]) {
		const state = {
			pieces: new Map([
				[0, "A"],
				[1, "B"],
				[5, "A"],
				[6, "B"],
			]),
			turn: "A",
			taken: { A: 2, B: 0 },
		};
		for (const rules of allRules)
			for (const to of [1, 2, 3, 6]) {
				const move = { from: 0, to },
					result = play(board, state, move, rules);
				if (result.next)
					assert.deepEqual(
						packState(replayOutcome(state, move, result.outcome)),
						packState(result.next),
					);
			}
	}
});
test("greedy solver selects the best split and rejects indistinguishable twins", () => {
	const probes = [
		{ snapshot: 0, from: 0, to: 1 },
		{ snapshot: 0, from: 0, to: 2 },
	];
	assert.equal(
		solveGreedy(
			probes,
			[
				[0, 0, 1, 1],
				[0, 1, 2, 3],
			],
			0,
		).length,
		1,
	);
	assert.equal(
		solveGreedy(
			probes,
			[
				[0, 0],
				[0, 0],
			],
			0,
		),
		null,
	);
});
test("fragments reconstruct all snapshots and filter by behavior", () => {
	const b = createBoard("ur"),
		r = allRules[0];
	const s = {
		pieces: new Map([
			[0, "A"],
			[19, "B"],
		]),
		turn: "A",
		taken: { A: 0, B: 0 },
	};
	const move = { from: 0, to: 3 },
		{ outcome } = play(b, s, move, r);
	const fragments = [
		{ start: packState(s), moves: [move], outcomes: [outcome] },
	];
	assert.equal(snapshotsFromFragments(fragments).length, 2);
	const survivors = filterEvidence(b, fragments, allRules);
	assert.ok(
		survivors.some(
			(candidate) => JSON.stringify(candidate) === JSON.stringify(r),
		),
	);
	assert.ok(survivors.length < 3500);
});
