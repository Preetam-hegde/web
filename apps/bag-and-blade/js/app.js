/**
 * Bag & Blade: Application Controller
 * Owns the run state and every player action. Rules live in the engine modules, drawing
 * lives in ui.js, pointer handling in drag.js. This file glues the three together.
 */
"use strict";

(function () {
	const MODES = ["delve", "orders", "market", "vault"];

	let state = null;
	let mode = "delve";
	let selected = null;
	let puzzle = null;
	let hintTarget = null;
	let lastSale = null;
	let dirtyWhileDragging = false;
	let deadShown = false;
	let clearShown = false;
	let lastDeskTap = { uid: null, at: 0 };

	const h = UI.h;

	function view() {
		return { state, meta: Store.meta, mode, selected, puzzle, hintTarget };
	}

	function sfx(name) {
		Store.sfx(name);
	}

	function commit(opts) {
		if (!opts || opts.save !== false) Store.save(state);
		if (Drag.active()) {
			dirtyWhileDragging = true;
			return;
		}
		UI.render();
		const events = Combat.drainEvents();
		if (mode === "delve") UI.playEvents(events);
		checkEndStates();
	}

	function toast(text, type, extra) {
		UI.toast(text, Object.assign({ type: type || "info" }, extra || {}));
	}

	function fail(reason) {
		sfx("playInvalidDrop");
		toast(reason, "warn");
	}

	// ── grids and sources ────────────────────────────────────────────────────
	function gridFor(name) {
		if (name === "bag") return state.bag;
		if (name === "satchel") return state.satchel;
		if (name === "puzzle" && puzzle) return puzzle.grid;
		return null;
	}

	function removeFrom(kind, uid) {
		if (kind === "bag" || kind === "satchel" || kind === "puzzle") {
			const rec = gridFor(kind).remove(uid);
			return rec ? rec.id : null;
		}
		if (kind === "desk") {
			const i = state.desk.findIndex((d) => d.uid === uid);
			return i === -1 ? null : state.desk.splice(i, 1)[0].id;
		}
		if (kind === "pool") {
			const i = puzzle.pool.findIndex((d) => d.uid === uid);
			return i === -1 ? null : puzzle.pool.splice(i, 1)[0].id;
		}
		return null;
	}

	function afterChange(touchedBag) {
		if (touchedBag) Store.syncHp(state);
		if (mode === "vault") afterPuzzleChange();
	}

	function afterPuzzleChange() {
		hintTarget = null;
		puzzle.moves += 1;
		const ev = Puzzles.evaluate(puzzle);
		if (ev.solved && !puzzle.solved) {
			Puzzles.markSolved(puzzle);
			sfx("playVictoryFanfare");
			toast(`⭐ ${puzzle.puzzle.title} solved!${puzzle.hinted ? "" : " No hints used."}`, "success", { ms: 4500 });
		}
	}

	// ── drag & drop host ─────────────────────────────────────────────────────
	const dragHost = {
		getSource(kind, uid) {
			if (kind === "bag" || kind === "satchel" || kind === "puzzle") {
				const rec = gridFor(kind) && gridFor(kind).get(uid);
				return rec ? { id: rec.id, shape: rec.shape } : null;
			}
			if (kind === "desk") {
				const d = state.desk.find((x) => x.uid === uid);
				return d ? { id: d.id, shape: ItemCatalog.get(d.id).shape } : null;
			}
			if (kind === "pool" && puzzle) {
				const d = puzzle.pool.find((x) => x.uid === uid);
				return d ? { id: d.id, shape: ItemCatalog.get(d.id).shape } : null;
			}
			return null;
		},

		gridFor,

		canDrop(src, target) {
			const puzzleSrc = src.kind === "puzzle" || src.kind === "pool";
			if (target.type === "grid") {
				if (puzzleSrc !== (target.name === "puzzle")) return false;
				const grid = gridFor(target.name);
				const ignore = src.kind === target.name ? src.uid : null;
				return !!grid && grid.canPlace(src.shape, target.col, target.row, ignore);
			}
			switch (target.name) {
				case "sell":
					return src.kind === "bag" || src.kind === "satchel" || src.kind === "desk";
				case "desk":
					return (src.kind === "bag" || src.kind === "satchel") && state.desk.length < Store.DESK_CAP;
				case "pool":
					return src.kind === "puzzle";
				default:
					return false;
			}
		},

		drop(src, target) {
			if (target.type === "grid") {
				const dest = gridFor(target.name);
				if (src.kind === target.name) {
					dest.move(src.uid, target.col, target.row, src.shape);
				} else {
					const id = removeFrom(src.kind, src.uid);
					if (!dest.place(src.uid, id, target.col, target.row, src.shape)) {
						// Cannot happen after canDrop, but never lose an item
						if (src.kind === "desk") state.desk.push({ uid: src.uid, id });
						return;
					}
				}
				sfx("playItemPlace");
				selected = { kind: target.name, uid: src.uid };
				afterChange(src.kind === "bag" || target.name === "bag");
				commit();
				return;
			}
			if (target.name === "sell") {
				act.sellRef({ kind: src.kind, uid: src.uid });
			} else if (target.name === "desk") {
				const id = removeFrom(src.kind, src.uid);
				state.desk.push({ uid: src.uid, id });
				sfx("playItemPlace");
				selected = { kind: "desk", uid: src.uid };
				afterChange(src.kind === "bag");
				commit();
			} else if (target.name === "pool") {
				const id = removeFrom("puzzle", src.uid);
				puzzle.pool.push({ uid: src.uid, id });
				sfx("playItemPlace");
				afterChange(false);
				commit();
			}
		},

		dropInvalid(src, target) {
			sfx("playInvalidDrop");
			if (target.type === "drop" && target.name === "desk" && state.desk.length >= Store.DESK_CAP) {
				toast("Your desk is full. Sell or pack something first.", "warn");
			}
		},

		dragStart() {
			UI.setHover(null);
			sfx("playItemPickup");
		},

		dragEnd() {
			if (dirtyWhileDragging) {
				dirtyWhileDragging = false;
				commit({ save: false });
			}
		},

		tap(kind, uid, info) {
			const ref = { kind, uid };
			if (kind === "desk") {
				const now = Date.now();
				if (lastDeskTap.uid === uid && now - lastDeskTap.at < 380) {
					lastDeskTap = { uid: null, at: 0 };
					act.autoPack(uid);
					return;
				}
				lastDeskTap = { uid, at: now };
			}
			const wasSelected = selected && selected.kind === kind && selected.uid === uid;
			selected = ref;
			if (kind === "bag" && mode === "delve" && (info.pointerType !== "touch" || wasSelected)) {
				const res = Combat.useItem(state, uid);
				if (!res.ok && res.code !== "passive") {
					fail(res.reason);
				} else if (res.ok) {
					state.hints.firstFight = false;
				}
				commit();
				return;
			}
			commit({ save: false });
		},
	};

	// ── actions ──────────────────────────────────────────────────────────────
	const act = {
		setMode(m) {
			if (MODES.indexOf(m) === -1 || m === mode) return;
			mode = m;
			hintTarget = null;
			sfx("playItemPlace");
			commit({ save: false });
		},

		select(ref) {
			selected = ref;
			commit({ save: false });
		},

		autoTurn() {
			if (state.phase !== "fight") return;
			const n = Combat.autoTurn(state);
			if (!n) toast("Nothing left to swing. Click items yourself, or end the turn.", "info");
			state.hints.firstFight = false;
			commit();
		},

		endTurn() {
			if (state.phase !== "fight") return;
			Combat.endTurn(state);
			state.hints.firstFight = false;
			commit();
		},

		descend() {
			if (Combat.descend(state)) commit();
		},

		useItem(uid) {
			const res = Combat.useItem(state, uid);
			if (!res.ok) return fail(res.reason);
			state.hints.firstFight = false;
			if (selected && selected.uid === uid && !state.bag.get(uid)) selected = null;
			commit();
		},

		sellRef(ref) {
			if (ref.kind === "puzzle" || ref.kind === "pool") return;
			const def = (() => {
				const g = ref.kind === "desk" ? null : gridFor(ref.kind);
				const rec = g ? g.get(ref.uid) : state.desk.find((d) => d.uid === ref.uid);
				return rec ? ItemCatalog.get(rec.id) : null;
			})();
			const res = Market.sell(state, ref.kind, ref.uid);
			if (!res.ok) return fail(res.reason);
			sfx("playCoinClink");
			lastSale = { id: res.id, gold: res.gold };
			if (selected && selected.uid === ref.uid) selected = null;
			toast(`Sold ${def ? def.name : "item"} for ${res.gold}g`, "success", {
				actionLabel: "Undo",
				onAction: act.undoSale,
				ms: 5200,
			});
			afterChange(ref.kind === "bag");
			commit();
		},

		undoSale() {
			if (!lastSale) return;
			if (state.desk.length >= Store.DESK_CAP) return fail("Your desk is full, so the sale cannot be undone.");
			state.gold -= lastSale.gold;
			state.stats.goldEarned -= lastSale.gold;
			state.stats.sold -= 1;
			state.desk.push({ uid: Store.uid(state), id: lastSale.id });
			lastSale = null;
			sfx("playItemPlace");
			commit();
		},

		autoPack(uid) {
			const d = state.desk.find((x) => x.uid === uid);
			if (!d) return;
			const spot = state.bag.findSpot(d.id);
			if (!spot) return fail("No room in the satchel. Rearrange it, unlock a slot, or sell something.");
			state.desk.splice(state.desk.indexOf(d), 1);
			state.bag.place(d.uid, d.id, spot.col, spot.row, spot.shape);
			selected = { kind: "bag", uid: d.uid };
			sfx("playItemPlace");
			afterChange(true);
			commit();
		},

		toDesk(kind, uid) {
			if (state.desk.length >= Store.DESK_CAP) return fail("Your desk is full.");
			const id = removeFrom(kind, uid);
			if (!id) return;
			state.desk.push({ uid, id });
			selected = { kind: "desk", uid };
			sfx("playItemPlace");
			afterChange(kind === "bag");
			commit();
		},

		rotateRef(ref) {
			const grid = gridFor(ref.kind);
			if (!grid) return;
			if (!grid.rotate(ref.uid)) return fail("No room to rotate there.");
			sfx("playItemRotate");
			afterChange(false);
			commit();
		},

		unlockSlot(col, row) {
			if (mode !== "market") {
				toast("Slots are unlocked in the Market. Open that tab, then click a 🔒.", "info");
				return;
			}
			const res = Market.unlockSlot(state, col, row);
			if (!res.ok) return fail(res.reason);
			sfx("playCoinClink");
			toast(`Slot unlocked for ${res.cost}g`, "success");
			commit();
		},

		buy(index) {
			const res = Market.buy(state, index);
			if (!res.ok) return fail(res.reason);
			sfx("playCoinClink");
			selected = { kind: "desk", uid: res.uid };
			toast(`Bought ${ItemCatalog.get(state.shop.wares[index].id).name} for ${res.cost}g. It is on your desk.`, "success");
			commit();
		},

		restock() {
			const res = Market.restock(state, { free: false });
			if (!res.ok) return fail(res.reason);
			sfx("playCoinClink");
			commit();
		},

		rest() {
			const res = Market.rest(state);
			if (!res.ok) return fail(res.reason);
			sfx("playPotionGulp");
			toast(`You sleep soundly: +${res.healed} HP. A new day begins.`, "success");
			commit();
		},

		selectOrder(i) {
			state.orders.selected = i;
			commit();
		},

		seal() {
			const order = state.orders.list[state.orders.selected];
			if (!order) return;
			const res = Orders.seal(state, order.id);
			if (!res.ok) return fail(res.reason);
			sfx("playWaxStamp");
			setTimeout(() => sfx("playCoinClink"), 150);
			toast(`Contract sealed: +${res.gold}g${res.tip ? ` (tip ${res.tip}g)` : ""}, +${res.rep} reputation`, "success");
			if (res.rankUp) toast(`🎉 New guild rank: ${res.rankUp}!`, "success", { ms: 4500 });
			if (res.newDay) toast("🌅 A new day dawns: fresh orders and fresh stock.", "info");
			commit();
			UI.stampFlash();
		},

		returnGoods() {
			const res = Orders.returnSatchel(state);
			if (res.moved) sfx("playItemPlace");
			if (res.left) toast(`${res.left} item${res.left === 1 ? "" : "s"} did not fit anywhere. Make room first.`, "warn");
			afterChange(true);
			commit();
		},

		selectPuzzle(i) {
			loadPuzzle(i);
			commit({ save: false });
		},

		resetPuzzle() {
			loadPuzzle(puzzleIndex());
			commit({ save: false });
		},

		hintPuzzle() {
			const t = Puzzles.hint(puzzle);
			if (!t) return toast("Every relic already sits in its solution spot.", "info");
			hintTarget = t;
			puzzle.hinted = true;
			toast(`Hint: ${ItemCatalog.get(t.id).name} belongs in the glowing slots.`, "info");
			commit({ save: false });
		},

		nextPuzzle() {
			const i = puzzleIndex();
			if (i < Puzzles.LIST.length - 1) loadPuzzle(i + 1);
			commit({ save: false });
		},

		newRun(skipConfirm) {
			const go = () => {
				Store.clearRun();
				state = Store.newRun();
				mode = "delve";
				selected = null;
				lastSale = null;
				deadShown = false;
				clearShown = false;
				commit();
				toast("A new run begins. Your reputation carries over.", "info");
			};
			if (skipConfirm || state.phase === "dead") return go();
			UI.modal({
				title: "Abandon this run?",
				body: h("p", { text: "Your gold, satchel and dungeon floor will be lost. Reputation, rank and puzzle stars are kept." }),
				actions: [{ label: "Keep playing" }, { label: "Start over", kind: "btn-danger", onClick: go }],
			});
		},
	};

	// ── puzzles ──────────────────────────────────────────────────────────────
	function puzzleIndex() {
		return Puzzles.LIST.findIndex((p) => p.id === puzzle.puzzle.id);
	}

	function loadPuzzle(i) {
		const idx = Math.max(0, Math.min(Puzzles.LIST.length - 1, i));
		puzzle = Puzzles.create(Puzzles.LIST[idx]);
		hintTarget = null;
		selected = null;
	}

	// ── modals ───────────────────────────────────────────────────────────────
	function showHelp() {
		const li = (t) => h("li", {}, t);
		UI.modal({
			title: "How to play",
			cls: "modal-wide",
			body: h(
				"div",
				{ class: "howto" },
				h("p", { text: "You are a guild quartermaster. Your satchel is both your inventory and your battle deck: where an item sits decides how strong it is." }),
				h(
					"ul",
					{},
					li("Drag items to arrange them. Press R or right-click to rotate. Tap/click an item to inspect it."),
					li("Items that touch can power each other up. A Whetstone makes touching weapons hit harder, a Coin Purse makes touching gems sell for more. Hunt for the ✦ sparkle."),
					li("🧪 Holster and 🏹 quiver slots give potions and ranged weapons a bonus. 🔒 slots unlock in the Market."),
					li("⚔️ Delve: click weapons, shields and scrolls to spend Energy. Potions and food are free but single-use. Armor works by itself. Rearranging mid-battle is free."),
					li("📜 Orders: pack the satchel with what each client asks for, then seal the contract. Everything inside is handed over."),
					li("🛒 Market: buy gear, unlock satchel slots, sell with the Merchant's Scale. 🧩 Vault: packing puzzles with hints."),
					li("Fights and sealed orders spend time. Five slots make a day, and each new day brings fresh orders and stock.")
				),
				h("p", { class: "dim", text: "Hotkeys: 1–4 tabs · Space auto-turn · Enter end turn · R rotate · M mute · Esc cancel a drag." })
			),
			actions: [{ label: "Got it. Let's go", kind: "btn-primary" }],
		});
	}

	function showDead() {
		deadShown = true;
		const s = state.stats;
		const rank = Store.rankInfo(Store.meta.rep);
		UI.modal({
			title: "Your run has ended",
			body: h(
				"div",
				{ class: "howto" },
				h("p", { text: `You fell on floor ${state.floor}, having slain ${s.kills} monster${s.kills === 1 ? "" : "s"}.` }),
				h(
					"ul",
					{ class: "summary" },
					h("li", { text: `🪙 Gold earned: ${s.goldEarned}` }),
					h("li", { text: `📜 Orders sealed: ${s.ordersSealed}` }),
					h("li", { text: `🏰 Deepest floor ever: ${Store.meta.bestFloor}` }),
					h("li", { text: `⭐ Guild rank: ${rank.name} (${rank.rep} reputation, kept)` })
				)
			),
			dismissible: false,
			actions: [{ label: "Begin a new run", kind: "btn-primary", onClick: () => act.newRun(true) }],
		});
	}

	function showCleared() {
		clearShown = true;
		UI.modal({
			title: "The Wyrm is slain!",
			body: h("p", { text: "The Ancient Wyrm's lair falls silent. You have conquered the dungeon, earning a hoard of gold and a legendary reputation. The depths go on if you dare." }),
			dismissible: false,
			actions: [
				{ label: "Keep delving", kind: "btn-primary" },
				{ label: "New run", kind: "btn-wood", onClick: () => act.newRun(true) },
			],
		});
	}

	function checkEndStates() {
		if (state.phase === "dead" && !deadShown) setTimeout(showDead, 500);
		if (state.lastReward && state.lastReward.firstClear && !clearShown) setTimeout(showCleared, 500);
	}

	// ── keyboard & mouse extras ──────────────────────────────────────────────
	function hotRef() {
		const hovered = document.querySelector("[data-drag]:hover");
		if (hovered) return { kind: hovered.dataset.src, uid: hovered.dataset.uid };
		return selected;
	}

	function bindInput() {
		document.addEventListener("keydown", (e) => {
			if (e.ctrlKey || e.metaKey || e.altKey) return;
			if (document.querySelector(".modal-backdrop")) {
				return;
			}
			const inField = e.target.matches("input, textarea, select");
			if (inField) return;
			const onButton = e.target.tagName === "BUTTON";

			if (e.key === "Escape") {
				if (Drag.active()) Drag.cancel();
				else if (selected) {
					selected = null;
					commit({ save: false });
				}
			} else if (e.key === "r" || e.key === "R") {
				e.preventDefault();
				if (Drag.active()) {
					Drag.rotate();
					sfx("playItemRotate");
				} else {
					const ref = hotRef();
					if (ref && (ref.kind === "bag" || ref.kind === "satchel" || ref.kind === "puzzle")) act.rotateRef(ref);
				}
			} else if (e.code === "Space" && mode === "delve" && !onButton && !e.target.closest("[data-drag]")) {
				e.preventDefault();
				act.autoTurn();
			} else if (e.key === "Enter" && mode === "delve" && !onButton && !e.target.closest("[data-drag]")) {
				act.endTurn();
			} else if (e.key >= "1" && e.key <= "4") {
				act.setMode(MODES[Number(e.key) - 1]);
			} else if (e.key === "m" || e.key === "M") {
				toggleSound();
			} else if (e.key === "?") {
				showHelp();
			} else if ((e.key === "Enter" || e.code === "Space") && e.target.closest("[data-drag]")) {
				e.preventDefault();
				const node = e.target.closest("[data-drag]");
				dragHost.tap(node.dataset.src, node.dataset.uid, { pointerType: "keyboard" });
			}
		});

		document.addEventListener("contextmenu", (e) => {
			if (Drag.active()) {
				e.preventDefault();
				Drag.rotate();
				sfx("playItemRotate");
				return;
			}
			const node = e.target.closest(".item[data-drag]");
			if (node) {
				e.preventDefault();
				act.rotateRef({ kind: node.dataset.src, uid: node.dataset.uid });
			}
		});

		// Buttons should not keep focus, or Space would press them again
		document.addEventListener("click", (e) => {
			const b = e.target.closest("button");
			if (b && !b.closest(".modal")) b.blur();
		});

		// First user gesture wakes the audio context
		document.addEventListener(
			"pointerdown",
			() => {
				if (window.SoundController && SoundController.initAudio) SoundController.initAudio();
			},
			{ once: true }
		);
	}

	function toggleSound() {
		if (!window.SoundController) return;
		const muted = SoundController.toggleMute();
		updateSoundButton(muted);
		toast(muted ? "Sound off" : "Sound on", "info", { ms: 1200 });
	}

	function updateSoundButton(muted) {
		const b = document.getElementById("btn-sound");
		b.textContent = muted ? "🔇" : "🔊";
		b.classList.toggle("off", muted);
	}

	// ── boot ─────────────────────────────────────────────────────────────────
	function init() {
		Store.loadMeta();
		state = Store.load();
		if (!state) state = Store.newRun();
		if (state.phase === "fight" && !state.enemy) Combat.startFight(state);
		const firstOpen = Puzzles.LIST.findIndex((p) => !Puzzles.isSolved(p.id));
		loadPuzzle(firstOpen === -1 ? 0 : firstOpen);

		UI.init({ view, act });
		Drag.init(dragHost);
		bindInput();

		document.getElementById("btn-help").addEventListener("click", showHelp);
		document.getElementById("btn-sound").addEventListener("click", toggleSound);
		document.getElementById("btn-newrun").addEventListener("click", () => act.newRun(false));
		if (window.SoundController) updateSoundButton(SoundController.isMutedState());

		// Dead runs reopen on their end screen; a hard refresh must not hide it
		deadShown = false;
		clearShown = state.cleared;
		commit({ save: false });
		if (!Store.meta.seenHelp) {
			Store.meta.seenHelp = true;
			Store.saveMeta();
			showHelp();
		}

		// Test hook, only with ?debug in the URL
		if (/[?&]debug\b/.test(location.search)) {
			window.__bb = {
				get state() {
					return state;
				},
				act,
				commit,
			};
		}
	}

	if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
	else init();
})();
