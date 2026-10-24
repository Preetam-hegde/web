/**
 * Bag & Blade: Item Catalog
 * 63 hand-balanced relics. Every synergy is declared as data and read by grid.js,
 * so the tooltip text, the live totals and the combat numbers can never disagree.
 *
 * Synergy schema (an item's `synergies` array):
 *   { with: { category | id | tag | any }, to: 'self' | 'neighbor', bonus: { stat: n }, max?: n }
 *   - `with`  filters the OTHER item that must be touching this one.
 *   - `to: 'self'`     this item receives the bonus once per matching neighbor.
 *   - `to: 'neighbor'` every matching neighbor receives the bonus from this item.
 *   - `max`   caps how many neighbors can trigger it.
 * `openEdge: { bonus, max }` pays the bonus once per empty slot touching the item.
 */
"use strict";

const ItemCatalog = (function () {
	const SHAPES = {
		dot: [[1]],
		h2: [[1, 1]],
		v2: [[1], [1]],
		h3: [[1, 1, 1]],
		v3: [[1], [1], [1]],
		sq: [
			[1, 1],
			[1, 1],
		],
		r23: [
			[1, 1],
			[1, 1],
			[1, 1],
		],
		r32: [
			[1, 1, 1],
			[1, 1, 1],
		],
		L: [
			[1, 0],
			[1, 0],
			[1, 1],
		],
		T: [
			[1, 1, 1],
			[0, 1, 0],
		],
	};

	const RARITY_ORDER = ["common", "uncommon", "rare", "epic", "legendary"];

	const CATEGORY_LABEL = {
		weapon: "Weapon",
		shield: "Shield",
		armor: "Armor",
		accessory: "Accessory",
		potion: "Potion",
		food: "Provision",
		spell: "Scroll",
		material: "Material",
		gem: "Gemstone",
		treasure: "Treasure",
	};

	/** What an item does when clicked in battle. Armor & accessories work passively. */
	const USE_BY_CATEGORY = {
		weapon: "attack",
		shield: "guard",
		potion: "drink",
		food: "eat",
		spell: "cast",
		armor: "passive",
		accessory: "passive",
		material: null,
		gem: null,
		treasure: null,
	};

	const STAT_LABEL = {
		damage: "Damage",
		block: "Block",
		heal: "Heal",
		burn: "Burn",
		chill: "Chill",
		crit: "Crit",
		thorns: "Thorns",
		lifesteal: "Lifesteal",
		pierce: "Pierce",
		stun: "Stun",
		strength: "Strength",
		restoreEnergy: "Energy restored",
		energyBonus: "Energy per turn",
		dodge: "Dodge",
		maxHp: "Max HP",
		regen: "Regen",
		value: "Gold value",
		valuePct: "Sell value",
		lootBonus: "Extra loot",
		lootLuck: "Loot luck",
		orderBonusPct: "Order pay",
	};

	const PERCENT_STATS = new Set([
		"crit",
		"stun",
		"dodge",
		"lootLuck",
		"valuePct",
		"orderBonusPct",
	]);

	const A = (withSpec, to, bonus, max) => ({ with: withSpec, to, bonus, max });
	const cat = (c) => ({ category: c });
	const byId = (i) => ({ id: i });
	const ANY = { any: true };

	const ITEM_LIST = [
		// ── WEAPONS ───────────────────────────────────────────────────────────
		{
			id: "rusty_dagger",
			name: "Rusty Dagger",
			category: "weapon",
			shape: "h2",
			rarity: "common",
			stats: { damage: 4, energy: 1, value: 8 },
			synergies: [A(cat("weapon"), "self", { damage: 1 }, 2)],
			lore: "Dull-edged and nicked, but light enough for rapid strikes.",
		},
		{
			id: "iron_shortsword",
			name: "Iron Shortsword",
			category: "weapon",
			shape: "v2",
			rarity: "common",
			stats: { damage: 7, energy: 1, value: 16 },
			synergies: [A(cat("gem"), "self", { damage: 2 }, 2)],
			lore: "A staple sidearm of garrison guards and highwaymen.",
		},
		{
			id: "steel_broadsword",
			name: "Steel Broadsword",
			category: "weapon",
			shape: "v3",
			rarity: "uncommon",
			stats: { damage: 12, energy: 2, value: 28 },
			synergies: [A(cat("shield"), "self", { damage: 3 }, 1)],
			lore: "Forged from high-carbon river steel with balanced crossguards.",
		},
		{
			id: "executioner_greatsword",
			name: "Executioner Greatsword",
			category: "weapon",
			shape: "r23",
			rarity: "rare",
			stats: { damage: 22, energy: 3, value: 65 },
			synergies: [],
			openEdge: { bonus: { damage: 2 }, max: 6 },
			lore: "A colossal two-handed cleaver that demands immense backpack clearance.",
		},
		{
			id: "flame_blade",
			name: "Sunfire Scimitar",
			category: "weapon",
			shape: "v3",
			rarity: "rare",
			stats: { damage: 14, burn: 4, energy: 2, value: 55 },
			synergies: [A(cat("gem"), "self", { burn: 1 }, 2)],
			lore: "Radiates smoldering heat that blisters enemy hides on contact.",
		},
		{
			id: "cursed_saber",
			name: "Vampiric Saber",
			category: "weapon",
			shape: "h3",
			rarity: "epic",
			stats: { damage: 16, lifesteal: 5, energy: 2, value: 75 },
			synergies: [A(cat("food"), "self", { damage: 4 }, 2)],
			lore: "A thirsty blade that siphons vitality directly into the wielder.",
		},
		{
			id: "silver_rapier",
			name: "Noble Rapier",
			category: "weapon",
			shape: "v3",
			rarity: "uncommon",
			stats: { damage: 9, crit: 0.25, energy: 1, value: 34 },
			synergies: [A(cat("accessory"), "self", { crit: 0.15 }, 2)],
			lore: "Inscribed with aristocratic silver filigree for precise lunges.",
		},
		{
			id: "battle_axe",
			name: "Bearded Battleaxe",
			category: "weapon",
			shape: "L",
			rarity: "uncommon",
			stats: { damage: 13, energy: 2, value: 32 },
			synergies: [A(cat("armor"), "self", { damage: 3 }, 2)],
			lore: "Hooks shields out of the way before delivering devastating chops.",
		},
		{
			id: "dwarven_warhammer",
			name: "Dwarven Warhammer",
			category: "weapon",
			shape: "T",
			rarity: "rare",
			stats: { damage: 18, stun: 0.25, energy: 2, value: 58 },
			synergies: [A(byId("iron_ingot"), "self", { damage: 5 }, 1)],
			lore: "Solid granite core encased in tempered runic iron.",
		},
		{
			id: "hunting_bow",
			name: "Yew Shortbow",
			category: "weapon",
			shape: "L",
			rarity: "common",
			tags: ["ranged"],
			stats: { damage: 8, energy: 1, value: 20 },
			synergies: [],
			lore: "Carved from flexible English yew. Loves a Quiver Pocket.",
		},
		{
			id: "heavy_crossbow",
			name: "Arbalest Crossbow",
			category: "weapon",
			shape: "T",
			rarity: "rare",
			tags: ["ranged"],
			stats: { damage: 18, energy: 2, value: 60 },
			synergies: [A(cat("material"), "self", { damage: 4 }, 2)],
			lore: "Wound with a steel lever, punching through plate armor with ease.",
		},
		{
			id: "apprentice_wand",
			name: "Oak Wand",
			category: "weapon",
			shape: "v2",
			rarity: "common",
			tags: ["magic"],
			stats: { damage: 6, energy: 1, value: 22 },
			synergies: [A(cat("spell"), "self", { damage: 3 }, 2)],
			lore: "Channeled with raw spark essence for fledgling wizards.",
		},
		{
			id: "archmage_staff",
			name: "Aetherwood Staff",
			category: "weapon",
			shape: "v3",
			rarity: "epic",
			tags: ["magic"],
			stats: { damage: 16, energy: 2, value: 85 },
			synergies: [
				A(cat("spell"), "self", { damage: 4 }, 2),
				A(cat("gem"), "self", { damage: 4 }, 2),
			],
			lore: "Pulsing with ley-line arcane conduits along its carved grooves.",
		},
		{
			id: "composite_longbow",
			name: "Composite Longbow",
			category: "weapon",
			shape: "h3",
			rarity: "uncommon",
			tags: ["ranged"],
			stats: { damage: 10, crit: 0.15, energy: 1, value: 30 },
			synergies: [A(cat("material"), "self", { crit: 0.1 }, 2)],
			lore: "Horn, sinew and maple laminated for a brutal draw weight.",
		},
		{
			id: "crystal_blade",
			name: "Crystal Blade",
			category: "weapon",
			shape: "v2",
			rarity: "rare",
			stats: { damage: 11, crit: 0.2, energy: 1, value: 52 },
			synergies: [A(cat("gem"), "self", { crit: 0.2 }, 2)],
			lore: "Grown, not forged. It sings when gems are near.",
		},
		{
			id: "halberd_spear",
			name: "Guardsman Halberd",
			category: "weapon",
			shape: "v3",
			rarity: "uncommon",
			stats: { damage: 12, pierce: 6, energy: 2, value: 36 },
			synergies: [A(cat("shield"), "self", { pierce: 4 }, 1)],
			lore: "Hooks and spike alike find the gaps in a monster's guard.",
		},
		{
			id: "runic_claymore",
			name: "Runic Claymore",
			category: "weapon",
			shape: "r32",
			rarity: "epic",
			stats: { damage: 20, energy: 2, value: 88 },
			synergies: [
				A(cat("gem"), "self", { damage: 4 }, 2),
				A(cat("material"), "self", { damage: 3 }, 2),
			],
			lore: "Its runes drink in whatever ore and crystal rest beside it.",
		},
		{
			id: "phoenix_scepter",
			name: "Phoenix Scepter",
			category: "weapon",
			shape: "v3",
			rarity: "legendary",
			tags: ["magic"],
			stats: { damage: 13, burn: 6, energy: 2, value: 120 },
			synergies: [
				A(cat("spell"), "self", { burn: 2 }, 2),
				A(byId("flawed_ruby"), "self", { damage: 6 }, 1),
			],
			lore: "Rekindles itself from its own ashes, and so do its victims.",
		},
		{
			id: "oak_staff",
			name: "Oak Quarterstaff",
			category: "weapon",
			shape: "v3",
			rarity: "common",
			tags: ["magic"],
			stats: { damage: 7, energy: 1, value: 18 },
			synergies: [A(cat("spell"), "self", { damage: 2 }, 2)],
			lore: "Knotted wood worn smooth by a hundred apprentices.",
		},

		// ── SHIELDS ───────────────────────────────────────────────────────────
		{
			id: "wooden_buckler",
			name: "Wooden Buckler",
			category: "shield",
			shape: "sq",
			rarity: "common",
			stats: { block: 6, energy: 1, value: 14 },
			synergies: [A(cat("armor"), "self", { block: 3 }, 1)],
			lore: "Reinforced with iron bands and animal hide.",
		},
		{
			id: "iron_kite_shield",
			name: "Iron Kite Shield",
			category: "shield",
			shape: "r23",
			rarity: "uncommon",
			stats: { block: 14, energy: 2, value: 38 },
			synergies: [
				A(cat("shield"), "self", { block: 4 }, 2),
				A(cat("weapon"), "self", { block: 2 }, 2),
			],
			lore: "Offers head-to-toe protection against flanking arrows and lances.",
		},
		{
			id: "paladin_tower_shield",
			name: "Paladin Tower Shield",
			category: "shield",
			shape: "r32",
			rarity: "rare",
			stats: { block: 18, energy: 2, value: 70 },
			synergies: [A(cat("armor"), "self", { block: 4 }, 2)],
			lore: "A moving wall, blessed in three cathedrals.",
		},
		{
			id: "dragon_aegis",
			name: "Dragon's Aegis",
			category: "shield",
			shape: "r23",
			rarity: "legendary",
			stats: { block: 22, thorns: 8, energy: 2, value: 120 },
			synergies: [A(cat("gem"), "self", { block: 6, thorns: 4 }, 2)],
			lore: "Forged from the calcified breastplate of an ancient wyrm.",
		},

		// ── ARMOR (passive: adds Block at the start of every turn) ────────────
		{
			id: "adventurer_tunic",
			name: "Padded Tunic",
			category: "armor",
			shape: "sq",
			rarity: "common",
			stats: { block: 3, maxHp: 8, value: 18 },
			synergies: [],
			lore: "Quilted wool that has seen a lot of ditches.",
		},
		{
			id: "leather_coif",
			name: "Leather Coif",
			category: "armor",
			shape: "dot",
			rarity: "common",
			stats: { block: 2, maxHp: 5, value: 12 },
			synergies: [A(cat("armor"), "self", { block: 1 }, 2)],
			lore: "Supple boiled cowhide that fits snugly over hair and ears.",
		},
		{
			id: "iron_helm",
			name: "Great Bascinet",
			category: "armor",
			shape: "h2",
			rarity: "uncommon",
			stats: { block: 4, maxHp: 10, value: 26 },
			synergies: [A(cat("armor"), "self", { block: 2 }, 2)],
			lore: "Visored iron dome designed to deflect crushing mace blows.",
		},
		{
			id: "iron_greaves",
			name: "Iron Greaves",
			category: "armor",
			shape: "h2",
			rarity: "uncommon",
			stats: { block: 4, maxHp: 6, value: 24 },
			synergies: [A(cat("armor"), "self", { block: 2 }, 2)],
			lore: "Shin plates riveted over a boiled-leather sleeve.",
		},
		{
			id: "leather_boots",
			name: "Scout Boots",
			category: "armor",
			shape: "h2",
			rarity: "common",
			stats: { block: 1, dodge: 0.1, value: 15 },
			synergies: [A(cat("food"), "self", { dodge: 0.05 }, 2)],
			lore: "Muffled soles allow silent footwork across cobblestones.",
		},
		{
			id: "chainmail_hauberk",
			name: "Chainmail Hauberk",
			category: "armor",
			shape: "sq",
			rarity: "uncommon",
			stats: { block: 6, maxHp: 15, value: 45 },
			synergies: [A(cat("shield"), "self", { block: 3 }, 2)],
			lore: "Thousands of interlocking steel rings over a padded gambeson.",
		},
		{
			id: "knight_plate_armor",
			name: "Full Plate Harness",
			category: "armor",
			shape: "r23",
			rarity: "rare",
			stats: { block: 12, maxHp: 25, value: 85 },
			synergies: [A(cat("armor"), "self", { block: 3 }, 3)],
			lore: "Masterwork fluted Gothic plate that turns aside crossbow bolts.",
		},
		{
			id: "sorcerer_robe",
			name: "Starlight Robes",
			category: "armor",
			shape: "sq",
			rarity: "rare",
			stats: { block: 3, value: 65 },
			synergies: [A(cat("spell"), "self", { energyBonus: 1 }, 2)],
			lore: "Spun from gossamer silk and infused with moonlight wards.",
		},

		// ── POTIONS (free action, single use) ─────────────────────────────────
		{
			id: "minor_health_potion",
			name: "Healing Draught",
			category: "potion",
			shape: "dot",
			rarity: "common",
			stats: { heal: 15, value: 10 },
			synergies: [],
			lore: "A sweet red concoction that binds cuts and staunches blood.",
		},
		{
			id: "greater_health_elixir",
			name: "Elixir of Vitality",
			category: "potion",
			shape: "v2",
			rarity: "rare",
			stats: { heal: 35, value: 30 },
			synergies: [A(cat("potion"), "self", { heal: 10 }, 2)],
			lore: "Distilled with troll blood and starflower nectar.",
		},
		{
			id: "mana_flask",
			name: "Arcane Tonic",
			category: "potion",
			shape: "dot",
			rarity: "common",
			stats: { restoreEnergy: 2, value: 14 },
			synergies: [A(cat("spell"), "self", { restoreEnergy: 1 }, 1)],
			lore: "Crackles with cobalt ozone sparks that invigorate the mind.",
		},
		{
			id: "greater_mana_flask",
			name: "Grand Arcane Flask",
			category: "potion",
			shape: "v2",
			rarity: "rare",
			stats: { restoreEnergy: 3, heal: 8, value: 34 },
			synergies: [],
			lore: "Three measures of moonlight, bottled before dawn.",
		},
		{
			id: "berserker_brew",
			name: "Berserker's Draught",
			category: "potion",
			shape: "dot",
			rarity: "uncommon",
			stats: { strength: 3, value: 20 },
			synergies: [A(cat("weapon"), "self", { strength: 2 }, 1)],
			lore: "Brewed from crushed dragon peppers and stinging nettles.",
		},
		{
			id: "antidote_vial",
			name: "Ironbark Tonic",
			category: "potion",
			shape: "dot",
			rarity: "uncommon",
			stats: { block: 12, value: 18 },
			synergies: [A(cat("armor"), "self", { block: 4 }, 1)],
			lore: "Tastes of bark and regret. Turns skin to timber for a moment.",
		},

		// ── PROVISIONS (free action, single use) ──────────────────────────────
		{
			id: "crusty_bread",
			name: "Crusty Rye Loaf",
			category: "food",
			shape: "dot",
			rarity: "common",
			stats: { heal: 8, value: 5 },
			synergies: [A(byId("aged_cheese"), "self", { heal: 6 }, 1)],
			lore: "Durable rye bread that stays wholesome for weeks on the road.",
		},
		{
			id: "roasted_meat",
			name: "Roasted Boar Leg",
			category: "food",
			shape: "h2",
			rarity: "uncommon",
			stats: { heal: 18, value: 12 },
			synergies: [A(cat("food"), "self", { heal: 6 }, 2)],
			lore: "Glazed with rosemary honey and smoked over applewood.",
		},
		{
			id: "fresh_apple",
			name: "Orchard Apple",
			category: "food",
			shape: "dot",
			rarity: "common",
			stats: { heal: 6, value: 4 },
			synergies: [A(cat("potion"), "self", { heal: 4 }, 1)],
			lore: "Crisp, juicy fruit picked at peak autumn ripeness.",
		},
		{
			id: "aged_cheese",
			name: "Mountain Cheese Wheel",
			category: "food",
			shape: "dot",
			rarity: "common",
			stats: { heal: 9, value: 7 },
			synergies: [A(cat("food"), "self", { heal: 4 }, 2)],
			lore: "Pungent cave-aged sheep cheese, packed with savory energy.",
		},
		{
			id: "healing_herb",
			name: "Silverleaf Herb",
			category: "food",
			shape: "dot",
			rarity: "common",
			stats: { heal: 7, value: 6 },
			synergies: [A(cat("potion"), "neighbor", { heal: 5 })],
			lore: "A fragrant forest herb renowned by apothecaries for wound sealing.",
		},
		{
			id: "glowing_mushroom",
			name: "Glowcap Mushroom",
			category: "food",
			shape: "dot",
			rarity: "uncommon",
			stats: { heal: 10, restoreEnergy: 1, value: 16 },
			synergies: [],
			lore: "Faintly warm, faintly humming, mostly safe.",
		},

		// ── SCROLLS & TOMES (cost Energy; scrolls burn up when read) ──────────
		{
			id: "scroll_of_fireball",
			name: "Scroll of Fireball",
			category: "spell",
			shape: "h2",
			rarity: "uncommon",
			stats: { damage: 18, burn: 6, energy: 2, value: 36 },
			synergies: [],
			lore: "Incantations written in volcanic cinder that burst into flame when read.",
		},
		{
			id: "scroll_of_frost",
			name: "Scroll of Blizzard",
			category: "spell",
			shape: "h2",
			rarity: "uncommon",
			stats: { damage: 12, chill: 1, energy: 2, value: 36 },
			synergies: [A(byId("cut_sapphire"), "self", { damage: 6 }, 1)],
			lore: "Conjures howling sub-zero rimes that lock monster limbs in ice.",
		},
		{
			id: "scroll_of_healing",
			name: "Scroll of Mending",
			category: "spell",
			shape: "h2",
			rarity: "uncommon",
			stats: { heal: 25, energy: 1, value: 32 },
			synergies: [A(cat("potion"), "self", { heal: 6 }, 1)],
			lore: "The ink knits itself into a warm, golden light.",
		},
		{
			id: "ancient_grimoire",
			name: "Forbidden Grimoire",
			category: "spell",
			shape: "sq",
			rarity: "epic",
			stats: { damage: 22, energy: 2, value: 90, reusable: 1 },
			synergies: [
				A(cat("spell"), "self", { damage: 5 }, 3),
				A(cat("gem"), "self", { damage: 6 }, 2),
			],
			lore: "Bound in weathered dragon hide, whispering lost eldritch verses.",
		},

		// ── MATERIALS, GEMS & TREASURE ────────────────────────────────────────
		{
			id: "whetstone_sharpener",
			name: "Oiled Whetstone",
			category: "material",
			shape: "dot",
			rarity: "common",
			stats: { value: 12 },
			synergies: [A(cat("weapon"), "neighbor", { damage: 3 })],
			lore: "Fine quartz stone soaked in tallow for honing keen blades.",
		},
		{
			id: "iron_ingot",
			name: "Tempered Iron Bar",
			category: "material",
			shape: "h2",
			rarity: "common",
			stats: { value: 15 },
			synergies: [
				A(cat("shield"), "neighbor", { block: 3 }),
				A(cat("weapon"), "neighbor", { damage: 2 }),
			],
			lore: "Standard forge-stamped ingot ready for shaping.",
		},
		{
			id: "flawed_ruby",
			name: "Cinnabar Ruby",
			category: "gem",
			shape: "dot",
			rarity: "uncommon",
			stats: { value: 25 },
			synergies: [
				A(cat("weapon"), "neighbor", { damage: 4, burn: 2 }),
				A(cat("spell"), "neighbor", { damage: 6 }),
			],
			lore: "Traps living volcanic embers inside its faceted carmine depths.",
		},
		{
			id: "cut_sapphire",
			name: "Glacial Sapphire",
			category: "gem",
			shape: "dot",
			rarity: "uncommon",
			stats: { value: 28 },
			synergies: [
				A(cat("shield"), "neighbor", { block: 5 }),
				A(cat("armor"), "neighbor", { block: 4 }),
			],
			lore: "Cool to the touch, freezing dew upon its crystalline facets.",
		},
		{
			id: "flawless_emerald",
			name: "Verdant Emerald",
			category: "gem",
			shape: "dot",
			rarity: "rare",
			stats: { value: 45 },
			synergies: [
				A(cat("potion"), "neighbor", { heal: 12 }),
				A(cat("food"), "neighbor", { heal: 8 }),
			],
			lore: "Imbued with the rejuvenating life-pulse of primaeval forests.",
		},
		{
			id: "radiant_diamond",
			name: "Starlight Diamond",
			category: "gem",
			shape: "dot",
			rarity: "legendary",
			stats: { value: 95 },
			synergies: [
				A(cat("weapon"), "neighbor", { damage: 5 }),
				A(cat("spell"), "neighbor", { damage: 5 }),
				A(cat("shield"), "neighbor", { block: 5 }),
				A(cat("armor"), "neighbor", { block: 5 }),
				A(cat("potion"), "neighbor", { heal: 10 }),
				A(cat("food"), "neighbor", { heal: 10 }),
			],
			lore: "An extraordinary prismatic gemstone that harmonizes every relic nearby.",
		},
		{
			id: "gold_bar",
			name: "King's Gold Bullion",
			category: "treasure",
			shape: "h2",
			rarity: "rare",
			stats: { value: 70 },
			synergies: [A(byId("leather_coin_purse"), "self", { value: 25 }, 1)],
			lore: "Stamped with the royal guild seal, heavy and pure.",
		},
		{
			id: "leather_coin_purse",
			name: "Merchant's Coin Purse",
			category: "accessory",
			shape: "h2",
			rarity: "uncommon",
			stats: { value: 20 },
			synergies: [
				A(cat("treasure"), "neighbor", { valuePct: 0.3 }),
				A(cat("gem"), "neighbor", { valuePct: 0.3 }),
			],
			lore: "Velvet-lined pouch designed to prevent coins from jangling.",
		},
		{
			id: "skeleton_key",
			name: "Ancient Skeleton Key",
			category: "treasure",
			shape: "v2",
			rarity: "rare",
			stats: { value: 40, lootLuck: 0.25 },
			synergies: [A(cat("treasure"), "neighbor", { value: 15 })],
			lore: "Its intricate wards morph to open locked dungeon chest chambers.",
		},
		{
			id: "golden_chalice",
			name: "Guildmaster's Chalice",
			category: "treasure",
			shape: "h2",
			rarity: "epic",
			stats: { value: 80 },
			synergies: [A(ANY, "neighbor", { value: 10 })],
			lore: "Encased in beaten gold and rubies, presented to legendary grandmasters.",
		},
		{
			id: "royal_crown",
			name: "Crown of the Vale",
			category: "treasure",
			shape: "h2",
			rarity: "legendary",
			stats: { value: 150, orderBonusPct: 0.25 },
			synergies: [A(ANY, "neighbor", { value: 20 })],
			lore: "Clients tip lavishly when this is on the counter.",
		},
		{
			id: "ruby_ring",
			name: "Ring of Might",
			category: "accessory",
			shape: "dot",
			rarity: "uncommon",
			stats: { value: 30 },
			synergies: [A(cat("weapon"), "neighbor", { damage: 3 })],
			lore: "Warm gold band set with a fiery carnelian stone.",
		},
		{
			id: "sapphire_ring",
			name: "Ring of Ward",
			category: "accessory",
			shape: "dot",
			rarity: "uncommon",
			stats: { block: 3, value: 30 },
			synergies: [A(cat("armor"), "neighbor", { block: 3 })],
			lore: "Engraved with ancient dwarven protective runes.",
		},
		{
			id: "amulet_of_life",
			name: "Heartstone Talisman",
			category: "accessory",
			shape: "dot",
			rarity: "rare",
			stats: { maxHp: 20, regen: 3, value: 50 },
			synergies: [A(cat("potion"), "neighbor", { heal: 8 })],
			lore: "Beats with a gentle rhythmic pulse in sync with the wearer.",
		},
		{
			id: "amulet_of_power",
			name: "Amulet of Wrath",
			category: "accessory",
			shape: "dot",
			rarity: "rare",
			stats: { strength: 2, value: 55 },
			synergies: [],
			lore: "Every blow lands a little harder while it hangs at your throat.",
		},
		{
			id: "lockpick_set",
			name: "Thief's Lockpicks",
			category: "accessory",
			shape: "h2",
			rarity: "uncommon",
			stats: { lootBonus: 1, value: 28 },
			synergies: [],
			lore: "Every victory yields one more drawer to pry open.",
		},
	];

	const ITEMS = {};
	for (const raw of ITEM_LIST) {
		const def = Object.assign(
			{ tags: [], synergies: [], openEdge: null, lore: "" },
			raw,
		);
		def.icon = raw.icon || raw.id + ".png";
		def.shape = SHAPES[raw.shape];
		def.use = USE_BY_CATEGORY[raw.category] || null;
		def.consumable =
			def.use === "drink" ||
			def.use === "eat" ||
			(def.use === "cast" && !def.stats.reusable);
		ITEMS[def.id] = def;
	}

	function rotateShape(shape) {
		// 90 degrees clockwise: cell (r, c) moves to (c, rows - 1 - r)
		const rows = shape.length;
		const cols = shape[0].length;
		const rotated = [];
		for (let c = 0; c < cols; c++) {
			const row = [];
			for (let r = rows - 1; r >= 0; r--) row.push(shape[r][c]);
			rotated.push(row);
		}
		return rotated;
	}

	function cloneShape(shape) {
		return shape.map((row) => row.slice());
	}

	function shapeCellCount(shape) {
		let n = 0;
		for (const row of shape) for (const v of row) n += v;
		return n;
	}

	/** All distinct orientations of a shape (1, 2 or 4 of them). */
	function uniqueRotations(shape) {
		const seen = new Set();
		const out = [];
		let cur = shape;
		for (let i = 0; i < 4; i++) {
			const key = JSON.stringify(cur);
			if (!seen.has(key)) {
				seen.add(key);
				out.push(cur);
			}
			cur = rotateShape(cur);
		}
		return out;
	}

	function formatStat(key, value) {
		const label = STAT_LABEL[key] || key;
		if (PERCENT_STATS.has(key)) return `${Math.round(value * 100)}% ${label}`;
		return `${value} ${label}`;
	}

	function formatBonus(bonus) {
		return Object.entries(bonus)
			.map(([k, v]) => `+${formatStat(k, v)}`)
			.join(" & ");
	}

	function describeFilter(spec, plural) {
		if (spec.any) return plural ? "items" : "item";
		if (spec.id) return ITEMS[spec.id] ? ITEMS[spec.id].name : spec.id;
		if (spec.tag) return `${spec.tag} weapon${plural ? "s" : ""}`;
		const label = CATEGORY_LABEL[spec.category] || spec.category;
		return plural ? `${label}s` : label;
	}

	function describeSynergy(syn) {
		const cap = syn.max ? ` (max ${syn.max})` : "";
		if (syn.to === "neighbor") {
			const who = describeFilter(syn.with, true);
			return `Touching ${who} gain ${formatBonus(syn.bonus)}`;
		}
		return `${formatBonus(syn.bonus)} per touching ${describeFilter(syn.with, false)}${cap}`;
	}

	function describeOpenEdge(edge) {
		return `${formatBonus(edge.bonus)} per empty slot touching it (max ${edge.max})`;
	}

	function matchesFilter(def, spec) {
		if (spec.any) return true;
		if (spec.id) return def.id === spec.id;
		if (spec.tag) return def.tags.indexOf(spec.tag) !== -1;
		return def.category === spec.category;
	}

	// Rarity odds by dungeon depth
	const LOOT_WEIGHTS = [
		{ upTo: 2, w: { common: 62, uncommon: 33, rare: 5, epic: 0, legendary: 0 } },
		{ upTo: 4, w: { common: 36, uncommon: 40, rare: 20, epic: 4, legendary: 0 } },
		{ upTo: 6, w: { common: 16, uncommon: 36, rare: 30, epic: 15, legendary: 3 } },
		{ upTo: 99, w: { common: 6, uncommon: 26, rare: 34, epic: 26, legendary: 8 } },
	];

	function pickRarity(weights, rng) {
		const total = Object.values(weights).reduce((a, b) => a + b, 0);
		let roll = rng() * total;
		for (const r of RARITY_ORDER) {
			roll -= weights[r] || 0;
			if (roll < 0) return r;
		}
		return "common";
	}

	function pickFromRarity(rarity, rng, exclude) {
		let idx = RARITY_ORDER.indexOf(rarity);
		while (idx >= 0) {
			const pool = Object.values(ITEMS).filter(
				(d) => d.rarity === RARITY_ORDER[idx] && !(exclude && exclude.has(d.id)),
			);
			if (pool.length) return pool[Math.floor(rng() * pool.length)];
			idx--;
		}
		return ITEMS.iron_shortsword;
	}

	return {
		SHAPES,
		RARITY_ORDER,
		CATEGORY_LABEL,
		STAT_LABEL,

		get: function (id) {
			return ITEMS[id] || null;
		},
		all: function () {
			return ITEMS;
		},
		list: function () {
			return ITEM_LIST.map((i) => ITEMS[i.id]);
		},

		rotateShape,
		cloneShape,
		shapeCellCount,
		uniqueRotations,
		matchesFilter,
		formatStat,
		formatBonus,
		describeSynergy,
		describeOpenEdge,

		/** Gold the Market pays for an item at its base value. */
		baseValue: function (id) {
			const def = ITEMS[id];
			return def ? def.stats.value || 0 : 0;
		},

		/**
		 * Roll one loot drop for a dungeon floor.
		 * luck: 0..1 chance to bump the rarity one tier. minRarity: floor for bosses.
		 */
		rollLoot: function (floor, opts = {}) {
			const rng = opts.rng || Math.random;
			const band = LOOT_WEIGHTS.find((b) => floor <= b.upTo);
			let rarity = pickRarity(band.w, rng);
			if (opts.luck && rng() < opts.luck) {
				rarity =
					RARITY_ORDER[
						Math.min(RARITY_ORDER.length - 1, RARITY_ORDER.indexOf(rarity) + 1)
					];
			}
			if (opts.minRarity) {
				const min = RARITY_ORDER.indexOf(opts.minRarity);
				if (RARITY_ORDER.indexOf(rarity) < min) rarity = opts.minRarity;
			}
			return pickFromRarity(rarity, rng, opts.exclude).id;
		},

		/** Rarity odds for the Market, unlocked gradually by Guild rank. */
		rollShopItem: function (rank, rng, exclude) {
			const table = [
				{ common: 70, uncommon: 30, rare: 0, epic: 0, legendary: 0 },
				{ common: 52, uncommon: 36, rare: 12, epic: 0, legendary: 0 },
				{ common: 38, uncommon: 36, rare: 20, epic: 6, legendary: 0 },
				{ common: 26, uncommon: 34, rare: 25, epic: 13, legendary: 2 },
				{ common: 16, uncommon: 30, rare: 28, epic: 20, legendary: 6 },
			];
			const weights = table[Math.min(table.length - 1, rank)];
			return pickFromRarity(pickRarity(weights, rng), rng, exclude).id;
		},
	};
})();
