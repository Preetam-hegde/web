"use strict";

/**
 * ComicClash Hero Kits & Campaign Data
 * Data-driven skill/ultimate effects (so every hero actually does what its card says),
 * wave-based issues, villain templates, boss specials and daily quests.
 *
 * Kit spec fields (all optional):
 *   dmg      attack multiplier          target  single | all | chain | lowest
 *   hits     number of strikes          crit    force critical hits
 *   pierce   ignore most defense        splash  damage multiplier on non-targets
 *   heal / shield  { who: self|lowest|all, pct }
 *   buff     { who: self|all, atkUp, evade, crit, taunt, guard, immuneCrit }
 *   debuff   { atkDown, defDown, bleed, mark, stun: { chance, turns } }
 */
const HERO_KITS = {
	cosmic_sentinel: {
		skill: { dmg: 0.9, shield: { who: "all", pct: 0.3 } },
		ult: { dmg: 2.6, target: "all", debuff: { stun: { chance: 0.5, turns: 1 } } },
	},
	crimson_phantom: {
		skill: { dmg: 1.2, buff: { who: "self", evade: 1, crit: 2, guaranteed: true } },
		ult: { dmg: 3.8, crit: true, pierce: true },
	},
	chronos_prime: {
		skill: { dmg: 1.0, target: "all", debuff: { atkDown: 2 } },
		ult: {
			dmg: 1.6,
			target: "strongest",
			heal: { who: "all", pct: 0.35 },
			debuff: { stun: { chance: 1, turns: 1 } },
		},
	},
	titan_mecha: {
		skill: { dmg: 1.0, buff: { who: "self", taunt: 2, guard: 2 } },
		ult: { dmg: 2.4, target: "all", debuff: { defDown: 2 } },
	},
	neon_valkyrie: {
		skill: { dmg: 1.5, target: "chain" },
		ult: { dmg: 2.8, debuff: { stun: { chance: 1, turns: 1 } } },
	},
	madame_mystica: {
		skill: { dmg: 0.8, heal: { who: "lowest", pct: 0.35 }, buff: { who: "lowest", atkUp: 2 } },
		ult: { dmg: 2.1, target: "all", debuff: { defDown: 2 } },
	},
	iron_fang: {
		skill: { dmg: 1.6, debuff: { bleed: 2 } },
		ult: { dmg: 3.2, hits: 5, debuff: { bleed: 2 } },
	},
	dr_voltage: {
		skill: { dmg: 1.0, buff: { who: "all", crit: 2 } },
		ult: { dmg: 2.5, target: "all", debuff: { stun: { chance: 0.4, turns: 1 } } },
	},
	shadow_blade: {
		skill: { dmg: 1.3, buff: { who: "self", evade: 1 } },
		ult: { dmg: 2.6, target: "lowest", crit: true },
	},
	blast_radius: {
		skill: { dmg: 1.3, target: "all" },
		ult: { dmg: 2.7, splash: 1.0 },
	},
	aegis_knight: {
		skill: { dmg: 0.9, shield: { who: "lowest", pct: 0.25 } },
		ult: { dmg: 1.5, buff: { who: "self", taunt: 2, immuneCrit: 2 }, shield: { who: "self", pct: 0.3 } },
	},
	apex_ranger: {
		skill: { dmg: 1.2, debuff: { mark: 2 } },
		ult: { dmg: 3.1, pierce: true },
	},
	street_brawler: {
		skill: { dmg: 1.3, heal: { who: "self", pct: 0.15 } },
		ult: { dmg: 2.0 },
	},
	rookie_cadet: {
		skill: { dmg: 1.2, debuff: { atkDown: 2 } },
		ult: { dmg: 1.9 },
	},
	grease_monkey: {
		skill: { dmg: 0.9, heal: { who: "lowest", pct: 0.2 } },
		ult: { dmg: 1.2, buff: { who: "all", atkUp: 2 } },
	},
	alley_cat: {
		skill: { dmg: 1.3, buff: { who: "self", evade: 2 } },
		ult: { dmg: 2.1, crit: true },
	},
};

const DEFAULT_KIT = {
	skill: { dmg: 1.6 },
	ult: { dmg: 2.8, target: "all", crit: true },
};

/** Villain factory: V(id, name, icon, affinity, hp, atk, def, extras) */
function V(id, name, icon, affinity, hp, atk, def, extra = {}) {
	return { id, name, icon, affinity, hp, maxHp: hp, atk, def, ...extra };
}

/** Boss special moves, fired every `cd` villain actions and telegraphed one turn early. */
const BOSS_SPECIALS = {
	slam: { kind: "slam", cd: 3 },
	stun: { kind: "stun", cd: 3 },
	drain: { kind: "drain", cd: 3 },
	shred: { kind: "shred", cd: 3 },
};

const ISSUES_CAMPAIGN = [
	{
		id: "issue_1",
		issueNo: "#1",
		title: "Dawn of the Neon Alley",
		coverDesc:
			"Thugs control the lower ward. Assemble your squad and clean up the streets!",
		bossName: "Knuckles McGruff",
		rewardCoins: 250,
		rewardXp: 80,
		rewardInk: 15,
		par: 6,
		waves: [
			[
				V("v1_thug", "Alley Goon", "🥊", "Brawler", 550, 75, 30),
				V("v1_thug2", "Alley Goon", "🥊", "Brawler", 550, 75, 30),
			],
			[
				V("v1_boss", "Knuckles McGruff", "👑", "Brawler", 1400, 110, 45, {
					isBoss: true,
					special: { ...BOSS_SPECIALS.stun, name: "Haymaker Slam" },
				}),
			],
		],
	},
	{
		id: "issue_2",
		issueNo: "#2",
		title: "Rooftop Cyber Heist",
		coverDesc:
			"The Neon Syndicate has seized the grid towers. Neutralize the drone swarm and confront the Volt Empress!",
		bossName: "Volt Empress",
		rewardCoins: 450,
		rewardXp: 150,
		rewardInk: 25,
		par: 8,
		waves: [
			[
				V("v2_drone", "Laser Drone", "🤖", "Tech", 700, 95, 35),
				V("v2_merc", "Cyber Merc", "🦾", "Tech", 850, 105, 40),
			],
			[
				V("v2_drone2", "Laser Drone", "🤖", "Tech", 700, 95, 35),
				V("v2_boss", "Volt Empress", "⚡", "Tech", 2500, 145, 60, {
					isBoss: true,
					special: { ...BOSS_SPECIALS.slam, name: "Grid Overload" },
				}),
			],
		],
	},
	{
		id: "issue_3",
		issueNo: "#3",
		title: "The Occult Catacombs",
		coverDesc:
			"Dark ley lines bleed beneath the metropolis. Enter the crypt and stop Baron Malice’s ritual!",
		bossName: "Baron Malice",
		rewardCoins: 750,
		rewardXp: 260,
		rewardInk: 40,
		par: 9,
		waves: [
			[
				V("v3_shade", "Gargoyle Shade", "🦇", "Mystic", 950, 125, 55),
				V("v3_cult", "Void Acolyte", "🔮", "Mystic", 1100, 135, 50),
			],
			[
				V("v3_cult2", "Void Acolyte", "🔮", "Mystic", 1100, 135, 50),
				V("v3_boss", "Baron Malice", "💀", "Mystic", 3800, 190, 75, {
					isBoss: true,
					special: { ...BOSS_SPECIALS.drain, name: "Soul Siphon" },
				}),
			],
		],
	},
	{
		id: "issue_4",
		issueNo: "#4",
		title: "Cosmic Incursion",
		coverDesc:
			"A rift tears open the upper atmosphere. Face Galaxor the Infinite before he compresses Earth into a singularity!",
		bossName: "Galaxor the Infinite",
		rewardCoins: 1200,
		rewardXp: 450,
		rewardInk: 60,
		par: 10,
		waves: [
			[
				V("v4_sentry", "Star Sentry", "🛸", "Cosmic", 1400, 165, 70),
				V("v4_void", "Void Annihilator", "🌌", "Cosmic", 1600, 180, 75),
			],
			[
				V("v4_sentry2", "Star Sentry", "🛸", "Cosmic", 1400, 165, 70),
				V("v4_boss", "Galaxor Infinite", "🪐", "Cosmic", 6000, 250, 100, {
					isBoss: true,
					special: { ...BOSS_SPECIALS.shred, name: "Singularity Crush" },
				}),
			],
		],
	},
	{
		id: "issue_5",
		issueNo: "#5",
		title: "Clockwork Paradox",
		coverDesc:
			"Time itself is stuttering. Doctor Tick-Tock is stealing minutes from the city one gear at a time!",
		bossName: "Doctor Tick-Tock",
		rewardCoins: 1500,
		rewardXp: 560,
		rewardInk: 75,
		par: 11,
		waves: [
			[
				V("v5_gear", "Gear Grunt", "⚙️", "Tech", 1600, 185, 80),
				V("v5_hand", "Minute Hand", "🕰️", "Mystic", 1500, 195, 75),
			],
			[
				V("v5_gear2", "Gear Grunt", "⚙️", "Tech", 1600, 185, 80),
				V("v5_hand2", "Hour Hand", "⏳", "Mystic", 1700, 190, 85),
			],
			[
				V("v5_boss", "Doctor Tick-Tock", "⏰", "Tech", 7500, 270, 110, {
					isBoss: true,
					special: { ...BOSS_SPECIALS.stun, name: "Stopped Clocks" },
				}),
			],
		],
	},
	{
		id: "issue_6",
		issueNo: "#6",
		title: "Noir Nights",
		coverDesc:
			"Rain, neon and trench coats. The Black Mask's gang owns every shadow in Noir Alley. Bring a lantern.",
		bossName: "The Black Mask",
		rewardCoins: 1900,
		rewardXp: 680,
		rewardInk: 90,
		par: 12,
		waves: [
			[
				V("v6_hit", "Hitman", "🕶️", "Brawler", 1900, 210, 90),
				V("v6_dame", "Femme Fatale", "💋", "Mystic", 1700, 225, 80),
			],
			[
				V("v6_hit2", "Hitman", "🕶️", "Brawler", 1900, 210, 90),
				V("v6_boss", "The Black Mask", "🎭", "Brawler", 9500, 300, 120, {
					isBoss: true,
					special: { ...BOSS_SPECIALS.drain, name: "Blackout Blades" },
				}),
			],
		],
	},
	{
		id: "issue_7",
		issueNo: "#7",
		title: "Multiverse Collapse",
		coverDesc:
			"Parallel Earths are bleeding into one another. Something hungry is eating the margins between panels.",
		bossName: "Mister Omnivore",
		rewardCoins: 2400,
		rewardXp: 820,
		rewardInk: 110,
		par: 13,
		waves: [
			[
				V("v7_a", "Panel Ghoul", "👻", "Mystic", 2300, 240, 100),
				V("v7_b", "Rift Hound", "🐺", "Cosmic", 2200, 250, 95),
			],
			[
				V("v7_c", "Ink Wraith", "🌫️", "Mystic", 2400, 245, 105),
				V("v7_d", "Star Eater", "☄️", "Cosmic", 2500, 255, 105),
			],
			[
				V("v7_boss", "Mister Omnivore", "👾", "Cosmic", 12000, 340, 135, {
					isBoss: true,
					special: { ...BOSS_SPECIALS.slam, name: "Dimension Rip" },
				}),
			],
		],
	},
	{
		id: "issue_8",
		issueNo: "#8",
		title: "Final Issue: The Editor",
		coverDesc:
			"The Editor is erasing the whole series — every hero, every villain. Defend your issue to the very last page!",
		bossName: "The Editor",
		rewardCoins: 3500,
		rewardXp: 1100,
		rewardInk: 160,
		par: 16,
		waves: [
			[
				V("v8_a", "Red Pencil", "✏️", "Tech", 2800, 270, 115),
				V("v8_b", "Eraser Golem", "🧽", "Brawler", 3000, 265, 120),
			],
			[
				V("v8_c", "Plot Hole", "🕳️", "Cosmic", 2900, 275, 115),
				V("v8_d", "Cliffhanger", "🪝", "Mystic", 2800, 280, 110),
			],
			[
				V("v8_boss", "The Editor", "📕", "Mystic", 16000, 380, 150, {
					isBoss: true,
					special: { ...BOSS_SPECIALS.shred, name: "Page Tear" },
				}),
			],
		],
	},
];

/** Endless mode: procedurally scaled waves. */
const ENDLESS_ISSUE = {
	id: "endless",
	issueNo: "∞",
	title: "The Infinite Gauntlet",
	coverDesc:
		"Endless waves of ever-stronger villains. How deep into the multiverse can your squad fight?",
	bossName: "???",
	endless: true,
	rewardCoins: 0,
	rewardXp: 0,
	rewardInk: 0,
	par: 0,
};

const ENDLESS_POOL = [
	["Street Punk", "🧨", "Brawler"],
	["Cyber Hound", "🐕‍🦺", "Tech"],
	["Hex Witch", "🧙", "Mystic"],
	["Nova Cultist", "🌠", "Cosmic"],
	["Steel Thug", "🔩", "Tech"],
	["Bone Knight", "🦴", "Mystic"],
	["Ring Bruiser", "🥋", "Brawler"],
	["Quasar Drone", "🛰️", "Cosmic"],
];

const ENDLESS_BOSSES = [
	["Tyrant Rex", "🦖", "Brawler", "stun", "Tail Whip"],
	["Mecha Kraken", "🦑", "Tech", "slam", "Tentacle Storm"],
	["Lich Queen", "👸", "Mystic", "drain", "Life Leech"],
	["Nebula Titan", "🌀", "Cosmic", "shred", "Gravity Well"],
];

function buildEndlessWave(waveNo) {
	const scale = 1 + (waveNo - 1) * 0.2;
	const rand = (n) => Math.floor(Math.random() * n);
	if (waveNo % 5 === 0) {
		const [name, icon, aff, kind, moveName] =
			ENDLESS_BOSSES[(waveNo / 5 - 1) % ENDLESS_BOSSES.length];
		return [
			V(
				`e${waveNo}_boss`,
				name,
				icon,
				aff,
				Math.round(2600 * scale),
				Math.round(130 * scale),
				Math.round(55 * scale),
				{ isBoss: true, special: { ...BOSS_SPECIALS[kind], name: moveName } },
			),
		];
	}
	const count = Math.min(3, 1 + Math.ceil(waveNo / 2.5));
	const wave = [];
	for (let i = 0; i < count; i++) {
		const [name, icon, aff] = ENDLESS_POOL[rand(ENDLESS_POOL.length)];
		wave.push(
			V(
				`e${waveNo}_${i}`,
				name,
				icon,
				aff,
				Math.round(520 * scale),
				Math.round(70 * scale),
				Math.round(28 * scale),
			),
		);
	}
	return wave;
}

/** Daily quests: type is a gameState.track() key. */
const DAILY_QUESTS = [
	{ id: "q_win", type: "win", target: 2, label: "Win 2 battles", coins: 150, ink: 10 },
	{ id: "q_pull", type: "pull", target: 5, label: "Open 5 booster packs", coins: 100, ink: 15 },
	{ id: "q_ult", type: "ult", target: 3, label: "Unleash 3 Ultimate Bursts", coins: 120, ink: 10 },
	{ id: "q_crit", type: "crit", target: 8, label: "Land 8 critical hits", coins: 120, ink: 10 },
	{ id: "q_level", type: "level", target: 1, label: "Level up a hero", coins: 80, ink: 20 },
];

const DAILY_STREAK_REWARDS = [
	{ coins: 300, ink: 40 },
	{ coins: 350, ink: 40 },
	{ coins: 400, ink: 50 },
	{ coins: 450, ink: 50 },
	{ coins: 500, ink: 60 },
	{ coins: 600, ink: 70 },
	{ coins: 1000, ink: 150, label: "JACKPOT" },
];

const MAX_HERO_LEVEL = 30;

window.HERO_KITS = HERO_KITS;
window.ISSUES_CAMPAIGN = ISSUES_CAMPAIGN;
