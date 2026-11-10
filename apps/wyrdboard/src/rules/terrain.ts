"use strict";
import type { Board, State, Ruleset, Sq, Side } from "../types.js";

const terrainCache = new WeakMap<Board, Map<string, Sq[]>>();

export function safeSquares(b: Board, rule: Ruleset["safe"]): Sq[] {
	if (!terrainCache.has(b)) terrainCache.set(b, new Map());
	const cached = terrainCache.get(b)!.get(rule);
	if (cached) return cached;
	const maxY = Math.max(...b.xy.map((p) => p[1]));
	const result = b.xy.flatMap(([x, y], i) => {
		const yes =
			rule === "heart"
				? b.centre.includes(i)
				: rule === "rosettes"
					? b.special.includes(i)
					: rule === "corners"
						? (x === 0 || x === 2) && (y === 0 || y === maxY)
						: rule === "cross"
							? x === 1 || y === Math.floor(maxY / 2)
							: rule === "midpoints"
								? ((x === 0 || x === 2) && y === Math.floor(maxY / 2)) ||
									(x === 1 && (y === 0 || y === maxY))
								: rule === "lane"
									? x === 0
									: false;
		return yes ? [i] : [];
	});
	terrainCache.get(b)!.set(rule, result);
	return result;
}

export function applySpecial(
	b: Board,
	s: State,
	to: Sq,
	rule: Ruleset["special"],
	side: Side,
) {
	let sentBack: Sq | null = null;
	let swapped: Sq | null = null;
	const extraTurn = b.special.includes(to) && rule === "extra";
	if (b.special.includes(to) && rule === "return") {
		const start = b.ends[side === "A" ? "B" : "A"].find(
			(sq) => !s.pieces.has(sq),
		);
		if (start !== undefined) {
			s.pieces.delete(to);
			s.pieces.set(start, side);
			sentBack = start;
		}
	}
	if (b.special.includes(to) && rule === "swap") {
		const [x, y] = b.xy[to];
		const enemies = [...s.pieces]
			.filter(([, p]) => p !== side)
			.map(([sq]) => sq);
		enemies.sort(
			(a, c) =>
				Math.abs(b.xy[a][0] - x) +
					Math.abs(b.xy[a][1] - y) -
					(Math.abs(b.xy[c][0] - x) + Math.abs(b.xy[c][1] - y)) || a - c,
		);
		if (enemies.length) {
			swapped = enemies[0];
			s.pieces.set(swapped, side);
			s.pieces.set(to, side === "A" ? "B" : "A");
		}
	}
	if (b.special.includes(to) && rule === "warp") {
		// Carried to the next rosette in board order, if it is empty.
		const dest = b.special[(b.special.indexOf(to) + 1) % b.special.length];
		if (!s.pieces.has(dest)) {
			s.pieces.delete(to);
			s.pieces.set(dest, side);
			sentBack = dest;
		}
	}
	return { sentBack, extraTurn, swapped };
}
