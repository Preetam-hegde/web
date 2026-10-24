/**
 * Bag & Blade: Guild Orders
 * Three client orders per day. Pack the delivery satchel to satisfy every requirement,
 * then seal the contract. Everything in the satchel is handed over, so choose wisely.
 * Orders expire when the day rolls over.
 */
"use strict";

const Orders = (function () {
	const STAT_LABEL = { damage: "Attack", block: "Block", heal: "Healing", value: "Gold value" };
	// Gold tip per point of surplus beyond the requested stat
	const TIP_RATE = { damage: 2, block: 2, heal: 2, value: 0.5 };

	const TEMPLATES = [
		{
			key: "guard",
			client: "Ser Roderick (Town Guard)",
			avatar: "🛡️",
			needs: [{ category: "weapon", n: 1 }, { category: "shield", n: 1 }],
			stat: { type: "damage", base: 8, perDay: 1.5 },
			gold: 45,
			rep: 12,
			note: "Brigands near the mill. We need solid steel and something to hide behind.",
		},
		{
			key: "apothecary",
			client: "Mistress Willow (Apothecary)",
			avatar: "🌿",
			needs: [{ category: "potion", n: 1 }, { category: "food", n: 1 }],
			stat: { type: "heal", base: 20, perDay: 2 },
			gold: 40,
			rep: 12,
			note: "Fever in the lower ward. Restorative elixirs and fresh provisions, please.",
		},
		{
			key: "miner",
			client: "Master Thulun (Dwarven Miner)",
			avatar: "⛏️",
			needs: [{ category: "material", n: 1 }, { category: "gem", n: 1 }],
			stat: { type: "value", base: 35, perDay: 5 },
			gold: 62,
			rep: 18,
			note: "Smelting high-grade bronze takes raw ingots and unblemished stones.",
		},
		{
			key: "mage",
			client: "Eldrin (Academy Mage)",
			avatar: "🔮",
			needs: [{ category: "spell", n: 1 }, { category: "gem", n: 1 }],
			stat: { type: "damage", base: 16, perDay: 2 },
			gold: 78,
			rep: 22,
			note: "Arcane study demands parchment scrolls tuned to a resonance crystal.",
		},
		{
			key: "emissary",
			client: "Lord Vaelin (Crown Emissary)",
			avatar: "👑",
			needs: [{ category: "armor", n: 1 }, { category: "treasure", n: 1 }],
			stat: { type: "value", base: 80, perDay: 8 },
			gold: 115,
			rep: 30,
			note: "The royal banquet demands fine armor for the coach and gilt for the table.",
		},
		{
			key: "smith",
			client: "Brannoch (Blacksmith)",
			avatar: "⚒️",
			needs: [{ category: "material", n: 2 }],
			stat: { type: "value", base: 30, perDay: 3 },
			gold: 38,
			rep: 10,
			note: "My forge is hungry. Two bars of anything that holds an edge.",
		},
		{
			key: "ranger",
			client: "Warden Sylva (Ranger)",
			avatar: "🏹",
			needs: [{ category: "weapon", tag: "ranged", n: 1, label: "Ranged weapon" }, { category: "food", n: 1 }],
			stat: { type: "damage", base: 9, perDay: 1.5 },
			gold: 48,
			rep: 14,
			note: "Bring me a bow and a meal. The deer will not hunt themselves.",
		},
		{
			key: "chaplain",
			client: "Brother Anselm (Chaplain)",
			avatar: "🕯️",
			needs: [{ category: "potion", n: 2 }],
			stat: { type: "heal", base: 30, perDay: 3 },
			gold: 55,
			rep: 15,
			note: "The infirmary is full tonight. Two draughts at least.",
		},
		{
			key: "merchant",
			client: "Dame Orla (Merchant)",
			avatar: "🧮",
			needs: [{ category: "treasure", n: 1 }, { category: "accessory", n: 1 }],
			stat: { type: "value", base: 60, perDay: 6 },
			gold: 85,
			rep: 22,
			note: "A shiny thing and a trinket to show it off with. Quick, quick.",
		},
	];

	function statOf(totals, type) {
		if (type === "damage") return totals.attack;
		if (type === "block") return totals.guard + totals.armor;
		if (type === "heal") return totals.heal;
		return totals.value;
	}

	function needLabel(need) {
		if (need.label) return need.label;
		const base = ItemCatalog.CATEGORY_LABEL[need.category] || need.category;
		return need.n > 1 ? `${base}s` : base;
	}

	function generate(state) {
		const pool = TEMPLATES.slice();
		const list = [];
		const day = state.day;
		for (let i = 0; i < 3 && pool.length; i++) {
			const t = pool.splice(Math.floor(Store.random() * pool.length), 1)[0];
			list.push({
				id: `o${day}-${i}`,
				key: t.key,
				client: t.client,
				avatar: t.avatar,
				note: t.note,
				needs: t.needs,
				stat: {
					type: t.stat.type,
					min: Math.round(t.stat.base + t.stat.perDay * (day - 1)),
				},
				gold: t.gold + 6 * (day - 1),
				rep: t.rep,
				sealed: false,
			});
		}
		state.orders = { list, selected: 0 };
	}

	function current(state) {
		return state.orders.list[state.orders.selected] || null;
	}

	/** Live checklist for an order against whatever is packed in the satchel. */
	function evaluate(state, order) {
		const items = state.satchel.items.map((r) => ItemCatalog.get(r.id));
		const calc = state.satchel.calculate();
		const lines = [];
		for (const need of order.needs) {
			const have = items.filter(
				(d) =>
					d.category === need.category &&
					(!need.tag || d.tags.indexOf(need.tag) !== -1),
			).length;
			lines.push({
				text: `${need.n}× ${needLabel(need)}`,
				have,
				need: need.n,
				ok: have >= need.n,
			});
		}
		const have = Math.round(statOf(calc.totals, order.stat.type));
		const statOk = have >= order.stat.min;
		lines.push({
			text: `${STAT_LABEL[order.stat.type]} ≥ ${order.stat.min}`,
			have,
			need: order.stat.min,
			ok: statOk,
		});

		const ok = lines.every((l) => l.ok);
		const surplus = Math.max(0, have - order.stat.min);
		const tip = ok
			? Math.min(
					Math.round(order.gold * 0.5),
					Math.floor(surplus * TIP_RATE[order.stat.type]),
				)
			: 0;
		const bonusPct = Store.calc(state).totals.orderBonusPct;
		const total = Math.round((order.gold + tip) * (1 + bonusPct));
		return { ok, lines, tip, bonusPct, total, empty: items.length === 0 };
	}

	function seal(state, orderId) {
		const order = state.orders.list.find((o) => o.id === orderId);
		if (!order) return { ok: false, reason: "That order has expired." };
		if (order.sealed) return { ok: false, reason: "That order is already sealed." };
		const check = evaluate(state, order);
		if (check.empty) return { ok: false, reason: "The satchel is empty." };
		if (!check.ok) {
			const bad = check.lines.find((l) => !l.ok);
			return { ok: false, reason: `Not yet: ${bad.text} (have ${bad.have}).` };
		}

		const consumed = state.satchel.items.map((r) => r.id);
		state.satchel.clearItems();
		order.sealed = true;
		state.stats.ordersSealed += 1;
		Store.gainGold(state, check.total);
		const rankUp = Store.gainRep(order.rep);
		const newDay = Store.advanceSlots(state, 1);

		// Jump to the next open order, if the day did not just roll over
		if (!newDay) {
			const next = state.orders.list.findIndex((o) => !o.sealed);
			if (next !== -1) state.orders.selected = next;
		}
		return { ok: true, gold: check.total, tip: check.tip, rep: order.rep, rankUp, newDay, consumed };
	}

	/** Empty the satchel back into the bag (or the desk). Items that fit nowhere stay put. */
	function returnSatchel(state) {
		let moved = 0;
		for (const rec of state.satchel.items.slice()) {
			const spot = state.bag.findSpot(rec.id);
			if (spot) {
				state.satchel.remove(rec.uid);
				state.bag.place(rec.uid, rec.id, spot.col, spot.row, spot.shape);
				moved++;
			} else if (state.desk.length < Store.DESK_CAP) {
				state.satchel.remove(rec.uid);
				state.desk.push({ uid: rec.uid, id: rec.id });
				moved++;
			}
		}
		return { moved, left: state.satchel.items.length };
	}

	return { TEMPLATES, STAT_LABEL, generate, current, evaluate, seal, returnSatchel, statOf };
})();
