"use strict";
import { options, slots } from "./engine.js";
import type { Puzzle, Probe, Ruleset, Slot } from "./types.js";

export interface Run {
	probes: Probe[];
	choices: Partial<Ruleset>;
	crossed: Partial<Record<Slot, string[]>>;
	hints: Slot[];
	wrong: number;
	assisted: boolean;
	finished: "solved" | "revealed" | null;
	feedback: boolean[];
	seen: number[];
	foresight: { hit: number; total: number };
	at: number | null;
}
const whole = (v: unknown): number =>
	Number.isInteger(v) && Number(v) >= 0 ? Math.min(1000, Number(v)) : 0;
export const RANKS = [
	"Champollion",
	"Decipherer",
	"Epigrapher",
	"Scribe",
	"Digger",
] as const;
export function rank(score: number, par: number): (typeof RANKS)[number] {
	const delta = score - par;
	return RANKS[
		delta < 0 ? 0 : delta === 0 ? 1 : delta === 1 ? 2 : delta <= 4 ? 3 : 4
	];
}
export function restoreRun(raw: unknown, p: Puzzle): Run {
	const data =
		raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};
	const choices: Partial<Ruleset> = {},
		crossed: Run["crossed"] = {};
	for (const slot of slots) {
		const value = (data.choices as Record<string, unknown> | undefined)?.[slot];
		if (
			typeof value === "string" &&
			(options[slot] as readonly string[]).includes(value)
		)
			Object.assign(choices, { [slot]: value });
		const marked = (data.crossed as Record<string, unknown> | undefined)?.[
			slot
		];
		crossed[slot] = Array.isArray(marked)
			? marked.filter(
					(v) =>
						typeof v === "string" &&
						(options[slot] as readonly string[]).includes(v),
				)
			: [];
	}
	const size = p.board === "ur" ? 20 : 30;
	const probes = Array.isArray(data.probes)
		? (data.probes
				.filter(
					(m) =>
						m &&
						Number.isInteger(m.snapshot) &&
						m.snapshot >= 0 &&
						m.snapshot < p.oracle.length &&
						Number.isInteger(m.from) &&
						Number.isInteger(m.to) &&
						m.from >= 0 &&
						m.to >= 0 &&
						m.from < size &&
						m.to < size &&
						m.from !== m.to,
				)
				.slice(0, 1000) as Probe[])
		: [];
	return {
		probes,
		choices: { ...choices, ...p.given },
		crossed,
		hints: Array.isArray(data.hints)
			? ([...new Set(data.hints.filter((v) => slots.includes(v)))] as Slot[])
			: [],
		wrong:
			Number.isInteger(data.wrong) && Number(data.wrong) >= 0
				? Math.min(3, Number(data.wrong))
				: 0,
		assisted: data.assisted === true,
		finished:
			data.finished === "solved" || data.finished === "revealed"
				? data.finished
				: null,
		feedback: Array.isArray(data.feedback)
			? data.feedback.slice(0, 5).map((v) => v === true)
			: [],
		seen: Array.isArray(data.seen)
			? [
					...new Set(
						data.seen.filter((v) => Number.isInteger(v) && v >= 0 && v < 8),
					),
				]
			: [],
		foresight: {
			hit: whole((data.foresight as Run["foresight"] | undefined)?.hit),
			total: whole((data.foresight as Run["foresight"] | undefined)?.total),
		},
		at:
			typeof data.at === "number" && Number.isFinite(data.at) && data.at > 0
				? data.at
				: null,
	};
}
export const scoreRun = (
	run: Pick<Run, "probes" | "wrong" | "hints">,
): number => run.probes.length + 3 * run.wrong + 2 * run.hints.length;
export const dateKey = (date = new Date()): string =>
	`${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
export function hasFullMonth(dates: string[]): boolean {
	const days = new Set(dates);
	return [...new Set(dates.map((date) => date.slice(0, 7)))].some((month) => {
		const count = new Date(
			Number(month.slice(0, 4)),
			Number(month.slice(5)),
			0,
		).getDate();
		return Array.from(
			{ length: count },
			(_, i) => `${month}-${String(i + 1).padStart(2, "0")}`,
		).every((day) => days.has(day));
	});
}
