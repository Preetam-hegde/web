/**
 * Bag & Blade: Inventory Grid Engine
 * Tetris-style packing, rotation, pockets, and the adjacency-synergy calculator.
 *
 * A grid is described by a layout, one string per row:
 *   '.' open cell   'L' locked (buy in Market)   '#' blocked (puzzle holes)
 *   'h' potion holster pocket   'q' quiver pocket
 * Placed items are plain records { uid, id, col, row, shape }; the item data itself
 * always comes from ItemCatalog so records stay tiny and save cleanly.
 */
"use strict";

const Grid = (function () {
	const POCKETS = {
		holster: {
			label: "Potion Holster",
			text: "Potions in a holster slot heal +6 more",
			match: (def) => def.category === "potion",
			bonus: { heal: 6 },
		},
		quiver: {
			label: "Quiver Pocket",
			text: "Ranged weapons in a quiver slot deal +4 damage",
			match: (def) => def.tags.indexOf("ranged") !== -1,
			bonus: { damage: 4 },
		},
	};

	const CELL_TYPE_BY_CHAR = {
		".": "normal",
		L: "locked",
		"#": "blocked",
		h: "holster",
		q: "quiver",
	};
	const CHAR_BY_CELL_TYPE = {};
	for (const ch of Object.keys(CELL_TYPE_BY_CHAR)) {
		CHAR_BY_CELL_TYPE[CELL_TYPE_BY_CHAR[ch]] = ch;
	}

	/** Rough "stat points" each bonus is worth. Drives the Synergy Bonus total. */
	const POINT_WEIGHT = {
		damage: 1,
		block: 1,
		heal: 0.5,
		burn: 1,
		thorns: 1,
		pierce: 1,
		strength: 3,
		restoreEnergy: 4,
		energyBonus: 6,
		chill: 4,
		lifesteal: 1,
		maxHp: 0.5,
		regen: 2,
		crit: 20,
		dodge: 20,
		stun: 20,
		value: 0.1,
		valuePct: 20,
	};

	function pointsFor(bonus) {
		let p = 0;
		for (const [k, v] of Object.entries(bonus)) p += (POINT_WEIGHT[k] || 0) * v;
		return p;
	}

	function Grid(options) {
		const layout = options.layout;
		this.rows = layout.length;
		this.cols = layout[0].length;
		this.cells = [];
		for (let r = 0; r < this.rows; r++) {
			for (let c = 0; c < this.cols; c++) {
				this.cells.push({
					col: c,
					row: r,
					type: CELL_TYPE_BY_CHAR[layout[r][c]] || "normal",
					uid: null,
				});
			}
		}
		this.items = [];
	}

	Grid.POCKETS = POCKETS;

	Grid.prototype.layoutStrings = function () {
		const out = [];
		for (let r = 0; r < this.rows; r++) {
			let line = "";
			for (let c = 0; c < this.cols; c++) {
				line += CHAR_BY_CELL_TYPE[this.cells[r * this.cols + c].type];
			}
			out.push(line);
		}
		return out;
	};

	Grid.prototype.getCell = function (c, r) {
		if (c < 0 || c >= this.cols || r < 0 || r >= this.rows) return null;
		return this.cells[r * this.cols + c];
	};

	Grid.prototype.isOpen = function (c, r) {
		const cell = this.getCell(c, r);
		return !!cell && cell.type !== "locked" && cell.type !== "blocked";
	};

	Grid.prototype.get = function (uid) {
		return this.items.find((it) => it.uid === uid) || null;
	};

	Grid.prototype.countOpenCells = function () {
		return this.cells.filter((c) => c.type !== "locked" && c.type !== "blocked")
			.length;
	};

	Grid.prototype.countFreeCells = function () {
		return this.cells.filter(
			(c) => c.type !== "locked" && c.type !== "blocked" && !c.uid,
		).length;
	};

	Grid.prototype.canPlace = function (shape, col, row, ignoreUid) {
		for (let r = 0; r < shape.length; r++) {
			for (let c = 0; c < shape[0].length; c++) {
				if (!shape[r][c]) continue;
				const cell = this.getCell(col + c, row + r);
				if (!cell) return false;
				if (cell.type === "locked" || cell.type === "blocked") return false;
				if (cell.uid && cell.uid !== ignoreUid) return false;
			}
		}
		return true;
	};

	Grid.prototype.place = function (uid, id, col, row, shape) {
		const def = ItemCatalog.get(id);
		if (!def) return null;
		const s = ItemCatalog.cloneShape(shape || def.shape);
		if (this.get(uid) || !this.canPlace(s, col, row, null)) return null;
		for (let r = 0; r < s.length; r++) {
			for (let c = 0; c < s[0].length; c++) {
				if (s[r][c]) this.getCell(col + c, row + r).uid = uid;
			}
		}
		const record = { uid, id, col, row, shape: s };
		this.items.push(record);
		return record;
	};

	Grid.prototype.remove = function (uid) {
		const index = this.items.findIndex((it) => it.uid === uid);
		if (index === -1) return null;
		const removed = this.items.splice(index, 1)[0];
		for (const cell of this.cells) if (cell.uid === uid) cell.uid = null;
		return removed;
	};

	/** Atomically move/reshape a placed item. Leaves the grid untouched on failure. */
	Grid.prototype.move = function (uid, col, row, shape) {
		const rec = this.get(uid);
		if (!rec) return false;
		if (!this.canPlace(shape, col, row, uid)) return false;
		this.remove(uid);
		return !!this.place(uid, rec.id, col, row, shape);
	};

	/**
	 * Rotate a placed item 90deg clockwise about its centre. If that collides it tries
	 * the nearest legal nudge so rotating next to an edge or a neighbour still works.
	 */
	Grid.prototype.rotate = function (uid) {
		const rec = this.get(uid);
		if (!rec) return false;
		const rotated = ItemCatalog.rotateShape(rec.shape);
		const baseCol =
			rec.col + Math.floor((rec.shape[0].length - rotated[0].length) / 2);
		const baseRow = rec.row + Math.floor((rec.shape.length - rotated.length) / 2);

		const offsets = [];
		for (let dr = -2; dr <= 2; dr++) {
			for (let dc = -2; dc <= 2; dc++) {
				offsets.push({ dc, dr, d: Math.abs(dc) + Math.abs(dr) });
			}
		}
		offsets.sort((a, b) => a.d - b.d);

		for (const o of offsets) {
			if (this.canPlace(rotated, baseCol + o.dc, baseRow + o.dr, uid)) {
				return this.move(uid, baseCol + o.dc, baseRow + o.dr, rotated);
			}
		}
		return false;
	};

	/** First legal spot for an item in any orientation, scanning top-left first. */
	Grid.prototype.findSpot = function (id) {
		const def = ItemCatalog.get(id);
		if (!def) return null;
		const rotations = ItemCatalog.uniqueRotations(def.shape);
		for (let r = 0; r < this.rows; r++) {
			for (let c = 0; c < this.cols; c++) {
				for (const shape of rotations) {
					if (this.canPlace(shape, c, r, null)) return { col: c, row: r, shape };
				}
			}
		}
		return null;
	};

	Grid.prototype.unlock = function (col, row) {
		const cell = this.getCell(col, row);
		if (cell && cell.type === "locked") {
			cell.type = "normal";
			return true;
		}
		return false;
	};

	Grid.prototype.clearItems = function () {
		this.items = [];
		for (const cell of this.cells) cell.uid = null;
	};

	Grid.prototype.toJSON = function () {
		return {
			layout: this.layoutStrings(),
			items: this.items.map((it) => ({
				uid: it.uid,
				id: it.id,
				col: it.col,
				row: it.row,
				shape: it.shape,
			})),
		};
	};

	/** Rebuilds a grid; returns { grid, rejected } where rejected are un-placeable items. */
	Grid.fromJSON = function (json) {
		const grid = new Grid({ layout: json.layout });
		const rejected = [];
		for (const it of json.items || []) {
			if (!grid.place(it.uid, it.id, it.col, it.row, it.shape)) {
				if (ItemCatalog.get(it.id)) rejected.push({ uid: it.uid, id: it.id });
			}
		}
		return { grid, rejected };
	};

	/**
	 * Resolves every adjacency synergy, pocket bonus and open-edge bonus.
	 *
	 * Returns {
	 *   items:  { uid -> { uid, id, def, base, eff, notes, active, neighbors, open, points } },
	 *   links:  [{ from, to }]  giver -> receiver pairs, for drawing the web,
	 *   totals: { attack, guard, armor, heal, value, bonus, maxHp, ... }
	 * }
	 */
	Grid.prototype.calculate = function () {
		const items = {};
		const owner = new Map();
		const ordered = this.items
			.slice()
			.sort((a, b) => a.row - b.row || a.col - b.col);

		for (const rec of ordered) {
			const def = ItemCatalog.get(rec.id);
			const base = Object.assign({}, def.stats);
			items[rec.uid] = {
				uid: rec.uid,
				id: rec.id,
				def,
				rec,
				base,
				eff: Object.assign({}, base),
				notes: [],
				active: new Set(),
				neighbors: [],
				open: 0,
				points: 0,
			};
			for (let r = 0; r < rec.shape.length; r++) {
				for (let c = 0; c < rec.shape[0].length; c++) {
					if (rec.shape[r][c]) owner.set(`${rec.col + c},${rec.row + r}`, rec.uid);
				}
			}
		}

		const DIRS = [
			[1, 0],
			[-1, 0],
			[0, 1],
			[0, -1],
		];
		for (const rec of ordered) {
			const data = items[rec.uid];
			const near = new Set();
			const open = new Set();
			for (let r = 0; r < rec.shape.length; r++) {
				for (let c = 0; c < rec.shape[0].length; c++) {
					if (!rec.shape[r][c]) continue;
					for (const [dc, dr] of DIRS) {
						const nc = rec.col + c + dc;
						const nr = rec.row + r + dr;
						const key = `${nc},${nr}`;
						const other = owner.get(key);
						if (other) {
							if (other !== rec.uid) near.add(other);
						} else if (this.isOpen(nc, nr)) {
							open.add(key);
						}
					}
				}
			}
			data.neighbors = Array.from(near).sort((a, b) => {
				const ra = items[a].rec;
				const rb = items[b].rec;
				return ra.row - rb.row || ra.col - rb.col;
			});
			data.open = open.size;
		}

		const links = [];
		let power = 0;

		function apply(target, bonus, sourceName) {
			for (const [k, v] of Object.entries(bonus)) {
				target.eff[k] = (target.eff[k] || 0) + v;
			}
			const pts = pointsFor(bonus);
			target.points += pts;
			power += pts;
			target.notes.push(`${ItemCatalog.formatBonus(bonus)} from ${sourceName}`);
		}

		for (const rec of ordered) {
			const data = items[rec.uid];
			const def = data.def;

			def.synergies.forEach((syn, index) => {
				let matches = data.neighbors.filter((n) =>
					ItemCatalog.matchesFilter(items[n].def, syn.with),
				);
				if (syn.max) matches = matches.slice(0, syn.max);
				for (const n of matches) {
					const other = items[n];
					if (syn.to === "neighbor") {
						apply(other, syn.bonus, def.name);
						links.push({ from: data.uid, to: other.uid });
					} else {
						apply(data, syn.bonus, other.def.name);
						links.push({ from: other.uid, to: data.uid });
					}
					data.active.add(index);
				}
			});

			if (def.openEdge && data.open > 0) {
				const n = Math.min(data.open, def.openEdge.max);
				const bonus = {};
				for (const [k, v] of Object.entries(def.openEdge.bonus)) bonus[k] = v * n;
				apply(data, bonus, `${n} empty slot${n === 1 ? "" : "s"}`);
				data.active.add("open");
			}

			const covered = new Set();
			for (let r = 0; r < rec.shape.length; r++) {
				for (let c = 0; c < rec.shape[0].length; c++) {
					if (!rec.shape[r][c]) continue;
					const cell = this.getCell(rec.col + c, rec.row + r);
					if (cell && POCKETS[cell.type]) covered.add(cell.type);
				}
			}
			for (const type of covered) {
				const pocket = POCKETS[type];
				if (pocket.match(def)) {
					apply(data, pocket.bonus, pocket.label);
					data.active.add("pocket:" + type);
				}
			}
		}

		const totals = {
			attack: 0,
			guard: 0,
			armor: 0,
			heal: 0,
			value: 0,
			bonus: 0,
			maxHp: 0,
			energyBonus: 0,
			regen: 0,
			dodge: 0,
			strength: 0,
			lootBonus: 0,
			lootLuck: 0,
			orderBonusPct: 0,
			count: ordered.length,
		};

		for (const data of Object.values(items)) {
			const e = data.eff;
			e.value = Math.round((e.value || 0) * (1 + (e.valuePct || 0)));
			const use = data.def.use;
			if (use === "attack" || use === "cast") totals.attack += e.damage || 0;
			if (use === "guard" || use === "drink") totals.guard += e.block || 0;
			if (use === "passive") totals.armor += e.block || 0;
			if (use === "drink" || use === "eat" || use === "cast")
				totals.heal += e.heal || 0;
			totals.value += e.value;
			for (const key of [
				"maxHp",
				"energyBonus",
				"regen",
				"dodge",
				"lootBonus",
				"lootLuck",
				"orderBonusPct",
			]) {
				totals[key] += e[key] || 0;
			}
			if (use === "passive") totals.strength += e.strength || 0;
		}
		totals.dodge = Math.min(0.6, totals.dodge);
		totals.bonus = Math.round(power);

		return { items, links, totals };
	};

	return Grid;
})();
