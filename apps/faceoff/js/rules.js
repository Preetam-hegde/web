'use strict';

/* Shared game rules. No browser state: also loaded directly by tests/rules.test.mjs. */

/* 0 or 1 = the winner; -1 = a tie. Failed attempts use ±Infinity. */
function judge(a, b, lowerIsBetter) {
	if (a === b) return -1;
	return (lowerIsBetter ? a < b : a > b) ? 0 : 1;
}

const TTT_LINES = [
	[0, 1, 2],
	[3, 4, 5],
	[6, 7, 8],
	[0, 3, 6],
	[1, 4, 7],
	[2, 5, 8],
	[0, 4, 8],
	[2, 4, 6],
];
/* Board cells hold null or the index of the player who played there. Returns the winner and the line, or null. */
function tttWinner(board) {
	for (const line of TTT_LINES) {
		const [x, y, z] = line;
		if (board[x] !== null && board[x] === board[y] && board[y] === board[z])
			return { p: board[x], line };
	}
	return null;
}

const C4_COLS = 7,
	C4_ROWS = 6;
/* Board is a flat array, row 0 at the top; cells hold null or the index of the player who dropped there.
   Returns the winner and the four cells, or null. */
function c4Winner(board) {
	const at = (r, c) =>
		r >= 0 && r < C4_ROWS && c >= 0 && c < C4_COLS
			? board[r * C4_COLS + c]
			: undefined;
	for (let r = 0; r < C4_ROWS; r++) {
		for (let c = 0; c < C4_COLS; c++) {
			const v = at(r, c);
			if (v === null || v === undefined) continue;
			for (const [dr, dc] of [
				[0, 1],
				[1, 0],
				[1, 1],
				[1, -1],
			]) {
				const cells = [0, 1, 2, 3].map((k) => [r + dr * k, c + dc * k]);
				if (cells.every(([rr, cc]) => at(rr, cc) === v))
					return { p: v, cells: cells.map(([rr, cc]) => rr * C4_COLS + cc) };
			}
		}
	}
	return null;
}

const polyArea = (p) =>
	Math.abs(
		p.reduce((s, q, i) => {
			const r = p[(i + 1) % p.length];
			return s + q[0] * r[1] - r[0] * q[1];
		}, 0),
	) / 2;

/* Keep the part of the polygon left of a→b (Sutherland–Hodgman, one half-plane).
   Concave shapes leave overlapping edges along the cut, but those cancel in the area sum, so areas stay exact. */
function clipHalf(poly, a, b) {
	const side = (p) =>
		(b[0] - a[0]) * (p[1] - a[1]) - (b[1] - a[1]) * (p[0] - a[0]);
	const out = [];
	poly.forEach((p, i) => {
		const q = poly[(i + 1) % poly.length];
		const sp = side(p),
			sq = side(q);
		if (sp >= 0) out.push(p);
		if (sp >= 0 !== sq >= 0) {
			const t = sp / (sp - sq);
			out.push([p[0] + (q[0] - p[0]) * t, p[1] + (q[1] - p[1]) * t]);
		}
	});
	return out;
}

/* err: 0 = perfect halves, 100 = the line missed the shape. share: [smaller %, larger %]. */
function cutSplit(poly, a, b) {
	const l = polyArea(clipHalf(poly, a, b));
	const r = polyArea(clipHalf(poly, b, a));
	const t = l + r;
	return {
		err: (Math.abs(l - r) / t) * 100,
		share: [(Math.min(l, r) / t) * 100, (Math.max(l, r) / t) * 100],
	};
}

const angleErr = (a, b) => {
	const d = Math.abs(a - b) % 360;
	return Math.min(d, 360 - d);
}; // 359° and 1° are 2° apart

/* Mean ms between each tap and where beat k+1 after t4 should fall; a tap that never came counts as TEMPO_MISS_MS. */
const TEMPO_TAPS = 8;
const TEMPO_MISS_MS = 400;
const tempoErr = (taps, t4, gap) =>
	Array.from({ length: TEMPO_TAPS }, (_, k) =>
		k < taps.length ? Math.abs(taps[k] - (t4 + (k + 1) * gap)) : TEMPO_MISS_MS,
	).reduce((a, b) => a + b) / TEMPO_TAPS;

const hslToRgb = (h, s, l) => {
	s /= 100;
	l /= 100;
	const k = (n) => (n + h / 30) % 12,
		a = s * Math.min(l, 1 - l);
	return [0, 8, 4].map((n) =>
		Math.round(255 * (l - a * Math.max(-1, Math.min(k(n) - 3, 9 - k(n), 1)))),
	);
};
const rgbDist = (a, b) =>
	(Math.hypot(...a.map((v, i) => v - b[i])) / 441.67) * 100; // 0 identical, 100 black against white

/* Mean ms between how far apart each pair of taps was and how far apart the pair of notes was; a tap that never came counts as TEMPO_MISS_MS. */
const rhythmErr = (taps, gaps, beat) =>
	gaps.reduce(
		(sum, g, k) =>
			sum +
			(taps[k + 1] === undefined
				? TEMPO_MISS_MS
				: Math.abs(taps[k + 1] - taps[k] - g * beat)),
		0,
	) / gaps.length;

if (typeof module !== 'undefined' && module.exports) {
	module.exports = {
		judge,
		tttWinner,
		c4Winner,
		polyArea,
		clipHalf,
		cutSplit,
		angleErr,
		tempoErr,
		rhythmErr,
		hslToRgb,
		rgbDist,
		TTT_LINES,
		C4_COLS,
		C4_ROWS,
		TEMPO_TAPS,
		TEMPO_MISS_MS,
	};
}
