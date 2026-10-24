/**
 * Bag & Blade: Blacksmith Market
 * Daily stock, escalating slot prices, selling, and the Inn.
 * Guild rank widens the stock (rarer wares) and shaves 5% off prices per rank.
 */
"use strict";

const Market = (function () {
	const WARES_PER_DAY = 8;
	const MARKUP = 1.6;
	const REROLL_BASE = 15;
	const INN_COST = 10;

	function rank() {
		return Store.rankIndex(Store.meta.rep);
	}

	function price(id) {
		const base = ItemCatalog.baseValue(id);
		const discount = 1 - 0.05 * rank();
		return Math.max(3, Math.ceil(base * MARKUP * discount));
	}

	function pickWare(chosen, accept) {
		for (let i = 0; i < 60; i++) {
			const id = ItemCatalog.rollShopItem(rank(), Store.random, chosen);
			if (!accept || accept(ItemCatalog.get(id))) return id;
		}
		return ItemCatalog.rollShopItem(rank(), Store.random, chosen);
	}

	/** Build a fresh shelf: a few staples guaranteed, the rest at random. */
	function restock(state, opts) {
		const free = !!(opts && opts.free);
		if (!free) {
			const cost = rerollCost(state);
			if (state.gold < cost) return { ok: false, reason: `A restock costs ${cost} gold.` };
			state.gold -= cost;
			state.shop.restocks += 1;
		} else {
			state.shop.restocks = 0;
		}

		const chosen = new Set();
		const add = (accept) => {
			const id = pickWare(chosen, accept);
			chosen.add(id);
			return id;
		};
		const ids = [
			add((d) => d.category === "potion" || d.category === "food"),
			add((d) => d.category === "weapon"),
			add((d) => d.category === "shield" || d.category === "armor"),
			add(
				(d) =>
					d.category === "gem" ||
					d.category === "material" ||
					d.category === "accessory",
			),
		];
		while (ids.length < WARES_PER_DAY) ids.push(add());
		state.shop.wares = ids.map((id) => ({ id, sold: false }));
		return { ok: true };
	}

	function rerollCost(state) {
		return REROLL_BASE + 10 * state.shop.restocks;
	}

	function buy(state, index) {
		const ware = state.shop.wares[index];
		if (!ware || ware.sold) return { ok: false, reason: "Sold out." };
		const cost = price(ware.id);
		if (state.gold < cost) return { ok: false, reason: `You need ${cost} gold.` };
		if (state.desk.length >= Store.DESK_CAP) {
			return { ok: false, reason: "Your desk is full. Pack or sell something first." };
		}
		state.gold -= cost;
		ware.sold = true;
		const res = Store.addToDesk(state, ware.id);
		return { ok: true, cost, uid: res.uid };
	}

	function unlockCost(state) {
		return Math.round((30 * Math.pow(1.4, state.shop.slotsBought)) / 5) * 5;
	}

	function unlockSlot(state, col, row) {
		const cell = state.bag.getCell(col, row);
		if (!cell || cell.type !== "locked") return { ok: false, reason: "That slot is already open." };
		const cost = unlockCost(state);
		if (state.gold < cost) return { ok: false, reason: `Unlocking a slot costs ${cost} gold.` };
		state.gold -= cost;
		state.bag.unlock(col, row);
		state.shop.slotsBought += 1;
		return { ok: true, cost };
	}

	/**
	 * Sell a thing. Items in the bag fetch their synergy-boosted value (coin purses and
	 * chalices finally pay off); desk items fetch their plain value.
	 */
	function sell(state, where, uid) {
		let id;
		let gold;
		if (where === "desk") {
			const idx = state.desk.findIndex((d) => d.uid === uid);
			if (idx === -1) return { ok: false, reason: "Item not found." };
			id = state.desk[idx].id;
			gold = Store.sellPrice(id);
			state.desk.splice(idx, 1);
		} else {
			const grid = where === "satchel" ? state.satchel : state.bag;
			const rec = grid.get(uid);
			if (!rec) return { ok: false, reason: "Item not found." };
			id = rec.id;
			gold = Store.sellPrice(id, grid.calculate().items[uid].eff.value);
			grid.remove(uid);
			if (where === "bag") Store.syncHp(state);
		}
		Store.gainGold(state, gold);
		state.stats.sold += 1;
		return { ok: true, id, gold };
	}

	function rest(state) {
		if (state.phase === "dead") return { ok: false, reason: "Your run has ended." };
		if (state.gold < INN_COST) return { ok: false, reason: `The Inn costs ${INN_COST} gold.` };
		state.gold -= INN_COST;
		const max = Store.maxHp(state);
		const before = state.hp;
		state.hp = Math.min(max, state.hp + Math.round(max * 0.5));
		Store.advanceSlots(state, Store.SLOTS_PER_DAY - state.slot);
		return { ok: true, healed: state.hp - before };
	}

	return {
		INN_COST,
		price,
		restock,
		rerollCost,
		buy,
		unlockCost,
		unlockSlot,
		sell,
		rest,
	};
})();
