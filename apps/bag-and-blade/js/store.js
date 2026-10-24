/**
 * Bag & Blade: Game State & Persistence
 * One serialisable run state (gold, HP, bag, desk, day clock...) plus a small
 * "meta" record (lifetime reputation, best floor, puzzle stars) that survives deaths.
 */
"use strict";

const Store = (function () {
	const RUN_KEY = "bag_and_blade_run_v2";
	const META_KEY = "bag_and_blade_meta_v2";
	const OLD_PUZZLE_KEY = "bag_and_blade_puzzles";

	const DESK_CAP = 10;
	const BASE_HP = 50;
	const BASE_ENERGY = 3;
	const SLOTS_PER_DAY = 5;
	const TIME_NAMES = ["Dawn", "Morning", "Afternoon", "Dusk", "Night"];

	const BAG_LAYOUT = ["h...qL", ".....L", ".....L", ".....L", "LLLLLL"];
	const SATCHEL_LAYOUT = ["....", "....", "....", "...."];

	const RANKS = [
		{ name: "Squire", rep: 0 },
		{ name: "Journeyman", rep: 60 },
		{ name: "Artisan", rep: 160 },
		{ name: "Master", rep: 320 },
		{ name: "Grandmaster", rep: 600 },
	];
	/** Each rank permanently opens one more starting slot in a fresh satchel. */
	const RANK_SLOTS = [
		[5, 0],
		[5, 1],
		[5, 2],
		[5, 3],
	];

	const STARTER_KIT = [
		{ id: "minor_health_potion", col: 0, row: 0 },
		{ id: "crusty_bread", col: 0, row: 1 },
		{ id: "rusty_dagger", col: 1, row: 1 },
		{ id: "whetstone_sharpener", col: 3, row: 1 },
		{ id: "wooden_buckler", col: 0, row: 2 },
	];

	let meta = defaultMeta();
	// Replaceable so tests can use a seeded generator.
	const rng = { next: Math.random };

	function defaultMeta() {
		return { rep: 0, bestFloor: 0, runs: 0, wins: 0, puzzles: {}, seenHelp: false };
	}

	function readJson(key) {
		try {
			const raw = localStorage.getItem(key);
			return raw ? JSON.parse(raw) : null;
		} catch (e) {
			return null;
		}
	}

	function writeJson(key, value) {
		try {
			localStorage.setItem(key, JSON.stringify(value));
		} catch (e) {
			/* private mode or quota: the game still plays, it just won't resume */
		}
	}

	function loadMeta() {
		const saved = readJson(META_KEY);
		meta = Object.assign(defaultMeta(), saved || {});
		if (!meta.puzzles || typeof meta.puzzles !== "object") meta.puzzles = {};
		// Migrate stars from the first version of the vault
		const old = readJson(OLD_PUZZLE_KEY);
		if (Array.isArray(old)) {
			for (const id of old) {
				if (!meta.puzzles[id]) meta.puzzles[id] = { solved: true };
			}
			try {
				localStorage.removeItem(OLD_PUZZLE_KEY);
			} catch (e) {}
			writeJson(META_KEY, meta);
		}
		return meta;
	}

	function saveMeta() {
		writeJson(META_KEY, meta);
	}

	function rankIndex(rep) {
		let idx = 0;
		for (let i = 0; i < RANKS.length; i++) if (rep >= RANKS[i].rep) idx = i;
		return idx;
	}

	function rankInfo(rep) {
		const index = rankIndex(rep);
		const cur = RANKS[index];
		const next = RANKS[index + 1] || null;
		return {
			index,
			name: cur.name,
			next: next ? next.name : null,
			into: rep - cur.rep,
			span: next ? next.rep - cur.rep : 1,
			progress: next ? (rep - cur.rep) / (next.rep - cur.rep) : 1,
			rep,
		};
	}

	function sfx(name) {
		try {
			const s = window.SoundController;
			if (s && typeof s[name] === "function") s[name]();
		} catch (e) {}
	}

	function uid(state) {
		return "u" + state.uidCounter++;
	}

	function makeBag(rank) {
		const grid = new Grid({ layout: BAG_LAYOUT });
		for (let i = 0; i < rank && i < RANK_SLOTS.length; i++) {
			grid.unlock(RANK_SLOTS[i][0], RANK_SLOTS[i][1]);
		}
		return grid;
	}

	function newRun() {
		const rank = rankIndex(meta.rep);
		const state = {
			v: 2,
			uidCounter: 1,
			gold: 50,
			day: 1,
			slot: 0,
			hp: BASE_HP,
			block: 0,
			energy: BASE_ENERGY,
			strength: 0,
			thorns: 0,
			used: [],
			floor: 1,
			phase: "fight",
			cleared: false,
			enemy: null,
			log: [],
			lastReward: null,
			bag: makeBag(rank),
			satchel: new Grid({ layout: SATCHEL_LAYOUT }),
			desk: [],
			shop: { wares: [], restocks: 0, slotsBought: 0 },
			orders: { list: [], selected: 0 },
			stats: { kills: 0, goldEarned: 0, ordersSealed: 0, sold: 0 },
			hints: { firstFight: true },
		};
		for (const kit of STARTER_KIT) {
			state.bag.place(uid(state), kit.id, kit.col, kit.row);
		}
		Market.restock(state, { free: true });
		Orders.generate(state);
		Combat.startFight(state);
		meta.runs += 1;
		saveMeta();
		return state;
	}

	function calc(state) {
		return state.bag.calculate();
	}

	function maxHp(state) {
		return BASE_HP + calc(state).totals.maxHp;
	}

	/** Keep current HP legal after the bag changed (an armour piece was removed). */
	function syncHp(state) {
		state.hp = Math.min(state.hp, maxHp(state));
	}

	function sellPrice(id, effValue) {
		const base = ItemCatalog.baseValue(id);
		return Math.max(1, typeof effValue === "number" ? effValue : base);
	}

	/**
	 * Put an item on the study desk. A full desk auto-sells the item instead, so loot
	 * is never silently destroyed.
	 */
	function addToDesk(state, id) {
		if (state.desk.length >= DESK_CAP) {
			const gold = sellPrice(id);
			state.gold += gold;
			state.stats.goldEarned += gold;
			state.stats.sold += 1;
			return { ok: false, sold: gold };
		}
		const item = { uid: uid(state), id };
		state.desk.push(item);
		return { ok: true, uid: item.uid };
	}

	function gainGold(state, amount) {
		state.gold += amount;
		if (amount > 0) state.stats.goldEarned += amount;
	}

	/** Reputation is lifetime progress. Returns the new rank name when one is earned. */
	function gainRep(amount) {
		const before = rankIndex(meta.rep);
		meta.rep += amount;
		saveMeta();
		const after = rankIndex(meta.rep);
		return after > before ? RANKS[after].name : null;
	}

	/** Spend `n` time slots; rolls the day over (new orders, new stock) when needed. */
	function advanceSlots(state, n) {
		let newDay = false;
		state.slot += n;
		while (state.slot >= SLOTS_PER_DAY) {
			state.slot -= SLOTS_PER_DAY;
			state.day += 1;
			newDay = true;
		}
		if (newDay) {
			Orders.generate(state);
			Market.restock(state, { free: true });
		}
		return newDay;
	}

	function serialize(state) {
		return {
			v: 2,
			uidCounter: state.uidCounter,
			gold: state.gold,
			day: state.day,
			slot: state.slot,
			hp: state.hp,
			block: state.block,
			energy: state.energy,
			strength: state.strength,
			thorns: state.thorns,
			used: state.used,
			floor: state.floor,
			phase: state.phase,
			cleared: state.cleared,
			enemy: state.enemy,
			log: state.log.slice(0, 30),
			lastReward: state.lastReward,
			bag: state.bag.toJSON(),
			satchel: state.satchel.toJSON(),
			desk: state.desk,
			shop: state.shop,
			orders: state.orders,
			stats: state.stats,
			hints: state.hints,
		};
	}

	function hydrate(json) {
		if (!json || json.v !== 2) return null;
		const bag = Grid.fromJSON(json.bag);
		const satchel = Grid.fromJSON(json.satchel);
		const state = Object.assign({}, json, {
			bag: bag.grid,
			satchel: satchel.grid,
			desk: (json.desk || []).filter((d) => ItemCatalog.get(d.id)),
		});
		// Anything that no longer fits goes to the desk instead of vanishing.
		for (const lost of bag.rejected.concat(satchel.rejected)) {
			state.desk.push({ uid: lost.uid, id: lost.id });
		}
		state.shop.wares = (state.shop.wares || []).filter((w) => ItemCatalog.get(w.id));
		if (!state.orders.list.length) Orders.generate(state);
		return state;
	}

	function save(state) {
		writeJson(RUN_KEY, serialize(state));
	}

	function load() {
		try {
			return hydrate(readJson(RUN_KEY));
		} catch (e) {
			return null;
		}
	}

	function clearRun() {
		try {
			localStorage.removeItem(RUN_KEY);
		} catch (e) {}
	}

	return {
		DESK_CAP,
		BASE_HP,
		BASE_ENERGY,
		SLOTS_PER_DAY,
		TIME_NAMES,
		BAG_LAYOUT,
		SATCHEL_LAYOUT,
		RANKS,
		rng,

		get meta() {
			return meta;
		},
		random: () => rng.next(),
		loadMeta,
		saveMeta,
		rankIndex,
		rankInfo,
		sfx,
		uid,
		newRun,
		calc,
		maxHp,
		syncHp,
		sellPrice,
		addToDesk,
		gainGold,
		gainRep,
		advanceSlots,
		serialize,
		hydrate,
		save,
		load,
		clearRun,
	};
})();
