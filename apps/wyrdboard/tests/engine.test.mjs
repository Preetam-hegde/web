import test from "node:test";
import assert from "node:assert/strict";
import { createBoard, allRules, play, sig, safeSquares } from "../js/engine.js";

const board = createBoard("ur");
const sq = (x, y) => board.xy.findIndex(([a, b]) => a === x && b === y);
const rules = {
	move: "step",
	capture: "none",
	safe: "none",
	special: "none",
	win: "reach",
};
const state = (entries, taken = 0) => ({
	pieces: new Map(entries.map(([x, y, side]) => [sq(x, y), side])),
	turn: "A",
	taken: { A: taken, B: 0 },
});
const probe = (s, from, to, changes = {}) =>
	play(
		board,
		s,
		{ from: sq(...from), to: sq(...to) },
		{ ...rules, ...changes },
	);

test("enumerates exactly 3,500 unique rulesets and both graph boards", () => {
	assert.equal(allRules.length, 3500);
	assert.equal(new Set(allRules.map(JSON.stringify)).size, 3500);
	assert.equal(board.xy.length, 20);
	assert.equal(createBoard("senet").xy.length, 30);
	for (const b of [board, createBoard("senet")])
		b.adj.forEach((a, i) => a.forEach((j) => assert.ok(b.adj[j].includes(i))));
});
test("step, slide and hop obey adjacency and blockers", () => {
	const s = state([
		[0, 0, "A"],
		[1, 0, "B"],
	]);
	assert.equal(probe(s, [0, 0], [0, 1]).outcome.kind, "legal");
	assert.equal(probe(s, [0, 0], [0, 2]).outcome.kind, "illegal");
	assert.equal(
		probe(s, [0, 0], [0, 2], { move: "slide" }).outcome.kind,
		"legal",
	);
	assert.equal(
		probe(s, [0, 0], [2, 0], { move: "slide" }).outcome.kind,
		"illegal",
	);
	assert.equal(probe(s, [0, 0], [2, 0], { move: "hop" }).outcome.kind, "legal");
	assert.equal(
		probe(s, [0, 0], [0, 2], { move: "hop" }).outcome.kind,
		"illegal",
	);
});
test("none forbids occupied destinations; replace captures; safe squares protect", () => {
	const s = state([
		[0, 0, "A"],
		[1, 0, "B"],
	]);
	assert.equal(probe(s, [0, 0], [1, 0]).outcome.kind, "illegal");
	assert.deepEqual(
		probe(s, [0, 0], [1, 0], { capture: "replace" }).outcome.captured,
		[sq(1, 0)],
	);
	const protectedState = state([
		[1, 0, "A"],
		[0, 0, "B"],
	]);
	assert.equal(
		probe(protectedState, [1, 0], [0, 0], {
			capture: "replace",
			safe: "corners",
		}).outcome.kind,
		"illegal",
	);
	for (const safe of [
		"none",
		"rosettes",
		"corners",
		"cross",
		"midpoints",
		"lane",
	])
		assert.ok(Array.isArray(safeSquares(board, safe)));
	assert.equal(
		new Set(
			["none", "rosettes", "corners", "cross", "midpoints", "lane"].map((r) =>
				safeSquares(board, r).join(),
			),
		).size,
		6,
	);
});
test("custodial capture only closes a trap and liberty removes a surrounded group", () => {
	const s = state([
		[0, 0, "A"],
		[1, 1, "B"],
		[2, 1, "A"],
	]);
	assert.deepEqual(
		probe(s, [0, 0], [0, 1], { capture: "custodial" }).outcome.captured,
		[sq(1, 1)],
	);
	const liberty = state([
		[0, 0, "B"],
		[0, 2, "A"],
		[1, 0, "A"],
	]);
	assert.deepEqual(
		probe(liberty, [0, 2], [0, 1], { capture: "liberty" }).outcome.captured,
		[sq(0, 0)],
	);
});
test("specials grant an extra turn, return to start, and swap deterministically", () => {
	const target = board.special[0],
		from = board.adj[target][0];
	const s = {
		pieces: new Map([
			[from, "A"],
			[board.xy.length - 1, "B"],
		]),
		turn: "A",
		taken: { A: 0, B: 0 },
	};
	const extra = play(
		board,
		s,
		{ from, to: target },
		{ ...rules, special: "extra" },
	);
	assert.equal(extra.outcome.extraTurn, true);
	assert.equal(extra.next.turn, "A");
	const back = play(
		board,
		s,
		{ from, to: target },
		{ ...rules, special: "return" },
	);
	assert.notEqual(back.outcome.sentBack, null);
	const swap = play(
		board,
		s,
		{ from, to: target },
		{ ...rules, special: "swap" },
	);
	assert.equal(swap.next.pieces.get(target), "B");
	assert.equal(swap.next.pieces.get(board.xy.length - 1), "A");
});
test("reach, capture-three, immobilise and centre wins are observable", () => {
	assert.equal(
		probe(
			state([
				[1, 6, "A"],
				[0, 0, "B"],
			]),
			[1, 6],
			[1, 7],
		).outcome.won,
		true,
	);
	assert.equal(
		probe(
			state(
				[
					[0, 0, "A"],
					[1, 0, "B"],
				],
				2,
			),
			[0, 0],
			[1, 0],
			{ capture: "replace", win: "capture3" },
		).outcome.won,
		true,
	);
	assert.equal(
		probe(state([[0, 0, "A"]]), [0, 0], [0, 1], { win: "immobilise" }).outcome
			.won,
		true,
	);
	const [a, b] = board.centre,
		start = board.adj[b].find((n) => n !== a);
	const s = {
		pieces: new Map([
			[a, "A"],
			[start, "A"],
		]),
		turn: "A",
		taken: { A: 0, B: 0 },
	};
	assert.equal(
		play(board, s, { from: start, to: b }, { ...rules, win: "centre" }).outcome
			.won,
		true,
	);
});
test("play is pure, deterministic and rejects invalid inputs", () => {
	const s = state([
			[0, 0, "A"],
			[2, 7, "B"],
		]),
		before = JSON.stringify([...s.pieces]);
	for (const r of allRules)
		assert.equal(
			sig(probe(s, [0, 0], [0, 1], r).outcome),
			sig(probe(s, [0, 0], [0, 1], r).outcome),
		);
	assert.equal(JSON.stringify([...s.pieces]), before);
	assert.equal(play(board, s, { from: -1, to: 100 }, rules).next, null);
	assert.equal(
		play(board, s, { from: sq(2, 7), to: sq(1, 7) }, rules).next,
		null,
	);
});

test("leap jumps exactly two squares, over anything", () => {
	const s = state([
		[0, 0, "A"],
		[0, 1, "B"],
	]);
	assert.equal(
		probe(s, [0, 0], [0, 2], { move: "leap" }).outcome.kind,
		"legal",
	);
	assert.equal(
		probe(s, [0, 0], [0, 1], { move: "leap" }).outcome.kind,
		"illegal",
	);
	assert.equal(
		probe(s, [0, 0], [0, 3], { move: "leap" }).outcome.kind,
		"illegal",
	);
});
test("approach captures the enemy ahead of the landing square only", () => {
	const s = state([
		[0, 0, "A"],
		[0, 2, "B"],
		[2, 0, "B"],
	]);
	const hit = probe(s, [0, 0], [0, 1], { capture: "approach" }).outcome;
	assert.deepEqual(hit.captured, [sq(0, 2)]);
	assert.deepEqual(probe(s, [0, 0], [0, 1]).outcome.captured, []);
	// A safe square protects the target; (0,2) is a rosette.
	const shielded = probe(s, [0, 0], [0, 1], {
		capture: "approach",
		safe: "rosettes",
	}).outcome;
	assert.deepEqual(shielded.captured, []);
});
test("heart protects both centre squares", () => {
	assert.deepEqual(
		safeSquares(board, "heart"),
		[...board.centre].sort((a, c) => a - c),
	);
});
test("warp carries a piece to the next rosette, when it is empty", () => {
	const s = state([[0, 1, "A"]]);
	const out = probe(s, [0, 1], [0, 2], { special: "warp" });
	assert.equal(out.outcome.sentBack, sq(2, 2));
	assert.equal(out.next.pieces.get(sq(2, 2)), "A");
	assert.equal(out.next.pieces.has(sq(0, 2)), false);
	const blocked = state([
		[0, 1, "A"],
		[2, 2, "B"],
	]);
	assert.equal(
		probe(blocked, [0, 1], [0, 2], { special: "warp" }).outcome.sentBack,
		null,
	);
});
test("pair wins with two pieces on the far edge", () => {
	const s = state([
		[0, 7, "A"],
		[1, 6, "A"],
	]);
	assert.equal(probe(s, [1, 6], [1, 7], { win: "pair" }).outcome.won, true);
	const one = state([[1, 6, "A"]]);
	assert.equal(probe(one, [1, 6], [1, 7], { win: "pair" }).outcome.won, false);
});
