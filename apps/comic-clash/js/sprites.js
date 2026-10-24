"use strict";

/**
 * ComicClash Sprite & Icon helpers
 * Battle units use Tiny Swords (Pixel Frog) sprite sheets; icons come from Raven Fantasy Icons
 * (Clockwork Raven Studios). See README credits.
 */
const SPRITE_DEFS = {
	warrior: { fw: 192, idle: 8, atk: 4 },
	archer: { fw: 192, idle: 6, atk: 8 },
	monk: { fw: 192, idle: 6, atk: 11 },
	lancer: { fw: 320, idle: 12, atk: 3 },
	pawn: { fw: 192, idle: 8, atk: 4 },
};

const AFFINITY_CLASS = {
	Brawler: "warrior",
	Tech: "archer",
	Mystic: "monk",
	Cosmic: "lancer",
};

const VILLAIN_COLOR = {
	Brawler: "red",
	Tech: "black",
	Mystic: "purple",
	Cosmic: "yellow",
};

const MINION_CLASSES = ["warrior", "pawn", "archer", "lancer"];
const SPRITE_RENDER_PX = 190;

/** Raven icon ids (assets/icons/fb<ID>.png, 32x32 pixel art). */
const ICON = {
	coin: 131,
	ink: 122,
	star: 12,
	trophy: 15,
	chest: 6,
	heart: 1042,
	shield: 1043,
	sword: 721,
	ultimate: 745,
	skull: 862,
	atkUp: 609,
	atkDown: 617,
	defDown: 621,
	evade: 667,
	crit: 668,
	bleed: 693,
	stun: 687,
	guard: 1043,
	gems: { 2: 168, 3: 165, 4: 166, 5: 164 },
	affinity: { Cosmic: 12, Tech: 1025, Brawler: 993, Mystic: 666 },
};

function iconHTML(id, cls = "") {
	return `<img class="pix ${cls}" src="assets/icons/fb${id}.png" alt="" draggable="false" />`;
}

function hashString(str) {
	let h = 0;
	for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0;
	return h;
}

/** Decides which sprite sheet a combat unit uses. */
function getUnitSprite(unit) {
	if (unit.isHero) {
		const cls = unit.rarity <= 2 ? "pawn" : AFFINITY_CLASS[unit.affinity];
		return { color: "blue", cls, scale: unit.rarity >= 5 ? 1.15 : 1 };
	}
	const color = VILLAIN_COLOR[unit.affinity] || "red";
	const cls = unit.isBoss
		? AFFINITY_CLASS[unit.affinity]
		: MINION_CLASSES[hashString(unit.id.replace(/\d+$/, "") + unit.name) % MINION_CLASSES.length];
	return { color, cls, scale: unit.isBoss ? 1.45 : 1 };
}

/** Applies a sheet/animation to a .sprite element. mode: 'idle' | 'atk'. */
function setSpriteMode(el, spriteInfo, mode) {
	const def = SPRITE_DEFS[spriteInfo.cls];
	const frames = def[mode];
	const px = Math.round(SPRITE_RENDER_PX * spriteInfo.scale * (def.fw === 320 ? 1 : 1));
	const size = def.fw === 320 ? px : px;
	el.style.setProperty("--url", `url(assets/sprites/${spriteInfo.color}_${spriteInfo.cls}_${mode}.png)`);
	el.style.setProperty("--w", `${size}px`);
	el.style.setProperty("--n", frames);
	el.style.setProperty("--dur", mode === "idle" ? `${frames * 0.12}s` : `${frames * 0.09}s`);
	el.dataset.mode = mode;
	// restart the animation
	el.style.animation = "none";
	void el.offsetWidth;
	el.style.animation = "";
	return frames * (mode === "idle" ? 120 : 90);
}

window.SPRITE_DEFS = SPRITE_DEFS;
window.ICON = ICON;
window.iconHTML = iconHTML;
window.getUnitSprite = getUnitSprite;
window.setSpriteMode = setSpriteMode;
