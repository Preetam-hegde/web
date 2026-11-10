"use strict";
import { allRules, createBoard, options, slots, play, sig } from "./engine.js";
import {
	filterEvidence,
	snapshotsFromFragments,
	oracleOutcome,
	replayOutcome,
	matchesPuzzle,
} from "./solver.js";
import {
	Atmosphere,
	boardInfo,
	describeOutcome,
	miniBoard,
	renderBoard,
	ruleInfo,
	slotNames,
} from "./presentation.js";
import {
	dateKey,
	rank,
	restoreRun,
	scoreRun,
	hasFullMonth,
	RANKS,
} from "./session.js";
import type { Run } from "./session.js";
import {
	BADGES,
	earnedBadges,
	mergeImport,
	stars,
	summarize,
	xpOf,
} from "./records.js";
import type { Entry } from "./records.js";
import type {
	Board,
	Puzzle,
	State,
	Slot,
	Ruleset,
	Probe,
	Outcome,
} from "./types.js";

const $ = <T extends HTMLElement = HTMLElement>(id: string): T =>
	document.getElementById(id) as T;
const svg = document.getElementById("board") as unknown as SVGSVGElement;
const modal = $<HTMLDialogElement>("modal");
const ledgerSheet = $<HTMLDialogElement>("ledger-sheet");
const ledger = document.querySelector<HTMLElement>(".ledger")!;
const today = dateKey();
const storageKey = "wyrdboard-v1";
let saved: {
	runs: Record<string, unknown>;
	sound: boolean;
	reduced: boolean | null;
	skin: boolean;
	foresight: boolean;
	tour: boolean;
} = {
	runs: {},
	sound: false,
	reduced: null,
	skin: false,
	foresight: false,
	tour: false,
};
let storageAvailable = true;
try {
	const raw = JSON.parse(localStorage.getItem(storageKey) || "null");
	if (raw && typeof raw === "object")
		saved = {
			runs:
				raw.runs && typeof raw.runs === "object" && !Array.isArray(raw.runs)
					? raw.runs
					: {},
			sound: raw.sound === true,
			reduced: typeof raw.reduced === "boolean" ? raw.reduced : null,
			skin: raw.skin === true,
			foresight: raw.foresight === true,
			tour: raw.tour === true,
		};
} catch {
	storageAvailable = false;
}
const atmosphere = new Atmosphere(
	$<HTMLCanvasElement>("dust"),
	allRules.length,
);
atmosphere.sound = saved.sound;
atmosphere.reduced = saved.reduced ?? atmosphere.reduced;
document.body.classList.toggle("reduced-motion", atmosphere.reduced);
document.body.classList.toggle("gold-leaf", saved.skin);

let index: { date: string; board: "ur" | "senet"; par: number }[] = [];
let daily = today;
let puzzle: Puzzle,
	board: Board,
	run: Run,
	snapshots: State[],
	candidates: Ruleset[];
let fragment = 0,
	frame = 0,
	selected: number | null = null;
let displayState: State, displayProbe: Probe | undefined;
let showProbe = false,
	strike = false,
	answerCache: Ruleset | null = null;
let pending: Probe | null = null;
let replayTimer: number | undefined;
let drag: { sq: number; x: number; y: number } | null = null;
let ignoreClick = 0;

function save(): void {
	if (puzzle && run) saved.runs[puzzle.date] = run;
	try {
		localStorage.setItem(storageKey, JSON.stringify(saved));
		storageAvailable = true;
	} catch {
		storageAvailable = false;
	}
}
/** Saved runs as typed entries; runs for dates outside the schedule are ignored. */
function entries(): Entry[] {
	return index.flatMap((p) => {
		const raw = saved.runs[p.date];
		if (!raw) return [];
		const stub = {
			given: {},
			board: p.board,
			oracle: new Array(56),
		} as unknown as Puzzle;
		return [
			{ date: p.date, board: p.board, par: p.par, run: restoreRun(raw, stub) },
		];
	});
}
let baseline = 2;
/** 0% with only the fragments in hand, 100% once one ruleset remains. */
const clarityOf = (): number =>
	Math.round(
		100 * (1 - Math.log(Math.max(1, candidates.length)) / Math.log(baseline)),
	);
function setStatus(glyph: string, title: string, detail: string): void {
	$("oracle-glyph").textContent = glyph;
	$("oracle-title").textContent = title;
	$("oracle-detail").textContent = detail;
}
function openModal(html: string): void {
	stopReplay();
	$("modal-content").innerHTML = html;
	if (!modal.open) modal.showModal();
}
function stopReplay(): void {
	clearInterval(replayTimer);
	replayTimer = undefined;
	$("play-replay").textContent = "▶";
	$("play-replay").setAttribute("aria-label", "Play fragment");
}
function snapshotIndex(): number {
	return (
		puzzle.fragments
			.slice(0, fragment)
			.reduce((n, f) => n + f.moves.length + 1, 0) + frame
	);
}
function findFrame(n: number): void {
	let offset = 0;
	for (let i = 0; i < puzzle.fragments.length; i++) {
		if (n < offset + puzzle.fragments[i].moves.length + 1) {
			fragment = i;
			frame = n - offset;
			return;
		}
		offset += puzzle.fragments[i].moves.length + 1;
	}
}
function getAnswer(): Ruleset {
	if (answerCache) return answerCache;
	let remaining = filterEvidence(board, puzzle.fragments);
	for (const { probe } of puzzle.path)
		remaining = remaining.filter(
			(r) =>
				sig(play(board, snapshots[probe.snapshot], probe, r).outcome) ===
				sig(oracleOutcome(puzzle, probe)),
		);
	if (remaining.length !== 1)
		throw new Error(
			"This tablet could not be verified. Please try another date.",
		);
	answerCache = remaining[0];
	return answerCache;
}
function updateCandidates(): void {
	candidates = filterEvidence(board, puzzle.fragments).filter((r) =>
		slots.every(
			(slot) => !puzzle.given[slot] || r[slot] === puzzle.given[slot],
		),
	);
	baseline = Math.max(2, candidates.length);
	for (const probe of run.probes)
		candidates = candidates.filter(
			(r) =>
				sig(play(board, snapshots[probe.snapshot], probe, r).outcome) ===
				sig(oracleOutcome(puzzle, probe)),
		);
	for (const slot of run.hints)
		candidates = candidates.filter((r) => r[slot] === getAnswer()[slot]);
	atmosphere.setFog(candidates.length);
	renderClarity();
}

/* ── The path: four stages derived from progress, never stored ─────────── */
const STAGES = [
	{ id: "observe", label: "Observe" },
	{ id: "test", label: "Test" },
	{ id: "deduce", label: "Deduce" },
	{ id: "inscribe", label: "Inscribe" },
];
function stageStates(): boolean[] {
	return [
		run.seen.length >= 3,
		run.probes.length >= 3 || clarityOf() >= 60,
		slots.every((slot) => run.choices[slot]),
		run.finished !== null,
	];
}
function renderStages(): void {
	const done = stageStates();
	const active = run.finished ? -1 : done.findIndex((d) => !d);
	$("stages").classList.toggle("finished", run.finished !== null);
	$("stages").innerHTML = STAGES.map(
		(s, i) =>
			`<li class="stage ${done[i] ? "done" : ""} ${i === active ? "active" : ""}"><button type="button" data-stage="${s.id}" ${i === active ? 'aria-current="step"' : ""}><span class="stage-dot" aria-hidden="true">${done[i] ? "✓" : i + 1}</span><span>${s.label}</span></button></li>`,
	).join("");
	renderCoach(active);
}
function renderCoach(active: number): void {
	const coach = $("coach");
	if (active < 0) {
		coach.hidden = false;
		coach.innerHTML = `<span class="coach-step">${run.finished === "solved" ? "SOLVED" : "REVEALED"}</span><div><strong>This tablet is finished.</strong><p>Explore the fragments, dig log and the Scribe's review, or open your result again.</p></div><button type="button" class="coach-cta" data-coach="result">View result</button>`;
		return;
	}
	coach.hidden = false;
	const watched = Math.min(3, run.seen.length);
	const body = [
		[
			"Watch the fragments",
			`Eight excavated games were recorded. Watch at least three to the end and look for patterns. Replays are free. <b>${watched} / 3 watched.</b>`,
			"Play next fragment",
		],
		[
			"Question the stone",
			`Tap a piece, then any square, legal or not. The stone answers, and every answer narrows the rules. Each test costs 1 point; par is ${puzzle.par}. <b>${run.probes.length} so far · clarity ${clarityOf()}%.</b>`,
			"Pick a piece for me",
		],
		[
			"Build your theory",
			`Choose one rule in each notebook row. Use <b>Cross out</b> on rules the evidence rules out. Clarity is at <b>${clarityOf()}%</b>.`,
			"Open field notes",
		],
		[
			"Inscribe your rules",
			`All five rows are filled. Submit when you are confident. A wrong guess costs 3 points, and you have ${3 - run.wrong}.`,
			"Inscribe now",
		],
	][active];
	coach.innerHTML = `<span class="coach-step">STEP ${active + 1} OF 4</span><div><strong>${body[0]}</strong><p>${body[1]}</p></div><button type="button" class="coach-cta" data-coach="${STAGES[active].id}">${body[2]}</button>`;
}
function renderClarity(): void {
	const c = clarityOf();
	$("clarity-num").textContent = String(c);
	$("clarity").setAttribute("aria-label", `Clarity ${c} percent`);
	$("clarity-ring").style.strokeDashoffset = String(113.1 * (1 - c / 100));
}
function renderChrome(): void {
	const stats = summarize(entries(), today);
	$("streak-count").textContent = String(stats.current);
	$("level-num").textContent = String(stats.level.level);
	$("xp-fill").style.width = `${(100 * stats.level.into) / stats.level.need}%`;
	$("streak-label").textContent = stats.current
		? `♨ ${stats.current}-day lamp · keep the flame alive.`
		: "♨ A new expedition begins.";
}

function renderSlots(): void {
	const filled = slots.filter((slot) => run.choices[slot]).length;
	$("ledger-progress").textContent = `${filled} / 5 ↑`;
	$("slots").innerHTML = slots
		.map((slot, i) => {
			const locked = Boolean(puzzle.given[slot] || run.hints.includes(slot));
			const viable = new Set(candidates.map((r) => r[slot]));
			return `<section class="slot ${locked ? "locked" : ""} ${run.choices[slot] ? "chosen" : ""}" aria-label="${slotNames[slot]}"><div class="slot-heading"><span class="slot-number">0${i + 1}</span><h3>${slotNames[slot]}</h3><span class="slot-status">${locked ? "◆ CONFIRMED" : run.assisted && viable.size === 1 ? "◇ DEDUCED" : ""}</span></div><div class="slot-options" role="group" aria-label="${slotNames[slot]} options">${options[
				slot
			]
				.map((value) => {
					const [glyph, label, description] = ruleInfo[slot][value];
					const crossed =
						run.crossed[slot]?.includes(value) ||
						(run.assisted && !viable.has(value as never));
					return `<button class="rule-option ${run.choices[slot] === value ? "selected" : ""} ${crossed ? "crossed" : ""}" data-slot="${slot}" data-value="${value}" aria-pressed="${run.choices[slot] === value}" aria-label="${label}${crossed ? ", crossed out" : ""}: ${description}" title="${description}" ${locked || run.finished ? "disabled" : ""}><span class="glyph" aria-hidden="true">${glyph}</span>${label}</button>`;
				})
				.join("")}</div></section>`;
		})
		.join("");
	$<HTMLButtonElement>("submit").disabled = Boolean(run.finished) || filled < 5;
	$("submit").innerHTML = run.finished
		? "Tablet deciphered <span>◆</span>"
		: 'Inscribe your rules <span aria-hidden="true">↗</span>';
	$<HTMLButtonElement>("hint").disabled =
		Boolean(run.finished) ||
		slots.every((slot) => puzzle.given[slot] || run.hints.includes(slot));
	$<HTMLInputElement>("assist").checked = run.assisted;
	$<HTMLInputElement>("assist").disabled =
		Boolean(run.finished) || run.assisted;
	$("assist-note").hidden = !run.assisted;
	$("attempts").textContent =
		`${3 - run.wrong} inscription${run.wrong === 2 ? "" : "s"} remain`;
	$("score").textContent =
		`SCORE ${scoreRun(run)} · PAR ${puzzle.par}${run.assisted ? " · ASSISTED" : ""}`;
	renderStages();
}
function renderFragments(): void {
	const focused = (document.activeElement as HTMLElement | null)?.dataset
		?.fragment;
	$("echo-count").textContent = `${run.seen.length} / 8 watched`;
	$("fragments").innerHTML = puzzle.fragments
		.map(
			(f, i) =>
				`<button type="button" class="fragment ${i === fragment ? "active" : ""} ${run.seen.includes(i) ? "seen" : ""}" data-fragment="${i}" aria-label="Fragment ${i + 1}${run.seen.includes(i) ? ", watched" : ""}" aria-pressed="${i === fragment}">${miniBoard(board, snapshots[puzzle.fragments.slice(0, i).reduce((n, p) => n + p.moves.length + 1, 0)])}<span>${run.seen.includes(i) ? "✓" : "0" + (i + 1)}</span></button>`,
		)
		.join("");
	if (focused !== undefined)
		$("fragments")
			.querySelector<HTMLButtonElement>(`[data-fragment="${focused}"]`)
			?.focus({ preventScroll: true });
}
function renderPosition(): void {
	if (!showProbe) {
		displayState = snapshots[snapshotIndex()];
		displayProbe = undefined;
	}
	const focused = svg.contains(document.activeElement)
		? document.activeElement?.getAttribute("data-sq")
		: null;
	renderBoard(
		svg,
		board,
		displayState,
		selected,
		displayProbe ||
			(frame > 0 ? puzzle.fragments[fragment].moves[frame - 1] : undefined),
	);
	if (focused != null)
		(svg.querySelector(`[data-sq="${focused}"]`) as SVGGElement | null)?.focus({
			preventScroll: true,
		});
	$("turn-label").textContent =
		`${displayState.turn === "A" ? "SHELL ○" : "ONYX ◇"} TO MOVE · TAKEN ${displayState.taken.A}/${displayState.taken.B}`;
	$<HTMLInputElement>("scrubber").value = String(frame);
	$<HTMLInputElement>("scrubber").max = String(
		puzzle.fragments[fragment].moves.length,
	);
	$("frame-label").textContent =
		`${String(frame + 1).padStart(2, "0")} / ${String(puzzle.fragments[fragment].moves.length + 1).padStart(2, "0")}`;
	$("reset-probe").hidden = !showProbe;
	$<HTMLButtonElement>("previous-frame").disabled = frame === 0;
	$<HTMLButtonElement>("next-frame").disabled =
		frame === puzzle.fragments[fragment].moves.length;
	renderFragments();
}
function goToFrame(n: number): void {
	cancelPending();
	frame = Math.max(0, Math.min(puzzle.fragments[fragment].moves.length, n));
	selected = null;
	showProbe = false;
	if (
		frame === puzzle.fragments[fragment].moves.length &&
		!run.seen.includes(fragment)
	) {
		run.seen.push(fragment);
		save();
		renderStages();
	}
	renderPosition();
	if (frame > 0) {
		const o = puzzle.fragments[fragment].outcomes[frame - 1],
			[glyph, title, detail] = describeOutcome(o);
		setStatus(
			glyph,
			`Fragment ${fragment + 1} · ${title}`,
			`${detail} This recorded move is free to replay.`,
		);
	} else
		setStatus(
			"⌁",
			"The stone is listening.",
			`Select ${displayState.turn === "A" ? "a shell" : "an onyx"} piece, then any square. Each test costs one point.`,
		);
}
function renderLog(): void {
	$("probe-count").textContent = String(run.probes.length).padStart(2, "0");
	$("dig-log").innerHTML = run.probes.length
		? run.probes
				.map((probe, i) => {
					const o = oracleOutcome(puzzle, probe),
						[glyph, title] = describeOutcome(o);
					return `<button class="log-entry" data-log="${i}" type="button" aria-label="Review probe ${i + 1}: ${title}">${miniBoard(board, replayOutcome(snapshots[probe.snapshot], probe, o), probe)}<strong>${glyph} PROBE ${String(i + 1).padStart(2, "0")}</strong><small>${probe.from + 1} → ${probe.to + 1}</small></button>`;
				})
				.join("")
		: '<p class="empty-log">Every test leaves a mark. Your first one begins here.</p>';
}
function showGain(before: number): void {
	const gain = clarityOf() - before,
		el = $("oracle-gain");
	el.hidden = false;
	el.className = `gain ${gain > 0 ? "up" : "flat"}`;
	el.textContent = gain > 0 ? `+${gain}% clarity` : "Nothing new";
	if (!atmosphere.reduced)
		el.animate(
			[
				{ opacity: 0, transform: "translateY(6px) scale(.9)" },
				{ opacity: 1, transform: "none" },
			],
			{ duration: 380, easing: "ease-out" },
		);
}
function showExperiment(probe: Probe, record: boolean, extra = ""): void {
	stopReplay();
	cancelPending();
	const o = oracleOutcome(puzzle, probe),
		[glyph, title, detail] = describeOutcome(o);
	findFrame(probe.snapshot);
	selected = null;
	displayProbe = probe;
	displayState = replayOutcome(snapshots[probe.snapshot], probe, o);
	showProbe = true;
	const before = clarityOf();
	if (record) {
		run.probes.push(probe);
		candidates = candidates.filter(
			(r) =>
				sig(play(board, snapshots[probe.snapshot], probe, r).outcome) ===
				sig(o),
		);
		atmosphere.setFog(candidates.length);
		renderClarity();
		atmosphere.play("clack");
		atmosphere.play(
			o.kind === "illegal"
				? "illegal"
				: o.captured.length
					? "capture"
					: "legal",
		);
		if (!atmosphere.reduced && navigator.vibrate)
			navigator.vibrate(
				o.kind === "illegal" ? 35 : o.captured.length ? [20, 35, 20] : 12,
			);
		save();
		renderSlots();
		renderLog();
	}
	renderPosition();
	setStatus(
		glyph,
		title,
		`${detail} ${record ? "Recorded in your dig log." : "Revisiting evidence · no point charged."}${extra}`,
	);
	if (record) showGain(before);
	else $("oracle-gain").hidden = true;
	if (record && o.kind === "legal" && !atmosphere.reduced) {
		const piece = svg.querySelector(
			`[data-piece="${o.sentBack ?? o.swapped ?? probe.to}"]`,
		);
		piece?.animate(
			[
				{ opacity: 0.4, transform: "translateY(-5px)" },
				{ opacity: 1, transform: "translateY(0)" },
			],
			{ duration: 320, easing: "ease-out" },
		);
	}
}

/* ── Foresight: an optional step that asks for a prediction first ──────── */
function cancelPending(): void {
	pending = null;
	$("foresight-prompt").hidden = true;
}
function requestProbe(probe: Probe): void {
	if (saved.foresight && !run.finished) {
		pending = probe;
		$("foresight-question").textContent =
			`Foresight: will the stone accept ${probe.from + 1} → ${probe.to + 1}?`;
		$("foresight-prompt").hidden = false;
		setStatus("◔", "Make your prediction.", "A correct guess earns +10 XP.");
		return;
	}
	showExperiment(probe, true);
}
function predict(allowed: boolean): void {
	if (!pending) return;
	const probe = pending,
		actual = oracleOutcome(puzzle, probe).kind === "legal",
		hit = actual === allowed;
	run.foresight.total++;
	if (hit) run.foresight.hit++;
	renderForesight();
	showExperiment(
		probe,
		true,
		hit ? " Foresight hit · +10 XP." : " Foresight missed.",
	);
	if (hit) atmosphere.play("lock");
}
function renderForesight(): void {
	$<HTMLInputElement>("foresight").checked = saved.foresight;
	$("foresight-score").textContent = run.foresight.total
		? `${run.foresight.hit}/${run.foresight.total}`
		: "";
}

function selectSquare(sq: number): void {
	if (run.finished) {
		setStatus(
			"◆",
			"This tablet has been revealed.",
			"Explore the fragments, dig log and the Scribe's review below.",
		);
		return;
	}
	cancelPending();
	if (showProbe) {
		showProbe = false;
		selected = null;
		renderPosition();
	}
	if (selected === null) {
		if (!displayState.pieces.has(sq)) {
			setStatus(
				"⌁",
				"Begin with a piece.",
				"Select a shell circle or an onyx diamond, then any destination.",
			);
			return;
		}
		selected = sq;
		stopReplay();
		renderPosition();
		setStatus(
			"⌖",
			`Square ${sq + 1} selected.`,
			"Tap any destination to ask the stone, or tap this piece to cancel.",
		);
	} else if (selected === sq) goToFrame(frame);
	else requestProbe({ snapshot: snapshotIndex(), from: selected, to: sq });
}
function syncSound(): void {
	$("sound-button").setAttribute("aria-pressed", String(atmosphere.sound));
	$("sound-button").setAttribute(
		"aria-label",
		`Turn sound ${atmosphere.sound ? "off" : "on"}`,
	);
	$("sound-button").innerHTML =
		`♪${atmosphere.sound ? "" : '<span class="sound-off" aria-hidden="true">/</span>'}`;
}

async function loadPuzzle(date: string): Promise<void> {
	stopReplay();
	cancelPending();
	$("loading").hidden = false;
	$("game").hidden = true;
	$("result").hidden = true;
	try {
		const response = await fetch(`data/${date.slice(0, 7)}/${date}.json`);
		if (!response.ok)
			throw new Error(
				"The tablet could not be loaded. Check your connection and refresh.",
			);
		puzzle = (await response.json()) as Puzzle;
		if (
			puzzle.date !== date ||
			!Array.isArray(puzzle.fragments) ||
			puzzle.fragments.length !== 8 ||
			!puzzle.oracle?.length
		)
			throw new Error(
				"This tablet is incomplete. Please refresh or choose another day.",
			);
		board = createBoard(puzzle.board);
		snapshots = snapshotsFromFragments(puzzle.fragments);
		run = restoreRun(saved.runs[date], puzzle);
		answerCache = null;
		for (const slot of run.hints)
			Object.assign(run.choices, { [slot]: getAnswer()[slot] });
		fragment = 0;
		frame = 0;
		selected = null;
		showProbe = false;
		$("oracle-gain").hidden = true;
		updateCandidates();
		renderSlots();
		renderLog();
		renderPosition();
		renderForesight();
		const labelDate = new Date(`${date}T12:00:00`),
			number = index.findIndex((p) => p.date === date) + 1;
		$("edition").textContent =
			`EXCAVATION No. ${String(number).padStart(3, "0")}`;
		$("date-label").textContent = labelDate.toLocaleDateString(undefined, {
			weekday: "long",
			day: "numeric",
			month: "short",
			year: "numeric",
		});
		$("era-label").textContent = boardInfo[puzzle.board].era;
		$("board-name").textContent = boardInfo[puzzle.board].name;
		$("daily-badge").textContent =
			date === today ? "TODAY" : date === daily ? "LATEST" : "FROM THE ARCHIVE";
		$("briefing").textContent = Object.keys(puzzle.given).length
			? `${Object.keys(puzzle.given).length} rule${Object.keys(puzzle.given).length === 1 ? " is" : "s are"} already carved in stone. Find the rest.`
			: "No rule is known. This one is entirely yours.";
		$("submission-feedback").innerHTML = run.feedback.length
			? `<div class="feedback-slots" aria-label="Previous inscription: ${run.feedback.map((v, i) => `${slotNames[slots[i]]} ${v ? "correct" : "incorrect"}`).join(", ")}">${run.feedback.map((v) => `<span class="${v ? "feedback-correct" : "feedback-wrong"}">${v ? "◆" : "□"}</span>`).join("")}</div>`
			: "";
		$("loading").hidden = true;
		$("game").hidden = false;
		setStatus(
			"⌁",
			"The stone is listening.",
			`Select ${displayState.turn === "A" ? "a shell" : "an onyx"} piece, then any square to test a move.`,
		);
		if (run.finished) renderResult(null, false);
		renderChrome();
		// A brand-new player gets the guided tour once.
		if (!saved.tour && !run.finished && !run.probes.length)
			window.setTimeout(() => startTour(0), 600);
		if (!storageAvailable)
			setStatus(
				"⌁",
				"Your expedition is ready.",
				"Browser storage is unavailable. Progress will last for this visit.",
			);
	} catch (error) {
		$("loading").textContent =
			error instanceof Error
				? error.message
				: "The board could not be opened. Please refresh.";
		$("loading").hidden = false;
	}
}

/* ── Finish, reward and review ──────────────────────────────────────────── */
interface Reward {
	xp: number;
	levelUp: boolean;
	level: string;
	badges: string[];
}
function finish(won: boolean): void {
	if (ledgerSheet.open) ledgerSheet.close();
	const before = summarize(entries(), today);
	run.finished = won ? "solved" : "revealed";
	run.at = Date.now();
	save();
	const after = summarize(entries(), today);
	const entry = entries().find((e) => e.date === puzzle.date)!;
	const known = new Set(earnedBadges(before));
	stopReplay();
	renderSlots();
	atmosphere.setFog(1);
	renderClarity();
	renderResult(
		{
			xp: xpOf(entry),
			levelUp: after.level.level > before.level.level,
			level: `Level ${after.level.level} · ${after.level.title}`,
			badges: earnedBadges(after).filter((id) => !known.has(id)),
		},
		true,
	);
	atmosphere.play("reveal");
	if (won)
		atmosphere.burst($<HTMLCanvasElement>("burst"), run.assisted ? 0.5 : 1);
	renderChrome();
}
function countUp(el: HTMLElement, to: number): void {
	if (atmosphere.reduced || !to) {
		el.textContent = String(to);
		return;
	}
	const start = performance.now();
	const step = (now: number) => {
		const t = Math.min(1, (now - start) / 1100);
		el.textContent = String(Math.round(to * (1 - Math.pow(1 - t, 3))));
		if (t < 1) requestAnimationFrame(step);
	};
	requestAnimationFrame(step);
}
function renderResult(reward: Reward | null, open: boolean): void {
	const answer = getAnswer(),
		score = scoreRun(run),
		won = run.finished === "solved",
		entry = entries().find((e) => e.date === puzzle.date)!,
		stats = summarize(entries(), today),
		earned = won ? stars(entry) : 0,
		xp = reward?.xp ?? xpOf(entry),
		title = run.assisted
			? "An assisted discovery."
			: won
				? `${rank(score, puzzle.par)}.`
				: "The rules, rediscovered.";
	$("result").hidden = !open;
	renderCoach(-1);
	$("result").innerHTML =
		`<div class="result-card"><button type="button" class="close-result" data-close-result aria-label="Close result">×</button><span class="tiny-label">${won ? "THE TABLET IS WHOLE AGAIN" : "EVERY EXPEDITION UNCOVERS SOMETHING"}</span><h2 id="result-title" class="rank-title">${title}</h2><div class="stars" aria-label="${earned} of 3 stars">${[0, 1, 2].map((i) => `<span class="star ${i < earned ? "on" : ""}" style="--i:${i}" aria-hidden="true">★</span>`).join("")}</div><p class="result-sub">${score} points · ${run.probes.length} tests · ${run.wrong} wrong · ${run.hints.length} hints · par ${puzzle.par}</p><div class="reveal-tablet">${slots.map((slot, i) => `<div class="revealed-rule" style="--i:${i}"><small>${slotNames[slot].toUpperCase()}</small><b><span aria-hidden="true">${ruleInfo[slot][answer[slot]][0]}</span> ${ruleInfo[slot][answer[slot]][1]}</b></div>`).join("")}</div><div class="reward-row"><div class="reward"><span>XP EARNED</span><b>+<span id="xp-count">0</span></b></div><div class="reward level"><span>${reward?.levelUp ? "LEVEL UP!" : "LEVEL"}</span><b>${reward?.level ?? `Level ${stats.level.level} · ${stats.level.title}`}</b><i class="level-bar"><u style="width:${(100 * stats.level.into) / stats.level.need}%"></u></i></div><div class="reward"><span>STREAK</span><b>♨ ${stats.current}</b></div></div>${
			reward?.badges.length
				? `<div class="new-badges"><span>NEW BADGE${reward.badges.length > 1 ? "S" : ""}</span>${reward.badges
						.map((id) => BADGES.find((b) => b.id === id)!)
						.map(
							(b) =>
								`<span class="badge-pill"><i aria-hidden="true">${b.glyph}</i>${b.name}</span>`,
						)
						.join("")}</div>`
				: ""
		}<p class="fact">${boardInfo[puzzle.board].fact}<br><a href="https://www.metmuseum.org/essays/board-games-from-ancient-egypt-and-the-near-east" target="_blank" rel="noopener">From the Metropolitan Museum of Art ↗</a><br><em>These deduction rules are invented, inspired by ancient games.</em></p><div class="result-actions"><button type="button" id="share-result" class="primary-button">Copy your result ↗</button><button type="button" id="review-button">The Scribe's review</button><button type="button" id="result-archive">${won ? "Unearth another tablet" : "View the archive"}</button><button type="button" id="result-codex">Your museum</button></div><div id="review" hidden></div><p id="share-feedback" role="status" aria-live="polite"></p></div>`;
	countUp($("xp-count"), xp);
	$("share-result").onclick = () => {
		void shareResult();
	};
	$("review-button").onclick = renderReview;
	$("result-archive").onclick = showArchive;
	$("result-codex").onclick = () => showMuseum("records");
}
function renderReview(): void {
	const review = $("review");
	review.hidden = !review.hidden;
	if (review.hidden) return;
	review.innerHTML = `<h3>The Scribe's path · ${puzzle.par} tests</h3><p>A greedy benchmark on the unbriefed fragments. It is not guaranteed optimal. Click a step to replay it for free.</p><div class="review-list">${puzzle.path.map((step, i) => `<button class="review-step" data-review="${i}" type="button">0${i + 1} · Square ${step.probe.from + 1} → ${step.probe.to + 1}<small>${step.before} → ${step.after} possibilities</small><div class="review-bar"><i style="width:${100 * (1 - step.after / step.before)}%"></i></div></button>`).join("")}</div>`;
}
async function shareResult(): Promise<void> {
	const number = index.findIndex((p) => p.date === puzzle.date) + 1;
	const feedback = slots
		.map((slot) => (run.choices[slot] === getAnswer()[slot] ? "🟩" : "⬜"))
		.join("");
	const glyphs = run.probes
		.map((p) => {
			const o: Outcome = oracleOutcome(puzzle, p);
			return o.kind === "illegal"
				? "❌"
				: o.captured.length
					? "⚔️"
					: o.won
						? "🏁"
						: "✅";
		})
		.join("");
	const entry = entries().find((e) => e.date === puzzle.date)!;
	const weekday = new Date(`${puzzle.date}T12:00:00`).toLocaleDateString("en", {
		weekday: "short",
	});
	const result = run.assisted
		? "Assisted"
		: run.finished === "solved"
			? rank(scoreRun(run), puzzle.par)
			: "Rules revealed";
	const text = `Wyrdboard #${number} (${weekday}, ${boardInfo[puzzle.board].short})\n${result}: ${run.probes.length} tests, par ${puzzle.par} ${"★".repeat(stars(entry))}${"☆".repeat(3 - stars(entry))}\nTests: ${glyphs || "—"}\nRules: ${feedback}\n${location.origin}${location.pathname}`;
	try {
		await navigator.clipboard.writeText(text);
		$("share-feedback").textContent = "Copied. Your result is ready to share.";
	} catch {
		openModal(
			'<span class="tiny-label">YOUR DISCOVERY</span><h2>Take it with you.</h2><p>Select and copy the text below.</p><textarea id="share-text" rows="8" readonly></textarea>',
		);
		$<HTMLTextAreaElement>("share-text").value = text;
		$<HTMLTextAreaElement>("share-text").select();
	}
}

/* ── Archive, museum (records, collection, badges), help ─────────────────── */
function showArchive(): void {
	const unlocked =
		(saved.runs[daily] as Run | undefined)?.finished === "solved";
	const done = new Map(entries().map((e) => [e.date, e]));
	const available = index.filter((p) => p.date <= daily).reverse();
	let month = "";
	openModal(
		`<span class="tiny-label">THE ARCHIVE</span><h2>There is always<br>another mystery.</h2><p>${unlocked ? "Your discovery opened the archive. Past tablets are ready to explore." : "Decipher today's tablet to open earlier expeditions."} ${[...done.values()].filter((e) => e.run.finished === "solved").length} of ${available.length} solved.</p><div class="archive-list">${available
			.map((p) => {
				const e = done.get(p.date),
					won = e?.run.finished === "solved",
					locked = !unlocked && p.date !== daily;
				const heading =
					p.date.slice(0, 7) !== month
						? `<h3 class="archive-month">${new Date(`${p.date.slice(0, 7)}-01T12:00:00`).toLocaleDateString(undefined, { month: "long", year: "numeric" })}</h3>`
						: "";
				month = p.date.slice(0, 7);
				return `${heading}<button type="button" data-date="${p.date}" ${locked ? "disabled" : ""}>${p.date.slice(5)}<span>${boardInfo[p.board].short} · ${won ? "★".repeat(stars(e!)) : locked ? "LOCKED" : e?.run.finished ? "REVEALED" : "UNEARTH"}</span></button>`;
			})
			.join("")}</div>`,
	);
}
const MUSEUM_TABS = [
	["records", "Records"],
	["collection", "Collection"],
	["badges", "Badges"],
];
function museumBody(tab: string): string {
	const all = entries(),
		stats = summarize(all, today);
	if (tab === "badges") {
		const got = new Set(earnedBadges(stats));
		return `<p>${got.size} of ${BADGES.length} badges earned.</p><div class="badge-grid">${BADGES.map((b) => `<div class="badge ${got.has(b.id) ? "earned" : ""}"><i aria-hidden="true">${b.glyph}</i><b>${b.name}</b><small>${b.hint}</small></div>`).join("")}</div>`;
	}
	if (tab === "collection") {
		const dates = index.filter((p) => p.date <= today),
			won = new Map(
				all.filter((e) => e.run.finished === "solved").map((e) => [e.date, e]),
			);
		const monthComplete = hasFullMonth([...won.keys()]);
		return `<p>${won.size} ${won.size === 1 ? "board" : "boards"} deciphered. Complete a week to restore its mural. A full month unlocks the gold-leaf board.</p><div class="museum-grid">${dates
			.map((p, i) => {
				const row = dates.slice(
					Math.floor(i / 7) * 7,
					Math.floor(i / 7) * 7 + 7,
				);
				const complete = row.length === 7 && row.every((d) => won.has(d.date));
				const e = won.get(p.date);
				return `<div class="museum-tablet ${e ? "solved" : ""} ${complete ? "mural" : ""}" title="${p.date}${e ? `: ${stars(e)} of 3 stars` : ": not yet"}"><strong aria-hidden="true">${e ? "★".repeat(stars(e)) : "·"}</strong><span>${p.date.slice(5)}</span></div>`;
			})
			.join(
				"",
			)}</div>${monthComplete ? `<button id="skin-toggle" class="primary-button" type="button">${saved.skin ? "Return to the stone board" : "Use the gold-leaf board ↗"}</button>` : ""}`;
	}
	const pct = (n: number) => `${Math.round(n * 100)}%`;
	const top = Math.max(1, ...Object.values(stats.ranks));
	return `<div class="museum-hero"><div><small>LEVEL ${stats.level.level}</small><b>${stats.level.title}</b></div><div class="museum-xp"><i><u style="width:${(100 * stats.level.into) / stats.level.need}%"></u></i><small>${stats.level.into} / ${stats.level.need} XP to level ${stats.level.level + 1} · ${stats.xp} total</small></div></div><div class="stat-grid">${[
		["Solved", `${stats.solved}`, `of ${stats.played} played`],
		["Win rate", stats.played ? pct(stats.winRate) : "—", "before the reveal"],
		["Streak", `♨ ${stats.current}`, `best ${stats.best}`],
		["Avg tests", stats.solved ? stats.avgProbes.toFixed(1) : "—", "per solve"],
		[
			"Vs par",
			stats.solved
				? `${stats.avgDelta > 0 ? "+" : ""}${stats.avgDelta.toFixed(1)}`
				: "—",
			"average",
		],
		[
			"Foresight",
			stats.foresight.total
				? pct(stats.foresight.hit / stats.foresight.total)
				: "—",
			`${stats.foresight.hit} of ${stats.foresight.total}`,
		],
	]
		.map(
			([k, v, s]) =>
				`<div class="stat"><small>${k}</small><b>${v}</b><span>${s}</span></div>`,
		)
		.join(
			"",
		)}</div><h3>Ranks earned</h3><div class="rank-bars">${RANKS.map((r) => `<div><span>${r}</span><i><u style="width:${(100 * stats.ranks[r]) / top}%"></u></i><b>${stats.ranks[r]}</b></div>`).join("")}</div><h3>History</h3>${
		stats.history.length
			? `<div class="history"><table><thead><tr><th>Date</th><th>Board</th><th>Rank</th><th>Score</th><th>★</th><th>XP</th></tr></thead><tbody>${stats.history
					.slice(0, 25)
					.map(
						(h) =>
							`<tr><td>${h.date.slice(5)}</td><td>${boardInfo[h.board as "ur" | "senet"].short}</td><td>${h.run.finished === "solved" ? h.rank : "Revealed"}${h.run.assisted ? " (assisted)" : ""}</td><td>${scoreRun(h.run)} / ${h.par}</td><td>${h.stars ? "★".repeat(h.stars) : "·"}</td><td>+${h.xp}</td></tr>`,
					)
					.join("")}</tbody></table></div>`
			: "<p>No finished boards yet. Your first record is waiting.</p>"
	}<div class="museum-actions"><button type="button" id="export-records">Export records</button><label class="file-button">Import records<input id="import-records" type="file" accept="application/json" hidden></label></div><p class="note">Records live in this browser. Export them to move or back them up.${storageAvailable ? "" : " Storage is currently unavailable."}</p><p id="museum-feedback" role="status" aria-live="polite"></p>`;
}
function showMuseum(tab = "records"): void {
	openModal(
		`<span class="tiny-label">YOUR MUSEUM</span><h2>Small discoveries.<br>A growing collection.</h2><div class="tabs" role="tablist">${MUSEUM_TABS.map(([id, label]) => `<button type="button" role="tab" data-tab="${id}" aria-selected="${id === tab}">${label}</button>`).join("")}</div><div id="museum-body">${museumBody(tab)}</div>`,
	);
}
function showHelp(): void {
	openModal(
		`<span class="tiny-label">HOW TO PLAY</span><h2>Find the five rules.</h2><button type="button" id="start-tour" class="primary-button tour-launch">Take the guided tour</button><p>A forgotten game has five hidden rules. You never see them, only what they do.</p><ol><li><strong>Observe.</strong> Watch the eight fragments: recorded games where every move was legal. Shell is ○, onyx is ◇, ✳ marks rosettes.</li><li><strong>Test.</strong> Tap a piece, then any square. Drag works too. The stone says whether the move is allowed and what happens. Each test costs one point, so choose carefully. The clarity ring shows how much you have narrowed it down.</li><li><strong>Deduce.</strong> In the field notes, pick one option per row. Use <em>Cross out</em> to mark what the evidence has ruled out.</li><li><strong>Inscribe.</strong> Submit all five. A wrong guess costs 3 points and shows which rows were right. Three wrong guesses reveal the answer.</li></ol><p><strong>Ask the Scribe</strong> reveals one rule for 2 points. <strong>Scribe assist</strong> crosses out impossible options for you, but earns less XP and no rank. <strong>Foresight</strong> asks you to predict each answer first; every hit is +10 XP.</p><p>Score = tests + 3 × wrong guesses + 2 × hints. Under par: Champollion. Par: Decipherer. +1: Epigrapher. +2 to 4: Scribe. +5 or more: Digger. Par is a greedy benchmark, not proven optimal, so beating it is a feat. Three stars need par or better with no hints.</p><label class="settings-row"><input type="checkbox" id="reduce-motion" ${atmosphere.reduced ? "checked" : ""}> Reduce motion and dust</label><div class="rule-guide">${slots.map((slot) => `<h3>${slotNames[slot]}</h3>${options[slot].map((value) => `<p><strong>${ruleInfo[slot][value][0]} ${ruleInfo[slot][value][1]}.</strong> ${ruleInfo[slot][value][2]}</p>`).join("")}`).join("")}</div><p class="note">These are invented deterministic games inspired by ancient boards. No account or timer is needed. Progress stays in this browser.</p>`,
	);
	$<HTMLInputElement>("reduce-motion").onchange = (event) => {
		atmosphere.reduced = (event.target as HTMLInputElement).checked;
		saved.reduced = atmosphere.reduced;
		document.body.classList.toggle("reduced-motion", atmosphere.reduced);
		save();
	};
}

/* ── First-time tour: a short spotlight walkthrough, shown once ─────────── */
interface TourStep {
	title: string;
	body: string;
	targets: string[];
	phone?: string[];
}
const TOUR: TourStep[] = [
	{
		title: "Welcome to Wyrdboard",
		body: "Every board follows five hidden rules. You can never read them, only watch what they do and test them. This short tour shows you how. It takes about thirty seconds.",
		targets: [],
	},
	{
		title: "Watch the fragments",
		body: "These are eight recorded games, and every move in them was legal. Watch at least three to the end and look for patterns. Replays are always free.",
		targets: ["#fragments", ".replay-controls"],
	},
	{
		title: "This is the board",
		body: "Shell ○ and onyx ◇ pieces. ✳ marks rosettes and the ◇ squares in the middle are the centre. Tap a piece, then any square, even one you think is illegal. Dragging works too.",
		targets: ["#board-frame"],
	},
	{
		title: "Ask the stone",
		body: "The stone answers every test: allowed, refused, or what happened. Each test costs 1 point, so pick the ones that tell you the most. Your tests collect in the dig log.",
		targets: [".oracle-zone"],
	},
	{
		title: "Watch your clarity",
		body: "The ring shows how much the evidence has narrowed the rules down. After every test you will see what you gained. At 100% only one answer is left.",
		targets: ["#clarity"],
		phone: ["#ledger-open"],
	},
	{
		title: "Build your theory",
		body: "Choose one option in each row. Hover an option to read what it means. Use Cross out for rules you have ruled out. Scribe assist can do it for you, for less reward.",
		targets: [".ledger"],
		phone: ["#ledger-open"],
	},
	{
		title: "Inscribe your rules",
		body: "When you are sure, submit. A wrong guess costs 3 points and shows which rows were right. Ask the Scribe reveals one rule for 2 points. Fewer points means a better rank.",
		targets: ["#submit"],
		phone: ["#ledger-open"],
	},
	{
		title: "Follow the path",
		body: "These four steps track your progress, and the bar under them always says what to do next. Try Foresight on the board for bonus XP: predict each answer before you ask.",
		targets: ["#stages"],
	},
];
let tourStep = -1;
function visibleTarget(selector: string): HTMLElement | null {
	const el = document.querySelector<HTMLElement>(selector);
	if (!el) return null;
	const r = el.getBoundingClientRect();
	return r.width > 0 && r.height > 0 ? el : null;
}
function startTour(step: number): void {
	stopReplay();
	cancelPending();
	if (ledgerSheet.open) ledgerSheet.close();
	showTourStep(step);
}
function endTour(): void {
	$("tour").hidden = true;
	tourStep = -1;
	saved.tour = true;
	save();
}
function showTourStep(i: number): void {
	const step = TOUR[i];
	tourStep = i;
	const els = (phone.matches && step.phone ? step.phone : step.targets)
		.map(visibleTarget)
		.filter((el): el is HTMLElement => el !== null);
	if (phone.matches && els.length)
		els[0].scrollIntoView({ block: "center", behavior: "auto" });
	const rects = els.map((el) => el.getBoundingClientRect());
	const box = rects.length
		? {
				left: Math.min(...rects.map((r) => r.left)) - 8,
				top: Math.min(...rects.map((r) => r.top)) - 8,
				right: Math.max(...rects.map((r) => r.right)) + 8,
				bottom: Math.max(...rects.map((r) => r.bottom)) + 8,
			}
		: null;
	const spot = $("tour-spot"),
		card = $("tour-card");
	spot.classList.toggle("empty", !box);
	Object.assign(spot.style, {
		left: `${box ? box.left : innerWidth / 2}px`,
		top: `${box ? box.top : innerHeight / 2}px`,
		width: `${box ? box.right - box.left : 0}px`,
		height: `${box ? box.bottom - box.top : 0}px`,
	});
	$("tour-count").textContent = `STEP ${i + 1} OF ${TOUR.length}`;
	$("tour-title").textContent = step.title;
	$("tour-body").textContent = step.body;
	$("tour-dots").innerHTML = TOUR.map(
		(_, n) => `<i class="${n === i ? "on" : n < i ? "past" : ""}"></i>`,
	).join("");
	$<HTMLButtonElement>("tour-back").hidden = i === 0;
	$<HTMLButtonElement>("tour-skip").hidden = i === TOUR.length - 1;
	$("tour-next").textContent = i === TOUR.length - 1 ? "Let's dig in" : "Next";
	$("tour").hidden = false;
	const margin = 12,
		cw = card.offsetWidth,
		ch = card.offsetHeight;
	let x = (innerWidth - cw) / 2,
		y = (innerHeight - ch) / 2;
	if (phone.matches) {
		// Phones: a full-width card on whichever edge the target is not on.
		const low = box ? (box.top + box.bottom) / 2 > innerHeight / 2 : false;
		y = low ? margin : innerHeight - ch - margin;
		x = margin;
		card.style.width = `${innerWidth - margin * 2}px`;
	} else {
		card.style.width = "";
		if (box) {
			const fit = [
				[
					box.right + margin,
					box.top,
					box.right + margin + cw <= innerWidth - margin,
				],
				[box.left - margin - cw, box.top, box.left - margin - cw >= margin],
				[
					box.left,
					box.bottom + margin,
					box.bottom + margin + ch <= innerHeight - margin,
				],
				[box.left, box.top - margin - ch, box.top - margin - ch >= margin],
			].find((p) => p[2]);
			if (fit) [x, y] = [fit[0] as number, fit[1] as number];
			else y = innerHeight - ch - margin;
		}
		x = Math.max(margin, Math.min(x, innerWidth - cw - margin));
		y = Math.max(margin, Math.min(y, innerHeight - ch - margin));
	}
	card.style.left = `${x}px`;
	card.style.top = `${y}px`;
	$("tour-next").focus({ preventScroll: true });
}
$("tour-next").onclick = () => {
	if (tourStep >= TOUR.length - 1) endTour();
	else showTourStep(tourStep + 1);
};
$("tour-back").onclick = () => showTourStep(Math.max(0, tourStep - 1));
$("tour-skip").onclick = endTour;
document.addEventListener("keydown", (event) => {
	if (tourStep < 0) return;
	if (event.key === "Escape") endTour();
	else if (event.key === "ArrowRight") $("tour-next").click();
	else if (event.key === "ArrowLeft" && tourStep > 0) $("tour-back").click();
});
window.addEventListener("resize", () => {
	if (tourStep >= 0) showTourStep(tourStep);
});

/* ── Events ─────────────────────────────────────────────────────────────── */
const phone = matchMedia("(max-width: 900px)");
/** On a phone the page scrolls to the area; on a desktop window everything is
 * already visible, so it only flashes. */
function reveal(el: HTMLElement): void {
	if (phone.matches)
		el.scrollIntoView({
			behavior: atmosphere.reduced ? "auto" : "smooth",
			block: "center",
		});
	else if (!atmosphere.reduced)
		el.animate(
			[
				{ boxShadow: "0 0 0 3px #947235" },
				{ boxShadow: "0 0 0 3px transparent" },
			],
			{ duration: 900, easing: "ease-out" },
		);
}
function openLedger(): void {
	if (matchMedia("(max-width: 900px)").matches) {
		stopReplay();
		ledgerSheet.append(ledger);
		ledgerSheet.showModal();
	} else reveal(ledger);
}
$("slots").addEventListener("click", (event) => {
	const button = (event.target as Element).closest<HTMLButtonElement>(
		"[data-slot]",
	);
	if (!button || button.disabled || run.finished) return;
	const slot = button.dataset.slot as Slot,
		value = button.dataset.value!;
	if (strike) {
		const marked = run.crossed[slot] || [];
		run.crossed[slot] = marked.includes(value)
			? marked.filter((v) => v !== value)
			: [...marked, value];
		if (run.crossed[slot]!.includes(value) && run.choices[slot] === value)
			delete run.choices[slot];
	} else {
		Object.assign(run.choices, { [slot]: value });
		run.crossed[slot] = run.crossed[slot]?.filter((v) => v !== value);
	}
	save();
	renderSlots();
	(
		document.querySelector(
			`[data-slot="${slot}"][data-value="${value}"]`,
		) as HTMLElement
	)?.focus({ preventScroll: true });
});
$("strike-button").onclick = () => {
	strike = !strike;
	$("strike-button").setAttribute("aria-pressed", String(strike));
};
$("assist").onchange = () => {
	run.assisted = true;
	updateCandidates();
	save();
	renderSlots();
};
$("foresight").onchange = (event) => {
	saved.foresight = (event.target as HTMLInputElement).checked;
	if (!saved.foresight) cancelPending();
	save();
};
$("predict-yes").onclick = () => predict(true);
$("predict-no").onclick = () => predict(false);
$("predict-cancel").onclick = () => goToFrame(frame);
$("hint").onclick = () => {
	if (run.finished) return;
	const slot = slots.find(
		(slot) => !puzzle.given[slot] && !run.hints.includes(slot),
	);
	if (!slot) return;
	run.hints.push(slot);
	Object.assign(run.choices, { [slot]: getAnswer()[slot] });
	updateCandidates();
	atmosphere.play("lock");
	save();
	renderSlots();
	setStatus(
		"◆",
		`The Scribe confirms ${slotNames[slot].toLowerCase()}.`,
		`${ruleInfo[slot][getAnswer()[slot]][1]} · Two points added to your score.`,
	);
};
$("submit").onclick = () => {
	if (run.finished || !slots.every((slot) => run.choices[slot])) return;
	const correct = matchesPuzzle(
			board,
			puzzle,
			run.choices as Ruleset,
			snapshots,
		),
		answer = getAnswer();
	run.feedback = slots.map((slot) => run.choices[slot] === answer[slot]);
	if (correct) {
		finish(true);
		return;
	}
	run.wrong++;
	$("submission-feedback").innerHTML =
		`<div class="feedback-slots" aria-label="${run.feedback.map((v, i) => `${slotNames[slots[i]]} ${v ? "correct" : "incorrect"}`).join(", ")}">${run.feedback.map((v) => `<span class="${v ? "feedback-correct" : "feedback-wrong"}">${v ? "◆" : "□"}</span>`).join("")}</div><span>${run.feedback.filter(Boolean).length} of five rules match. Three points added.</span>`;
	atmosphere.play("illegal");
	save();
	renderSlots();
	if (run.wrong >= 3) finish(false);
};
$("stages").addEventListener("click", (event) => {
	const id = (event.target as Element).closest<HTMLElement>("[data-stage]")
		?.dataset.stage;
	if (id === "observe") reveal($("fragments"));
	else if (id === "test") reveal($("board-frame"));
	else if (id) openLedger();
});
$("coach").addEventListener("click", (event) => {
	const id = (event.target as Element).closest<HTMLElement>("[data-coach]")
		?.dataset.coach;
	if (id === "observe") {
		const next = puzzle.fragments.findIndex((_, i) => !run.seen.includes(i));
		fragment = next < 0 ? 0 : next;
		goToFrame(0);
		$("play-replay").click();
	} else if (id === "test") {
		const mine = [...displayState.pieces].filter(
			([, s]) => s === displayState.turn,
		);
		if (mine.length) {
			showProbe = false;
			selected = null;
			selectSquare(mine[Math.floor(Math.random() * mine.length)][0]);
		}
		reveal($("board-frame"));
	} else if (id === "deduce") openLedger();
	else if (id === "inscribe") $("submit").click();
	else if (id === "result") $("result").hidden = false;
});
$("fragments").onclick = (event) => {
	const button = (event.target as Element).closest<HTMLElement>(
		"[data-fragment]",
	);
	if (button) {
		stopReplay();
		fragment = Number(button.dataset.fragment);
		goToFrame(0);
	}
};
$("scrubber").oninput = (event) => {
	stopReplay();
	goToFrame(Number((event.target as HTMLInputElement).value));
};
$("previous-frame").onclick = () => {
	stopReplay();
	goToFrame(frame - 1);
};
$("next-frame").onclick = () => {
	stopReplay();
	goToFrame(frame + 1);
};
$("play-replay").onclick = () => {
	if (replayTimer !== undefined) {
		stopReplay();
		return;
	}
	if (frame >= puzzle.fragments[fragment].moves.length) goToFrame(0);
	$("play-replay").textContent = "Ⅱ";
	$("play-replay").setAttribute("aria-label", "Pause fragment");
	replayTimer = window.setInterval(() => {
		goToFrame(frame + 1);
		if (frame === puzzle.fragments[fragment].moves.length) stopReplay();
	}, 950);
};
$("reset-probe").onclick = () => goToFrame(frame);
$("dig-log").onclick = (event) => {
	const button = (event.target as Element).closest<HTMLElement>("[data-log]");
	if (button) showExperiment(run.probes[Number(button.dataset.log)], false);
};
$("result").onclick = (event) => {
	const target = event.target as Element;
	if (target === $("result") || target.closest("[data-close-result]")) {
		$("result").hidden = true;
		return;
	}
	const button = target.closest<HTMLElement>("[data-review]");
	if (button) {
		$("result").hidden = true;
		showExperiment(puzzle.path[Number(button.dataset.review)].probe, false);
	}
};
document.addEventListener("keydown", (event) => {
	if (event.key === "Escape" && !$("result").hidden && !modal.open)
		$("result").hidden = true;
});
svg.addEventListener("click", (event) => {
	if (Date.now() < ignoreClick) return;
	const node = (event.target as Element).closest<SVGGElement>("[data-sq]");
	if (node) selectSquare(Number(node.dataset.sq));
});
svg.addEventListener("keydown", (event) => {
	const node = (event.target as Element).closest<SVGGElement>("[data-sq]");
	if (!node) return;
	const square = Number(node.dataset.sq);
	if (event.key === "Enter" || event.key === " ") {
		event.preventDefault();
		selectSquare(square);
		(svg.querySelector(`[data-sq="${square}"]`) as SVGGElement)?.focus();
	}
	if (event.key === "Escape") goToFrame(frame);
	if (["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(event.key)) {
		event.preventDefault();
		const [row, col] = board.xy[square];
		const next = board.xy.findIndex(
			([r, c]) =>
				r ===
					row +
						(event.key === "ArrowUp"
							? -1
							: event.key === "ArrowDown"
								? 1
								: 0) &&
				c ===
					col +
						(event.key === "ArrowLeft"
							? -1
							: event.key === "ArrowRight"
								? 1
								: 0),
		);
		if (next >= 0)
			(svg.querySelector(`[data-sq="${next}"]`) as SVGGElement)?.focus();
	}
});
svg.addEventListener("pointerdown", (event) => {
	const node = (event.target as Element).closest<SVGGElement>("[data-sq]");
	if (node && !run.finished) {
		const sq = Number(node.dataset.sq),
			current = snapshots[snapshotIndex()];
		if (current.pieces.has(sq)) {
			stopReplay();
			drag = { sq, x: event.clientX, y: event.clientY };
		}
	}
});
window.addEventListener("pointerup", (event) => {
	if (!drag) return;
	const node = document
		.elementFromPoint(event.clientX, event.clientY)
		?.closest<SVGGElement>("#board [data-sq]");
	if (
		node &&
		Number(node.dataset.sq) !== drag.sq &&
		Math.hypot(event.clientX - drag.x, event.clientY - drag.y) > 7
	) {
		ignoreClick = Date.now() + 200;
		requestProbe({
			snapshot: snapshotIndex(),
			from: drag.sq,
			to: Number(node.dataset.sq),
		});
	}
	drag = null;
});
window.addEventListener("pointercancel", () => {
	drag = null;
});
$("sound-button").onclick = () => {
	atmosphere.sound = !atmosphere.sound;
	saved.sound = atmosphere.sound;
	syncSound();
	save();
	atmosphere.play("legal");
};
$("help-button").onclick = showHelp;
$("museum-button").onclick = () => showMuseum("records");
$("streak-chip").onclick = () => showMuseum("records");
$("level-chip").onclick = () => showMuseum("records");
$("archive-button").onclick = showArchive;
$("close-modal").onclick = () => modal.close();
$("ledger-open").onclick = openLedger;
$("ledger-close").onclick = () => ledgerSheet.close();
ledgerSheet.addEventListener("close", () => {
	document.querySelector(".workspace")!.append(ledger);
});
matchMedia("(min-width: 901px)").addEventListener("change", (event) => {
	if (event.matches && ledgerSheet.open) ledgerSheet.close();
});
modal.addEventListener("click", (event) => {
	const target = event.target as Element;
	if (target === modal) {
		const rect = modal.getBoundingClientRect();
		if (
			event.clientX < rect.left ||
			event.clientX > rect.right ||
			event.clientY < rect.top ||
			event.clientY > rect.bottom
		)
			modal.close();
	}
	const date = target.closest<HTMLElement>("[data-date]");
	if (date && !(date as HTMLButtonElement).disabled) {
		modal.close();
		void loadPuzzle(date.dataset.date!);
	}
	const tab = target.closest<HTMLElement>("[data-tab]");
	if (tab) {
		modal
			.querySelectorAll<HTMLElement>("[data-tab]")
			.forEach((t) => t.setAttribute("aria-selected", String(t === tab)));
		$("museum-body").innerHTML = museumBody(tab.dataset.tab!);
	}
	if (target.id === "skin-toggle") {
		saved.skin = !saved.skin;
		document.body.classList.toggle("gold-leaf", saved.skin);
		save();
		$("museum-body").innerHTML = museumBody("collection");
	}
	if (target.id === "start-tour") {
		modal.close();
		startTour(0);
	}
	if (target.id === "export-records") {
		const blob = new Blob(
			[
				JSON.stringify(
					{ app: "wyrdboard", version: 1, runs: saved.runs },
					null,
					1,
				),
			],
			{ type: "application/json" },
		);
		const link = document.createElement("a");
		link.href = URL.createObjectURL(blob);
		link.download = `wyrdboard-records-${today}.json`;
		link.click();
		URL.revokeObjectURL(link.href);
		$("museum-feedback").textContent = "Records exported.";
	}
});
modal.addEventListener("change", (event) => {
	const input = event.target as HTMLInputElement;
	if (input.id !== "import-records" || !input.files?.[0]) return;
	void input.files[0].text().then((text) => {
		try {
			const { runs, added } = mergeImport(saved.runs, JSON.parse(text));
			saved.runs = runs;
			save();
			renderChrome();
			$("museum-body").innerHTML = museumBody("records");
			$("museum-feedback").textContent = added
				? `Imported ${added} record${added === 1 ? "" : "s"}.`
				: "Nothing new to import.";
		} catch {
			$("museum-feedback").textContent = "That file is not a Wyrdboard export.";
		}
	});
});
syncSound();

Object.assign(window, {
	render_game_to_text: () =>
		JSON.stringify(
			puzzle
				? {
						date: puzzle.date,
						board: puzzle.board,
						fragment: fragment + 1,
						frame,
						selected,
						showProbe,
						turn: displayState.turn,
						taken: displayState.taken,
						pieces: [...displayState.pieces],
						coordinates:
							"square IDs are zero-based; board.xy is [display row, display column], origin top left",
						xy: board.xy,
						score: scoreRun(run),
						probes: run.probes.length,
						wrong: run.wrong,
						hints: run.hints.length,
						assisted: run.assisted,
						choices: run.choices,
						finished: run.finished,
						clarity: clarityOf(),
						oracle: $("oracle-title").textContent,
					}
				: { loading: true },
		),
	advanceTime: (ms: number) => {
		atmosphere.draw(ms);
		if (replayTimer !== undefined && ms >= 950) {
			goToFrame(frame + Math.floor(ms / 950));
			if (frame >= puzzle.fragments[fragment].moves.length) stopReplay();
		}
	},
});
void (async () => {
	try {
		const response = await fetch("data/index.json");
		if (!response.ok)
			throw new Error("The archive is unavailable. Please refresh.");
		index = await response.json();
		const available = index.filter((p) => p.date <= today);
		daily = available[available.length - 1]?.date || index[0]?.date;
		if (!daily) throw new Error("No tablets are available yet.");
		await loadPuzzle(daily);
	} catch (error) {
		$("loading").textContent =
			error instanceof Error
				? error.message
				: "The archive could not be loaded.";
	}
})();
