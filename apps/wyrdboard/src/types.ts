"use strict";

export type Sq = number;
export type Side = "A" | "B";
export interface Board {
	id: "ur" | "senet";
	adj: Sq[][];
	xy: [number, number][];
	rays: Sq[][][];
	special: Sq[];
	centre: Sq[];
	ends: { A: Sq[]; B: Sq[] };
}
export interface State {
	pieces: Map<Sq, Side>;
	turn: Side;
	taken: { A: number; B: number };
}
export interface Move {
	from: Sq;
	to: Sq;
}
export interface Ruleset {
	move: "step" | "slide" | "hop" | "leap";
	capture: "none" | "custodial" | "replace" | "liberty" | "approach";
	safe:
		| "none"
		| "rosettes"
		| "corners"
		| "cross"
		| "midpoints"
		| "lane"
		| "heart";
	special: "none" | "extra" | "return" | "swap" | "warp";
	win: "reach" | "capture3" | "immobilise" | "centre" | "pair";
}
export type Slot = keyof Ruleset;
export type Outcome =
	| { kind: "illegal" }
	| {
			kind: "legal";
			captured: Sq[];
			extraTurn: boolean;
			sentBack: Sq | null;
			swapped: Sq | null;
			won: boolean;
	  };
export interface Snapshot {
	pieces: [Sq, Side][];
	turn: Side;
	taken: { A: number; B: number };
}
export interface Fragment {
	start: Snapshot;
	moves: Move[];
	outcomes: Outcome[];
}
export interface Probe {
	snapshot: number;
	from: Sq;
	to: Sq;
}
export interface Puzzle {
	date: string;
	board: "ur" | "senet";
	fragments: Fragment[];
	par: number;
	survivors: number;
	path: { probe: Probe; before: number; after: number }[];
	outcomes: Outcome[];
	oracle: number[][];
	given: Partial<Ruleset>;
}
