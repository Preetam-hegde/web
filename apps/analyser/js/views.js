'use strict';

/*
 * Renderers. Each view owns one container, exposes init(el), reset() and
 * render(frame, meta). Views ignore frames that carry no data for them.
 */
(function () {
	const esc = DSA.util.esc;
	const SVG_NS = 'http://www.w3.org/2000/svg';

	// ── Bars (sorting) ──────────────────────────────────────────────────────
	DSA.views.bars = {
		init: function (el) {
			this.el = el;
			this.bars = [];
		},
		reset: function () {
			this.el.innerHTML = '';
			this.bars = [];
		},
		render: function (f, meta) {
			if (!f.a) {
				return;
			}
			const a = f.a;
			const n = a.length;
			if (this.bars.length !== n) {
				this.el.innerHTML = '';
				this.bars = [];
				for (let i = 0; i < n; i++) {
					const bar = document.createElement('div');
					bar.className = 'bar';
					bar.innerHTML = '<span></span>';
					this.el.appendChild(bar);
					this.bars.push(bar);
				}
			}
			this.el.classList.toggle('show-values', n <= 24);
			this.el.classList.toggle('tight', n > 50);
			const cls = new Array(n).fill('');
			if (f.range) {
				for (let i = f.range[0]; i <= f.range[1]; i++) {
					cls[i] = 'range';
				}
			}
			if (f.sorted) {
				for (let i = 0; i < n; i++) {
					if (f.sorted[i]) {
						cls[i] = 'done';
					}
				}
			}
			['compare', 'write', 'swap', 'pivot'].forEach(function (kind) {
				if (f.mark && f.mark[kind]) {
					f.mark[kind].forEach(function (i) {
						cls[i] = kind;
					});
				}
			});
			const max = meta.max || 100;
			for (let i = 0; i < n; i++) {
				const bar = this.bars[i];
				bar.className = 'bar ' + cls[i];
				bar.style.height = (a[i] / max * 100) + '%';
				bar.firstChild.textContent = a[i];
			}
		}
	};

	// ── Strip (array cells, queues shown as chips, output rows) ─────────────
	DSA.views.strip = {
		init: function (el) {
			this.el = el;
		},
		reset: function () {
			this.el.innerHTML = '';
		},
		render: function (f) {
			const s = f.strip;
			if (!s) {
				this.el.innerHTML = '';
				return;
			}
			let html = '';
			if (s.label) {
				html += '<div class="strip-label">' + esc(s.label) + '</div>';
			}
			html += '<div class="strip">';
			if (!s.a.length) {
				html += '<div class="strip-empty">empty</div>';
			}
			s.a.forEach(function (v, i) {
				const out = s.dim && (i < s.dim[0] || i > s.dim[1]);
				const cls = (s.cls && s.cls[i]) || '';
				const ptr = s.ptr && s.ptr[i];
				html += '<div class="cell ' + cls + (out ? ' out' : '') + '">' +
					'<span class="cv">' + (v === null ? '' : esc(v)) + '</span>' +
					'<span class="ci">' + (s.noIndex ? '' : i) + '</span>' +
					(ptr ? '<span class="ptr">' + esc(ptr) + '</span>' : '') +
					'</div>';
			});
			html += '</div>';
			this.el.innerHTML = html;
		}
	};

	// ── Net (trees, heaps, graphs) ──────────────────────────────────────────
	function svgEl(name, cls) {
		const node = document.createElementNS(SVG_NS, name);
		if (cls) {
			node.setAttribute('class', cls);
		}
		return node;
	}

	DSA.views.net = {
		W: 860,
		H: 480,
		PAD: 56,
		init: function (el) {
			this.el = el;
			this.reset();
		},
		reset: function () {
			this.el.innerHTML = '';
			this.svg = svgEl('svg');
			this.svg.setAttribute('viewBox', '0 0 ' + this.W + ' ' + this.H);
			this.svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
			this.edgeLayer = svgEl('g');
			this.nodeLayer = svgEl('g');
			this.svg.appendChild(this.edgeLayer);
			this.svg.appendChild(this.nodeLayer);
			this.el.appendChild(this.svg);
			this.nodeMap = new Map();
			this.edgeMap = new Map();
		},
		px: function (x) {
			return this.PAD + x * (this.W - 2 * this.PAD);
		},
		py: function (y) {
			return this.PAD + y * (this.H - 2 * this.PAD);
		},
		render: function (f) {
			const net = f.net;
			if (!net) {
				return;
			}
			const self = this;
			const pos = {};
			const seenNodes = new Set();
			net.nodes.forEach(function (n) {
				pos[n.id] = { x: self.px(n.x), y: self.py(n.y) };
			});

			// edges first so they sit under the nodes
			const seenEdges = new Set();
			net.edges.forEach(function (e) {
				const key = e.a + '-' + e.b;
				seenEdges.add(key);
				let g = self.edgeMap.get(key);
				if (!g) {
					g = svgEl('g');
					g.appendChild(svgEl('line'));
					g.appendChild(svgEl('text', 'ew'));
					self.edgeLayer.appendChild(g);
					self.edgeMap.set(key, g);
				}
				const p = pos[e.a];
				const q = pos[e.b];
				if (!p || !q) {
					return;
				}
				g.setAttribute('class', 'edge ' + (e.cls || ''));
				const line = g.firstChild;
				line.setAttribute('x1', p.x);
				line.setAttribute('y1', p.y);
				line.setAttribute('x2', q.x);
				line.setAttribute('y2', q.y);
				const text = g.lastChild;
				if (e.w !== undefined && e.w !== null) {
					text.textContent = e.w;
					text.setAttribute('x', (p.x + q.x) / 2);
					text.setAttribute('y', (p.y + q.y) / 2 + 5);
					text.style.display = '';
				} else {
					text.style.display = 'none';
				}
			});
			this.edgeMap.forEach(function (g, key) {
				if (!seenEdges.has(key)) {
					g.remove();
					self.edgeMap.delete(key);
				}
			});

			net.nodes.forEach(function (n) {
				seenNodes.add(n.id);
				let g = self.nodeMap.get(n.id);
				if (!g) {
					g = svgEl('g');
					g.appendChild(svgEl('circle'));
					g.appendChild(svgEl('text', 'nl'));
					g.appendChild(svgEl('text', 'ns'));
					g.firstChild.setAttribute('r', 24);
					g.children[1].setAttribute('dy', '0.35em');
					g.children[2].setAttribute('y', 43);
					self.nodeLayer.appendChild(g);
					self.nodeMap.set(n.id, g);
				}
				g.setAttribute('class', ('node ' + (n.cls || '')).trim());
				g.setAttribute('transform', 'translate(' + pos[n.id].x + ' ' + pos[n.id].y + ')');
				g.children[1].textContent = n.label;
				g.children[2].textContent = n.sub || '';
			});
			this.nodeMap.forEach(function (g, id) {
				if (!seenNodes.has(id)) {
					g.remove();
					self.nodeMap.delete(id);
				}
			});
		}
	};

	// ── Lin (stack, queue, linked list) ─────────────────────────────────────
	DSA.views.lin = {
		init: function (el) {
			this.el = el;
		},
		reset: function () {
			this.el.innerHTML = '';
		},
		render: function (f) {
			const L = f.lin;
			if (!L) {
				return;
			}
			const tag = function (item) {
				return item.tag ? '<em class="tag">' + esc(item.tag) + '</em>' : '';
			};
			let html = '';
			if (L.kind === 'stack') {
				html = '<div class="lin stack' + (f.warn ? ' warn' : '') + '">';
				html += '<div class="stack-base">' + (L.items.length ? '' : 'empty stack') + '</div>';
				html += L.items.map(function (item) {
					return '<div class="blk ' + (item.cls || '') + '"><b>' + esc(item.v) + '</b>' + tag(item) + '</div>';
				}).join('');
				html += '</div>';
			} else if (L.kind === 'queue') {
				html = '<div class="lin queue' + (f.warn ? ' warn' : '') + '"><span class="pipe-end">dequeue ←</span><div class="pipe">';
				html += L.items.length ? L.items.map(function (item) {
					return '<div class="blk ' + (item.cls || '') + '"><b>' + esc(item.v) + '</b>' + tag(item) + '</div>';
				}).join('') : '<span class="pipe-empty">empty queue</span>';
				html += '</div><span class="pipe-end">← enqueue</span></div>';
			} else {
				html = '<div class="lin list' + (f.warn ? ' warn' : '') + '">';
				L.items.forEach(function (item) {
					html += '<div class="lnode ' + (item.cls || '') + '">' + tag(item) +
						'<div class="lbox"><b>' + esc(item.v) + '</b><i></i></div></div><span class="larrow"></span>';
				});
				html += '<div class="lnull">' + (L.items.length ? 'null' : 'empty list · null') + '</div></div>';
			}
			this.el.innerHTML = html;
		}
	};

	// ── Table (dynamic programming) ─────────────────────────────────────────
	DSA.views.table = {
		init: function (el) {
			this.el = el;
		},
		reset: function () {
			this.el.innerHTML = '';
		},
		render: function (f) {
			const T = f.table;
			if (!T) {
				return;
			}
			const mark = {};
			const put = function (list, cls) {
				(list || []).forEach(function (rc) {
					mark[rc[0] + ',' + rc[1]] = cls;
				});
			};
			put(T.from, 'range');
			put(T.path, 'path');
			put(T.cur ? [T.cur] : [], 'cur');
			let html = '<table class="dp"><thead><tr><th></th>';
			T.cols.forEach(function (c) {
				html += '<th>' + esc(c) + '</th>';
			});
			html += '</tr></thead><tbody>';
			T.rows.forEach(function (label, r) {
				html += '<tr><th>' + esc(label) + '</th>';
				T.cells[r].forEach(function (v, c) {
					html += '<td class="' + (mark[r + ',' + c] || '') + '">' + (v === null ? '' : esc(v)) + '</td>';
				});
				html += '</tr>';
			});
			html += '</tbody></table>';
			this.el.innerHTML = html;
		}
	};

	// ── Board (N-Queens) ────────────────────────────────────────────────────
	DSA.views.board = {
		init: function (el) {
			this.el = el;
		},
		reset: function () {
			this.el.innerHTML = '';
		},
		render: function (f) {
			const B = f.board;
			if (!B) {
				return;
			}
			const bad = {};
			(B.bad || []).forEach(function (rc) {
				bad[rc[0] + ',' + rc[1]] = true;
			});
			let html = '<div class="board" style="--n:' + B.n + '">';
			for (let r = 0; r < B.n; r++) {
				for (let c = 0; c < B.n; c++) {
					let cls = (r + c) % 2 ? 'sq dark' : 'sq';
					if (B.cur && B.cur[0] === r && B.cur[1] === c) {
						cls += B.conflict ? ' swap' : ' cur';
					}
					if (bad[r + ',' + c]) {
						cls += ' swap';
					}
					if (B.solved && B.queens[r] === c) {
						cls += ' done';
					}
					const queen = B.queens[r] === c || (B.cur && B.cur[0] === r && B.cur[1] === c);
					html += '<div class="' + cls + '">' + (queen ? '<span class="queen">♛</span>' : '') + '</div>';
				}
			}
			html += '</div>';
			this.el.innerHTML = html;
		}
	};

	// ── Grid (pathfinding, canvas) ──────────────────────────────────────────
	DSA.views.grid = {
		init: function (el) {
			this.el = el;
			this.canvas = document.createElement('canvas');
			this.canvas.className = 'grid-canvas';
			this.el.appendChild(this.canvas);
			this.ctx = this.canvas.getContext('2d');
			this.frame = null;
			this.meta = null;
			this.drag = null;
			const self = this;
			const down = function (ev) {
				self.onDown(ev);
			};
			this.canvas.addEventListener('pointerdown', down);
			this.canvas.addEventListener('pointermove', function (ev) {
				self.onMove(ev);
			});
			window.addEventListener('pointerup', function () {
				self.drag = null;
			});
			window.addEventListener('resize', function () {
				if (self.frame && !self.el.hidden) {
					self.render(self.frame, self.meta);
				}
			});
		},
		reset: function () {
			this.frame = null;
		},
		colors: function () {
			const css = getComputedStyle(document.documentElement);
			const get = function (name) {
				return css.getPropertyValue(name).trim();
			};
			return {
				empty: get('--grid-empty'),
				line: get('--grid-line'),
				wall: get('--grid-wall'),
				front: get('--grid-front'),
				cur: get('--c-cur-lo'),
				path: get('--c-done-lo'),
				start: get('--c-done-hi'),
				end: get('--c-swap-lo')
			};
		},
		cellAt: function (ev) {
			const rect = this.canvas.getBoundingClientRect();
			const G = DSA.grid;
			const c = Math.floor((ev.clientX - rect.left) / this.cell);
			const r = Math.floor((ev.clientY - rect.top) / this.cell);
			if (r < 0 || c < 0 || r >= G.rows || c >= G.cols) {
				return -1;
			}
			return r * G.cols + c;
		},
		onDown: function (ev) {
			const G = DSA.grid;
			const idx = this.cellAt(ev);
			if (idx < 0) {
				return;
			}
			ev.preventDefault();
			if (idx === G.start) {
				this.drag = { kind: 'start' };
			} else if (idx === G.end) {
				this.drag = { kind: 'end' };
			} else {
				this.drag = { kind: 'wall', value: G.walls[idx] ? 0 : 1 };
				this.apply(idx);
			}
		},
		onMove: function (ev) {
			if (!this.drag) {
				return;
			}
			const idx = this.cellAt(ev);
			if (idx >= 0) {
				this.apply(idx);
			}
		},
		apply: function (idx) {
			const G = DSA.grid;
			let changed = false;
			if (this.drag.kind === 'start' && idx !== G.end && idx !== G.start) {
				G.walls[idx] = 0;
				G.start = idx;
				changed = true;
			} else if (this.drag.kind === 'end' && idx !== G.start && idx !== G.end) {
				G.walls[idx] = 0;
				G.end = idx;
				changed = true;
			} else if (this.drag.kind === 'wall' && idx !== G.start && idx !== G.end && G.walls[idx] !== this.drag.value) {
				G.walls[idx] = this.drag.value;
				changed = true;
			}
			if (changed && DSA.onGridEdit) {
				DSA.onGridEdit();
			}
		},
		render: function (f, meta) {
			if (f.n === undefined || !meta || !meta.grid) {
				return;
			}
			this.frame = f;
			this.meta = meta;
			const G = meta.grid;
			const box = this.el.getBoundingClientRect();
			const cell = Math.max(8, Math.floor(Math.min(box.width / G.cols, box.height / G.rows)));
			this.cell = cell;
			const w = cell * G.cols;
			const h = cell * G.rows;
			const dpr = window.devicePixelRatio || 1;
			this.canvas.width = w * dpr;
			this.canvas.height = h * dpr;
			this.canvas.style.width = w + 'px';
			this.canvas.style.height = h + 'px';
			const ctx = this.ctx;
			ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
			ctx.clearRect(0, 0, w, h);
			const col = this.colors();
			const gap = Math.max(1, Math.round(cell * 0.08));
			const radius = Math.max(2, cell * 0.22);
			const frontSet = new Set(f.front || []);
			const pathCells = new Set((meta.path || []).slice(0, f.p || 0));
			const total = Math.max(1, meta.order.length);
			const draw = function (idx, fill) {
				const x = (idx % G.cols) * cell + gap / 2;
				const y = Math.floor(idx / G.cols) * cell + gap / 2;
				ctx.fillStyle = fill;
				ctx.beginPath();
				ctx.roundRect(x, y, cell - gap, cell - gap, radius);
				ctx.fill();
				ctx.lineWidth = 1.5;
				ctx.strokeStyle = fill === col.empty ? col.line : '#111111';
				ctx.stroke();
			};
			for (let idx = 0; idx < G.rows * G.cols; idx++) {
				let fill = col.empty;
				if (G.walls[idx]) {
					fill = col.wall;
				} else if (pathCells.has(idx)) {
					fill = col.path;
				} else if (idx === f.cur) {
					fill = col.cur;
				} else if (frontSet.has(idx)) {
					fill = col.front;
				} else if (meta.visitedAt[idx] < f.n) {
					const t = meta.visitedAt[idx] / total;
					fill = 'hsl(' + Math.round(205 + 80 * t) + ' 85% ' + Math.round(70 - 6 * t) + '%)';
				}
				draw(idx, fill);
			}
			draw(G.start, col.start);
			draw(G.end, col.end);
			ctx.fillStyle = '#111111';
			[[G.start, 'S'], [G.end, 'E']].forEach(function (pair) {
				ctx.font = '700 ' + Math.round(cell * 0.5) + 'px Inter, sans-serif';
				ctx.textAlign = 'center';
				ctx.textBaseline = 'middle';
				ctx.fillText(pair[1], (pair[0] % G.cols + 0.5) * cell, (Math.floor(pair[0] / G.cols) + 0.54) * cell);
			});
		}
	};
})();
