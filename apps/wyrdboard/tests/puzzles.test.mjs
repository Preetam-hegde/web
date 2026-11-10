import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import {
	allRules,
	createBoard,
	play,
	sig,
	slots,
	options,
} from "../js/engine.js";
import {
	filterEvidence,
	snapshotsFromFragments,
	oracleOutcome,
	candidateProbes,
} from "../js/solver.js";

test("the full year contains only fair, reproducible, behavior-verified daily puzzles", async () => {
	const index = JSON.parse(
		await readFile(new URL("../data/index.json", import.meta.url), "utf8"),
	);
	assert.equal(index.length, 365);
	const recent = [];
	for (const [day, entry] of index.entries()) {
		const p = JSON.parse(
			await readFile(
				new URL(
					`../data/${entry.date.slice(0, 7)}/${entry.date}.json`,
					import.meta.url,
				),
				"utf8",
			),
		);
		const b = createBoard(p.board),
			states = snapshotsFromFragments(p.fragments);
		assert.equal(
			new Date(`${p.date}T00:00:00Z`).getTime(),
			new Date(`${index[0].date}T00:00:00Z`).getTime() + day * 86400000,
		);
		assert.equal(p.fragments.length, 8);
		assert.ok(
			p.fragments.every(
				(f) =>
					f.moves.length >= 6 &&
					f.moves.length <= 10 &&
					f.outcomes.every((o) => o.kind === "legal" && !o.won),
			),
		);
		assert.ok(!("target" in p) && !("answer" in p) && !("ruleset" in p));
		let survivors = filterEvidence(b, p.fragments, allRules);
		assert.equal(survivors.length, p.survivors);
		assert.ok(survivors.length >= 150 && survivors.length <= 600);
		assert.equal(p.par, p.path.length);
		assert.ok(p.par >= 4 && p.par <= 7);
		for (const step of p.path) {
			assert.equal(step.before, survivors.length);
			const o = oracleOutcome(p, step.probe);
			survivors = survivors.filter(
				(r) =>
					sig(play(b, states[step.probe.snapshot], step.probe, r).outcome) ===
					sig(o),
			);
			assert.equal(step.after, survivors.length);
			assert.ok(step.after < step.before);
		}
		assert.equal(
			survivors.length,
			1,
			`${p.date} must not have an indistinguishable twin`,
		);
		const answer = survivors[0],
			identity = JSON.stringify(answer);
		assert.ok(
			!recent.includes(identity),
			`${p.date}: combination repeated within 30 days`,
		);
		recent.push(identity);
		if (recent.length > 30) recent.shift();
		for (const slot of slots) {
			if (p.given[slot]) assert.equal(p.given[slot], answer[slot]);
			for (const value of options[slot].filter((v) => v !== answer[slot]))
				assert.ok(
					p.path.some(
						({ probe }) =>
							sig(
								play(b, states[probe.snapshot], probe, {
									...answer,
									[slot]: value,
								}).outcome,
							) !== sig(oracleOutcome(p, probe)),
					),
					`${p.date}: untested ${slot}`,
				);
		}
		assert.equal(p.oracle.length, states.length);
		assert.ok(
			p.oracle.every(
				(row) =>
					row.length === b.xy.length ** 2 &&
					row.every((code) => Number.isInteger(code) && p.outcomes[code]),
			),
		);
		for (const probe of candidateProbes(b, states))
			assert.equal(
				sig(play(b, states[probe.snapshot], probe, answer).outcome),
				sig(oracleOutcome(p, probe)),
				`${p.date} oracle mismatch`,
			);
	}
});
