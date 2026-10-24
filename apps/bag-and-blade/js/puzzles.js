/**
 * Bag & Blade: Master Packer Puzzle Vault
 * Ten hand-tuned packing puzzles. Boards can have holes ('#'), and goals are measured by
 * the exact same synergy engine the dungeon uses. Every puzzle ships with a solution that was
 * replayed through this same engine when the level was authored. The Hint button reads it.
 */
"use strict";

const Puzzles = (function () {
	const STAT_LABEL = {
		damage: "Attack",
		block: "Block",
		heal: "Healing",
		value: "Gold value",
		bonus: "Synergy Bonus",
	};

	const LIST = [
		{
			id: 1,
			title: "The Recruit's Pouch",
			difficulty: "Novice",
			desc: "A cramped 3×3 pouch and four relics. Every single cell must be filled.",
			layout: ["...","...","..."],
			pieces: ["wooden_buckler","iron_shortsword","rusty_dagger","leather_coif"],
			goals: [],
			// [piece, col, row, quarter-turns]
			solution: [
				["wooden_buckler", 0, 0, 0],
				["iron_shortsword", 2, 0, 0],
				["rusty_dagger", 0, 2, 0],
				["leather_coif", 2, 2, 0],
			],
		},
		{
			id: 2,
			title: "Apothecary's Case",
			difficulty: "Novice",
			desc: "Fit every remedy into the case, and arrange them so the whole kit heals at least 160 HP.",
			layout: ["....","....","...."],
			pieces: ["greater_health_elixir","healing_herb","minor_health_potion","roasted_meat","fresh_apple","crusty_bread","scroll_of_healing","glowing_mushroom","aged_cheese"],
			goals: [{stat:"heal", min:160}],
			// [piece, col, row, quarter-turns]
			solution: [
				["greater_health_elixir", 0, 0, 0],
				["healing_herb", 1, 0, 0],
				["minor_health_potion", 2, 0, 0],
				["roasted_meat", 3, 0, 1],
				["fresh_apple", 1, 1, 0],
				["crusty_bread", 2, 1, 0],
				["scroll_of_healing", 0, 2, 0],
				["glowing_mushroom", 2, 2, 0],
				["aged_cheese", 3, 2, 0],
			],
		},
		{
			id: 3,
			title: "Knight's Footlocker",
			difficulty: "Apprentice",
			desc: "The corners of this trunk are rusted shut. Pack everything into what is left.",
			layout: ["#..#","....","....","#..#"],
			pieces: ["steel_broadsword","wooden_buckler","iron_helm","leather_boots","leather_coif"],
			goals: [],
			// [piece, col, row, quarter-turns]
			solution: [
				["steel_broadsword", 1, 0, 0],
				["leather_coif", 2, 0, 0],
				["iron_helm", 0, 1, 1],
				["wooden_buckler", 2, 1, 0],
				["leather_boots", 1, 3, 0],
			],
		},
		{
			id: 4,
			title: "The Resonance Matrix",
			difficulty: "Apprentice",
			desc: "Whetstones, rubies and rings amplify the blades they touch. Reach 47 total Attack.",
			layout: ["....","....","...."],
			pieces: ["iron_shortsword","flame_blade","flawed_ruby","whetstone_sharpener","ruby_ring","rusty_dagger"],
			goals: [{stat:"damage", min:47}],
			// [piece, col, row, quarter-turns]
			solution: [
				["flame_blade", 3, 0, 0],
				["flawed_ruby", 2, 2, 0],
				["iron_shortsword", 0, 2, 1],
				["whetstone_sharpener", 2, 0, 0],
				["rusty_dagger", 1, 1, 0],
				["ruby_ring", 0, 1, 0],
			],
		},
		{
			id: 5,
			title: "The Smuggler's Crate",
			difficulty: "Adept",
			desc: "A crate with awkward holes. Pack all seven treasures and make the haul worth 420 gold.",
			layout: ["..#..",".....","#...#"],
			pieces: ["skeleton_key","gold_bar","leather_coin_purse","cut_sapphire","golden_chalice","lockpick_set","flawed_ruby"],
			goals: [{stat:"value", min:420}],
			// [piece, col, row, quarter-turns]
			solution: [
				["skeleton_key", 0, 0, 0],
				["gold_bar", 1, 0, 1],
				["cut_sapphire", 3, 0, 0],
				["golden_chalice", 4, 0, 1],
				["leather_coin_purse", 2, 1, 0],
				["lockpick_set", 1, 2, 0],
				["flawed_ruby", 3, 2, 0],
			],
		},
		{
			id: 6,
			title: "Archmage's Reliquary",
			difficulty: "Adept",
			desc: "Scrolls, wands and crystals resonate when they touch. Reach 108 Attack.",
			layout: ["#....","....#",".....","....."],
			pieces: ["ancient_grimoire","apprentice_wand","scroll_of_fireball","scroll_of_frost","flawed_ruby","cut_sapphire","mana_flask","oak_staff"],
			goals: [{stat:"damage", min:108}],
			// [piece, col, row, quarter-turns]
			solution: [
				["oak_staff", 0, 3, 1],
				["ancient_grimoire", 2, 1, 0],
				["scroll_of_frost", 3, 3, 0],
				["mana_flask", 4, 0, 0],
				["flawed_ruby", 1, 2, 0],
				["apprentice_wand", 2, 0, 1],
				["cut_sapphire", 4, 2, 0],
				["scroll_of_fireball", 1, 0, 1],
			],
		},
		{
			id: 7,
			title: "Dwarven Heavy Ordnance",
			difficulty: "Expert",
			desc: "Every cell must be filled, and the arsenal must still reach 49 Attack.",
			layout: ["..#..",".....",".....","..#.."],
			pieces: ["dwarven_warhammer","battle_axe","chainmail_hauberk","iron_helm","iron_ingot","whetstone_sharpener","leather_coif"],
			goals: [{stat:"damage", min:49}],
			// [piece, col, row, quarter-turns]
			solution: [
				["dwarven_warhammer", 0, 0, 3],
				["whetstone_sharpener", 1, 0, 0],
				["iron_helm", 3, 0, 0],
				["battle_axe", 2, 1, 1],
				["iron_ingot", 1, 2, 1],
				["chainmail_hauberk", 3, 2, 0],
				["leather_coif", 0, 3, 0],
			],
		},
		{
			id: 8,
			title: "The Great Phalanx Wall",
			difficulty: "Expert",
			desc: "Shields love other shields, and gems love both. Reach 82 Block.",
			layout: [".....",".....",".....",".....","....."],
			pieces: ["iron_kite_shield","paladin_tower_shield","wooden_buckler","chainmail_hauberk","cut_sapphire","sapphire_ring","iron_ingot"],
			goals: [{stat:"block", min:82}],
			// [piece, col, row, quarter-turns]
			solution: [
				["chainmail_hauberk", 3, 0, 0],
				["iron_kite_shield", 1, 0, 0],
				["paladin_tower_shield", 3, 2, 1],
				["wooden_buckler", 0, 3, 0],
				["cut_sapphire", 2, 3, 0],
				["sapphire_ring", 2, 4, 0],
				["iron_ingot", 0, 1, 1],
			],
		},
		{
			id: 9,
			title: "Dragon Slayer's Colossus",
			difficulty: "Master",
			desc: "A greatsword wants elbow room, an aegis wants gems. Reach 38 Attack and 36 Block together.",
			layout: [".....",".....",".....",".....","....."],
			pieces: ["executioner_greatsword","dragon_aegis","greater_health_elixir","radiant_diamond","flawed_ruby","cut_sapphire"],
			goals: [{stat:"damage", min:38}, {stat:"block", min:36}],
			// [piece, col, row, quarter-turns]
			solution: [
				["dragon_aegis", 3, 0, 0],
				["executioner_greatsword", 1, 1, 0],
				["cut_sapphire", 4, 3, 0],
				["radiant_diamond", 2, 0, 0],
				["flawed_ruby", 2, 4, 0],
				["greater_health_elixir", 3, 4, 1],
			],
		},
		{
			id: 10,
			title: "The Guildmaster's Masterpiece",
			difficulty: "Grandmaster",
			desc: "Eight relics, one satchel. Reach a Synergy Bonus of 52 and 600 gold of value.",
			layout: ["......","......","......","......","......"],
			pieces: ["flame_blade","ancient_grimoire","dragon_aegis","radiant_diamond","golden_chalice","leather_coin_purse","amulet_of_life","berserker_brew"],
			goals: [{stat:"bonus", min:52}, {stat:"value", min:600}],
			// [piece, col, row, quarter-turns]
			solution: [
				["dragon_aegis", 3, 2, 0],
				["radiant_diamond", 2, 2, 0],
				["ancient_grimoire", 1, 3, 0],
				["leather_coin_purse", 0, 2, 0],
				["berserker_brew", 2, 0, 0],
				["golden_chalice", 0, 0, 1],
				["flame_blade", 1, 1, 1],
				["amulet_of_life", 1, 0, 0],
			],
		},
	];

	function get(id) {
		return LIST.find((p) => p.id === id) || null;
	}

	function metricsOf(grid) {
		const t = grid.calculate().totals;
		return {
			damage: Math.round(t.attack),
			block: Math.round(t.guard + t.armor),
			heal: Math.round(t.heal),
			value: Math.round(t.value),
			bonus: t.bonus,
		};
	}

	/** Fresh runtime state for a puzzle: an empty board and every piece in the pool. */
	function create(puzzle) {
		return {
			puzzle,
			grid: new Grid({ layout: puzzle.layout }),
			// A piece's uid is its item id: every puzzle uses each relic at most once.
			pool: puzzle.pieces.map((id) => ({ uid: id, id })),
			solved: false,
			hinted: false,
			moves: 0,
		};
	}

	function evaluate(ps) {
		const m = metricsOf(ps.grid);
		const total = ps.puzzle.pieces.length;
		const placed = ps.grid.items.length;
		const goals = ps.puzzle.goals.map((g) => ({
			stat: g.stat,
			label: STAT_LABEL[g.stat],
			min: g.min,
			have: m[g.stat],
			ok: m[g.stat] >= g.min,
		}));
		const allPlaced = placed === total;
		return {
			metrics: m,
			placed,
			total,
			allPlaced,
			goals,
			solved: allPlaced && goals.every((g) => g.ok),
		};
	}

	function solutionPlacement(entry) {
		const [id, col, row, turns] = entry;
		let shape = ItemCatalog.get(id).shape;
		for (let i = 0; i < turns; i++) shape = ItemCatalog.rotateShape(shape);
		return { id, col, row, shape };
	}

	/** Show where one piece belongs: an unplaced piece first, otherwise a misplaced one. */
	function hint(ps) {
		const targets = ps.puzzle.solution.map(solutionPlacement);
		const unplaced = targets.find((t) => !ps.grid.get(t.id));
		if (unplaced) return unplaced;
		return (
			targets.find((t) => {
				const rec = ps.grid.get(t.id);
				return (
					rec.col !== t.col ||
					rec.row !== t.row ||
					JSON.stringify(rec.shape) !== JSON.stringify(t.shape)
				);
			}) || null
		);
	}

	function isSolved(id) {
		const rec = Store.meta.puzzles[id];
		return !!(rec && rec.solved);
	}

	function markSolved(ps) {
		const prev = Store.meta.puzzles[ps.puzzle.id] || {};
		Store.meta.puzzles[ps.puzzle.id] = {
			solved: true,
			clean: prev.clean || !ps.hinted,
		};
		ps.solved = true;
		Store.saveMeta();
	}

	return { LIST, STAT_LABEL, get, create, evaluate, hint, solutionPlacement, metricsOf, isSolved, markSolved };
})();
