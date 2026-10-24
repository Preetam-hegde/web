/**
 * Bag & Blade: Pointer Drag & Drop
 * One controller for mouse, touch and pen. Instead of relying on mouseenter over cells
 * (which breaks the moment the pointer is over another item), it hit-tests from raw
 * pointer coordinates, keeps the cell you grabbed under the cursor, and snaps a preview.
 *
 * Draggable things carry data-drag, data-src="bag|satchel|puzzle|desk|pool", data-uid.
 * Boards carry data-grid="bag|satchel|puzzle"; other targets carry data-drop="sell|desk|pool".
 * The host (app.js) supplies the rules: getSource, canDrop, drop, tap.
 */
"use strict";

const Drag = (function () {
	const THRESHOLD = 6;
	let host = null;
	let pending = null;
	let session = null;
	let probe = null;
	let metrics = { cell: 56, gap: 4, pitch: 60 };

	function readMetrics() {
		if (!probe) {
			probe = document.createElement("div");
			probe.style.cssText =
				"position:fixed;left:-999px;top:0;width:var(--cell);height:var(--gap);visibility:hidden;pointer-events:none";
			document.body.appendChild(probe);
		}
		const cell = probe.offsetWidth || 56;
		const gap = probe.offsetHeight || 4;
		metrics = { cell, gap, pitch: cell + gap };
	}

	function clamp(n, lo, hi) {
		return Math.max(lo, Math.min(hi, n));
	}

	function nearestFilled(shape, c, r) {
		let best = null;
		for (let rr = 0; rr < shape.length; rr++) {
			for (let cc = 0; cc < shape[0].length; cc++) {
				if (!shape[rr][cc]) continue;
				const d = Math.abs(cc - c) + Math.abs(rr - r);
				if (!best || d < best.d) best = { c: cc, r: rr, d };
			}
		}
		return { c: best.c, r: best.r };
	}

	function centerCell(shape) {
		return nearestFilled(shape, (shape[0].length - 1) / 2, (shape.length - 1) / 2);
	}

	function buildGhost(id, shape) {
		const def = ItemCatalog.get(id);
		const ghost = document.createElement("div");
		ghost.className = `drag-ghost rarity-${def.rarity}`;
		const grid = document.createElement("div");
		grid.className = "ghost-shape";
		grid.style.gridTemplateColumns = `repeat(${shape[0].length}, var(--cell))`;
		grid.style.gridTemplateRows = `repeat(${shape.length}, var(--cell))`;
		for (let r = 0; r < shape.length; r++) {
			for (let c = 0; c < shape[0].length; c++) {
				const cell = document.createElement("div");
				cell.className = shape[r][c] ? "ghost-cell filled" : "ghost-cell";
				grid.appendChild(cell);
			}
		}
		const img = document.createElement("img");
		img.className = "ghost-icon";
		img.src = `assets/icons/${def.icon}`;
		img.alt = "";
		grid.appendChild(img);
		ghost.appendChild(grid);
		document.body.appendChild(ghost);
		return ghost;
	}

	function clearPreview() {
		document
			.querySelectorAll(".hl-ok, .hl-bad")
			.forEach((el) => el.classList.remove("hl-ok", "hl-bad"));
		document
			.querySelectorAll(".drop-ok, .drop-bad")
			.forEach((el) => el.classList.remove("drop-ok", "drop-bad"));
	}

	function sourceInfo() {
		return {
			kind: session.kind,
			uid: session.uid,
			id: session.id,
			shape: session.shape,
		};
	}

	function positionGhost() {
		if (!session) return;
		const left = session.x - (session.grab.c * metrics.pitch + metrics.cell / 2);
		const top = session.y - (session.grab.r * metrics.pitch + metrics.cell / 2);
		session.ghost.style.transform = `translate(${Math.round(left)}px, ${Math.round(top)}px)`;
	}

	function updateTarget() {
		clearPreview();
		session.target = null;
		session.ghost.classList.remove("ok", "bad");

		const stack = document.elementsFromPoint(session.x, session.y);
		for (const el of stack) {
			const board = el.closest("[data-grid]");
			if (board) {
				const name = board.dataset.grid;
				const gridEl = board.querySelector(".grid-container");
				const grid = host.gridFor(name);
				if (!gridEl || !grid) break;
				const rect = gridEl.getBoundingClientRect();
				const pc = clamp(Math.floor((session.x - rect.left) / metrics.pitch), 0, grid.cols - 1);
				const pr = clamp(Math.floor((session.y - rect.top) / metrics.pitch), 0, grid.rows - 1);
				const col = pc - session.grab.c;
				const row = pr - session.grab.r;
				const target = { type: "grid", name, col, row };
				target.valid = host.canDrop(sourceInfo(), target);
				session.target = target;

				const cls = target.valid ? "hl-ok" : "hl-bad";
				const shape = session.shape;
				for (let r = 0; r < shape.length; r++) {
					for (let c = 0; c < shape[0].length; c++) {
						if (!shape[r][c]) continue;
						const cell = gridEl.children[(row + r) * grid.cols + (col + c)];
						const inside =
							col + c >= 0 && col + c < grid.cols && row + r >= 0 && row + r < grid.rows;
						if (cell && inside) cell.classList.add(cls);
					}
				}
				session.ghost.classList.add(target.valid ? "ok" : "bad");
				return;
			}
			const zone = el.closest("[data-drop]");
			if (zone) {
				const target = { type: "drop", name: zone.dataset.drop, el: zone };
				target.valid = host.canDrop(sourceInfo(), target);
				session.target = target;
				zone.classList.add(target.valid ? "drop-ok" : "drop-bad");
				session.ghost.classList.add(target.valid ? "ok" : "bad");
				return;
			}
		}
	}

	function begin(p) {
		const src = host.getSource(p.kind, p.uid);
		if (!src) return false;
		readMetrics();
		const shape = ItemCatalog.cloneShape(src.shape);
		let grab;
		if (p.el.classList.contains("item")) {
			const rect = p.el.getBoundingClientRect();
			const pc = clamp(
				Math.floor(((p.x - rect.left) / rect.width) * shape[0].length),
				0,
				shape[0].length - 1,
			);
			const pr = clamp(
				Math.floor(((p.y - rect.top) / rect.height) * shape.length),
				0,
				shape.length - 1,
			);
			grab = nearestFilled(shape, pc, pr);
		} else {
			grab = centerCell(shape);
		}
		session = {
			kind: p.kind,
			uid: p.uid,
			id: src.id,
			shape,
			grab,
			x: p.x,
			y: p.y,
			srcEl: p.el,
			ghost: buildGhost(src.id, shape),
			target: null,
		};
		p.el.classList.add("drag-source");
		document.body.classList.add("dragging");
		host.dragStart && host.dragStart(sourceInfo());
		positionGhost();
		updateTarget();
		return true;
	}

	function end(commit) {
		if (!session) return;
		const info = sourceInfo();
		const target = session.target;
		session.ghost.remove();
		session.srcEl.classList.remove("drag-source");
		document.body.classList.remove("dragging");
		clearPreview();
		session = null;
		host.dragEnd && host.dragEnd();
		if (!commit) return;
		if (target && target.valid) host.drop(info, target);
		else if (target) host.dropInvalid && host.dropInvalid(info, target);
	}

	function onPointerDown(e) {
		if (session || e.button > 0) return;
		const el = e.target.closest("[data-drag]");
		if (!el) return;
		pending = {
			el,
			kind: el.dataset.src,
			uid: el.dataset.uid,
			x: e.clientX,
			y: e.clientY,
			pointerId: e.pointerId,
			pointerType: e.pointerType,
		};
	}

	function onPointerMove(e) {
		if (session) {
			session.x = e.clientX;
			session.y = e.clientY;
			positionGhost();
			updateTarget();
			return;
		}
		if (!pending || e.pointerId !== pending.pointerId) return;
		if (Math.hypot(e.clientX - pending.x, e.clientY - pending.y) < THRESHOLD) return;
		const p = pending;
		pending = null;
		begin(p);
		if (session) {
			session.x = e.clientX;
			session.y = e.clientY;
			positionGhost();
			updateTarget();
		}
	}

	function onPointerUp(e) {
		if (session) {
			session.x = e.clientX;
			session.y = e.clientY;
			updateTarget();
			end(true);
			return;
		}
		if (pending) {
			const p = pending;
			pending = null;
			host.tap(p.kind, p.uid, { pointerType: p.pointerType, el: p.el });
		}
	}

	function onPointerCancel() {
		pending = null;
		end(false);
	}

	return {
		init: function (h) {
			host = h;
			document.addEventListener("pointerdown", onPointerDown);
			window.addEventListener("pointermove", onPointerMove);
			window.addEventListener("pointerup", onPointerUp);
			window.addEventListener("pointercancel", onPointerCancel);
			window.addEventListener("blur", onPointerCancel);
		},
		active: function () {
			return !!session;
		},
		cancel: function () {
			pending = null;
			end(false);
		},
		/** Turn the held piece 90 degrees, keeping the grabbed cell under the cursor. */
		rotate: function () {
			if (!session) return false;
			const rows = session.shape.length;
			session.grab = { c: rows - 1 - session.grab.r, r: session.grab.c };
			session.shape = ItemCatalog.rotateShape(session.shape);
			session.ghost.remove();
			session.ghost = buildGhost(session.id, session.shape);
			positionGhost();
			updateTarget();
			return true;
		},
	};
})();
