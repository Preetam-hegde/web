"use strict";
import type { Board, State, Move, Ruleset } from "../types.js";

export function canMove(b: Board, s: State, m: Move, r: Ruleset): boolean {
	if (
		!Number.isInteger(m.from) ||
		!Number.isInteger(m.to) ||
		!b.adj[m.from] ||
		!b.adj[m.to] ||
		m.from === m.to ||
		s.pieces.get(m.from) !== s.turn
	)
		return false;
	if (
		s.pieces.has(m.to) &&
		(s.pieces.get(m.to) === s.turn || r.capture !== "replace")
	)
		return false;
	if (r.move === "step") return b.adj[m.from].includes(m.to);
	return b.rays[m.from].some((ray) => {
		const distance = ray.indexOf(m.to);
		if (distance < 0) return false;
		if (r.move === "hop") return distance === 1 && s.pieces.has(ray[0]);
		if (r.move === "leap") return distance === 1;
		return ray.slice(0, distance).every((sq) => !s.pieces.has(sq));
	});
}
