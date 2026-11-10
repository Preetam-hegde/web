"use strict";
import type {
	Board,
	State,
	Move,
	Ruleset,
	Outcome,
	Snapshot,
	Slot,
} from "./types.js";
import { canMove } from "./rules/movement.js";
import { safeSquares, applySpecial } from "./rules/terrain.js";
import { capturePieces } from "./rules/capture.js";
import { hasWon } from "./rules/win.js";
export { safeSquares } from "./rules/terrain.js";
export * from "./types.js";

export const options = {
	move: ["step", "slide", "hop", "leap"],
	capture: ["none", "custodial", "replace", "liberty", "approach"],
	safe: ["none", "rosettes", "corners", "cross", "midpoints", "lane", "heart"],
	special: ["none", "extra", "return", "swap", "warp"],
	win: ["reach", "capture3", "immobilise", "centre", "pair"],
} as const;
export const slots = Object.keys(options) as Slot[];
export const allRules: Ruleset[] = [];
for (const move of options.move)
	for (const capture of options.capture)
		for (const safe of options.safe)
			for (const special of options.special)
				for (const win of options.win)
					allRules.push({ move, capture, safe, special, win });

export function createBoard(id: "ur" | "senet"): Board {
	const xy: [number, number][] = [];
	const height = id === "ur" ? 8 : 10;
	for (let y = 0; y < height; y++)
		for (let x = 0; x < 3; x++) {
			if (id === "ur" && (y === 4 || y === 5) && x !== 1) continue;
			xy.push([x, y]);
		}
	const at = (x: number, y: number) =>
		xy.findIndex((p) => p[0] === x && p[1] === y);
	const path = xy
		.map((_, i) => i)
		.sort(
			(a, c) =>
				xy[a][1] - xy[c][1] ||
				(xy[a][1] % 2 ? xy[c][0] - xy[a][0] : xy[a][0] - xy[c][0]),
		);
	const adj = xy.map(([x, y], i) =>
		id === "ur"
			? [
					[x, y - 1],
					[x + 1, y],
					[x, y + 1],
					[x - 1, y],
				]
					.map(([a, c]) => at(a, c))
					.filter((n) => n >= 0)
			: [path[path.indexOf(i) - 1], path[path.indexOf(i) + 1]].filter(
					(n) => n !== undefined,
				),
	);
	const rays = xy.map(([x, y], i) => {
		if (id === "senet") {
			const n = path.indexOf(i);
			return [path.slice(0, n).reverse(), path.slice(n + 1)].filter(
				(r) => r.length,
			);
		}
		return [
			[0, -1],
			[1, 0],
			[0, 1],
			[-1, 0],
		]
			.map(([dx, dy]) => {
				const ray = [];
				for (let n = 1; ; n++) {
					const next = at(x + dx * n, y + dy * n);
					if (next < 0) break;
					ray.push(next);
				}
				return ray;
			})
			.filter((r) => r.length);
	});
	return {
		id,
		xy,
		adj,
		rays,
		special: [at(0, 2), at(2, 2), at(1, height - 2)],
		centre: [
			at(1, Math.floor((height - 1) / 2)),
			at(1, Math.floor((height - 1) / 2) + 1),
		],
		ends: {
			A: xy.flatMap(([, y], i) => (y === height - 1 ? [i] : [])),
			B: xy.flatMap(([, y], i) => (y === 0 ? [i] : [])),
		},
	};
}

export function play(
	b: Board,
	s: State,
	m: Move,
	r: Ruleset,
): { outcome: Outcome; next: State | null } {
	const safe = safeSquares(b, r.safe);
	if (!canMove(b, s, m, r) || (s.pieces.has(m.to) && safe.includes(m.to)))
		return { outcome: { kind: "illegal" }, next: null };
	const side = s.turn;
	const next: State = {
		pieces: new Map(s.pieces),
		turn: side === "A" ? "B" : "A",
		taken: { ...s.taken },
	};
	const replaced = next.pieces.has(m.to) ? [m.to] : [];
	next.pieces.delete(m.from);
	next.pieces.set(m.to, side);
	const captured = [
		...replaced,
		...capturePieces(b, next, m, side, r.capture, safe),
	];
	for (const sq of captured) if (sq !== m.to) next.pieces.delete(sq);
	next.taken[side] += captured.length;
	const special = applySpecial(b, next, m.to, r.special, side);
	if (special.extraTurn) next.turn = side;
	return {
		outcome: {
			kind: "legal",
			captured,
			...special,
			won: hasWon(b, next, r, side),
		},
		next,
	};
}
export const sig = (outcome: Outcome): string => JSON.stringify(outcome);
export const unpackState = (s: Snapshot): State => ({
	pieces: new Map(s.pieces),
	turn: s.turn,
	taken: { ...s.taken },
});
export const packState = (s: State): Snapshot => ({
	pieces: [...s.pieces].sort(([a], [c]) => a - c),
	turn: s.turn,
	taken: { ...s.taken },
});
