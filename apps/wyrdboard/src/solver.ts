"use strict";
import { play, sig, unpackState, allRules, slots } from "./engine.js";
import type {
	Board,
	State,
	Move,
	Outcome,
	Fragment,
	Ruleset,
	Probe,
	Puzzle,
} from "./types.js";

export function replayOutcome(s: State, move: Move, o: Outcome): State {
	const next = {
		pieces: new Map(s.pieces),
		turn: s.turn,
		taken: { ...s.taken },
	};
	if (o.kind === "illegal") return next;
	next.pieces.delete(move.from);
	o.captured.forEach((sq) => next.pieces.delete(sq));
	next.pieces.set(move.to, s.turn);
	if (o.sentBack !== null) {
		next.pieces.delete(move.to);
		next.pieces.set(o.sentBack, s.turn);
	}
	if (o.swapped !== null) {
		next.pieces.set(o.swapped, s.turn);
		next.pieces.set(move.to, s.turn === "A" ? "B" : "A");
	}
	next.taken[s.turn] += o.captured.length;
	next.turn = o.extraTurn ? s.turn : s.turn === "A" ? "B" : "A";
	return next;
}
export function snapshotsFromFragments(fragments: Fragment[]): State[] {
	return fragments.flatMap((f) => {
		const states = [unpackState(f.start)];
		f.moves.forEach((move, i) =>
			states.push(replayOutcome(states[i], move, f.outcomes[i])),
		);
		return states;
	});
}
export function filterEvidence(
	b: Board,
	fragments: Fragment[],
	rules: Ruleset[] = allRules,
): Ruleset[] {
	return rules.filter((r) =>
		fragments.every((f) => {
			let state = unpackState(f.start);
			return f.moves.every((move, i) => {
				const agrees =
					sig(play(b, state, move, r).outcome) === sig(f.outcomes[i]);
				state = replayOutcome(state, move, f.outcomes[i]);
				return agrees;
			});
		}),
	);
}
export function candidateProbes(b: Board, states: State[]): Probe[] {
	return states.flatMap((s, snapshot) =>
		[...s.pieces]
			.filter(([, side]) => side === s.turn)
			.flatMap(([from]) =>
				b.xy.flatMap((_, to) => (from !== to ? [{ snapshot, from, to }] : [])),
			),
	);
}
export function solveGreedy(
	probes: Probe[],
	matrix: number[][],
	target: number,
) {
	let survivors = matrix[0].map((_, i) => i);
	const path: { probe: Probe; before: number; after: number }[] = [];
	while (survivors.length > 1) {
		let best = -1,
			quality = Infinity;
		for (let i = 0; i < matrix.length; i++) {
			const groups = new Map<number, number>();
			survivors.forEach((j) =>
				groups.set(matrix[i][j], (groups.get(matrix[i][j]) || 0) + 1),
			);
			const score = [...groups.values()].reduce((sum, n) => sum + n * n, 0);
			if (score < quality) {
				best = i;
				quality = score;
			}
		}
		const next = survivors.filter(
			(i) => matrix[best][i] === matrix[best][target],
		);
		if (next.length === survivors.length) return null;
		path.push({
			probe: probes[best],
			before: survivors.length,
			after: next.length,
		});
		survivors = next;
	}
	return path;
}
export function oracleOutcome(p: Puzzle, probe: Probe): Outcome {
	const size = p.board === "ur" ? 20 : 30;
	return p.outcomes[p.oracle[probe.snapshot][probe.from * size + probe.to]];
}
export function matchesPuzzle(
	b: Board,
	p: Puzzle,
	r: Ruleset,
	states = snapshotsFromFragments(p.fragments),
): boolean {
	if (!slots.every((slot) => !p.given[slot] || p.given[slot] === r[slot]))
		return false;
	if (!filterEvidence(b, p.fragments, [r]).length) return false;
	return candidateProbes(b, states).every(
		(probe) =>
			sig(play(b, states[probe.snapshot], probe, r).outcome) ===
			sig(oracleOutcome(p, probe)),
	);
}
