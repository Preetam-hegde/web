"use strict";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import {
	allRules,
	createBoard,
	play,
	sig,
	packState,
	slots,
	options,
} from "../js/engine.js";
import {
	candidateProbes,
	filterEvidence,
	matchesPuzzle,
	snapshotsFromFragments,
	solveGreedy,
} from "../js/solver.js";

let seed = 20261110;
const random = () => {
	seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
	return seed / 4294967296;
};
const pick = (list) => list[Math.floor(random() * list.length)];
const shuffle = (list) => [...list].sort(() => random() - 0.5);
const root = fileURLToPath(new URL("../data/", import.meta.url));
const count = Number(process.argv[2] || 365);
const first = process.argv[3] || "2026-11-01";
// "easy" replans a stretch of days: three rules announced, par 4, few survivors.
const easy = process.argv[4] === "easy";
if (
	!Number.isInteger(count) ||
	count < 1 ||
	count > 365 ||
	!/^\d{4}-\d{2}-\d{2}$/.test(first)
)
	throw new Error("Usage: node scripts/generate.mjs [1..365] [YYYY-MM-DD]");
await mkdir(root, { recursive: true });

function randomState(b) {
	const nodes = shuffle(b.xy.map((_, i) => i));
	return {
		pieces: new Map(nodes.slice(0, 8).map((n, i) => [n, i < 4 ? "A" : "B"])),
		turn: random() < 0.5 ? "A" : "B",
		taken: { A: random() < 0.5 ? 2 : 0, B: random() < 0.5 ? 2 : 0 },
	};
}

function fragmentsFor(b, target) {
	let survivors = allRules;
	const fragments = [];
	for (let game = 0; game < 8; game++) {
		let s = randomState(b);
		const f = { start: packState(s), moves: [], outcomes: [] };
		for (let turn = 0; turn < 6; turn++) {
			const probes = shuffle(candidateProbes(b, [s]));
			let selected;
			for (const m of probes) {
				const result = play(b, s, m, target);
				if (result.outcome.kind === "illegal" || result.outcome.won) continue;
				const signature = sig(result.outcome);
				const next = survivors.filter(
					(r) => sig(play(b, s, m, r).outcome) === signature,
				);
				if (next.length >= 150) {
					selected = { m, result, next };
					break;
				}
			}
			if (!selected) return null;
			f.moves.push({ from: selected.m.from, to: selected.m.to });
			f.outcomes.push(selected.result.outcome);
			s = selected.result.next;
			survivors = selected.next;
		}
		fragments.push(f);
	}
	return survivors.length <= 600 ? { fragments, survivors } : null;
}

function solve(b, fragments, survivors, target) {
	const states = snapshotsFromFragments(fragments),
		probes = candidateProbes(b, states);
	const dictionary = [{ kind: "illegal" }],
		codes = new Map([[sig(dictionary[0]), 0]]);
	const code = (o) => {
		const key = sig(o);
		if (!codes.has(key)) {
			codes.set(key, dictionary.length);
			dictionary.push(o);
		}
		return codes.get(key);
	};
	const matrix = probes.map((probe) =>
		survivors.map((r) =>
			code(play(b, states[probe.snapshot], probe, r).outcome),
		),
	);
	const path = solveGreedy(probes, matrix, survivors.indexOf(target));
	if (!path || path.length < 4 || path.length > 7) return null;
	// Every slot must have a counterfactual separated by at least one benchmark probe.
	if (
		!slots.every((slot) =>
			options[slot]
				.filter((value) => value !== target[slot])
				.every((value) =>
					path.some(
						({ probe }) =>
							sig(
								play(b, states[probe.snapshot], probe, {
									...target,
									[slot]: value,
								}).outcome,
							) !== sig(play(b, states[probe.snapshot], probe, target).outcome),
					),
				),
		)
	)
		return null;
	const oracle = states.map((s) =>
		b.xy.flatMap((_, from) =>
			b.xy.map((_, to) => code(play(b, s, { from, to }, target).outcome)),
		),
	);
	return { par: path.length, path, outcomes: dictionary, oracle };
}

const dayKey = (offset) => {
	const date = new Date(`${first}T00:00:00Z`);
	date.setUTCDate(date.getUTCDate() + offset);
	return date.toISOString().slice(0, 10);
};
const readJson = async (path) =>
	JSON.parse(await readFile(path, "utf8").catch(() => "null"));

// A partial run must not repeat a combination used within 30 days of it.
const index = [],
	recent = [];
if (count < 365) {
	for (let d = -30; d < count + 30; d++) {
		if (d >= 0 && d < count) continue;
		const k = dayKey(d),
			old = await readJson(`${root}${k.slice(0, 7)}/${k}.json`);
		if (!old) continue;
		const answer = filterEvidence(createBoard(old.board), old.fragments).find(
			(r) => matchesPuzzle(createBoard(old.board), old, r),
		);
		recent.push(allRules.indexOf(answer));
	}
}
for (let day = 0; day < count; day++) {
	const date = new Date(`${first}T00:00:00Z`);
	date.setUTCDate(date.getUTCDate() + day);
	const key = date.toISOString().slice(0, 10),
		weekday = (date.getUTCDay() + 6) % 7;
	const b = createBoard(weekday % 2 ? "senet" : "ur");
	let puzzle,
		attempts = 0;
	while (!puzzle && attempts++ < 1500) {
		// A safe pattern has no observable effect without capture: these targets have twins.
		const target = pick(
			allRules.filter(
				(r) => r.capture !== "none" && !recent.includes(allRules.indexOf(r)),
			),
		);
		const draft = fragmentsFor(b, target);
		if (!draft) continue;
		const solved = solve(b, draft.fragments, draft.survivors, target);
		if (!solved) continue;
		if (easy && (solved.par > 4 || draft.survivors.length > 200)) continue;
		const given = {};
		const reveals = easy ? 3 : [3, 2, 2, 1, 1, 0, 0][weekday];
		shuffle(slots)
			.slice(0, reveals)
			.forEach((slot) => (given[slot] = target[slot]));
		puzzle = {
			date: key,
			board: b.id,
			fragments: draft.fragments,
			survivors: draft.survivors.length,
			given,
			...solved,
		};
		recent.push(allRules.indexOf(target));
		if (count === 365 && recent.length > 30) recent.shift();
	}
	if (!puzzle)
		throw new Error(
			`Could not validate ${key}; no unvalidated puzzle was emitted.`,
		);
	// One folder per month keeps the catalog browsable: data/2026-11/2026-11-10.json
	await mkdir(`${root}${key.slice(0, 7)}`, { recursive: true });
	await writeFile(
		`${root}${key.slice(0, 7)}/${key}.json`,
		JSON.stringify(puzzle),
	);
	index.push({ date: key, board: b.id, par: puzzle.par });
	console.log(
		`${key} ${b.id}: ${puzzle.survivors} survivors, par ${puzzle.par} (${attempts} attempts)`,
	);
}
// A partial run replaces only its own days in the catalog.
const old = (await readJson(`${root}index.json`)) ?? [];
await writeFile(
	`${root}index.json`,
	JSON.stringify(
		[
			...old.filter((e) => !index.some((n) => n.date === e.date)),
			...index,
		].sort((a, b) => (a.date < b.date ? -1 : 1)),
	),
);
console.log(`Validated ${index.length} puzzles.`);
