"use strict";
import type { Slot, Board, State, Outcome, Move } from "./types.js";

export const slotNames: Record<Slot, string> = {
	move: "Movement",
	capture: "Capture",
	safe: "Safe squares",
	special: "Special squares",
	win: "Victory",
};
export const ruleInfo: Record<
	Slot,
	Record<string, [string, string, string]>
> = {
	move: {
		step: ["↔", "Step", "Move to one adjacent square."],
		slide: [
			"⟷",
			"Slide",
			"Move any distance along a clear line. Senet follows the snake path.",
		],
		hop: [
			"⌒",
			"Hop",
			"Jump exactly one adjacent piece to the next square on the line.",
		],
		leap: [
			"⤳",
			"Leap",
			"Land exactly two squares away along a line, over anything between.",
		],
	},
	capture: {
		none: ["○", "None", "Pieces cannot capture or land on an occupied square."],
		custodial: [
			"⋈",
			"Flank",
			"Close a straight trap around one enemy with another friendly piece. Existing traps do not capture.",
		],
		replace: ["⊗", "Replace", "Land on an enemy to capture it."],
		liberty: [
			"⁙",
			"Liberty",
			"Enemy groups with no empty adjacent square are captured. A group touching a safe square is protected.",
		],
		approach: [
			"⇢",
			"Approach",
			"Capture the enemy directly beyond your landing square, along your line of travel.",
		],
	},
	safe: {
		none: ["∅", "None", "No squares protect from capture."],
		rosettes: ["✳", "Rosettes", "The three starred squares are safe."],
		corners: ["⌜", "Corners", "The four outer corner squares are safe."],
		cross: [
			"✚",
			"Cross",
			"The middle row and the first of the two middle columns are safe.",
		],
		midpoints: [
			"⁘",
			"Edge mids",
			"Midpoints of the four outer edges are safe (rounded toward the near end).",
		],
		lane: ["Ⅱ", "One lane", "The top lane in this view is safe."],
		heart: ["❖", "Heart", "The two diamond-marked centre squares are safe."],
	},
	special: {
		none: ["∅", "None", "Rosettes do not trigger a special effect."],
		extra: ["↻", "Extra turn", "Landing on a rosette grants another turn."],
		return: [
			"↤",
			"Return",
			"A rosette sends the moving piece to the first empty square on its starting edge. No effect if that edge is full.",
		],
		swap: [
			"⇄",
			"Swap",
			"A rosette swaps the moving piece with its nearest enemy, using Manhattan distance and square number to break ties.",
		],
		warp: [
			"✺",
			"Warp",
			"A rosette carries the moving piece to the next rosette in board order, if that one is empty.",
		],
	},
	win: {
		reach: [
			"⚑",
			"Far end",
			"Shell reaches the rightmost edge; onyx reaches the leftmost.",
		],
		capture3: [
			"⋮",
			"Capture 3",
			"Capture three enemy pieces in total. Fragment counters may already include earlier captures.",
		],
		immobilise: ["⊠", "No moves", "Leave the opponent without any legal move."],
		centre: [
			"⊙",
			"Hold centre",
			"Occupy both diamond-marked centre squares at the end of your move.",
		],
		pair: [
			"⚐",
			"Pair",
			"Hold two squares of the far edge at the end of your move.",
		],
	},
};
export const boardInfo = {
	ur: {
		name: "THE ROYAL GAME OF UR",
		era: "MESOPOTAMIA · C. 2600 BCE",
		fact: "Boards from the Royal Cemetery at Ur date to around 2600 BCE.<br>A later Babylonian clay tablet preserves rules for a form of this ancient game.",
		short: "Ur",
	},
	senet: {
		name: "THE THIRTY HOUSES OF SENET",
		era: "ANCIENT EGYPT · C. 3100 BCE",
		fact: "Senet boards appear in Egyptian tombs more than 5,000 years old.<br>Its original rules do not survive in full; modern play relies on reconstruction.",
		short: "Senet",
	},
} as const;
export function describeOutcome(o: Outcome): [string, string, string] {
	if (o.kind === "illegal")
		return [
			"×",
			"The stone refuses.",
			"Illegal move. Even a refusal is evidence.",
		];
	const events = [];
	if (o.captured.length) events.push(`${o.captured.length} captured`);
	if (o.extraTurn) events.push("another turn");
	if (o.sentBack !== null) events.push(`moved to square ${o.sentBack + 1}`);
	if (o.swapped !== null) events.push(`swapped with square ${o.swapped + 1}`);
	if (o.won) events.push("victory");
	return [
		o.won
			? "⚑"
			: o.captured.length
				? "⚔"
				: o.extraTurn
					? "↻"
					: o.sentBack !== null
						? "✺"
						: o.swapped !== null
							? "⇄"
							: "✓",
		o.won
			? "A winning move."
			: o.captured.length
				? "A piece falls."
				: o.extraTurn
					? "The turn is yours again."
					: o.sentBack !== null
						? "A rosette moves it on."
						: o.swapped !== null
							? "Two fates exchanged."
							: "The move is accepted.",
		events.length
			? events.join(" · ")
			: "Legal move. No capture or special effect.",
	];
}

export function miniBoard(b: Board, s: State, move?: Move): string {
	const width = Math.max(...b.xy.map((p) => p[1])) + 1;
	return `<svg viewBox="-1 -1 ${width * 8 + 2} 26" aria-hidden="true">${b.xy.map(([y, x], i) => `<rect x="${x * 8}" y="${y * 8}" width="7" height="7" fill="${i === move?.to ? "#b39958" : "#c5c3b5"}" opacity=".6"/>${s.pieces.has(i) ? (s.pieces.get(i) === "A" ? `<circle cx="${x * 8 + 3.5}" cy="${y * 8 + 3.5}" r="2.1" fill="#f4f0e3" stroke="#8c826b" stroke-width=".4"/>` : `<path d="M${x * 8 + 3.5} ${y * 8 + 1}l2.5 2.5-2.5 2.5-2.5-2.5Z" fill="#41483d"/>`) : ""}`).join("")}</svg>`;
}

export function renderBoard(
	svg: SVGSVGElement,
	b: Board,
	s: State,
	selected: number | null,
	move?: Move,
): void {
	const width = Math.max(...b.xy.map((p) => p[1])) + 1,
		cell = 68,
		pad = 18;
	svg.setAttribute(
		"viewBox",
		`0 0 ${width * cell + pad * 2} ${3 * cell + pad * 2}`,
	);
	svg.innerHTML = `<defs><radialGradient id="shell" cx=".35" cy=".3"><stop stop-color="#f6f0df"/><stop offset=".7" stop-color="#d6ccb6"/><stop offset="1" stop-color="#b0a58c"/></radialGradient><radialGradient id="onyx" cx=".35" cy=".3"><stop stop-color="#5c6559"/><stop offset=".65" stop-color="#2d3730"/><stop offset="1" stop-color="#1c2621"/></radialGradient><filter id="shadow" x="-50%" y="-50%" width="200%" height="200%"><feDropShadow dx="1" dy="3" stdDeviation="2" flood-opacity=".45"/></filter></defs>${b.xy
		.map(([row, col], i) => {
			const x = pad + col * cell,
				y = pad + row * cell,
				owner = s.pieces.get(i),
				star = b.special.includes(i);
			const route =
				b.id === "senet"
					? b.adj[i]
							.map(
								(n) =>
									`<path class="cell-detail" d="M${x + 34} ${y + 34}l${(b.xy[n][1] - col) * 34} ${(b.xy[n][0] - row) * 34}"/>`,
							)
							.join("")
					: "";
			return `<g class="node" data-sq="${i}" role="button" tabindex="0" aria-label="Square ${i + 1}${star ? ", rosette" : ""}${b.centre.includes(i) ? ", centre" : ""}, ${owner ? (owner === "A" ? "shell piece" : "onyx piece") : "empty"}${selected === i ? ", selected" : ""}" aria-pressed="${selected === i}"><rect class="board-cell ${(row + col) % 2 ? "alt" : ""}" x="${x + 2}" y="${y + 2}" width="${cell - 4}" height="${cell - 4}" rx="1"/><path class="cell-detail" d="M${x + 8} ${y + 18}v-10h10m${cell - 36} 0h10v10m0 ${cell - 36}v10h-10m-${cell - 36} 0h-10v-10"/>${route}${star ? `<text class="cell-glyph" x="${x + cell / 2}" y="${y + cell / 2}">✳</text>` : b.centre.includes(i) ? `<path class="cell-detail centre-mark" d="M${x + 34} ${y + 23}l11 11-11 11-11-11Z"/>` : `<circle class="cell-detail" cx="${x + 34}" cy="${y + 34}" r="2"/>`}<text class="cell-number" x="${x + 8}" y="${y + cell - 8}">${String(i + 1).padStart(2, "0")}</text>${move?.to === i || move?.from === i ? `<rect class="last-move" x="${x + 5}" y="${y + 5}" width="58" height="58"/>` : ""}${owner === "A" ? `<g class="stone" data-piece="${i}"><circle class="piece-a" cx="${x + 34}" cy="${y + 32}" r="21"/><circle class="piece-etch" cx="${x + 34}" cy="${y + 32}" r="14"/><path class="piece-etch" d="M${x + 30} ${y + 32}h8m-4-4v8"/></g>` : owner === "B" ? `<g class="stone" data-piece="${i}"><rect class="piece-b" x="${x + 17}" y="${y + 15}" width="34" height="34" rx="5" transform="rotate(45 ${x + 34} ${y + 32})"/><circle class="piece-etch" cx="${x + 34}" cy="${y + 32}" r="9"/></g>` : ""}${selected === i ? `<circle class="selected-ring" cx="${x + 34}" cy="${y + 32}" r="27"/>` : ""}</g>`;
		})
		.join("")}`;
}

export class Atmosphere {
	private ctx: CanvasRenderingContext2D;
	private audio: AudioContext | null = null;
	private particles = Array.from({ length: 400 }, () => ({
		x: Math.random(),
		y: Math.random(),
		size: Math.random() * 1.2 + 0.3,
		speed: 0.00003 + Math.random() * 0.00007,
	}));
	private fog = 1;
	private ripple = 0;
	private last = 0;
	private frame = 0;
	public reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
	public sound = false;
	constructor(
		private canvas: HTMLCanvasElement,
		private total: number,
	) {
		this.ctx = canvas.getContext("2d")!;
		new ResizeObserver(() => {
			canvas.width = canvas.clientWidth * devicePixelRatio;
			canvas.height = canvas.clientHeight * devicePixelRatio;
			this.draw(16);
		}).observe(canvas);
		this.tick = this.tick.bind(this);
		this.frame = requestAnimationFrame(this.tick);
		document.addEventListener("visibilitychange", () => {
			if (!document.hidden) {
				cancelAnimationFrame(this.frame);
				this.last = 0;
				this.frame = requestAnimationFrame(this.tick);
			}
		});
	}
	setFog(count: number) {
		this.fog = Math.log(Math.max(1, count)) / Math.log(this.total);
		this.ripple = 1;
		this.draw(16);
	}
	private tick(now: number) {
		if (document.hidden) return;
		this.draw(Math.min(50, this.last ? now - this.last : 16));
		this.last = now;
		this.frame = requestAnimationFrame(this.tick);
	}
	draw(ms: number) {
		const { width: w, height: h } = this.canvas;
		this.ctx.clearRect(0, 0, w, h);
		if (this.reduced) return;
		this.ripple = Math.max(0, this.ripple - ms / 1000);
		for (let i = 0; i < this.particles.length * this.fog; i++) {
			const p = this.particles[i];
			p.x = (p.x + (p.speed * ms) / 16) % 1;
			this.ctx.fillStyle = `rgba(217,198,144,${0.15 + this.fog * 0.25 - this.ripple * 0.12})`;
			this.ctx.beginPath();
			this.ctx.arc(p.x * w, p.y * h, p.size * devicePixelRatio, 0, Math.PI * 2);
			this.ctx.fill();
		}
	}
	/** A short fall of gold flecks, for a finished tablet. */
	burst(canvas: HTMLCanvasElement, power = 1) {
		if (this.reduced) return;
		const ctx = canvas.getContext("2d")!;
		canvas.width = innerWidth * devicePixelRatio;
		canvas.height = innerHeight * devicePixelRatio;
		const colours = ["#b39958", "#947235", "#d9c690", "#34362f"];
		const bits = Array.from({ length: Math.round(70 * power) }, () => ({
			x: canvas.width / 2 + (Math.random() - 0.5) * canvas.width * 0.4,
			y: canvas.height * 0.35,
			vx: (Math.random() - 0.5) * 12 * devicePixelRatio,
			vy: (-4 - Math.random() * 8) * devicePixelRatio,
			size: (3 + Math.random() * 5) * devicePixelRatio,
			colour: colours[Math.floor(Math.random() * colours.length)],
			spin: (Math.random() - 0.5) * 0.25,
			angle: Math.random() * 3,
		}));
		let age = 0;
		const step = () => {
			age++;
			ctx.clearRect(0, 0, canvas.width, canvas.height);
			for (const p of bits) {
				p.vy += 0.24 * devicePixelRatio;
				p.x += p.vx;
				p.y += p.vy;
				p.vx *= 0.99;
				p.angle += p.spin;
				ctx.save();
				ctx.translate(p.x, p.y);
				ctx.rotate(p.angle);
				ctx.globalAlpha = Math.max(0, 1 - age / 120);
				ctx.fillStyle = p.colour;
				ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
				ctx.restore();
			}
			if (age < 120) requestAnimationFrame(step);
			else ctx.clearRect(0, 0, canvas.width, canvas.height);
		};
		requestAnimationFrame(step);
	}
	play(kind: "clack" | "illegal" | "legal" | "capture" | "lock" | "reveal") {
		if (!this.sound) return;
		try {
			this.audio ??= new AudioContext();
			void this.audio.resume();
			const ctx = this.audio,
				time = ctx.currentTime;
			const frequencies = {
				clack: [170],
				illegal: [85],
				legal: [520, 780],
				capture: [140, 95, 60],
				lock: [420, 630, 840],
				reveal: [130, 195, 260, 390, 520],
			}[kind];
			frequencies.forEach((f, i) => {
				const oscillator = ctx.createOscillator(),
					gain = ctx.createGain();
				oscillator.type =
					kind === "capture" || kind === "clack" ? "triangle" : "sine";
				oscillator.frequency.setValueAtTime(f, time + i * 0.055);
				gain.gain.setValueAtTime(0, time + i * 0.055);
				gain.gain.linearRampToValueAtTime(0.08, time + i * 0.055 + 0.008);
				gain.gain.exponentialRampToValueAtTime(
					0.001,
					time + i * 0.055 + (kind === "reveal" ? 0.7 : 0.18),
				);
				oscillator.connect(gain);
				gain.connect(ctx.destination);
				oscillator.start(time + i * 0.055);
				oscillator.stop(time + i * 0.055 + 0.8);
			});
		} catch {
			/* Audio may be unavailable in a restricted browser. */
		}
	}
}
