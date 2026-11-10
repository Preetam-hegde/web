"use strict";
import { canMove } from "./movement.js";
import { safeSquares } from "./terrain.js";
export function hasWon(b, s, r, side) {
	if (r.win === "reach")
		return b.ends[side].some((sq) => s.pieces.get(sq) === side);
	if (r.win === "pair")
		return b.ends[side].filter((sq) => s.pieces.get(sq) === side).length >= 2;
	if (r.win === "capture3") return s.taken[side] >= 3;
	if (r.win === "centre")
		return b.centre.every((sq) => s.pieces.get(sq) === side);
	const enemy = side === "A" ? "B" : "A",
		safe = safeSquares(b, r.safe);
	const opponent = { ...s, turn: enemy };
	return ![...s.pieces].some(
		([from, owner]) =>
			owner === enemy &&
			b.xy.some(
				(_, to) =>
					canMove(b, opponent, { from, to }, r) &&
					!(s.pieces.has(to) && safe.includes(to)),
			),
	);
}
