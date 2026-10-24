/**
 * Bag & Blade: Rendering
 * Pure view code. It reads a view model from the host (app.js), rebuilds the DOM for the
 * regions that changed, and routes every click back to the host's actions.
 */
"use strict";

const UI = (function () {
	const ICON = (def) => `assets/icons/${def.icon}`;
	const TIME_KEYS = ["dawn", "morning", "afternoon", "dusk", "night"];
	const RARITY_LABEL = {
		common: "Common",
		uncommon: "Uncommon",
		rare: "Rare",
		epic: "Epic",
		legendary: "Legendary",
	};
	const STAT_ORDER = [
		"damage",
		"block",
		"heal",
		"restoreEnergy",
		"strength",
		"burn",
		"chill",
		"pierce",
		"crit",
		"stun",
		"lifesteal",
		"thorns",
		"maxHp",
		"regen",
		"dodge",
		"energyBonus",
		"lootBonus",
		"lootLuck",
		"orderBonusPct",
	];

	let host = null;
	const el = {};
	let hoverRef = null;

	// ── tiny DOM helper ──────────────────────────────────────────────────────
	function h(tag, attrs, ...kids) {
		const node = document.createElement(tag);
		if (attrs) {
			for (const [k, v] of Object.entries(attrs)) {
				if (v === null || v === undefined || v === false) continue;
				if (k === "class") node.className = v;
				else if (k === "text") node.textContent = v;
				else if (k === "style") node.style.cssText = v;
				else if (k === "dataset") Object.assign(node.dataset, v);
				else if (k.slice(0, 2) === "on") node.addEventListener(k.slice(2), v);
				else node.setAttribute(k, v === true ? "" : v);
			}
		}
		for (const kid of kids.flat(Infinity)) {
			if (kid === null || kid === undefined || kid === false) continue;
			node.append(kid.nodeType ? kid : document.createTextNode(String(kid)));
		}
		return node;
	}

	/** replaceChildren that accepts arrays and ignores null / false entries. */
	function setKids(node, ...kids) {
		node.replaceChildren(
			...kids.flat(Infinity).filter((k) => k !== null && k !== undefined && k !== false),
		);
	}

	function btn(label, cls, onClick, extra) {
		return h("button", Object.assign({ type: "button", class: `btn ${cls}`, onclick: onClick }, extra), label);
	}

	function pct(n, max) {
		return `${Math.max(0, Math.min(100, (n / Math.max(1, max)) * 100))}%`;
	}

	function fmtNum(n) {
		return Number.isInteger(n) ? String(n) : String(Math.round(n * 100) / 100);
	}

	// ── item tile badges ─────────────────────────────────────────────────────
	function primaryBadge(data) {
		const e = data.eff;
		const b = data.base;
		switch (data.def.use) {
			case "attack":
				return { text: `⚔${e.damage}`, cls: "b-dmg", buffed: e.damage > (b.damage || 0) };
			case "guard":
				return { text: `🛡${e.block}`, cls: "b-blk", buffed: e.block > (b.block || 0) };
			case "cast":
				if (e.damage) return { text: `✦${e.damage}`, cls: "b-dmg", buffed: e.damage > (b.damage || 0) };
				return { text: `💖${e.heal}`, cls: "b-heal", buffed: e.heal > (b.heal || 0) };
			case "drink":
			case "eat":
				if (e.heal) return { text: `💖${e.heal}`, cls: "b-heal", buffed: e.heal > (b.heal || 0) };
				if (e.restoreEnergy) return { text: `⚡${e.restoreEnergy}`, cls: "b-nrg", buffed: e.restoreEnergy > (b.restoreEnergy || 0) };
				if (e.strength) return { text: `💪${e.strength}`, cls: "b-dmg", buffed: e.strength > (b.strength || 0) };
				if (e.block) return { text: `🛡${e.block}`, cls: "b-blk", buffed: e.block > (b.block || 0) };
				return null;
			case "passive":
				if (e.block) return { text: `🛡${e.block}`, cls: "b-blk", buffed: e.block > (b.block || 0) };
				return null;
			default:
				if (data.def.category === "treasure" || data.def.category === "gem")
					return { text: `🪙${e.value}`, cls: "b-val", buffed: e.value > (b.value || 0) };
				return null;
		}
	}

	function energyCost(def) {
		return def.use === "attack" || def.use === "guard" || def.use === "cast" ? def.stats.energy || 1 : 0;
	}

	// ── grids ────────────────────────────────────────────────────────────────
	function pocketTitle(type) {
		return Grid.POCKETS[type].label + ": " + Grid.POCKETS[type].text;
	}

	function cellEl(cell, name, view) {
		const classes = ["cell", cell.type];
		const node = h("div", { dataset: { col: cell.col, row: cell.row } });
		if (cell.type === "blocked") {
			node.className = classes.join(" ");
			return node;
		}
		if (cell.type === "holster" || cell.type === "quiver") {
			node.append(h("span", { class: "cell-tag", text: cell.type === "holster" ? "🧪" : "🏹" }));
			node.title = pocketTitle(cell.type);
		} else if (cell.type === "locked") {
			node.append(h("span", { class: "cell-lock", text: "🔒" }));
			if (name === "bag") {
				const cost = Market.unlockCost(view.state);
				const buyable = view.mode === "market";
				if (buyable) classes.push("buyable");
				node.title = buyable
					? `Unlock this slot for ${cost} gold (click)`
					: "Locked slot. Unlock it in the Market.";
				node.addEventListener("click", () => host.act.unlockSlot(cell.col, cell.row));
				if (buyable) node.append(h("span", { class: "cell-price", text: `${cost}g` }));
			}
		}
		node.className = classes.join(" ");
		return node;
	}

	function itemEl(rec, data, name, view) {
		const def = data.def;
		const rows = rec.shape.length;
		const cols = rec.shape[0].length;
		const classes = ["item", `rarity-${def.rarity}`, `use-${def.use || "none"}`];
		if (data.points > 0) classes.push("synergized");

		const cost = energyCost(def);
		const s = view.state;
		if (name === "bag" && view.mode === "delve" && s.phase === "fight" && def.use && def.use !== "passive") {
			if (s.used.indexOf(rec.uid) !== -1) classes.push("spent");
			else if (s.energy < cost) classes.push("cant");
			else classes.push("usable");
		}
		if (name === "bag" && view.selected && view.selected.kind === "bag" && view.selected.uid === rec.uid) {
			classes.push("selected");
		}
		if (name === "puzzle" && view.selected && view.selected.kind === "puzzle" && view.selected.uid === rec.uid) {
			classes.push("selected");
		}

		const node = h("div", {
			class: classes.join(" "),
			dataset: { uid: rec.uid, src: name, drag: "1" },
			tabindex: "0",
			role: "button",
			"aria-label": def.name,
			style: `--col:${rec.col};--row:${rec.row};--w:${cols};--h:${rows}`,
		});

		const shape = h("div", {
			class: "shape",
			style: `grid-template-columns:repeat(${cols}, var(--pitch));grid-template-rows:repeat(${rows}, var(--pitch))`,
		});
		for (let r = 0; r < rows; r++) {
			for (let c = 0; c < cols; c++) {
				if (!rec.shape[r][c]) {
					shape.append(h("div", { class: "hole" }));
					continue;
				}
				const e = [];
				if (r === 0 || !rec.shape[r - 1][c]) e.push("e-t");
				if (c === cols - 1 || !rec.shape[r][c + 1]) e.push("e-r");
				if (r === rows - 1 || !rec.shape[r + 1][c]) e.push("e-b");
				if (c === 0 || !rec.shape[r][c - 1]) e.push("e-l");
				shape.append(h("div", { class: `part ${e.join(" ")}` }));
			}
		}
		node.append(shape);
		node.append(h("img", { class: "icon", src: ICON(def), alt: "", draggable: "false" }));

		const badge = primaryBadge(data);
		if (badge) {
			node.append(h("span", { class: `badge ${badge.cls}${badge.buffed ? " buffed" : ""}`, text: badge.text }));
		}
		if (cost) node.append(h("span", { class: "cost", text: `⚡${cost}` }));
		if (data.points > 0) node.append(h("span", { class: "spark", text: "✦" }));
		return node;
	}

	function linksSvg(grid, calc) {
		const ns = "http://www.w3.org/2000/svg";
		const svg = document.createElementNS(ns, "svg");
		svg.setAttribute("class", "links");
		svg.setAttribute("viewBox", `0 0 ${grid.cols} ${grid.rows}`);
		svg.setAttribute("preserveAspectRatio", "none");
		const center = (uid) => {
			const rec = calc.items[uid].rec;
			return [rec.col + rec.shape[0].length / 2, rec.row + rec.shape.length / 2];
		};
		for (const link of calc.links) {
			const [x1, y1] = center(link.from);
			const [x2, y2] = center(link.to);
			const line = document.createElementNS(ns, "line");
			line.setAttribute("class", "link");
			line.setAttribute("x1", x1);
			line.setAttribute("y1", y1);
			line.setAttribute("x2", x2);
			line.setAttribute("y2", y2);
			line.dataset.from = link.from;
			line.dataset.to = link.to;
			svg.append(line);
		}
		return svg;
	}

	function renderGrid(board, grid, name, view) {
		board.dataset.grid = name;
		let gridEl = board.querySelector(".grid-container");
		if (!gridEl) {
			gridEl = h("div", { class: "grid-container" });
			board.append(gridEl);
		}
		gridEl.replaceChildren();
		gridEl.style.setProperty("--cols", grid.cols);
		gridEl.style.setProperty("--rows", grid.rows);
		const calc = grid.calculate();
		for (const cell of grid.cells) gridEl.append(cellEl(cell, name, view));
		for (const rec of grid.items) gridEl.append(itemEl(rec, calc.items[rec.uid], name, view));
		gridEl.append(linksSvg(grid, calc));
		return calc;
	}

	// ── header / HUD ─────────────────────────────────────────────────────────
	function renderHud(view) {
		const s = view.state;
		const rank = Store.rankInfo(view.meta.rep);
		const slot = s.slot;
		const night = slot >= 3;
		setKids(el.hud, 
			h("div", { class: "pill pill-gold", title: "Gold" }, h("span", { class: "pill-ico", text: "🪙" }), h("b", { text: s.gold })),
			h(
				"div",
				{
					class: "pill pill-rank",
					title: `Guild reputation ${rank.rep}${rank.next ? ` · ${rank.span - rank.into} to ${rank.next}` : " · maximum rank"}`,
				},
				h("span", { class: "pill-ico", text: "⭐" }),
				h("div", { class: "rank-stack" }, h("b", { text: rank.name }), h("span", { class: "rank-bar" }, h("i", { style: `width:${Math.round(rank.progress * 100)}%` })))
			),
			h("div", { class: "pill pill-floor", title: `Deepest floor ever: ${view.meta.bestFloor}` }, h("span", { class: "pill-ico", text: "🏰" }), h("b", { text: `Floor ${s.floor}` })),
			h(
				"div",
				{ class: "pill pill-clock", title: "Fights and sealed orders each use a time slot. Five slots make a day." },
				h("img", { class: "clock-ico", src: night ? "assets/ui/moon-icon.png" : "assets/ui/sun-icon.png", alt: "" }),
				h("div", { class: "clock-stack" }, h("b", { text: `Day ${s.day}` }), h("span", { text: Store.TIME_NAMES[slot] })),
				h("div", { class: "slot-pips" }, Store.TIME_NAMES.map((_, i) => h("i", { class: i < slot ? "used" : i === slot ? "now" : "" })))
			)
		);
		document.body.dataset.time = TIME_KEYS[slot];
		document.body.dataset.mode = view.mode;
	}

	// ── stat strip ───────────────────────────────────────────────────────────
	function renderStats(view, calc) {
		const t = calc.totals;
		const chip = (ico, label, value, tip) =>
			h("div", { class: "stat-chip", title: tip }, h("span", { class: "stat-ico", text: ico }), h("b", { text: value }), h("small", { text: label }));
		const passives = [];
		if (t.maxHp) passives.push(`+${t.maxHp} max HP`);
		if (t.regen) passives.push(`+${t.regen} regen`);
		if (t.dodge) passives.push(`${Math.round(t.dodge * 100)}% dodge`);
		if (t.energyBonus) passives.push(`+${t.energyBonus} energy`);
		if (t.strength) passives.push(`+${t.strength} strength`);
		if (t.lootBonus) passives.push(`+${t.lootBonus} loot`);
		if (t.lootLuck) passives.push(`${Math.round(t.lootLuck * 100)}% loot luck`);
		if (t.orderBonusPct) passives.push(`+${Math.round(t.orderBonusPct * 100)}% order pay`);
		setKids(el.stats, 
			h(
				"div",
				{ class: "stat-row" },
				chip("⚔️", "Attack", fmtNum(t.attack), "Total damage of every weapon and scroll if you used them all once"),
				chip("🛡️", "Guard", fmtNum(t.guard), "Block you can raise this turn with shields (and Ironbark tonics)"),
				chip("🧱", "Armor", fmtNum(t.armor), "Passive Block you start every turn with, from armor and rings"),
				chip("💖", "Healing", fmtNum(t.heal), "Total healing sitting in potions, provisions and scrolls"),
				chip("✨", "Bonus", fmtNum(t.bonus), "Stat points earned purely from where things are placed"),
				chip("💰", "Value", `${fmtNum(t.value)}g`, "What the whole satchel would sell for, synergies included")
			),
			passives.length ? h("div", { class: "passives", text: passives.join(" · ") }) : null
		);
	}

	// ── inspector ────────────────────────────────────────────────────────────
	function statRows(def, data) {
		const base = data ? data.base : def.stats;
		const eff = data ? data.eff : def.stats;
		const keys = STAT_ORDER.filter((k) => (base[k] || 0) !== 0 || (eff[k] || 0) !== 0);
		return keys.map((k) => {
			const b = base[k] || 0;
			const e = eff[k] || 0;
			const label = ItemCatalog.STAT_LABEL[k] || k;
			const fmt = (v) => (["crit", "stun", "dodge", "lootLuck", "orderBonusPct"].indexOf(k) !== -1 ? `${Math.round(v * 100)}%` : fmtNum(v));
			return h(
				"div",
				{ class: "stat-line" },
				h("span", { text: label }),
				h("b", { class: e > b ? "up" : "" }, e > b ? `${fmt(b)} → ${fmt(e)}` : fmt(e))
			);
		});
	}

	function useLine(def) {
		const cost = energyCost(def);
		switch (def.use) {
			case "attack":
				return `Attack · costs ${cost}⚡ · once per turn`;
			case "guard":
				return `Guard · costs ${cost}⚡ · once per turn`;
			case "cast":
				return def.consumable ? `Scroll · costs ${cost}⚡ · burns up when read` : `Tome · costs ${cost}⚡ · reusable, once per turn`;
			case "drink":
				return "Potion · free action · single use";
			case "eat":
				return "Provision · free action · single use";
			case "passive":
				return "Passive · works while packed, no clicking";
			default:
				return "Trade good · powers neighbours, sells for gold";
		}
	}

	function inspectorContent(view, ref, interactive) {
		if (!ref) return null;
		const s = view.state;
		let def = null;
		let data = null;
		let grid = null;
		let price = null;
		let wareIndex = null;
		if (ref.kind === "bag" || ref.kind === "satchel" || ref.kind === "puzzle") {
			grid = ref.kind === "bag" ? s.bag : ref.kind === "satchel" ? s.satchel : view.puzzle && view.puzzle.grid;
			const rec = grid && grid.get(ref.uid);
			if (!rec) return null;
			data = grid.calculate().items[ref.uid];
			def = data.def;
			price = data.eff.value;
		} else if (ref.kind === "desk") {
			const d = s.desk.find((x) => x.uid === ref.uid);
			if (!d) return null;
			def = ItemCatalog.get(d.id);
			price = def.stats.value;
		} else if (ref.kind === "pool") {
			const d = view.puzzle && view.puzzle.pool.find((x) => x.uid === ref.uid);
			if (!d) return null;
			def = ItemCatalog.get(d.id);
		} else if (ref.kind === "shop") {
			const w = s.shop.wares[ref.index];
			if (!w) return null;
			def = ItemCatalog.get(w.id);
			price = def.stats.value;
			wareIndex = ref.index;
		}
		if (!def) return null;

		const slots = ItemCatalog.shapeCellCount(def.shape);
		const synergyRows = def.synergies.map((syn, i) =>
			h("li", { class: data ? (data.active.has(i) ? "on" : "off") : "" }, ItemCatalog.describeSynergy(syn))
		);
		if (def.openEdge) {
			synergyRows.push(h("li", { class: data ? (data.active.has("open") ? "on" : "off") : "" }, ItemCatalog.describeOpenEdge(def.openEdge)));
		}
		const pocketKinds = def.category === "potion" ? ["holster"] : def.tags.indexOf("ranged") !== -1 ? ["quiver"] : [];
		for (const k of pocketKinds) {
			synergyRows.push(h("li", { class: data ? (data.active.has("pocket:" + k) ? "on" : "off") : "" }, `${Grid.POCKETS[k].label} slot: ${Grid.POCKETS[k].text.replace(/^.*? in a \w+ slot /, "").replace(/^Potions /, "")}`));
		}

		const actions = [];
		const where = ref.kind;
		if (def.use && def.use !== "passive" && where === "bag") {
			actions.push(btn("Use", "btn-primary btn-sm", () => host.act.useItem(ref.uid)));
		}
		if (where === "bag" || where === "satchel" || where === "puzzle") {
			actions.push(btn("↻ Rotate", "btn-wood btn-sm", () => host.act.rotateRef(ref)));
		}
		if (where === "desk") {
			actions.push(btn("Pack ▸", "btn-primary btn-sm", () => host.act.autoPack(ref.uid)));
		}
		if (where === "bag" || where === "satchel") {
			actions.push(btn("To desk", "btn-wood btn-sm", () => host.act.toDesk(where, ref.uid)));
		}
		if (where === "bag" || where === "satchel" || where === "desk") {
			actions.push(btn(`Sell ${price}g`, "btn-gold btn-sm", () => host.act.sellRef(ref)));
		}
		if (where === "shop") {
			const w = s.shop.wares[wareIndex];
			const cost = Market.price(w.id);
			actions.push(btn(w.sold ? "Sold" : `Buy ${cost}g`, "btn-gold btn-sm", () => host.act.buy(wareIndex), { disabled: w.sold || s.gold < cost }));
		}

		const node = h(
			"div",
			{ class: `insp-card rarity-${def.rarity}` },
			h(
				"div",
				{ class: "insp-head" },
				h("img", { class: "insp-icon", src: ICON(def), alt: "" }),
				h("div", {}, h("div", { class: "insp-name", text: def.name }), h("div", { class: "insp-meta", text: `${RARITY_LABEL[def.rarity]} ${ItemCatalog.CATEGORY_LABEL[def.category]} · ${slots} slot${slots === 1 ? "" : "s"}${def.tags.length ? " · " + def.tags.join(", ") : ""}` }))
			),
			h("div", { class: "insp-use", text: useLine(def) }),
			h("div", { class: "stat-table" }, statRows(def, data)),
			data && data.notes.length
				? h("div", { class: "insp-notes" }, h("div", { class: "insp-sub", text: "Active bonuses" }), h("ul", {}, data.notes.map((n) => h("li", { text: n }))))
				: null,
			synergyRows.length
				? h("div", { class: "insp-syn" }, h("div", { class: "insp-sub", text: "Synergies" }), h("ul", { class: "syn-list" }, synergyRows))
				: null,
			h("div", { class: "insp-lore", text: `“${def.lore}”` }),
			price !== null && where !== "shop"
				? h("div", { class: "insp-price", text: `Sells for ${price}g${data && price !== def.stats.value ? ` (base ${def.stats.value}g)` : ""}` })
				: null,
			interactive && actions.length
				? h("div", { class: "insp-actions" }, actions)
				: !interactive
					? h("div", { class: "insp-peek", text: "Click to select and see actions" })
					: null
		);
		return node;
	}

	function sameRef(a, b) {
		if (!a || !b) return false;
		return a.kind === b.kind && a.uid === b.uid && a.index === b.index;
	}

	function renderInspector(view) {
		const peeking = !!hoverRef && !sameRef(hoverRef, view.selected);
		const ref = hoverRef || view.selected;
		const content = inspectorContent(view, ref, !peeking);
		setKids(el.inspector, 
			content ||
				h(
					"div",
					{ class: "insp-empty" },
					h("div", { class: "insp-empty-ico", text: "🔍" }),
					h("p", { text: "Hover or tap any item to inspect it." }),
					h("p", { class: "dim", text: "Items that touch each other can power one another up. Look for the ✦ sparkle." })
				)
		);
		el.inspector.classList.toggle("is-hover", peeking);
	}

	function setHover(ref) {
		hoverRef = ref;
		renderInspector(host.view());
	}

	// ── desk ─────────────────────────────────────────────────────────────────
	function renderDesk(view) {
		const s = view.state;
		el.deskCount.textContent = `${s.desk.length}/${Store.DESK_CAP}`;
		el.deskCount.classList.toggle("full", s.desk.length >= Store.DESK_CAP);
		if (!s.desk.length) {
			setKids(el.deskRack, h("div", { class: "rack-empty", text: "Loot and purchases land here. Drag them into your satchel." }));
			return;
		}
		setKids(el.deskRack, 
			s.desk.map((d) => {
				const def = ItemCatalog.get(d.id);
				const selected = view.selected && view.selected.kind === "desk" && view.selected.uid === d.uid;
				return h(
					"div",
					{
						class: `desk-card rarity-${def.rarity}${selected ? " selected" : ""}`,
						dataset: { uid: d.uid, src: "desk", drag: "1" },
						tabindex: "0",
						role: "button",
						"aria-label": `${def.name}. Press Enter to inspect, double click to pack.`,
					},
					h("img", { src: ICON(def), alt: "", draggable: "false" }),
					h("div", { class: "desk-card-info" }, h("b", { text: def.name }), h("small", { text: `${ItemCatalog.CATEGORY_LABEL[def.category]} · ${ItemCatalog.shapeCellCount(def.shape)} slot${ItemCatalog.shapeCellCount(def.shape) === 1 ? "" : "s"} · ${def.stats.value}g` }))
				);
			})
		);
	}

	// ── mode tabs ────────────────────────────────────────────────────────────
	function renderTabs(view) {
		const s = view.state;
		const open = s.orders.list.filter((o) => !o.sealed).length;
		const tabs = [
			{ mode: "delve", ico: "⚔️", label: "Delve", badge: s.phase === "victory" ? "!" : null },
			{ mode: "orders", ico: "📜", label: "Orders", badge: s.satchel.items.length ? `🧰${s.satchel.items.length}` : open ? String(open) : null },
			{ mode: "market", ico: "🛒", label: "Market", badge: null },
			{ mode: "vault", ico: "🧩", label: "Vault", badge: null },
		];
		setKids(el.tabs, 
			tabs.map((t, i) =>
				h(
					"button",
					{
						type: "button",
						class: `mode-tab${view.mode === t.mode ? " active" : ""}`,
						role: "tab",
						"aria-selected": view.mode === t.mode ? "true" : "false",
						title: `${t.label} [${i + 1}]`,
						onclick: () => host.act.setMode(t.mode),
					},
					h("span", { class: "tab-ico", text: t.ico }),
					h("span", { class: "tab-label", text: t.label }),
					t.badge ? h("span", { class: "tab-badge", text: t.badge }) : null
				)
			)
		);
	}

	// ── Delve panel ──────────────────────────────────────────────────────────
	function bar(value, max, cls, label) {
		return h("div", { class: `bar ${cls}` }, h("div", { class: "fill", style: `width:${pct(value, max)}` }), h("span", { class: "bar-label", text: label }));
	}

	function chip(text, cls, title) {
		return h("span", { class: `chip ${cls || ""}`, title, text });
	}

	function renderDelve(view) {
		const s = view.state;
		const t = Store.calc(s).totals;
		const maxHp = Store.maxHp(s);
		const en = s.enemy;
		const root = h("div", { class: "delve" });

		const energyMax = Math.max(Store.BASE_ENERGY + t.energyBonus, s.energy);
		const pips = [];
		for (let i = 0; i < energyMax; i++) pips.push(h("i", { class: i < s.energy ? "on" : "" }));

		const playerStatus = [];
		if (s.strength) playerStatus.push(chip(`💪 +${s.strength}`, "chip-str", "Added to every attack this turn"));
		if (s.thorns) playerStatus.push(chip(`🌵 ${s.thorns}`, "chip-thorn", "Damage reflected at the next attacker"));

		root.append(
			h(
				"div",
				{ class: "delve-head" },
				h("h2", { class: "panel-title", text: "Expedition" }),
				h("span", { class: `floor-tag${en && en.boss ? " boss" : ""}`, text: en && en.boss ? `⚠ BOSS · Floor ${s.floor}` : `Floor ${s.floor}` })
			),
			h(
				"div",
				{ class: "vitals", id: "player-card" },
				h("div", { class: "vitals-top" }, h("b", { text: "Guildmaster" }), h("span", { class: "chip-row" }, playerStatus)),
				bar(s.hp, maxHp, "bar-hp", `${s.hp} / ${maxHp}`),
				h(
					"div",
					{ class: "vitals-bottom" },
					h("span", { class: "block-chip", title: "Block absorbs damage until the enemy has acted" }, "🛡️ ", h("b", { text: s.block }), " Block"),
					h("span", { class: "energy-pips", title: "Energy" }, pips, h("small", { text: `${s.energy}/${energyMax}` }))
				)
			)
		);

		if (en && s.phase !== "dead") {
			const prev = Combat.intentPreview(s);
			const status = [];
			if (en.burn) status.push(chip(`🔥 ${en.burn}`, "chip-burn", "Burn: damage at the start of its turn, then fades by 1"));
			if (en.chill) status.push(chip("❄️ Chilled", "chip-chill", "Its next attack is 40% weaker"));
			if (en.stunned) status.push(chip("💫 Stunned", "chip-stun", "It will skip its next action"));
			if (en.rage) status.push(chip(`😡 +${en.rage}`, "chip-rage", "Enraged: extra damage on every attack"));
			if (en.block) status.push(chip(`🛡️ ${en.block}`, "chip-blk", "Enemy block: strike through it first"));

			let intent;
			if (s.phase === "victory") {
				intent = h("div", { class: "intent done", text: "💀 Defeated" });
			} else if (prev.stunned) {
				intent = h("div", { class: "intent" }, h("span", { class: "intent-ico", text: "💫" }), h("div", {}, h("b", { text: "Stunned" }), h("small", { text: "It loses its next action." })));
			} else if (prev.type === "attack") {
				intent = h(
					"div",
					{ class: "intent attack" },
					h("span", { class: "intent-ico", text: "⚔️" }),
					h("div", {}, h("b", { text: prev.text }), h("small", { text: prev.net === 0 ? "Fully blocked right now ✔" : `Would deal ${prev.net} to you after ${s.block} Block` }))
				);
			} else {
				intent = h("div", { class: `intent ${prev.type}` }, h("span", { class: "intent-ico", text: prev.type === "block" ? "🛡️" : "😡" }), h("div", {}, h("b", { text: prev.text }), h("small", { text: prev.type === "block" ? "Gains Block you must break through" : "Gets stronger every turn" })));
			}

			root.append(
				h(
					"div",
					{ class: `stage${en.boss ? " boss" : ""}${s.phase === "victory" ? " slain" : ""}`, id: "enemy-card" },
					h("div", { class: "enemy-sprite", text: en.icon }),
					h("div", { class: "enemy-info" }, h("div", { class: "enemy-name", text: en.name }), bar(en.hp, en.maxHp, "bar-enemy", `${en.hp} / ${en.maxHp}`), h("div", { class: "chip-row", style: "min-height:22px" }, status)),
					intent
				)
			);
		}

		if (s.phase === "fight") {
			root.append(
				h(
					"div",
					{ class: "btn-row" },
					btn("⚔️ Auto-turn  [Space]", "btn-primary", host.act.autoTurn, { title: "Raises just enough Block, then swings weapons by damage per energy. Never wastes scrolls or potions." }),
					btn("End turn  [Enter]", "btn-wood", host.act.endTurn)
				),
				h("p", { class: "help-line", text: "Click gear in your satchel to use it. Rearranging is free: touching a Whetstone mid-turn counts!" })
			);
			if (s.hints && s.hints.firstFight) {
				root.append(
					h(
						"div",
						{ class: "tip" },
						h("b", { text: "First fight? " }),
						"Click your dagger to attack, your buckler to guard, then end the turn. The enemy telegraphs its move above."
					)
				);
			}
		} else if (s.phase === "victory" && s.lastReward) {
			const r = s.lastReward;
			root.append(
				h(
					"div",
					{ class: "reward" },
					h("div", { class: "ribbon" }, h("span", { text: r.boss ? "BOSS SLAIN" : "VICTORY" })),
					h("div", { class: "reward-lines" }, h("span", { text: `🪙 +${r.gold}` }), h("span", { text: `⭐ +${r.rep}` }), r.healed ? h("span", { text: `💖 +${r.healed}` }) : null),
					r.rankUp ? h("div", { class: "rank-up", text: `🎉 New guild rank: ${r.rankUp}! Your next satchel starts with an extra slot.` }) : null,
					r.newDay ? h("div", { class: "rank-up soft", text: "🌅 A new day dawns: fresh orders and fresh stock." }) : null,
					h("div", { class: "loot-title", text: "Loot (moved to your desk)" }),
					h(
						"div",
						{ class: "loot-list" },
						r.loot.map((l) => {
							const def = ItemCatalog.get(l.id);
							return h("div", { class: `loot rarity-${def.rarity}`, title: def.name }, h("img", { src: ICON(def), alt: "" }), h("small", { text: l.sold ? `Desk full: sold ${l.sold}g` : def.name }));
						})
					),
					btn(`🏰 Descend to floor ${s.floor + 1}`, "btn-primary btn-wide", host.act.descend)
				)
			);
		} else if (s.phase === "dead") {
			root.append(
				h(
					"div",
					{ class: "reward defeat" },
					h("div", { class: "ribbon red" }, h("span", { text: "DEFEATED" })),
					h("p", { text: `You fell on floor ${s.floor}. Your reputation and puzzle stars are kept.` }),
					btn("Begin a new run", "btn-primary btn-wide", () => host.act.newRun(true))
				)
			);
		}

		root.append(
			h(
				"details",
				{ class: "log", open: s.phase !== "fight" ? "" : null },
				h("summary", { text: "Battle log" }),
				h("div", { class: "log-lines" }, s.log.slice(0, 10).map((l) => h("div", { text: l })))
			)
		);
		return root;
	}

	// ── Orders panel ─────────────────────────────────────────────────────────
	function innStrip(view) {
		const s = view.state;
		return h(
			"div",
			{ class: "inn" },
			h("span", { class: "inn-ico", text: "🛏️" }),
			h("div", {}, h("b", { text: "The Gilded Flagon Inn" }), h("small", { text: "Sleep until dawn: heal 50%, fresh orders, fresh stock." })),
			btn(`Rest ${Market.INN_COST}g`, "btn-wood btn-sm", host.act.rest, { disabled: s.gold < Market.INN_COST || s.phase === "dead" })
		);
	}

	function renderOrders(view) {
		const s = view.state;
		const list = s.orders.list;
		const order = list[s.orders.selected] || null;
		const root = h("div", { class: "orders" });
		root.append(h("div", { class: "delve-head" }, h("h2", { class: "panel-title", text: "Guild Orders" }), h("span", { class: "floor-tag", text: `Expire at day's end · Day ${s.day}` })));

		root.append(
			h(
				"div",
				{ class: "order-tabs" },
				list.map((o, i) =>
					h(
						"button",
						{
							type: "button",
							class: `order-tab${i === s.orders.selected ? " active" : ""}${o.sealed ? " sealed" : ""}`,
							onclick: () => host.act.selectOrder(i),
						},
						h("span", { class: "order-av", text: o.avatar }),
						h("span", { class: "order-nm", text: o.client.split(" (")[0] }),
						h("small", { text: o.sealed ? "✔ Sealed" : `🪙 ${o.gold}` })
					)
				)
			)
		);

		if (!order) return root;
		const check = Orders.evaluate(s, order);

		root.append(
			h(
				"div",
				{ class: `contract${order.sealed ? " is-sealed" : ""}` },
				h("div", { class: "contract-head" }, h("span", { class: "client-av", text: order.avatar }), h("div", {}, h("b", { class: "client-nm", text: order.client }), h("small", { text: `Pays ${order.gold}g · +${order.rep} reputation` }))),
				h("p", { class: "contract-quote", text: `“${order.note}”` }),
				h(
					"ul",
					{ class: "req-list" },
					check.lines.map((l) =>
						h("li", { class: l.ok ? "ok" : "no" }, h("span", { class: "req-mark", text: l.ok ? "✔" : "✖" }), h("span", { text: l.text }), h("em", { text: `${l.have}/${l.need}` }))
					)
				),
				check.ok && !order.sealed
					? h("div", { class: "payout", text: `Payout: ${check.total}g${check.tip ? ` (includes ${check.tip}g tip for surplus)` : ""}${check.bonusPct ? ` · +${Math.round(check.bonusPct * 100)}% crown bonus` : ""}` })
					: null,
				order.sealed ? h("div", { class: "seal-mark", text: "SEALED" }) : null
			)
		);

		const board = h("div", { class: "board-wrap satchel-board" });
		root.append(
			h("div", { class: "satchel-title", text: "🧰 Delivery satchel. Drag goods here; everything inside is handed over." }),
			board
		);
		renderGrid(board, s.satchel, "satchel", view);

		root.append(
			h(
				"div",
				{ class: "btn-row" },
				h(
					"button",
					{
						type: "button",
						class: "btn btn-wax",
						onclick: host.act.seal,
						disabled: order.sealed || !check.ok,
						title: order.sealed ? "Already sealed" : check.ok ? "Stamp it!" : "Requirements not met yet",
					},
					h("img", { src: "assets/ui/stamp-idle.png", alt: "", class: "stamp-img" }),
					order.sealed ? "Sealed" : "Seal contract"
				),
				btn("Return goods", "btn-wood", host.act.returnGoods, { disabled: !s.satchel.items.length })
			),
			innStrip(view)
		);
		return root;
	}

	// ── Market panel ─────────────────────────────────────────────────────────
	function waresSummary(def) {
		const parts = [];
		const st = def.stats;
		if (st.damage) parts.push(`⚔${st.damage}`);
		if (st.block) parts.push(`🛡${st.block}`);
		if (st.heal) parts.push(`💖${st.heal}`);
		if (st.restoreEnergy) parts.push(`⚡+${st.restoreEnergy}`);
		if (st.maxHp) parts.push(`❤+${st.maxHp}`);
		if (energyCostOf(def)) parts.push(`⚡${energyCostOf(def)}`);
		return parts.join("  ");
	}
	function energyCostOf(def) {
		return energyCost(def);
	}

	function renderMarket(view) {
		const s = view.state;
		const root = h("div", { class: "market" });
		const rerollCost = Market.rerollCost(s);
		root.append(
			h("div", { class: "delve-head" }, h("h2", { class: "panel-title", text: "Blacksmith Market" }), btn(`↻ Restock ${rerollCost}g`, "btn-wood btn-sm", host.act.restock, { disabled: s.gold < rerollCost })),
			h("p", { class: "help-line", text: `Day ${s.day} stock. Higher guild rank brings rarer wares and cheaper prices (${Math.round(Store.rankIndex(view.meta.rep) * 5)}% off).` })
		);
		const grid = h("div", { class: "wares" });
		s.shop.wares.forEach((w, i) => {
			const def = ItemCatalog.get(w.id);
			const cost = Market.price(w.id);
			const card = h(
				"div",
				{ class: `ware rarity-${def.rarity}${w.sold ? " sold" : ""}`, tabindex: "0", dataset: { ware: i } },
				h("img", { src: ICON(def), alt: "" }),
				h("div", { class: "ware-info" }, h("b", { text: def.name }), h("small", { text: `${ItemCatalog.CATEGORY_LABEL[def.category]} · ${ItemCatalog.shapeCellCount(def.shape)} slot${ItemCatalog.shapeCellCount(def.shape) === 1 ? "" : "s"}` }), h("small", { class: "ware-stats", text: waresSummary(def) })),
				btn(w.sold ? "Sold" : `🪙 ${cost}`, "btn-gold btn-sm ware-price", (e) => { e.stopPropagation(); host.act.buy(i); }, { disabled: w.sold || s.gold < cost })
			);
			card.addEventListener("pointerenter", () => setHover({ kind: "shop", index: i }));
			card.addEventListener("pointerleave", () => setHover(null));
			card.addEventListener("click", () => host.act.select({ kind: "shop", index: i }));
			grid.append(card);
		});
		root.append(grid);

		const open = s.bag.cells.filter((c) => c.type === "locked").length;
		root.append(
			h(
				"div",
				{ class: "slot-offer" },
				h("span", { class: "slot-ico", text: "🎒" }),
				h("div", {}, h("b", { text: open ? `Unlock a satchel slot: ${Market.unlockCost(s)}g` : "Your satchel is fully unlocked" }), h("small", { text: open ? "Click any 🔒 slot in your satchel. You choose where the space opens." : "Maximum capacity reached." }))
			),
			innStrip(view)
		);
		return root;
	}

	// ── Vault panel ──────────────────────────────────────────────────────────
	function renderVault(view) {
		const ps = view.puzzle;
		const root = h("div", { class: "vault" });
		root.append(h("div", { class: "delve-head" }, h("h2", { class: "panel-title", text: "Master Packer Vault" }), h("span", { class: "floor-tag", text: `${Puzzles.LIST.filter((p) => Puzzles.isSolved(p.id)).length}/${Puzzles.LIST.length} solved` })));
		root.append(
			h(
				"div",
				{ class: "levels" },
				Puzzles.LIST.map((p, i) =>
					h(
						"button",
						{
							type: "button",
							class: `level-btn${ps.puzzle.id === p.id ? " active" : ""}${Puzzles.isSolved(p.id) ? " solved" : ""}`,
							title: `${p.title} (${p.difficulty})`,
							onclick: () => host.act.selectPuzzle(i),
						},
						Puzzles.isSolved(p.id) ? "⭐" : String(p.id)
					)
				)
			)
		);
		const ev = Puzzles.evaluate(ps);
		root.append(
			h("div", { class: "puzzle-head" }, h("b", { class: "puzzle-title", text: ps.puzzle.title }), h("span", { class: `diff diff-${ps.puzzle.difficulty.toLowerCase()}`, text: ps.puzzle.difficulty })),
			h("p", { class: "help-line", text: ps.puzzle.desc }),
			h(
				"ul",
				{ class: "req-list" },
				h("li", { class: ev.allPlaced ? "ok" : "no" }, h("span", { class: "req-mark", text: ev.allPlaced ? "✔" : "✖" }), h("span", { text: "Pack every relic" }), h("em", { text: `${ev.placed}/${ev.total}` })),
				ev.goals.map((g) => h("li", { class: g.ok ? "ok" : "no" }, h("span", { class: "req-mark", text: g.ok ? "✔" : "✖" }), h("span", { text: `${g.label} ≥ ${g.min}` }), h("em", { text: `${g.have}/${g.min}` })))
			)
		);
		const board = h("div", { class: "board-wrap puzzle-board" });
		root.append(board);
		renderGrid(board, ps.grid, "puzzle", view);

		if (view.hintTarget) {
			// Paint the hint on top of the freshly built grid
			const gridEl = board.querySelector(".grid-container");
			const t = view.hintTarget;
			for (let r = 0; r < t.shape.length; r++) {
				for (let c = 0; c < t.shape[0].length; c++) {
					if (!t.shape[r][c]) continue;
					const cell = gridEl.children[(t.row + r) * ps.grid.cols + (t.col + c)];
					if (cell) cell.classList.add("hint");
				}
			}
		}

		root.append(
			h("div", { class: "pool-title", text: ps.pool.length ? "Relics still to pack" : "Every relic is on the board" }),
			h(
				"div",
				{ class: "pool", dataset: { drop: "pool" } },
				ps.pool.map((p) => {
					const def = ItemCatalog.get(p.id);
					const sel = view.selected && view.selected.kind === "pool" && view.selected.uid === p.uid;
					return h(
						"div",
						{ class: `desk-card rarity-${def.rarity}${sel ? " selected" : ""}`, dataset: { uid: p.uid, src: "pool", drag: "1" }, tabindex: "0", role: "button", "aria-label": def.name },
						h("img", { src: ICON(def), alt: "", draggable: "false" }),
						h("div", { class: "desk-card-info" }, h("b", { text: def.name }), h("small", { text: `${ItemCatalog.shapeCellCount(def.shape)} slot${ItemCatalog.shapeCellCount(def.shape) === 1 ? "" : "s"}` }))
					);
				})
			)
		);

		const solvedNow = ps.solved || ev.solved;
		root.append(
			solvedNow ? h("div", { class: "solved-banner", text: Puzzles.isSolved(ps.puzzle.id) && !ev.solved ? "⭐ Solved before. Try it again if you like." : "⭐ Solved!" }) : null,
			h(
				"div",
				{ class: "btn-row" },
				btn("💡 Hint", "btn-wood", host.act.hintPuzzle, { title: "Shows where one relic belongs" }),
				btn("↺ Reset", "btn-wood", host.act.resetPuzzle),
				btn("Next ▶", solvedNow ? "btn-primary" : "btn-wood", host.act.nextPuzzle, { disabled: ps.puzzle.id >= Puzzles.LIST.length })
			)
		);
		return root;
	}

	// ── master render ────────────────────────────────────────────────────────
	function render() {
		const view = host.view();
		renderHud(view);
		const calc = renderGrid(el.bagBoard, view.state.bag, "bag", view);
		renderStats(view, calc);
		renderDesk(view);
		renderInspector(view);
		renderTabs(view);

		let body;
		if (view.mode === "orders") body = renderOrders(view);
		else if (view.mode === "market") body = renderMarket(view);
		else if (view.mode === "vault") body = renderVault(view);
		else body = renderDelve(view);
		el.modeBody.replaceChildren(body);
	}

	// ── hover highlighting (no re-render) ────────────────────────────────────
	function setFocus(itemEl, on) {
		const board = itemEl.closest(".grid-container");
		if (!board) return;
		const uid = itemEl.dataset.uid;
		board.querySelectorAll(".link").forEach((ln) => {
			const hit = ln.dataset.from === uid || ln.dataset.to === uid;
			ln.classList.toggle("hot", on && hit);
			if (hit) {
				const other = ln.dataset.from === uid ? ln.dataset.to : ln.dataset.from;
				const node = board.querySelector(`.item[data-uid="${other}"]`);
				if (node) node.classList.toggle("partner", on);
			}
		});
		itemEl.classList.toggle("focus", on);
	}

	function bindHover() {
		document.addEventListener("pointerover", (e) => {
			if (Drag.active() || e.pointerType === "touch") return;
			const node = e.target.closest("[data-drag]");
			if (!node || node === bindHover.last) return;
			bindHover.last = node;
			if (node.classList.contains("item")) setFocus(node, true);
			setHover({ kind: node.dataset.src, uid: node.dataset.uid });
		});
		document.addEventListener("pointerout", (e) => {
			const node = e.target.closest("[data-drag]");
			if (!node) return;
			if (e.relatedTarget && node.contains(e.relatedTarget)) return;
			if (bindHover.last === node) bindHover.last = null;
			if (node.classList.contains("item")) setFocus(node, false);
			setHover(null);
		});
	}

	// ── toasts, modals, floaters ─────────────────────────────────────────────
	function toast(text, opts = {}) {
		const t = h("div", { class: `toast ${opts.type || "info"}`, role: "status" }, h("span", { text }));
		if (opts.actionLabel) {
			t.append(
				h("button", { type: "button", class: "toast-action", onclick: () => { opts.onAction(); t.remove(); } }, opts.actionLabel)
			);
		}
		el.toasts.append(t);
		while (el.toasts.children.length > 4) el.toasts.firstChild.remove();
		setTimeout(() => {
			t.classList.add("out");
			setTimeout(() => t.remove(), 300);
		}, opts.ms || 3200);
	}

	function modal(opts) {
		const close = () => backdrop.remove();
		const backdrop = h(
			"div",
			{ class: "modal-backdrop", onclick: (e) => { if (e.target === backdrop && opts.dismissible !== false) close(); } },
			h(
				"div",
				{ class: `modal ${opts.cls || ""}`, role: "dialog", "aria-modal": "true", "aria-label": opts.title },
				h("h2", { text: opts.title }),
				h("div", { class: "modal-body" }, opts.body),
				h(
					"div",
					{ class: "btn-row" },
					(opts.actions || [{ label: "Close", kind: "btn-wood" }]).map((a) =>
						btn(a.label, a.kind || "btn-wood", () => { close(); if (a.onClick) a.onClick(); })
					)
				)
			)
		);
		document.body.append(backdrop);
		const first = backdrop.querySelector(".btn");
		if (first) first.focus();
		return close;
	}

	function floater(target, text, cls) {
		if (!target) return;
		const f = h("span", { class: `floater ${cls}`, text });
		target.append(f);
		setTimeout(() => f.remove(), 1000);
	}

	function playEvents(events) {
		const enemy = document.getElementById("enemy-card");
		const player = document.getElementById("player-card");
		for (const ev of events) {
			const target = ev.side === "enemy" ? enemy : player;
			if (!target) continue;
			if (ev.kind === "hit") {
				if (ev.value > 0) floater(target, `-${ev.value}`, ev.thorns ? "f-thorn" : "f-hit");
				else if (ev.absorbed) floater(target, "Blocked", "f-block");
				target.classList.remove("shake");
				void target.offsetWidth;
				target.classList.add("shake");
			} else if (ev.kind === "crit") floater(target, "CRIT!", "f-crit");
			else if (ev.kind === "heal") floater(target, `+${ev.value}`, "f-heal");
			else if (ev.kind === "block") floater(target, `🛡${ev.value}`, "f-block");
			else if (ev.kind === "burn") floater(target, `🔥${ev.value}`, "f-burn");
			else if (ev.kind === "dodge") floater(target, "Dodged!", "f-block");
			else if (ev.kind === "stun") floater(target, "Stunned!", "f-crit");
			else if (ev.kind === "buff") floater(target, `${ev.label || "↑"}${ev.value}`, "f-buff");
		}
	}

	function stampFlash() {
		const c = document.querySelector(".contract");
		if (!c) return;
		const s = h("img", { class: "stamp-flash", src: "assets/ui/stamp-mark.png", alt: "" });
		c.append(s);
		setTimeout(() => s.remove(), 900);
	}

	function init(hostApi) {
		host = hostApi;
		el.hud = document.getElementById("hud");
		el.bagBoard = document.getElementById("bag-board");
		el.stats = document.getElementById("stat-strip");
		el.inspector = document.getElementById("inspector");
		el.deskRack = document.getElementById("desk-rack");
		el.deskCount = document.getElementById("desk-count");
		el.tabs = document.getElementById("mode-tabs");
		el.modeBody = document.getElementById("mode-body");
		el.toasts = document.getElementById("toasts");
		bindHover();
	}

	return {
		init,
		render,
		toast,
		modal,
		playEvents,
		stampFlash,
		h,
		setHover,
	};
})();
