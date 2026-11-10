"use strict";
import { RANKS, rank, scoreRun, dateKey } from "./session.js";
const TITLES = [
	"Volunteer",
	"Digger",
	"Surveyor",
	"Epigrapher",
	"Curator",
	"Archaeologist",
	"Keeper of the Archive",
];
const RANK_XP = [100, 60, 40, 20, 0];
const day = (key, offset) => {
	const d = new Date(`${key}T12:00:00`);
	d.setDate(d.getDate() + offset);
	return dateKey(d);
};
export const solved = (e) => e.run.finished === "solved";
export const isFlawless = (e) =>
	solved(e) && !e.run.assisted && !e.run.wrong && !e.run.hints.length;
export function stars(e) {
	if (!solved(e)) return 0;
	if (e.run.assisted) return 1;
	const score = scoreRun(e.run);
	return score <= e.par && !e.run.hints.length ? 3 : score <= e.par + 1 ? 2 : 1;
}
export function xpOf(e) {
	if (!e.run.finished) return 0;
	if (!solved(e)) return 20;
	if (e.run.assisted) return 50;
	return (
		100 +
		RANK_XP[RANKS.indexOf(rank(scoreRun(e.run), e.par))] +
		(isFlawless(e) ? 25 : 0) +
		10 * e.run.foresight.hit
	);
}
export function levelOf(xp) {
	let level = 1,
		floor = 0,
		need = 150;
	while (xp >= floor + need) {
		floor += need;
		need += 75;
		level++;
	}
	return {
		level,
		title: TITLES[Math.min(TITLES.length - 1, level - 1)],
		into: xp - floor,
		need,
	};
}
/** A day counts toward the streak only when it was solved on that same day. */
export function streaks(entries, today) {
	const days = new Set(
		entries
			.filter(
				(e) => solved(e) && e.run.at && dateKey(new Date(e.run.at)) === e.date,
			)
			.map((e) => e.date),
	);
	let current = 0,
		cursor = days.has(today) ? today : day(today, -1);
	while (days.has(cursor)) {
		current++;
		cursor = day(cursor, -1);
	}
	let best = 0;
	for (const d of days) {
		if (days.has(day(d, -1))) continue;
		let n = 0;
		for (let c = d; days.has(c); c = day(c, 1)) n++;
		best = Math.max(best, n);
	}
	return { current, best };
}
export function summarize(entries, today) {
	const done = entries.filter((e) => e.run.finished);
	const wins = done.filter(solved);
	const ranked = wins.filter((e) => !e.run.assisted);
	const ranks = Object.fromEntries(RANKS.map((r) => [r, 0]));
	for (const e of ranked) ranks[rank(scoreRun(e.run), e.par)]++;
	const avg = (list) =>
		list.length ? list.reduce((a, b) => a + b, 0) / list.length : 0;
	const xp = done.reduce((sum, e) => sum + xpOf(e), 0);
	return {
		played: done.length,
		solved: wins.length,
		revealed: done.length - wins.length,
		winRate: done.length ? wins.length / done.length : 0,
		...streaks(entries, today),
		avgProbes: avg(wins.map((e) => e.run.probes.length)),
		avgDelta: avg(ranked.map((e) => scoreRun(e.run) - e.par)),
		ranks,
		flawless: wins.filter(isFlawless).length,
		xp,
		level: levelOf(xp),
		foresight: done.reduce(
			(t, e) => ({
				hit: t.hit + e.run.foresight.hit,
				total: t.total + e.run.foresight.total,
			}),
			{ hit: 0, total: 0 },
		),
		boards: [...new Set(wins.map((e) => e.board))],
		minProbes: Math.min(
			Infinity,
			...ranked
				.filter((e) => !e.run.hints.length)
				.map((e) => e.run.probes.length),
		),
		thirdTime: wins.some((e) => e.run.wrong === 2),
		history: done
			.slice()
			.sort(
				(a, b) =>
					(b.run.at ?? 0) - (a.run.at ?? 0) || (a.date < b.date ? 1 : -1),
			)
			.map((e) => ({
				...e,
				rank: solved(e) && !e.run.assisted ? rank(scoreRun(e.run), e.par) : "—",
				stars: stars(e),
				xp: xpOf(e),
			})),
	};
}
export const BADGES = [
	{
		id: "first",
		glyph: "✳",
		name: "First Light",
		hint: "Decipher your first board.",
		earned: (s) => s.solved >= 1,
	},
	{
		id: "flawless",
		glyph: "◆",
		name: "Clean Cast",
		hint: "Solve with no wrong guesses and no hints.",
		earned: (s) => s.flawless >= 1,
	},
	{
		id: "oracle",
		glyph: "✦",
		name: "Past the Benchmark",
		hint: "Finish under par.",
		earned: (s) => s.ranks.Champollion >= 1,
	},
	{
		id: "seer",
		glyph: "⊙",
		name: "Dead Centre",
		hint: "Finish exactly on par.",
		earned: (s) => s.ranks.Decipherer >= 1,
	},
	{
		id: "lean",
		glyph: "⌖",
		name: "Economy of Motion",
		hint: "Solve in three probes or fewer.",
		earned: (s) => s.minProbes <= 3,
	},
	{
		id: "third",
		glyph: "⚑",
		name: "Third Time's the Charm",
		hint: "Solve on your last inscription.",
		earned: (s) => s.thirdTime,
	},
	{
		id: "foresight",
		glyph: "◔",
		name: "Second Sight",
		hint: "Land 10 foresight predictions.",
		earned: (s) => s.foresight.hit >= 10,
	},
	{
		id: "both",
		glyph: "⇄",
		name: "Two Roads",
		hint: "Solve on both boards.",
		earned: (s) => s.boards.length >= 2,
	},
	{
		id: "streak3",
		glyph: "♨",
		name: "Kindled",
		hint: "A 3-day streak.",
		earned: (s) => s.best >= 3,
	},
	{
		id: "streak7",
		glyph: "▦",
		name: "Lamp-keeper",
		hint: "A 7-day streak.",
		earned: (s) => s.best >= 7,
	},
	{
		id: "streak30",
		glyph: "❖",
		name: "Unbroken Flame",
		hint: "A 30-day streak.",
		earned: (s) => s.best >= 30,
	},
	{
		id: "solved10",
		glyph: "▥",
		name: "Scholar",
		hint: "Decipher 10 boards.",
		earned: (s) => s.solved >= 10,
	},
	{
		id: "solved50",
		glyph: "✚",
		name: "Loremaster",
		hint: "Decipher 50 boards.",
		earned: (s) => s.solved >= 50,
	},
];
export const earnedBadges = (s) =>
	BADGES.filter((b) => b.earned(s)).map((b) => b.id);
/** Accepts an exported file; keeps only well-formed runs and never downgrades a solve. */
export function mergeImport(current, raw) {
	const incoming = raw && typeof raw === "object" ? raw.runs : undefined;
	const runs = { ...current };
	let added = 0;
	if (!incoming || typeof incoming !== "object") return { runs, added };
	for (const [date, value] of Object.entries(incoming)) {
		if (
			!/^\d{4}-\d{2}-\d{2}$/.test(date) ||
			!value ||
			typeof value !== "object"
		)
			continue;
		const f = value.finished,
			mine = runs[date]?.finished;
		const rankOf = (x) => (x === "solved" ? 2 : x === "revealed" ? 1 : 0);
		if (rankOf(f) > rankOf(mine)) {
			runs[date] = value;
			added++;
		}
	}
	return { runs, added };
}
