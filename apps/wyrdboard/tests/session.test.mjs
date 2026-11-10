import test from "node:test";
import assert from "node:assert/strict";
import {
	restoreRun,
	scoreRun,
	dateKey,
	hasFullMonth,
	rank,
} from "../js/session.js";

const puzzle = {
	given: { move: "step" },
	board: "ur",
	oracle: [Array(400).fill(0)],
};
test("corrupt stored progress falls back safely and cannot overwrite briefing rules", () => {
	assert.equal(restoreRun(null, puzzle).choices.move, "step");
	assert.equal(
		restoreRun(
			{
				choices: { move: "hop", capture: "<script>" },
				probes: "oops",
				hints: null,
				wrong: -8,
			},
			puzzle,
		).choices.move,
		"step",
	);
	const run = restoreRun(
		{
			probes: [
				{ snapshot: 0, from: 0, to: 19 },
				{ snapshot: 55, from: -1, to: 900 },
			],
			choices: {},
			hints: [],
			wrong: 2,
		},
		puzzle,
	);
	assert.equal(run.probes.length, 1);
	assert.equal(scoreRun(run), 7);
});
test("score and ranks include all penalties; local calendar dates do not use UTC slicing", () => {
	assert.equal(scoreRun({ probes: [{}, {}], wrong: 1, hints: ["move"] }), 7);
	assert.deepEqual(
		[4, 5, 6, 7, 9, 10].map((n) => rank(n, 5)),
		["Champollion", "Decipherer", "Epigrapher", "Scribe", "Scribe", "Digger"],
	);
	const date = new Date(2026, 10, 10, 0, 1);
	assert.equal(dateKey(date), "2026-11-10");
});
test("a completed month stays unlocked after the calendar advances", () => {
	const november = Array.from(
		{ length: 30 },
		(_, i) => `2026-11-${String(i + 1).padStart(2, "0")}`,
	);
	assert.equal(hasFullMonth(november), true);
	assert.equal(hasFullMonth(november.slice(1)), false);
	assert.equal(hasFullMonth([...november, "2026-12-01"]), true);
	assert.equal(
		hasFullMonth(
			Array.from(
				{ length: 28 },
				(_, i) => `2028-02-${String(i + 1).padStart(2, "0")}`,
			),
		),
		false,
	);
});
