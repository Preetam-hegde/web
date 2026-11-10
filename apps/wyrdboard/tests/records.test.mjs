import test from "node:test";
import assert from "node:assert/strict";
import { restoreRun, rank } from "../js/session.js";
import {
	summarize,
	levelOf,
	stars,
	xpOf,
	earnedBadges,
	mergeImport,
} from "../js/records.js";

const stub = { given: {}, board: "ur", oracle: new Array(56) };
const at = (date, hour = 12) => new Date(`${date}T${hour}:00:00`).getTime();
const entry = (date, raw, par = 5) => ({
	date,
	board: raw.board || "ur",
	par,
	run: restoreRun({ finished: "solved", at: at(date), ...raw }, stub),
});

test("ranks follow the score against par", () => {
	assert.deepEqual(
		[4, 5, 6, 8, 12].map((s) => rank(s, 5)),
		["Champollion", "Decipherer", "Epigrapher", "Scribe", "Digger"],
	);
});
test("stars, xp and levels reward clean, efficient solves", () => {
	const clean = entry("2026-11-10", {
		probes: new Array(4).fill({ snapshot: 0, from: 1, to: 2 }),
	});
	assert.equal(stars(clean), 3);
	assert.equal(xpOf(clean), 100 + 100 + 25);
	const guided = entry("2026-11-10", { assisted: true });
	assert.equal(xpOf(guided), 50);
	assert.equal(
		xpOf({ ...clean, run: { ...clean.run, finished: "revealed" } }),
		20,
	);
	assert.equal(levelOf(0).level, 1);
	assert.equal(levelOf(150).level, 2);
	assert.equal(levelOf(150 + 225).level, 3);
});
test("a streak only counts days solved on their own date", () => {
	const days = ["2026-11-08", "2026-11-09", "2026-11-10"];
	const solved = days.map((d) => entry(d, {}));
	assert.equal(summarize(solved, "2026-11-10").current, 3);
	assert.equal(
		summarize(solved, "2026-11-11").current,
		3,
		"today not yet played",
	);
	// An archive solve made on a later day does not extend the streak.
	const late = [
		...solved,
		{
			...entry("2026-11-07", {}),
			run: restoreRun({ finished: "solved", at: at("2026-11-10") }, stub),
		},
	];
	assert.equal(summarize(late, "2026-11-10").best, 3);
	assert.equal(summarize([solved[0], solved[2]], "2026-11-10").current, 1);
});
test("badges derive from records", () => {
	const s = summarize(
		[entry("2026-11-10", { probes: [], hints: [] })],
		"2026-11-10",
	);
	assert.ok(earnedBadges(s).includes("first"));
	assert.ok(earnedBadges(s).includes("flawless"));
	assert.ok(earnedBadges(s).includes("oracle"));
	assert.ok(!earnedBadges(s).includes("streak7"));
});
test("importing never downgrades a solved day and ignores junk", () => {
	const current = { "2026-11-10": { finished: "solved" } };
	const incoming = {
		runs: {
			"2026-11-10": { finished: "revealed" },
			"2026-11-11": { finished: "solved" },
			"not-a-date": { finished: "solved" },
			"2026-11-12": "junk",
		},
	};
	const { runs, added } = mergeImport(current, incoming);
	assert.equal(added, 1);
	assert.equal(runs["2026-11-10"].finished, "solved");
	assert.equal(runs["2026-11-11"].finished, "solved");
	assert.equal(Object.keys(runs).length, 2);
	assert.equal(mergeImport(current, "nope").added, 0);
});
