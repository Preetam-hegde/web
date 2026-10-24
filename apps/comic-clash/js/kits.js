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
	nova_empress: {
		skill: { dmg: 1.0, shield: { who: "all", pct: 0.2 }, buff: { who: "all", atkUp: 2 } },
		ult: { dmg: 2.7, target: "all", heal: { who: "all", pct: 0.2 } },
	},
	ghost_circuit: {
		skill: { dmg: 1.5, debuff: { defDown: 2 } },
		ult: { dmg: 3.6, crit: true, pierce: true },
	},
	jade_tempest: {
		skill: { dmg: 1.5, target: "chain" },
		ult: { dmg: 3.0, hits: 4, debuff: { stun: { chance: 0.5, turns: 1 } } },
	},
	glitch_queen: {
		skill: { dmg: 1.1, target: "all", debuff: { atkDown: 2 } },
		ult: { dmg: 2.3, target: "all", debuff: { defDown: 2 } },
	},
	lunar_oracle: {
		skill: { dmg: 0.7, heal: { who: "all", pct: 0.2 }, cleanse: { who: "all" } },
		ult: { dmg: 1.8, heal: { who: "all", pct: 0.3 }, buff: { who: "all", crit: 2 } },
	},
	frost_warden: {
		skill: { dmg: 1.2, debuff: { stun: { chance: 0.5, turns: 1 } } },
		ult: { dmg: 2.2, target: "all", debuff: { atkDown: 2 } },
	},
	rust_hound: {
		skill: { dmg: 1.4, debuff: { bleed: 2 } },
		ult: { dmg: 2.6, debuff: { bleed: 2 } },
	},
	eclipse_knight: {
		skill: { dmg: 1.5, lifesteal: 0.5 },
		ult: { dmg: 2.5, target: "all", lifesteal: 0.3, debuff: { atkDown: 2 } },
	},
	volt_viking: {
		skill: { dmg: 1.2, target: "all", debuff: { stun: { chance: 0.3, turns: 1 } } },
		ult: { dmg: 3.0, hits: 3, debuff: { stun: { chance: 0.6, turns: 1 } } },
	},
	star_pilot: {
		skill: { dmg: 1.0, energy: { who: "all", amt: 25 } },
		ult: { dmg: 3.0, crit: true, pierce: true },
	},
	venom_vixen: {
		skill: { dmg: 1.2, target: "chain", debuff: { bleed: 3 } },
		ult: { dmg: 2.2, target: "all", debuff: { bleed: 3, defDown: 2 } },
	},
	clockwork_cop: {
		skill: { dmg: 1.1, debuff: { stun: { chance: 0.6, turns: 1 } } },
		ult: { dmg: 2.3, debuff: { mark: 2 } },
	},
	hex_doll: {
		skill: { dmg: 1.0, debuff: { mark: 2 } },
		ult: { dmg: 2.4, target: "chain", debuff: { bleed: 2 } },
	},
	meteor_monk: {
		skill: { dmg: 0.8, heal: { who: "self", pct: 0.2 }, cleanse: { who: "self" } },
		ult: { dmg: 2.6, crit: true },
	},
	lucky_pup: {
		skill: { dmg: 1.2, buff: { who: "self", crit: 2 } },
		ult: { dmg: 1.9, target: "chain" },
	},
	phoenix_heart: {
		skill: { dmg: 1.1, heal: { who: "lowest", pct: 0.4 } },
		ult: { dmg: 2.4, target: "all", heal: { who: "all", pct: 0.25 }, buff: { who: "all", atkUp: 2 } },
	},
	neon_ninja: {
		skill: { dmg: 1.6, hits: 3 },
		ult: { dmg: 3.0, hits: 6 },
	},
	sand_sphinx: {
		skill: { dmg: 0.9, debuff: { stun: { chance: 0.7, turns: 1 }, mark: 2 } },
		ult: { dmg: 2.1, target: "all", debuff: { mark: 2, defDown: 2 } },
	},
	comet_kid: {
		skill: { dmg: 1.0, buff: { who: "all", crit: 2 }, energy: { who: "self", amt: 30 } },
		ult: { dmg: 2.8, target: "chain", crit: true },
	},
	siege_sergeant: {
		skill: { dmg: 0.8, shield: { who: "all", pct: 0.15 }, buff: { who: "self", taunt: 2 } },
		ult: { dmg: 1.9, shield: { who: "self", pct: 0.35 }, buff: { who: "self", immuneCrit: 2, taunt: 2 } },
	},
	echo_bard: {
		skill: { dmg: 0.7, energy: { who: "all", amt: 15 }, buff: { who: "all", atkUp: 2 } },
		ult: { dmg: 1.7, target: "all", cleanse: { who: "all" }, heal: { who: "all", pct: 0.15 } },
	},
	gummy_guard: {
		skill: { dmg: 0.9, shield: { who: "self", pct: 0.25 }, buff: { who: "self", taunt: 2 } },
		ult: { dmg: 1.7, target: "chain" },
	},
	spark_sprite: {
		skill: { dmg: 1.2, energy: { who: "self", amt: 30 } },
		ult: { dmg: 1.9, target: "chain" },
	},
	paper_boy: {
		skill: { dmg: 1.3, buff: { who: "self", evade: 1 } },
		ult: { dmg: 1.9, target: "chain" },
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
	{
		id: "issue_9",
		issueNo: "#9",
		title: "Carnival of Chaos",
		coverDesc:
			"The big top rolls into town and every ride is rigged. Dodge the knife throwers before Harlequin Havoc closes the show!",
		bossName: "Harlequin Havoc",
		rewardCoins: 4200,
		rewardXp: 1400,
		rewardInk: 200,
		par: 14,
		waves: [
			[
				V("v9_a", "Juggler Thug", "🤹", "Brawler", 3200, 290, 125),
				V("v9_b", "Knife Thrower", "🔪", "Tech", 3000, 300, 120),
			],
			[
				V("v9_c", "Fortune Teller", "🔮", "Mystic", 3200, 295, 125),
				V("v9_d", "Strongman", "🏋️", "Brawler", 3500, 285, 135),
				V("v9_e", "Rocket Clown", "🤡", "Cosmic", 3100, 305, 120),
			],
			[
				V("v9_boss", "Harlequin Havoc", "🃏", "Brawler", 19000, 400, 160, {
					isBoss: true,
					special: { ...BOSS_SPECIALS.stun, name: "Big Top Slam" },
				}),
			],
		],
	},
	{
		id: "issue_10",
		issueNo: "#10",
		title: "Crossover Crisis",
		coverDesc:
			"Every villain from every issue is back, rebooted by The Archivist. End the multiverse event before the next printing!",
		bossName: "The Archivist",
		rewardCoins: 6000,
		rewardXp: 1800,
		rewardInk: 260,
		par: 18,
		waves: [
			[
				V("v10_a", "Rebooted Goon", "🥊", "Brawler", 3600, 320, 135),
				V("v10_b", "Rebooted Drone", "🤖", "Tech", 3500, 330, 130),
				V("v10_c", "Rebooted Acolyte", "🔮", "Mystic", 3600, 325, 130),
			],
			[
				V("v10_d", "Rebooted Sentry", "🛸", "Cosmic", 3800, 335, 135),
				V("v10_e", "Rebooted Merc", "🦾", "Tech", 3700, 335, 135),
			],
			[
				V("v10_f", "Rebooted Empress", "⚡", "Tech", 9000, 360, 150, {
					isBoss: true,
					special: { ...BOSS_SPECIALS.slam, name: "Grid Overload II" },
				}),
				V("v10_g", "Rebooted Baron", "💀", "Mystic", 9000, 360, 150, {
					isBoss: true,
					special: { ...BOSS_SPECIALS.drain, name: "Soul Siphon II" },
				}),
			],
			[
				V("v10_boss", "The Archivist", "📚", "Cosmic", 24000, 430, 175, {
					isBoss: true,
					special: { ...BOSS_SPECIALS.shred, name: "Reboot Universe" },
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

function buildEndlessWave(waveNo, bossOnly = false) {
	const scale = 1 + (waveNo - 1) * 0.2;
	const rand = (n) => Math.floor(Math.random() * n);
	if (bossOnly || waveNo % 5 === 0) {
		const idx = bossOnly ? waveNo - 1 : waveNo / 5 - 1;
		const [name, icon, aff, kind, moveName] = ENDLESS_BOSSES[idx % ENDLESS_BOSSES.length];
		return [
			V(
				`e${waveNo}_boss`,
				name,
				icon,
				aff,
				Math.round(2600 * scale * (bossOnly ? 0.6 : 1)),
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
	{ id: "q_tactic", type: "tactic", target: 3, label: "Play 3 tactic cards", coins: 110, ink: 10 },
	{ id: "q_pairs", type: "pairs", target: 2, label: "Trigger 2 pair combos", coins: 140, ink: 15 },
	{ id: "q_arcade", type: "arcade", target: 2, label: "Play 2 arcade games", coins: 100, ink: 15 },
	{ id: "q_level", type: "level", target: 1, label: "Level up a hero", coins: 80, ink: 20 },
];

/**
 * Pair combos: when these two heroes act back-to-back in a round (squad slot order),
 * the second hero deals +bonus damage and the combo's extra effects fire.
 */
const HERO_COMBOS = [
	{ id: "storm_lance", name: "STORM LANCE", a: "neon_valkyrie", b: "dr_voltage", bonus: 0.35, debuff: { stun: { chance: 0.6, turns: 1 } }, desc: "Lance charged with lightning: 60% stun." },
	{ id: "double_dawn", name: "DOUBLE DAWN", a: "cosmic_sentinel", b: "nova_empress", bonus: 0.4, heal: { who: "all", pct: 0.1 }, desc: "Twin suns scorch the foe and heal the squad 10%." },
	{ id: "shadow_duet", name: "SHADOW DUET", a: "crimson_phantom", b: "shadow_blade", bonus: 0.4, debuff: { mark: 1 }, desc: "Two assassins, one target: marked." },
	{ id: "siege_barrage", name: "SIEGE BARRAGE", a: "titan_mecha", b: "blast_radius", bonus: 0.3, debuff: { defDown: 2 }, desc: "Heavy ordnance shreds defense." },
	{ id: "hex_and_tarot", name: "HEX & TAROT", a: "madame_mystica", b: "hex_doll", bonus: 0.3, debuff: { bleed: 2 }, desc: "Cursed cards and needles: bleed." },
	{ id: "pack_hunt", name: "PACK HUNT", a: "iron_fang", b: "rust_hound", bonus: 0.35, debuff: { bleed: 3 }, desc: "The pack tears in: bleed 3 turns." },
	{ id: "field_repair", name: "FIELD REPAIR", a: "aegis_knight", b: "grease_monkey", bonus: 0.15, heal: { who: "lowest", pct: 0.2 }, shield: { who: "all", pct: 0.1 }, desc: "Patch-up under the shield wall." },
	{ id: "time_lock", name: "TIME LOCK", a: "chronos_prime", b: "clockwork_cop", bonus: 0.25, debuff: { stun: { chance: 0.85, turns: 1 } }, desc: "Time freezes: 85% stun." },
	{ id: "rookie_and_vet", name: "ROOKIE & VET", a: "street_brawler", b: "rookie_cadet", bonus: 0.3, energy: { who: "all", amt: 15 }, desc: "Mentorship pays off: +15 energy for all." },
	{ id: "moonlit_frost", name: "MOONLIT FROST", a: "frost_warden", b: "lunar_oracle", bonus: 0.3, debuff: { atkDown: 2 }, cleanse: { who: "all" }, desc: "Cold calm: foe attack down, squad cleansed." },
	{ id: "dogfight", name: "DOGFIGHT", a: "star_pilot", b: "comet_kid", bonus: 0.4, buff: { who: "self", crit: 2, guaranteed: true }, desc: "Wingmen in sync: next hit crits." },
	{ id: "storm_siblings", name: "STORM SIBLINGS", a: "volt_viking", b: "jade_tempest", bonus: 0.35, debuff: { stun: { chance: 0.5, turns: 1 } }, desc: "Thunder meets typhoon: 50% stun." },
	{ id: "night_and_nettle", name: "NIGHT & NETTLE", a: "eclipse_knight", b: "venom_vixen", bonus: 0.35, debuff: { bleed: 3 }, heal: { who: "self", pct: 0.1 }, desc: "Poisoned shadow: bleed and self-heal." },
	{ id: "fire_and_fist", name: "FIRE & FIST", a: "phoenix_heart", b: "meteor_monk", bonus: 0.4, heal: { who: "lowest", pct: 0.2 }, desc: "Flame and focus: heal the weakest 20%." },
	{ id: "nine_lives_luck", name: "NINE LIVES & LUCK", a: "alley_cat", b: "lucky_pup", bonus: 0.3, buff: { who: "self", evade: 1, crit: 2 }, desc: "Lucky pair: dodge and crit boost." },
	{ id: "zero_day", name: "ZERO-DAY STRIKE", a: "neon_ninja", b: "ghost_circuit", bonus: 0.4, debuff: { defDown: 2, mark: 2 }, desc: "Exploit found: defense down and marked." },
	{ id: "riddle_me_this", name: "RIDDLE ME THIS", a: "sand_sphinx", b: "echo_bard", bonus: 0.3, energy: { who: "all", amt: 15 }, debuff: { atkDown: 2 }, desc: "A song and a riddle: foe weakened, squad charged." },
	{ id: "iron_wall", name: "IRON WALL", a: "siege_sergeant", b: "gummy_guard", bonus: 0.2, shield: { who: "all", pct: 0.15 }, desc: "Double shield wall: +15% HP shield for all." },
	{ id: "fairy_fetch", name: "FAIRY FETCH", a: "spark_sprite", b: "paper_boy", bonus: 0.3, energy: { who: "self", amt: 30 }, desc: "Sparks fly and papers fly: +30 energy." },
];

/** Daily arcade mutators for the Mutator Gauntlet (endless mode with a twist). */
const DEFAULT_MUT = { dmgHero: 1, dmgEnemy: 1, enemyHp: 1, enemyDef: 1, startEnergy: 0, roundBleed: 0, bossOnly: false, payout: 1 };
const MUTATORS = [
	{ id: "glass", name: "GLASS CANNONS", icon: 1025, desc: "Everyone hits 60% harder. Nobody survives long.", mods: { dmgHero: 1.6, dmgEnemy: 1.6, payout: 1.4 } },
	{ id: "iron", name: "IRON WALLS", icon: 1043, desc: "Enemies have +60% HP and +30% DEF. You deal +15% damage.", mods: { enemyHp: 1.6, enemyDef: 1.3, dmgHero: 1.15, payout: 1.5 } },
	{ id: "rush", name: "ENERGY RUSH", icon: 745, desc: "Heroes start with 60 energy. Enemies hit 30% harder.", mods: { startEnergy: 60, dmgEnemy: 1.3, payout: 1.4 } },
	{ id: "bossparade", name: "BOSS PARADE", icon: 862, desc: "Every wave is a lone boss (with reduced HP). Specials galore.", mods: { bossOnly: true, payout: 1.6 } },
	{ id: "bleedout", name: "BLEED OUT", icon: 693, desc: "Heroes lose 5% HP every round, but deal +30% damage.", mods: { roundBleed: 0.05, dmgHero: 1.3, payout: 1.5 } },
];

/** Always-available tactic cards (one per hero turn). */
const TACTICS = {
	guard: {
		id: "guard",
		key: 4,
		name: "Brace Up",
		cd: 2,
		icon: 1043,
		desc: "Raise a 20% HP shield on yourself, halve damage taken this round and gain 20 energy.",
		tags: [
			{ text: "SHIELD SELF 20%", kind: "shield" },
			{ text: "GUARD -50% 1T", kind: "guard" },
			{ text: "+20 NRG", kind: "crit" },
		],
	},
	focus: {
		id: "focus",
		key: 5,
		name: "Focus Fire",
		cd: 3,
		icon: 668,
		desc: "Mark the target (+25% damage taken) and charge 45 energy. Allies acting after you benefit.",
		tags: [
			{ text: "MARK 1T", kind: "mark" },
			{ text: "+45 NRG", kind: "crit" },
		],
	},
	finisher: {
		id: "finisher",
		key: 6,
		name: "Combo Breaker",
		cd: 0,
		icon: 15,
		desc: "Needs a 2-hit combo. Spend the combo to strike ALL enemies for 130% +25% per combo step.",
		tags: [{ text: "NEEDS COMBO x2", kind: "crit" }, { text: "ALL ENEMIES" }],
	},
};

const DAILY_STREAK_REWARDS = [
	{ coins: 300, ink: 40 },
	{ coins: 350, ink: 40 },
	{ coins: 400, ink: 50 },
	{ coins: 450, ink: 50 },
	{ coins: 500, ink: 60 },
	{ coins: 600, ink: 70 },
	{ coins: 1000, ink: 150, label: "JACKPOT" },
];

/** Human-readable breakdown of a kit entry for move cards: { power, targets, tags:[{icon?,text}] }. */
function describeMove(spec, basicPower) {
	if (!spec) return { power: basicPower || 1, targets: "1 ENEMY", tags: [] };
	const targets =
		{ all: "ALL ENEMIES", chain: "2 ENEMIES", lowest: "WEAKEST FOE", strongest: "STRONGEST FOE" }[
			spec.target
		] || "1 ENEMY";
	const tags = [];
	const pct = (n) => `${Math.round(n * 100)}%`;
	if (spec.hits > 1) tags.push({ text: `${spec.hits} HITS` });
	if (spec.crit) tags.push({ text: "ALWAYS CRIT", kind: "crit" });
	if (spec.pierce) tags.push({ text: "PIERCES DEF" });
	if (spec.splash) tags.push({ text: "SPLASH" });
	if (spec.lifesteal) tags.push({ text: `LIFESTEAL ${Math.round(spec.lifesteal * 100)}%`, kind: "heal" });
	const d = spec.debuff || {};
	if (d.stun) tags.push({ text: `STUN ${pct(d.stun.chance ?? 1)}`, kind: "stun" });
	if (d.bleed) tags.push({ text: `BLEED ${d.bleed}T`, kind: "bleed" });
	if (d.mark) tags.push({ text: `MARK ${d.mark}T`, kind: "mark" });
	if (d.atkDown) tags.push({ text: `FOE ATK- ${d.atkDown}T`, kind: "atkDown" });
	if (d.defDown) tags.push({ text: `FOE DEF- ${d.defDown}T`, kind: "defDown" });
	const who = { self: "SELF", all: "SQUAD", lowest: "WEAKEST ALLY" };
	if (spec.heal) tags.push({ text: `HEAL ${who[spec.heal.who]} ${pct(spec.heal.pct)}`, kind: "heal" });
	if (spec.shield) tags.push({ text: `SHIELD ${who[spec.shield.who]} ${pct(spec.shield.pct)}`, kind: "shield" });
	if (spec.energy) tags.push({ text: `${who[spec.energy.who]} +${spec.energy.amt} NRG`, kind: "crit" });
	if (spec.cleanse) tags.push({ text: `CLEANSE ${who[spec.cleanse.who]}`, kind: "heal" });
	const b = spec.buff;
	if (b) {
		const w = who[b.who];
		if (b.atkUp) tags.push({ text: `${w} ATK+ ${b.atkUp}T`, kind: "atkUp" });
		if (b.evade) tags.push({ text: `${w} DODGE x${b.evade}`, kind: "evade" });
		if (b.crit) tags.push({ text: `${w} CRIT+ ${b.crit}T`, kind: "crit" });
		if (b.taunt) tags.push({ text: `TAUNT ${b.taunt}T` });
		if (b.guard) tags.push({ text: `GUARD -50% ${b.guard}T`, kind: "guard" });
		if (b.immuneCrit) tags.push({ text: `CRIT-PROOF ${b.immuneCrit}T` });
		if (b.guaranteed) tags.push({ text: "NEXT HIT CRITS", kind: "crit" });
	}
	return { power: spec.dmg, targets, tags };
}
window.describeMove = describeMove;
window.HERO_COMBOS = HERO_COMBOS;

const MAX_HERO_LEVEL = 30;

/** Global difficulty knob applied to every villain at spawn time. */
const ENEMY_SCALE = { hp: 1.8, atk: 1.6 };
[1, 1, 1, 1.1, 1.5, 1.9, 2.4, 3.0, 3.8, 4.8].forEach((d, i) => {
	ISSUES_CAMPAIGN[i].diff = d;
});
window.ENEMY_SCALE = ENEMY_SCALE;

window.HERO_KITS = HERO_KITS;
window.ISSUES_CAMPAIGN = ISSUES_CAMPAIGN;
