"use strict";
import type { Board, State, Ruleset, Sq, Side, Move } from "../types.js";

export function capturePieces(
	b: Board,
	s: State,
	move: Move,
	side: Side,
	rule: Ruleset["capture"],
	safe: Sq[],
): Sq[] {
	const to = move.to;
	const captured = new Set<Sq>();
	if (rule === "approach") {
		// The enemy one square beyond the landing square, along the line of travel.
		const ray = b.rays[move.from].find((r) => r.includes(to));
		const ahead = ray?.[ray.indexOf(to) + 1];
		if (
			ahead !== undefined &&
			s.pieces.has(ahead) &&
			s.pieces.get(ahead) !== side &&
			!safe.includes(ahead)
		)
			captured.add(ahead);
	}
	if (rule === "custodial") {
		for (const ray of b.rays[to]) {
			if (
				ray.length >= 2 &&
				s.pieces.has(ray[0]) &&
				s.pieces.get(ray[0]) !== side &&
				s.pieces.get(ray[1]) === side &&
				!safe.includes(ray[0])
			)
				captured.add(ray[0]);
		}
	}
	if (rule === "liberty") {
		const visited = new Set<Sq>();
		for (const [sq, owner] of s.pieces) {
			if (owner === side || visited.has(sq)) continue;
			const group = [sq];
			visited.add(sq);
			let liberty = false;
			for (let i = 0; i < group.length; i++) {
				for (const n of b.adj[group[i]]) {
					if (!s.pieces.has(n)) liberty = true;
					else if (s.pieces.get(n) === owner && !visited.has(n)) {
						visited.add(n);
						group.push(n);
					}
				}
			}
			if (!liberty && !group.some((n) => safe.includes(n)))
				group.forEach((n) => captured.add(n));
		}
	}
	return [...captured].sort((a, c) => a - c);
}
